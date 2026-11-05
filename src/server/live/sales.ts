import 'server-only';

import { cookies } from 'next/headers';
import { AppError } from '@/lib/errors';
import { requireRole } from '@/lib/rbac';
import type { ScanOutcome } from '@/lib/scan/rules';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { createSupabaseServerClient } from '@/lib/supabase/server';

/*
 * Sales portal on the real database (ADR-36). Reads and writes run as the signed-in sales user
 * (RLS: leads, lead_activities, customers). Sales never read scans or photos — only `leads.outcome`.
 * The team shares one login; `leads.owner_name` says which person took a lead, and each device
 * remembers "who am I" in a cookie.
 */

export const MEMBER_COOKIE = 'yhc_sales_member';

export type LeadView = 'new' | 'mine' | 'open' | 'eligible' | 'not_eligible' | 'unclear' | 'closed' | 'all';

export type SalesStage = 'new' | 'contacted' | 'interested' | 'product_purchased' | 'lost' | 'other';

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
  createdAt: string;
  lastContactedAt: string | null;
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
  source: string | null;
  activities: LeadActivity[];
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

type CustomerJoin = { full_name: string | null; phone: string; email: string | null; age_years: number | null; city: string | null } | null;

function toRow(l: {
  id: string;
  stage: string;
  outcome: ScanOutcome | null;
  owner_name: string | null;
  created_at: string;
  last_contacted_at: string | null;
  customers: CustomerJoin;
}): LeadRow {
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
    createdAt: l.created_at,
    lastContactedAt: l.last_contacted_at,
  };
}

const LEAD_COLUMNS =
  'id, stage, outcome, owner_name, created_at, last_contacted_at, customers(full_name, phone, email, age_years, city)';

export async function listLeads(view: LeadView, q: string, member: string | null): Promise<LeadRow[]> {
  await requireSalesUser();
  const supabase = await createSupabaseServerClient();
  let query = supabase.from('leads').select(LEAD_COLUMNS).order('created_at', { ascending: false }).limit(200);
  if (view === 'new') query = query.eq('stage', 'new').is('owner_name', null);
  if (view === 'mine') query = member ? query.eq('owner_name', member) : query.eq('id', '00000000-0000-0000-0000-000000000000');
  if (view === 'open') query = query.in('stage', ['new', 'contacted', 'interested']);
  if (view === 'eligible' || view === 'not_eligible' || view === 'unclear') query = query.eq('outcome', view);
  if (view === 'closed') query = query.in('stage', ['product_purchased', 'lost']);
  const { data, error } = await query;
  if (error) throw new AppError('load_failed', 'Could not load leads.', 500);
  const rows = (data ?? []).map((l) => toRow(l as Parameters<typeof toRow>[0]));
  const needle = q.trim().toLowerCase();
  if (!needle) return rows;
  const digits = needle.replace(/\D/g, '');
  return rows.filter(
    (r) =>
      r.name.toLowerCase().includes(needle) ||
      (r.email ?? '').toLowerCase().includes(needle) ||
      (digits.length >= 3 && r.phone.replace(/\D/g, '').includes(digits)),
  );
}

export async function leadCounts(): Promise<{ newCount: number; open: number }> {
  await requireSalesUser();
  const supabase = await createSupabaseServerClient();
  const [n, o] = await Promise.all([
    supabase.from('leads').select('id', { count: 'exact', head: true }).eq('stage', 'new').is('owner_name', null),
    supabase.from('leads').select('id', { count: 'exact', head: true }).in('stage', ['new', 'contacted', 'interested']),
  ]);
  return { newCount: n.count ?? 0, open: o.count ?? 0 };
}

export async function getLead(id: string): Promise<LeadDetail | null> {
  await requireSalesUser();
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from('leads')
    .select(`${LEAD_COLUMNS}, lost_reason, source`)
    .eq('id', id)
    .maybeSingle();
  if (!data) return null;
  const { data: acts } = await supabase
    .from('lead_activities')
    .select('id, kind, body, meta, created_at')
    .eq('lead_id', id)
    .order('created_at', { ascending: false })
    .limit(100);
  const row = toRow(data as Parameters<typeof toRow>[0]);
  return {
    ...row,
    lostReason: data.lost_reason,
    source: data.source,
    activities: (acts ?? []).map((a) => {
      const meta = (a.meta ?? {}) as Record<string, unknown>;
      return { id: a.id, kind: a.kind, body: a.body, by: typeof meta.member === 'string' ? meta.member : null, at: a.created_at };
    }),
  };
}

export async function claimLead(id: string, member: string | null, release = false): Promise<void> {
  const user = await requireSalesUser();
  if (!release && !member) throw new AppError('who_are_you', 'Choose your name first (top of the page).', 409);
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from('leads')
    .update(release ? { owner_name: null, owner_claimed_at: null } : { owner_name: member, owner_claimed_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw new AppError('save_failed', 'Could not update the lead.', 500);
  await supabase.from('lead_activities').insert({
    lead_id: id,
    actor_id: user.id,
    kind: 'system',
    body: release ? 'Lead released' : `Taken by ${member}`,
    meta: { member },
  });
}

export async function setStage(id: string, stage: Exclude<SalesStage, 'new' | 'other'>, reason: string | null, member: string | null): Promise<void> {
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
  if (stage === 'contacted') await supabase.from('leads').update({ last_contacted_at: new Date().toISOString() }).eq('id', id);
}

export async function addNote(id: string, kind: 'note' | 'call', body: string, member: string | null): Promise<void> {
  const user = await requireSalesUser();
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from('lead_activities')
    .insert({ lead_id: id, actor_id: user.id, kind, body, meta: { member } });
  if (error) throw new AppError('save_failed', 'Could not save the note.', 500);
  if (kind === 'call') await supabase.from('leads').update({ last_contacted_at: new Date().toISOString() }).eq('id', id);
}
