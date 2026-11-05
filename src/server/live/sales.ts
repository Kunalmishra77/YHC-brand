import 'server-only';

import { cookies } from 'next/headers';
import { AppError } from '@/lib/errors';
import { requireRole } from '@/lib/rbac';
import {
  type CallResult,
  RETRY_RESULTS,
  type WhatsAppTemplate,
  WHATSAPP_TEMPLATES,
  callResultLabel,
  endOfIstToday,
  retryAt,
} from '@/lib/sales/playbook';
import type { ScanOutcome } from '@/lib/scan/rules';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { type TeamScanView, getScanForTeam } from './scans';

/*
 * Sales portal on the real database (ADR-36, ADR-37). Lead reads and writes run as the signed-in
 * sales user (RLS: leads, lead_activities, customers). Scan photos and answers come only through
 * getScanForTeam(), which shows them only when the customer agreed to share them (ADR-37).
 * The team shares one login; `leads.owner_name` says which person owns a lead, and each device
 * remembers "who am I" in a cookie.
 */

export const MEMBER_COOKIE = 'yhc_sales_member';

export const LEAD_VIEWS = [
  'today',
  'new',
  'mine',
  'open',
  'eligible',
  'not_eligible',
  'unclear',
  'sold',
  'lost',
  'all',
] as const;
export type LeadView = (typeof LEAD_VIEWS)[number];

export type SalesStage = 'new' | 'contacted' | 'interested' | 'product_purchased' | 'lost' | 'other';
const OPEN_STAGES = ['new', 'contacted', 'interested'] as const;

export interface LeadRow {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  age: number | null;
  city: string | null;
  outcome: ScanOutcome | null;
  stage: string;
  owner: string | null;
  ownerSince: string | null;
  source: string | null;
  campaign: string | null;
  createdAt: string;
  lastContactedAt: string | null;
  nextActionAt: string | null;
}

export interface LeadActivity {
  id: string;
  kind: string;
  body: string | null;
  by: string | null;
  at: string;
}

export interface LeadDetail extends LeadRow {
  lostReason: string | null;
  utm: Record<string, string>;
  callAttempts: number;
  activities: LeadActivity[];
  scan: TeamScanView | null;
  scansFinished: number;
}

export async function requireSalesUser() {
  return requireRole(['sales', 'admin']);
}

export async function currentMember(): Promise<string | null> {
  const v = (await cookies()).get(MEMBER_COOKIE)?.value;
  return v ? decodeURIComponent(v).slice(0, 60) : null;
}

export async function getTeam(): Promise<string[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from('settings').select('value').eq('key', 'sales.team').maybeSingle();
  return Array.isArray(data?.value) ? data.value.filter((v): v is string => typeof v === 'string').slice(0, 20) : [];
}

/** Saves the team list (service role: settings are admin-write; the sales role is checked first). */
export async function saveTeam(names: string[]): Promise<void> {
  await requireSalesUser();
  const clean = [...new Set(names.map((n) => n.trim()).filter((n) => n.length >= 2 && n.length <= 60))].slice(0, 20);
  const { error } = await createSupabaseAdminClient()
    .from('settings')
    .update({ value: clean, updated_at: new Date().toISOString() })
    .eq('key', 'sales.team');
  if (error) throw new AppError('save_failed', 'Could not save the team list.', 500);
}

type CustomerJoin = {
  full_name: string | null;
  phone: string;
  email: string | null;
  age_years: number | null;
  city: string | null;
} | null;

type LeadSelect = {
  id: string;
  stage: string;
  outcome: ScanOutcome | null;
  owner_name: string | null;
  owner_claimed_at: string | null;
  source: string | null;
  campaign: string | null;
  created_at: string;
  last_contacted_at: string | null;
  next_action_at: string | null;
  customers: CustomerJoin;
};

