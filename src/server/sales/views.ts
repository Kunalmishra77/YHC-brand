import 'server-only';

import { differenceInMinutes } from 'date-fns';
import { SOURCE_LABELS } from '@/components/sales/labels';
import { t } from '@/i18n/en';
import type {
  Appointment,
  CareCheckin,
  Lead,
  LeadSource,
  LeadStage,
  MessageStatus,
  Order,
  OrderStatus,
  Task,
} from '@/lib/domain/types';
import { formatINR } from '@/lib/money';
import { formatIst, istDate } from '@/lib/time';
import { PLANS, STAFF } from '@/server/demo/fixtures';
import { db, getSetting, getSettingNumber, getSlots } from '@/server/demo/store';

/*
 * Sales read-models (golden rule 2 — the demo stand-in for `v_sales_*` views).
 * Everything returned here is safe for the sales role: identity, source, stage, owner, next action,
 * appointment code/slot/status, payment ids/amounts/status, order code/status/amount, message template
 * names + delivery status, check-in reply KIND. Never: intake, concern, photos, notes, prescriptions,
 * recommendation items/notes, message bodies or check-in free text.
 */

// ---------------------------------------------------------------------------------------------
// small formatters

export function ago(iso: string, now = new Date()): string {
  const mins = Math.max(0, differenceInMinutes(now, new Date(iso)));
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} h ago`;
  return `${Math.floor(hours / 24)} d ago`;
}

function dueLabel(iso: string, now: Date): { label: string; overdue: boolean; today: boolean } {
  const at = new Date(iso);
  const overdue = at < now;
  const today = istDate(at) === istDate(now);
  if (overdue) {
    const mins = differenceInMinutes(now, at);
    const by =
      mins < 60 ? `${mins} min` : mins < 1440 ? `${Math.floor(mins / 60)} h` : `${Math.floor(mins / 1440)} d`;
    return { label: `Overdue · ${by}`, overdue, today };
  }
  return {
    label: today ? `Due ${formatIst(at, 'h:mm aaa')}` : `Due ${formatIst(at, 'EEE d MMM, h:mm aaa')}`,
    overdue,
    today,
  };
}

const staffName = (id: string | null) => STAFF.find((u) => u.id === id)?.name ?? 'Unassigned';

export function salesReps(): { id: string; name: string }[] {
  return STAFF.filter((u) => u.role === 'sales' && u.active).map((u) => ({ id: u.id, name: u.name }));
}

/** Lead's first consult paid? (₹500 chip). */
function consultPaid(customerId: string | null): boolean {
  if (!customerId) return false;
  return db().appointments.some(
    (a) =>
      a.customerId === customerId &&
      a.kind === 'first' &&
      a.paymentId !== null &&
      (a.status === 'booked' || a.status === 'completed' || a.status === 'no_show'),
  );
}

// ---------------------------------------------------------------------------------------------
// leads (Kanban + list)

export interface SalesLeadCard {
  id: string;
  name: string;
  phone: string;
  source: LeadSource;
  sourceLabel: string;
  campaign: string | null;
  stage: LeadStage;
  stageLabel: string;
  ownerId: string | null;
  ownerName: string;
  createdAt: string;
  createdLabel: string;
  /** IST business date YYYY-MM-DD */
  createdOn: string;
  updatedAt: string;
  updatedAgo: string;
  nextAction: string | null;
  nextActionAt: string | null;
  nextActionDue: string | null;
  nextActionOverdue: boolean;
  nextActionToday: boolean;
  consultPaid: boolean;
}

function toCard(lead: Lead, now: Date): SalesLeadCard {
  const due = lead.nextActionAt && lead.nextAction ? dueLabel(lead.nextActionAt, now) : null;
  return {
    id: lead.id,
    name: lead.name,
    phone: lead.phone,
    source: lead.source,
    sourceLabel: SOURCE_LABELS[lead.source],
    campaign: lead.campaign,
    stage: lead.stage,
    stageLabel: t(`status.leadStage.${lead.stage}`),
    ownerId: lead.ownerId,
    ownerName: staffName(lead.ownerId),
    createdAt: lead.createdAt,
    createdLabel: formatIst(new Date(lead.createdAt), 'd MMM, h:mm aaa'),
    createdOn: istDate(new Date(lead.createdAt)),
    updatedAt: lead.updatedAt,
    updatedAgo: ago(lead.updatedAt, now),
    nextAction: lead.nextAction,
    nextActionAt: lead.nextActionAt,
    nextActionDue: due?.label ?? null,
    nextActionOverdue: due?.overdue ?? false,
    nextActionToday: due?.today ?? false,
    consultPaid: consultPaid(lead.customerId),
  };
}

export function listSalesLeads(now = new Date()): SalesLeadCard[] {
  return [...db().leads].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).map((l) => toCard(l, now));
}

// ---------------------------------------------------------------------------------------------
// lead detail

export interface ConsultPaymentBlock {
  appointmentCode: string;
  kindLabel: string;
  slotLabel: string;
  status: Appointment['status'];
  statusLabel: string;
  paid: boolean;
  feeLabel: string;
  paymentId: string | null;
  holdUntilLabel: string | null;
}

export interface OrderPaymentBlock {
  code: string;
  label: string;
  amountLabel: string;
  status: OrderStatus;
  statusLabel: string;
  paid: boolean;
  paymentId: string | null;
  paidAtLabel: string | null;
}

export type TimelineItem =
  | {
      type: 'activity';
      id: string;
      kind: string;
      summary: string;
      actor: string;
      at: string;
      atLabel: string;
    }
  | {
      type: 'message';
      id: string;
      direction: 'outbound' | 'inbound';
      channel: string;
      template: string | null;
      status: MessageStatus;
      statusLabel: string;
      at: string;
      atLabel: string;
    };

export interface SalesLeadDetail {
  lead: SalesLeadCard & { lostReason: string | null; manual: boolean };
  consults: ConsultPaymentBlock[];
  orders: OrderPaymentBlock[];
  timeline: TimelineItem[];
  openTasks: SalesTask[];
}

function consultBlock(a: Appointment, now: Date): ConsultPaymentBlock {
  const paid = a.paymentId !== null && a.status !== 'held' && a.status !== 'expired';
  const liveHold = a.status === 'held' && a.holdExpiresAt !== null && new Date(a.holdExpiresAt) > now;
  return {
    appointmentCode: a.code,
    kindLabel: a.kind === 'first' ? 'First consultation' : 'Follow-up consultation',
    slotLabel: formatIst(new Date(a.startsAt)),
    status: liveHold || a.status !== 'held' ? a.status : 'expired',
    statusLabel: t(`status.appointment.${liveHold || a.status !== 'held' ? a.status : 'expired'}`),
    paid,
    feeLabel: a.feePaise > 0 ? formatINR(a.feePaise) : 'No fee',
    paymentId: a.paymentId,
    holdUntilLabel: liveHold && a.holdExpiresAt ? formatIst(new Date(a.holdExpiresAt), 'h:mm aaa') : null,
  };
}

function orderBlock(o: Order): OrderPaymentBlock {
  const plan = PLANS.find((p) => p.id === o.planId);
  return {
    code: o.code,
    label: plan ? plan.name : o.source === 'shop' ? 'Shop order' : 'Order',
    amountLabel: formatINR(o.totalPaise),
    status: o.status,
    statusLabel: t(`status.order.${o.status}`),
    paid: o.status !== 'pending_payment' && o.status !== 'cancelled' && o.paymentId !== null,
    paymentId: o.paymentId,
    paidAtLabel: o.paidAt ? formatIst(new Date(o.paidAt)) : null,
  };
}

export function getSalesLeadDetail(leadId: string, now = new Date()): SalesLeadDetail | null {
  const s = db();
  const lead = s.leads.find((l) => l.id === leadId);
  if (!lead) return null;
  const card = toCard(lead, now);
  const consults = lead.customerId
    ? s.appointments
        .filter((a) => a.customerId === lead.customerId)
        .sort((a, b) => b.startsAt.localeCompare(a.startsAt))
        .map((a) => consultBlock(a, now))
    : [];
  const orders = lead.customerId
    ? s.orders
        .filter((o) => o.customerId === lead.customerId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .map(orderBlock)
    : [];

  const messages = s.messages.filter(
    (m) => m.leadId === lead.id || (lead.customerId !== null && m.customerId === lead.customerId),
  );
  // Activities of kind "message" mirror a message row (store logs both) — keep the richer message row.
  const mirrored = (summary: string, at: string) =>
    messages.some(
      (m) =>
        m.template !== null &&
        summary === `WhatsApp: ${m.template}` &&
        Math.abs(new Date(m.at).getTime() - new Date(at).getTime()) < 5000,
    );
  const timeline: TimelineItem[] = [
    ...s.activities
      .filter((a) => a.leadId === lead.id && !(a.kind === 'message' && mirrored(a.summary, a.at)))
      .map((a): TimelineItem => ({
        type: 'activity',
        id: a.id,
        kind: a.kind,
        summary: a.summary,
        actor: a.actor,
        at: a.at,
        atLabel: formatIst(new Date(a.at)),
      })),
    // Message bodies are never projected: they can contain health details (golden rule 2).
    ...messages.map((m): TimelineItem => ({
      type: 'message',
      id: m.id,
      direction: m.direction,
      channel: m.channel,
      template: m.template,
      status: m.status,
      statusLabel: t(`status.message.${m.status}`),
      at: m.at,
      atLabel: formatIst(new Date(m.at)),
    })),
  ].sort((a, b) => b.at.localeCompare(a.at));

  return {
    lead: { ...card, lostReason: lead.lostReason, manual: isManual(lead.stage) },
    consults,
    orders,
    timeline,
    openTasks: listSalesTasks({ leadId: lead.id }, now),
  };
}

const MANUAL: readonly LeadStage[] = [
  'new',
  'contacted',
  'interested',
  'consult_suggested',
  'consult_link_sent',
  'lost',
];
const isManual = (stage: LeadStage) => MANUAL.includes(stage);

// ---------------------------------------------------------------------------------------------
// slots for "book on behalf" (FR-M3-13)

export interface SlotDay {
  date: string;
  label: string;
  slots: { iso: string; label: string }[];
}

export function slotOptions(now = new Date()): SlotDay[] {
  const today = istDate(now);
  return getSlots(now)
    .filter((d) => d.slots.length > 0)
    .map((d) => ({
      date: d.date,
      label: d.date === today ? 'Today' : formatIst(new Date(`${d.date}T06:30:00Z`), 'EEE d MMM'),
      slots: d.slots.map((s) => ({
        iso: s.startsAt.toISOString(),
        label: formatIst(s.startsAt, 'h:mm aaa'),
      })),
    }));
}

export function salesHoldMinutes(): { minutes: number; fromSetting: boolean } {
  try {
    return { minutes: Number(getSetting('consult.sales_hold_minutes')), fromSetting: true };
  } catch {
    // TODO(client): demo store has no consult.sales_hold_minutes (seed.sql: 240) — holdSlot uses consult.hold_minutes.
    return { minutes: getSettingNumber('consult.hold_minutes'), fromSetting: false };
  }
}

// ---------------------------------------------------------------------------------------------
// tasks (FR-M7-9)

export interface SalesTask {
  id: string;
  leadId: string;
  leadName: string;
  title: string;
  kind: Task['kind'];
  urgent: boolean;
  ownerId: string | null;
  ownerName: string;
  dueAt: string;
  dueLabel: string;
  overdue: boolean;
  today: boolean;
}

const TASK_TITLES: Partial<Record<Task['kind'], string>> = {
  // Auto task titles can quote what the customer reported — show a neutral title to sales.
  side_effect: 'Customer reported an issue — call and loop in the doctor',
};

export function listSalesTasks(
  filter: { ownerId?: string; leadId?: string } = {},
  now = new Date(),
): SalesTask[] {
  const s = db();
  return s.tasks
    .filter(
      (task) =>
        task.status === 'open' &&
        (!filter.ownerId || task.ownerId === filter.ownerId) &&
        (!filter.leadId || task.leadId === filter.leadId),
    )
    .sort((a, b) => Number(b.urgent) - Number(a.urgent) || a.dueAt.localeCompare(b.dueAt))
    .map((task) => {
      const due = dueLabel(task.dueAt, now);
      return {
        id: task.id,
        leadId: task.leadId,
        leadName: s.leads.find((l) => l.id === task.leadId)?.name ?? 'Lead',
        title: TASK_TITLES[task.kind] ?? task.title,
        kind: task.kind,
        urgent: task.urgent,
        ownerId: task.ownerId,
        ownerName: staffName(task.ownerId),
        dueAt: task.dueAt,
        dueLabel: due.label,
        overdue: due.overdue,
        today: due.today,
      };
    });
}

export function openTaskCount(ownerId: string): number {
  return db().tasks.filter((t) => t.status === 'open' && t.ownerId === ownerId).length;
}

export function safeTaskTitle(taskId: string): string | null {
  const task = db().tasks.find((x) => x.id === taskId);
  if (!task) return null;
  return TASK_TITLES[task.kind] ?? task.title;
}

// ---------------------------------------------------------------------------------------------
// care view (FR-M7-10)

const REPLY_LABELS: Record<NonNullable<CareCheckin['reply']>, string> = {
  going_well: 'Going well',
  have_questions: 'Has questions',
  side_effect: 'Reported an issue',
};

export interface CareCheckinRow {
  id: string;
  leadId: string | null;
  customerName: string;
  phone: string;
  week: number;
  sentLabel: string;
  reply: CareCheckin['reply'];
  replyLabel: string;
  needsCall: boolean;
  hasReplyText: boolean;
}

export interface RefillRow {
  orderCode: string;
  leadId: string | null;
  customerName: string;
  phone: string;
  planName: string;
  endOn: string;
  endLabel: string;
  daysLeft: number;
}

export interface CareView {
  checkins: CareCheckinRow[];
  flagged: CareCheckinRow[];
  urgentTasks: SalesTask[];
  refills: RefillRow[];
}

export function getCareView(now = new Date()): CareView {
  const s = db();
  const leadFor = (customerId: string) => s.leads.find((l) => l.customerId === customerId);
  const checkins = [...s.checkins]
    .sort((a, b) => b.sentAt.localeCompare(a.sentAt))
    .map((c): CareCheckinRow => {
      const customer = s.customers.find((x) => x.id === c.customerId);
      return {
        id: c.id,
        leadId: leadFor(c.customerId)?.id ?? null,
        customerName: customer?.name ?? 'Customer',
        phone: customer?.phone ?? '',
        week: c.week,
        sentLabel: formatIst(new Date(c.sentAt), 'EEE d MMM'),
        reply: c.reply,
        replyLabel: c.reply ? REPLY_LABELS[c.reply] : 'No reply yet',
        needsCall: c.reply === 'have_questions' || c.reply === 'side_effect',
        hasReplyText: c.replyText !== null && c.replyText.length > 0,
      };
    });

  const today = istDate(now);
  const todayMs = new Date(`${today}T00:00:00Z`).getTime();
  const refills = s.orders
    .filter((o) => o.status === 'delivered' && o.planEndOn !== null)
    .filter(
      (o) =>
        !s.orders.some(
          (n) => n.customerId === o.customerId && n.source === 'reorder' && n.createdAt > o.createdAt,
        ),
    )
    .map((o): RefillRow => {
      const customer = s.customers.find((x) => x.id === o.customerId);
      const endOn = o.planEndOn ?? today;
      return {
        orderCode: o.code,
        leadId: leadFor(o.customerId)?.id ?? null,
        customerName: customer?.name ?? 'Customer',
        phone: customer?.phone ?? '',
        planName: PLANS.find((p) => p.id === o.planId)?.name ?? 'Plan',
        endOn,
        endLabel: formatIst(new Date(`${endOn}T06:30:00Z`), 'EEE d MMM'),
        daysLeft: Math.round((new Date(`${endOn}T00:00:00Z`).getTime() - todayMs) / 86_400_000),
      };
    })
    .filter((r) => r.daysLeft <= 7)
    .sort((a, b) => a.daysLeft - b.daysLeft);

  return {
    checkins,
    flagged: checkins.filter((c) => c.needsCall),
    urgentTasks: listSalesTasks({}, now).filter((task) => task.urgent),
    refills,
  };
}

// ---------------------------------------------------------------------------------------------
// performance (FR-M7-11)

export interface RepPerformance {
  id: string;
  name: string;
  leads: number;
  contacted: number;
  medianFirstContactMin: number | null;
  withinSla: number;
  consultPaid: number;
  plans: number;
  lost: number;
}

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? (sorted[mid] ?? null)
    : Math.round(((sorted[mid - 1] ?? 0) + (sorted[mid] ?? 0)) / 2);
}

export function getPerformance(): { reps: RepPerformance[]; slaMinutes: number } {
  const s = db();
  const slaMinutes = getSettingNumber('sales.first_contact_sla_minutes');
  const reps = salesReps().map((rep): RepPerformance => {
    const leads = s.leads.filter((l) => l.ownerId === rep.id);
    const firstContacts = leads.flatMap((l) => {
      const calls = s.activities.filter((a) => a.leadId === l.id && a.kind === 'call');
      const first = calls.reduce<string | null>((min, a) => (min === null || a.at < min ? a.at : min), null);
      return first ? [Math.max(0, differenceInMinutes(new Date(first), new Date(l.createdAt)))] : [];
    });
    const customerIds = new Set(leads.map((l) => l.customerId).filter((x): x is string => x !== null));
    return {
      id: rep.id,
      name: rep.name,
      leads: leads.length,
      contacted: firstContacts.length,
      medianFirstContactMin: median(firstContacts),
      withinSla: firstContacts.filter((m) => m <= slaMinutes).length,
      consultPaid: leads.filter((l) => consultPaid(l.customerId)).length,
      plans: s.orders.filter(
        (o) =>
          customerIds.has(o.customerId) &&
          o.planId !== null &&
          o.status !== 'pending_payment' &&
          o.status !== 'cancelled' &&
          o.status !== 'refunded',
      ).length,
      lost: leads.filter((l) => l.stage === 'lost').length,
    };
  });
  return { reps, slaMinutes };
}

// ---------------------------------------------------------------------------------------------
// realtime alerts (FR-M7-6, demo polling stand-in for Supabase Realtime)

export interface SalesAlert {
  id: number;
  kind: 'consult_paid' | 'plan_paid' | 'new_lead';
  title: string;
  leadId: string | null;
}

export function latestEventId(): number {
  return db().events.at(-1)?.id ?? 0;
}

export function alertsSince(afterId: number): { lastId: number; alerts: SalesAlert[] } {
  const s = db();
  const events = s.events.filter((e) => e.id > afterId);
  const leadOf = (customerId: string) => s.leads.find((l) => l.customerId === customerId)?.id ?? null;
  const firstName = (customerId: string) =>
    s.customers.find((c) => c.id === customerId)?.name.split(' ')[0] ?? 'Customer';
  const alerts = events.flatMap((e): SalesAlert[] => {
    if (e.type === 'appointment.booked') {
      const a = s.appointments.find((x) => x.id === e.aggregateId);
      if (!a) return [];
      return [
        {
          id: e.id,
          kind: 'consult_paid',
          title: `${formatINR(a.feePaise)} PAID · ${firstName(a.customerId)} · ${formatIst(new Date(a.startsAt), 'EEE h:mm aaa')}`,
          leadId: leadOf(a.customerId),
        },
      ];
    }
    if (e.type === 'order.paid') {
      const o = s.orders.find((x) => x.id === e.aggregateId);
      if (!o) return [];
      const name = s.customers.find((c) => c.id === o.customerId)?.name ?? 'Customer';
      return [
        {
          id: e.id,
          kind: 'plan_paid',
          title: `${o.planId ? 'Plan' : 'Order'} PAID · ${name} · ${formatINR(o.totalPaise)}`,
          leadId: leadOf(o.customerId),
        },
      ];
    }
    if (e.type === 'lead.created') {
      const l = s.leads.find((x) => x.id === e.aggregateId);
      if (!l) return [];
      return [
        {
          id: e.id,
          kind: 'new_lead',
          title: `New lead · ${l.name} · ${SOURCE_LABELS[l.source]}`,
          leadId: l.id,
        },
      ];
    }
    return [];
  });
  return { lastId: events.at(-1)?.id ?? afterId, alerts };
}