function toRow(l: LeadSelect): LeadRow {
  return {
    id: l.id,
    name: l.customers?.full_name ?? 'Unknown',
    phone: l.customers?.phone ?? '',
    email: l.customers?.email ?? null,
    age: l.customers?.age_years ?? null,
    city: l.customers?.city ?? null,
    outcome: l.outcome,
    stage: l.stage,
    owner: l.owner_name,
    ownerSince: l.owner_claimed_at,
    source: l.source,
    campaign: l.campaign,
    createdAt: l.created_at,
    lastContactedAt: l.last_contacted_at,
    nextActionAt: l.next_action_at,
  };
}

const LEAD_COLUMNS =
  'id, stage, outcome, owner_name, owner_claimed_at, source, campaign, created_at, last_contacted_at, next_action_at, customers(full_name, phone, email, age_years, city)';

export async function listLeads(view: LeadView, q: string, member: string | null): Promise<LeadRow[]> {
  await requireSalesUser();
  const supabase = await createSupabaseServerClient();
  let query = supabase.from('leads').select(LEAD_COLUMNS).limit(300);
  switch (view) {
    case 'today':
      query = query
        .in('stage', [...OPEN_STAGES])
        .lt('next_action_at', endOfIstToday(new Date()).toISOString())
        .order('next_action_at', { ascending: true });
      if (member) query = query.or(`owner_name.eq.${pgQuote(member)},owner_name.is.null`);
      break;
    case 'new':
      query = query.eq('stage', 'new').is('owner_name', null);
      break;
    case 'mine':
      query = member
        ? query.eq('owner_name', member).in('stage', [...OPEN_STAGES])
        : query.eq('id', '00000000-0000-0000-0000-000000000000');
      break;
    case 'open':
      query = query.in('stage', [...OPEN_STAGES]);
      break;
    case 'eligible':
    case 'not_eligible':
    case 'unclear':
      query = query.eq('outcome', view).in('stage', [...OPEN_STAGES]);
      break;
    case 'sold':
      query = query.eq('stage', 'product_purchased');
      break;
    case 'lost':
      query = query.eq('stage', 'lost');
      break;
    case 'all':
      break;
  }
  if (view !== 'today') query = query.order('created_at', { ascending: false });
  const { data, error } = await query;
  if (error) throw new AppError('load_failed', 'Could not load leads.', 500);
  const rows = (data ?? []).map((l) => toRow(l as LeadSelect));
  const needle = q.trim().toLowerCase();
  if (!needle) return rows;
  const digits = needle.replace(/\D/g, '');
  return rows.filter(
    (r) =>
      r.name.toLowerCase().includes(needle) ||
      (r.email ?? '').toLowerCase().includes(needle) ||
      (r.city ?? '').toLowerCase().includes(needle) ||
      (digits.length >= 3 && r.phone.replace(/\D/g, '').includes(digits)),
  );
}

/** PostgREST `or()` value quoting for a free-text name. */
function pgQuote(v: string): string {
  return `"${v.replace(/["\\]/g, '')}"`;
}

export interface SalesDashboard {
  newUnclaimed: number;
  mineOpen: number;
  dueToday: number;
  overdue: number;
  soldThisWeek: number;
  open: number;
}

export async function salesDashboard(member: string | null): Promise<SalesDashboard> {
  await requireSalesUser();
  const supabase = await createSupabaseServerClient();
  const now = new Date();
  const head = () => supabase.from('leads').select('id', { count: 'exact', head: true });
  const due = (q: ReturnType<typeof head>) =>
    member ? q.or(`owner_name.eq.${pgQuote(member)},owner_name.is.null`) : q;
  const [n, mine, today, late, sold, open] = await Promise.all([
    head().eq('stage', 'new').is('owner_name', null),
    member ? head().eq('owner_name', member).in('stage', [...OPEN_STAGES]) : Promise.resolve({ count: 0 }),
    due(head().in('stage', [...OPEN_STAGES]).lt('next_action_at', endOfIstToday(now).toISOString())),
    due(head().in('stage', [...OPEN_STAGES]).lt('next_action_at', now.toISOString())),
    head()
      .eq('stage', 'product_purchased')
      .gte('stage_changed_at', new Date(now.getTime() - 7 * 86_400_000).toISOString()),
    head().in('stage', [...OPEN_STAGES]),
  ]);
  return {
    newUnclaimed: n.count ?? 0,
    mineOpen: mine.count ?? 0,
    dueToday: today.count ?? 0,
    overdue: late.count ?? 0,
    soldThisWeek: sold.count ?? 0,
    open: open.count ?? 0,
  };
}

export async function leadCounts(): Promise<{ newCount: number; open: number }> {
  await requireSalesUser();
  const supabase = await createSupabaseServerClient();
  const [n, o] = await Promise.all([
    supabase.from('leads').select('id', { count: 'exact', head: true }).eq('stage', 'new').is('owner_name', null),
    supabase.from('leads').select('id', { count: 'exact', head: true }).in('stage', [...OPEN_STAGES]),
  ]);
  return { newCount: n.count ?? 0, open: o.count ?? 0 };
}

export async function getLead(id: string): Promise<LeadDetail | null> {
  const user = await requireSalesUser();
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from('leads')
    .select(`${LEAD_COLUMNS}, lost_reason, utm, customer_id`)
    .eq('id', id)
    .maybeSingle();
  if (!data) return null;
  const [{ data: acts }, team] = await Promise.all([
    supabase
      .from('lead_activities')
      .select('id, kind, body, meta, created_at')
      .eq('lead_id', id)
      .order('created_at', { ascending: false })
      .limit(200),
    getScanForTeam(data.customer_id, { id: user.id, role: user.role === 'admin' ? 'admin' : 'sales' }),
  ]);
  const row = toRow(data as unknown as LeadSelect);
  const utm =
    data.utm && typeof data.utm === 'object' && !Array.isArray(data.utm)
      ? Object.fromEntries(Object.entries(data.utm).filter((e): e is [string, string] => typeof e[1] === 'string'))
      : {};
  const activities = (acts ?? []).map((a) => {
    const meta = (a.meta ?? {}) as Record<string, unknown>;
    return {
      id: a.id,
      kind: a.kind,
      body: a.body,
      by: typeof meta.member === 'string' ? meta.member : null,
      at: a.created_at,
    };
  });
  return {
    ...row,
    lostReason: data.lost_reason,
    utm,
    callAttempts: activities.filter((a) => a.kind === 'call').length,
    activities,
    scan: team.latest,
    scansFinished: team.finished,
  };
}

async function logActivity(
  leadId: string,
  actorId: string,
  kind: 'note' | 'call' | 'whatsapp' | 'system',
  body: string,
  meta: Record<string, string | null>,
) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from('lead_activities').insert({ lead_id: leadId, actor_id: actorId, kind, body, meta });
  if (error) throw new AppError('save_failed', 'Could not save to the history.', 500);
}

/** Take a lead (`to` = a team name) or release it (`to` = null). `by` is who did it. */
export async function assignLead(id: string, to: string | null, by: string | null): Promise<void> {
  const user = await requireSalesUser();
  if (to !== null) {
    const team = await getTeam();
    if (!team.includes(to)) throw new AppError('unknown_member', 'Pick a name from the team list.', 422);
  }
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from('leads')
    .update(to ? { owner_name: to, owner_claimed_at: new Date().toISOString() } : { owner_name: null, owner_claimed_at: null })
    .eq('id', id);
  if (error) throw new AppError('save_failed', 'Could not update the lead.', 500);
  const body = !to ? `Lead released${by ? ` by ${by}` : ''}` : to === by ? `Taken by ${to}` : `Given to ${to}${by ? ` by ${by}` : ''}`;
  await logActivity(id, user.id, 'system', body, { member: by });
}

export async function setStage(
  id: string,
  stage: Exclude<SalesStage, 'new' | 'other'>,
  reason: string | null,
  member: string | null,
): Promise<void> {
  await requireSalesUser();
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc('set_lead_stage_manual', {
    p_lead_id: id,
    p_stage: stage,
    p_reason: reason ? `${reason}${member ? ` — ${member}` : ''}` : member ? `by ${member}` : undefined,
  });
  if (error) {
    if (error.message.includes('LOST_REASON_REQUIRED')) throw new AppError('reason_required', 'Please add a reason.', 422);
    if (error.message.includes('STAGE_SET_BY_SYSTEM_ONLY'))
      throw new AppError('stage_locked', 'This lead cannot move to that stage from where it is.', 409);
    throw new AppError('save_failed', 'Could not change the stage.', 500);
  }
  const patch: { last_contacted_at?: string; next_action_at?: null } = {};
  if (stage === 'contacted') patch.last_contacted_at = new Date().toISOString();
  if (stage === 'product_purchased' || stage === 'lost') patch.next_action_at = null;
  if (Object.keys(patch).length) await supabase.from('leads').update(patch).eq('id', id);
}

/**
 * Log one call. "Spoke to them" moves a new lead to Contacted. A missed call books the next try
 * (3 hours later, inside 10 am–7 pm IST) unless a later follow-up is already set.
 */
export async function logCall(
  id: string,
  result: CallResult,
  note: string | null,
  member: string | null,
): Promise<{ nextTry: string | null }> {
  const user = await requireSalesUser();
  const supabase = await createSupabaseServerClient();
  const { data: lead } = await supabase.from('leads').select('stage, next_action_at').eq('id', id).maybeSingle();
  if (!lead) throw new AppError('not_found', 'Lead not found.', 404);
  const now = new Date();
  await logActivity(id, user.id, 'call', note ? `${callResultLabel(result)} — ${note}` : callResultLabel(result), {
    member,
    result,
  });

  const patch: { last_contacted_at: string; next_action_at?: string } = { last_contacted_at: now.toISOString() };
  let nextTry: string | null = null;
  const hasFutureFollowUp = lead.next_action_at && Date.parse(lead.next_action_at) > now.getTime();
  if (RETRY_RESULTS.includes(result) && !hasFutureFollowUp) {
    nextTry = retryAt(now).toISOString();
    patch.next_action_at = nextTry;
  }
  await supabase.from('leads').update(patch).eq('id', id);
  if (result === 'answered' && lead.stage === 'new') await setStage(id, 'contacted', null, member);
  return { nextTry };
}

export async function setFollowUp(id: string, at: Date | null, note: string | null, member: string | null): Promise<void> {
  const user = await requireSalesUser();
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from('leads')
    .update({ next_action_at: at ? at.toISOString() : null })
    .eq('id', id);
  if (error) throw new AppError('save_failed', 'Could not save the follow-up.', 500);
  const when = at
    ? new Intl.DateTimeFormat('en-IN', {
        timeZone: 'Asia/Kolkata',
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: 'numeric',
        minute: '2-digit',
      }).format(at)
    : null;
  await logActivity(
    id,
    user.id,
    'system',
    when ? `Follow-up set for ${when}${note ? ` — ${note}` : ''}` : 'Follow-up cleared',
    { member },
  );
}

export async function logWhatsApp(id: string, template: WhatsAppTemplate, member: string | null): Promise<void> {
  const user = await requireSalesUser();
  const label = WHATSAPP_TEMPLATES.find((t) => t.id === template)?.label ?? template;
  await logActivity(id, user.id, 'whatsapp', `WhatsApp opened: ${label}`, { member, template });
}

export async function addNote(id: string, body: string, member: string | null): Promise<void> {
  const user = await requireSalesUser();
  await logActivity(id, user.id, 'note', body, { member });
}
