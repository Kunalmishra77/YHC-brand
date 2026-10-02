import 'server-only';

import { addDays } from 'date-fns';
import { fromZonedTime } from 'date-fns-tz';
import type {
  Appointment,
  DomainEvent,
  GuaranteeClaim,
  Lead,
  LeadSource,
  Order,
  OrderStatus,
  Plan,
  StaffUser,
} from '@/lib/domain/types';
import { IST, istDate } from '@/lib/time';
import type { AvailabilityInput, TimeRange } from '@/server/booking/availability';

/*
 * Management KPIs (FR-M13-1..3, -5). Pure functions over a demo-state snapshot so the maths is
 * unit-tested (kpis.test.ts). Definitions follow PRD §17 word for word; where the demo data lacks
 * a field the real schema has, the proxy is named in a comment.
 */

export const RANGE_OPTIONS = [7, 30, 90] as const;
export type RangeDays = (typeof RANGE_OPTIONS)[number];

export function parseRange(value: unknown): RangeDays {
  const n = Number(Array.isArray(value) ? value[0] : value);
  return (RANGE_OPTIONS as readonly number[]).includes(n) ? (n as RangeDays) : 30;
}

/** PRD §17, shown as tooltips (FR-M13-5). */
export const METRIC_DEFINITIONS = {
  newLeads: 'Leads created in period (by leads.created_at, IST)',
  leadToPaid:
    'Leads created in period that have a captured consultation payment within 14 days ÷ leads created in period',
  bookingConversion: 'Captured consult payments ÷ holds created (same period)',
  showUp: 'Completed ÷ (completed + no_show) consultations',
  consultToPlan:
    'Plans paid within 7 days of a completed consult ÷ completed consults, cohorted by consult week',
  aov: 'Sum of paid order totals ÷ paid orders',
  reorderRate:
    'Customers with ≥ 1 reorder within 30 days after plan end ÷ customers whose plan ended in period',
  retention90:
    'Customers with an active plan (plan_end_on ≥ day 90 after first delivery) ÷ customers with first delivery in cohort',
  utilisation: 'Booked + completed slot minutes ÷ available slot minutes',
  guaranteeCost: 'Sum of guarantee refunds ÷ plan revenue (same period)',
  noShow: 'No_show ÷ (completed + no_show) consultations',
  revenue:
    'Captured consultation fees + paid order totals in period, split by consultations, first plan/product orders and reorders',
} as const;

// ---------------------------------------------------------------------------------------------
// windows

export interface KpiWindow {
  /** inclusive, 00:00 IST of the first day */
  start: Date;
  /** exclusive, 00:00 IST of the day after the last day */
  end: Date;
  days: number;
  /** IST dates, first and last (inclusive) */
  firstDate: string;
  lastDate: string;
}

const istMidnight = (date: string) => fromZonedTime(`${date}T00:00:00`, IST);
const shiftDate = (date: string, days: number) =>
  addDays(new Date(`${date}T00:00:00Z`), days)
    .toISOString()
    .slice(0, 10);

/** The last `days` IST calendar days, including today. */
export function windowFor(days: number, now: Date): KpiWindow {
  const lastDate = istDate(now);
  const firstDate = shiftDate(lastDate, -(days - 1));
  return {
    start: istMidnight(firstDate),
    end: istMidnight(shiftDate(lastDate, 1)),
    days,
    firstDate,
    lastDate,
  };
}

/** The same-length window immediately before `w`. */
export function previousWindow(w: KpiWindow): KpiWindow {
  const lastDate = shiftDate(w.firstDate, -1);
  const firstDate = shiftDate(lastDate, -(w.days - 1));
  return {
    start: istMidnight(firstDate),
    end: w.start,
    days: w.days,
    firstDate,
    lastDate,
  };
}

const inWindow = (at: Date | string | null | undefined, w: KpiWindow) => {
  if (!at) return false;
  const t = typeof at === 'string' ? new Date(at).getTime() : at.getTime();
  return t >= w.start.getTime() && t < w.end.getTime();
};

const dateInWindow = (date: string | null, w: KpiWindow) =>
  date !== null && date >= w.firstDate && date <= w.lastDate;

// ---------------------------------------------------------------------------------------------
// maths

export interface Ratio {
  num: number;
  den: number;
  /** null when the denominator is zero — shown as "—", never as 0 % */
  value: number | null;
}

export function ratio(num: number, den: number): Ratio {
  return { num, den, value: den === 0 ? null : num / den };
}

/** Step conversion for a funnel: first step null, then each count ÷ the previous count. */
export function stepConversion(counts: readonly number[]): (number | null)[] {
  return counts.map((c, i) => {
    if (i === 0) return null;
    const prev = counts[i - 1] ?? 0;
    return prev === 0 ? null : c / prev;
  });
}

/** Deltas in words (docs/07 KpiTile: "+12% vs last week"). */
export function deltaWords(
  current: number | null,
  previous: number | null,
  kind: 'count' | 'money' | 'rate',
  days: number,
): string {
  const period = `previous ${days} days`;
  if (current === null) return 'Not enough data in this period';
  if (previous === null) return `No comparable data in ${period}`;
  if (kind === 'rate') {
    const pts = Math.round((current - previous) * 100);
    if (pts === 0) return `No change vs ${period}`;
    return `${pts > 0 ? 'Up' : 'Down'} ${Math.abs(pts)} pts vs ${period}`;
  }
  if (previous === 0) return current === 0 ? `No change vs ${period}` : `None in ${period}`;
  const pct = Math.round(((current - previous) / previous) * 100);
  if (pct === 0) return `No change vs ${period}`;
  return `${pct > 0 ? 'Up' : 'Down'} ${Math.abs(pct)}% vs ${period}`;
}

/** Bookable slot minutes in one working range: n slots of `slot` minutes with `buffer` between. */
export function slotMinutesInRange(range: TimeRange, slot: number, buffer: number): number {
  const toMin = (hhmm: string) => {
    const [h, m] = hhmm.split(':').map(Number);
    return (h ?? 0) * 60 + (m ?? 0);
  };
  const len = toMin(range.end) - toMin(range.start);
  if (len < slot || slot <= 0) return 0;
  const n = Math.floor((len + buffer) / (slot + buffer));
  return n * slot;
}

/** Available slot minutes across the window's IST days (weekly rules + date exceptions). */
export function availableSlotMinutes(
  w: KpiWindow,
  availability: Pick<AvailabilityInput, 'weeklyRules' | 'exceptions'>,
  slot: number,
  buffer: number,
): number {
  let total = 0;
  for (let date = w.firstDate; date <= w.lastDate; date = shiftDate(date, 1)) {
    const weekday = new Date(`${date}T00:00:00Z`).getUTCDay();
    const exceptions = availability.exceptions.filter((e) => e.date === date);
    if (exceptions.some((e) => e.kind === 'unavailable' && e.range === null)) continue;
    const ranges = [
      ...(availability.weeklyRules[weekday] ?? []),
      ...exceptions.flatMap((e) => (e.kind === 'extra' && e.range ? [e.range] : [])),
    ];
    let day = ranges.reduce((sum, r) => sum + slotMinutesInRange(r, slot, buffer), 0);
    for (const e of exceptions) {
      if (e.kind === 'unavailable' && e.range) day -= slotMinutesInRange(e.range, slot, buffer);
    }
    total += Math.max(0, day);
  }
  return total;
}

// ---------------------------------------------------------------------------------------------
// dashboard

export interface KpiSource {
  leads: Lead[];
  appointments: Appointment[];
  orders: Order[];
  claims: GuaranteeClaim[];
  events: DomainEvent[];
  availability: Pick<AvailabilityInput, 'weeklyRules' | 'exceptions'>;
}

export interface KpiOptions {
  slotMinutes: number;
  bufferMinutes: number;
  plans: Plan[];
  staff: StaffUser[];
  now: Date;
}

const PAID_STATUSES: OrderStatus[] = [
  'paid',
  'processing',
  'shipped',
  'delivered',
  'partially_refunded',
  'rto',
];
export const isPaidOrder = (o: Order) => PAID_STATUSES.includes(o.status) && o.paidAt !== null;
const isCaptured = (a: Appointment) => a.paymentId !== null && a.feePaise > 0;
const DAY = 86_400_000;

/**
 * When the hold was created. Real schema: appointments.created_at. Demo: the `appointment.held`
 * event if this session created it, otherwise the slot start (capped at now) for seeded rows.
 */
function heldAtResolver(events: DomainEvent[], now: Date) {
  const held = new Map<string, string>();
  for (const e of events) if (e.type === 'appointment.held') held.set(e.aggregateId, e.at);
  return (a: Appointment) => {
    const at = held.get(a.id);
    if (at) return new Date(at);
    const start = new Date(a.startsAt);
    return start > now ? now : start;
  };
}

export interface FunnelStep {
  key: 'leads' | 'booked' | 'paid' | 'attended' | 'plan' | 'reordered';
  label: string;
  count: number;
  /** ÷ previous step; null for the first step or when the previous step is 0 */
  conversion: number | null;
}

export interface PeriodMetrics {
  newLeads: number;
  leadToPaid: Ratio;
  bookingConversion: Ratio;
  showUp: Ratio;
  noShow: Ratio;
  consultToPlan: Ratio;
  aov: { valuePaise: number | null; orders: number; totalPaise: number };
  reorderRate: Ratio;
  retention90: Ratio;
  revenue: { consultPaise: number; planPaise: number; reorderPaise: number; totalPaise: number };
  planRevenuePaise: number;
  guaranteeCost: { refundPaise: number; value: number | null };
  utilisation: { bookedMinutes: number; availableMinutes: number; value: number | null };
  funnel: FunnelStep[];
}

export function computePeriod(src: KpiSource, opts: KpiOptions, w: KpiWindow): PeriodMetrics {
  const heldAt = heldAtResolver(src.events, opts.now);
  const apptsOf = (customerId: string | null) =>
    customerId ? src.appointments.filter((a) => a.customerId === customerId) : [];
  const paidOrdersOf = (customerId: string | null) =>
    customerId ? src.orders.filter((o) => o.customerId === customerId && isPaidOrder(o)) : [];

  // Leads
  const leads = src.leads.filter((l) => inWindow(l.createdAt, w));
  const leadPaid = leads.filter((l) => {
    const created = new Date(l.createdAt).getTime();
    return apptsOf(l.customerId).some((a) => {
      if (!isCaptured(a)) return false;
      const t = heldAt(a).getTime(); // demo proxy for payment time (captured within the hold)
      return t >= created && t <= created + 14 * DAY;
    });
  }).length;

  // Bookings: holds created in the period (paid first consults go through a hold)
  const holds = src.appointments.filter((a) => a.feePaise > 0 && inWindow(heldAt(a), w));
  const captured = holds.filter(isCaptured);

  // Consultations that took place in the period
  const happened = src.appointments.filter((a) => inWindow(a.startsAt, w));
  const completed = happened.filter((a) => a.status === 'completed');
  const noShows = happened.filter((a) => a.status === 'no_show');

  // Consult → plan: completed first consults, plan paid within 7 days of the consult
  const firstCompleted = completed.filter((a) => a.kind === 'first');
  const converted = firstCompleted.filter((a) => {
    const t = new Date(a.startsAt).getTime();
    return paidOrdersOf(a.customerId).some((o) => {
      if (!o.planId || !o.paidAt) return false;
      const p = new Date(o.paidAt).getTime();
      return p >= t && p <= t + 7 * DAY;
    });
  }).length;

  // Orders paid in the period
  const paidOrders = src.orders.filter((o) => isPaidOrder(o) && inWindow(o.paidAt, w));
  const orderTotal = paidOrders.reduce((s, o) => s + o.totalPaise, 0);
  const reorderPaise = paidOrders.filter((o) => o.source === 'reorder').reduce((s, o) => s + o.totalPaise, 0);
  const consultPaise = captured.reduce((s, a) => s + a.feePaise, 0);
  const planRevenuePaise = paidOrders.filter((o) => o.planId).reduce((s, o) => s + o.totalPaise, 0);

  // Reorder rate: customers whose plan ended in the period
  const ended = src.orders.filter((o) => o.planId && isPaidOrder(o) && dateInWindow(o.planEndOn, w));
  const endedCustomers = new Set(ended.map((o) => o.customerId));
  let reordered = 0;
  for (const customerId of endedCustomers) {
    const parents = ended.filter((o) => o.customerId === customerId);
    const hit = parents.some((parent) => {
      const limit = new Date(`${parent.planEndOn}T00:00:00Z`).getTime() + 30 * DAY;
      const after = new Date(parent.paidAt ?? parent.createdAt).getTime();
      return paidOrdersOf(customerId).some((o) => {
        if (o.source !== 'reorder' || !o.paidAt) return false;
        const t = new Date(o.paidAt).getTime();
        return t > after && t <= limit;
      });
    });
    if (hit) reordered += 1;
  }

  // 90-day retention: cohort = customers whose first plan delivery falls in the period
  const firstDelivery = new Map<string, string>();
  const latestEnd = new Map<string, string>();
  for (const o of src.orders) {
    if (!o.planId || !o.deliveredOn) continue;
    const f = firstDelivery.get(o.customerId);
    if (!f || o.deliveredOn < f) firstDelivery.set(o.customerId, o.deliveredOn);
    const e = latestEnd.get(o.customerId);
    if (o.planEndOn && (!e || o.planEndOn > e)) latestEnd.set(o.customerId, o.planEndOn);
  }
  let cohort = 0;
  let retained = 0;
  for (const [customerId, first] of firstDelivery) {
    if (!dateInWindow(first, w)) continue;
    cohort += 1;
    const end = latestEnd.get(customerId);
    if (end && end >= shiftDate(first, 90)) retained += 1;
  }

  // Guarantee cost
  const refundPaise = src.claims
    .filter((c) => c.status === 'refunded' && inWindow(c.submittedAt, w))
    .reduce((s, c) => s + c.refundPaise, 0);

  // Doctor utilisation
  const bookedMinutes = happened
    .filter((a) => a.status === 'booked' || a.status === 'completed')
    .reduce((s, a) => s + (new Date(a.endsAt).getTime() - new Date(a.startsAt).getTime()) / 60_000, 0);
  const availableMinutes = availableSlotMinutes(w, src.availability, opts.slotMinutes, opts.bufferMinutes);

  // Funnel: cohort of leads created in the period; each step requires the previous one
  const reached = leads.map((l) => {
    const appts = apptsOf(l.customerId);
    const orders = paidOrdersOf(l.customerId);
    const booked = appts.length > 0;
    const paid = booked && appts.some(isCaptured);
    const attended = paid && appts.some((a) => a.status === 'completed');
    const plan = attended && orders.some((o) => o.planId && o.source !== 'reorder');
    const again = plan && orders.some((o) => o.source === 'reorder');
    return [true, booked, paid, attended, plan, again];
  });
  const labels: [FunnelStep['key'], string][] = [
    ['leads', 'Leads'],
    ['booked', 'Slot booked'],
    ['paid', 'Consult paid'],
    ['attended', 'Attended'],
    ['plan', 'Plan bought'],
    ['reordered', 'Reordered'],
  ];
  const counts = labels.map((_, i) => reached.filter((r) => r[i]).length);
  const conv = stepConversion(counts);
  const funnel = labels.map(([key, label], i) => ({
    key,
    label,
    count: counts[i] ?? 0,
    conversion: conv[i] ?? null,
  }));

  return {
    newLeads: leads.length,
    leadToPaid: ratio(leadPaid, leads.length),
    bookingConversion: ratio(captured.length, holds.length),
    showUp: ratio(completed.length, completed.length + noShows.length),
    noShow: ratio(noShows.length, completed.length + noShows.length),
    consultToPlan: ratio(converted, firstCompleted.length),
    aov: {
      valuePaise: paidOrders.length ? Math.round(orderTotal / paidOrders.length) : null,
      orders: paidOrders.length,
      totalPaise: orderTotal,
    },
    reorderRate: ratio(reordered, endedCustomers.size),
    retention90: ratio(retained, cohort),
    revenue: {
      consultPaise,
      planPaise: orderTotal - reorderPaise,
      reorderPaise,
      totalPaise: consultPaise + orderTotal,
    },
    planRevenuePaise,
    guaranteeCost: { refundPaise, value: planRevenuePaise === 0 ? null : refundPaise / planRevenuePaise },
    utilisation: {
      bookedMinutes,
      availableMinutes,
      value: availableMinutes === 0 ? null : bookedMinutes / availableMinutes,
    },
    funnel,
  };
}

export interface RevenueBucket {
  label: string;
  firstDate: string;
  lastDate: string;
  consultPaise: number;
  planPaise: number;
  reorderPaise: number;
}

/** Daily buckets up to 30 days, weekly beyond. */
export function revenueSeries(src: KpiSource, opts: KpiOptions, w: KpiWindow): RevenueBucket[] {
  const size = w.days > 31 ? 7 : 1;
  const buckets: RevenueBucket[] = [];
  for (let first = w.firstDate; first <= w.lastDate; first = shiftDate(first, size)) {
    const last = shiftDate(first, size - 1) > w.lastDate ? w.lastDate : shiftDate(first, size - 1);
    const sub: KpiWindow = {
      start: istMidnight(first),
      end: istMidnight(shiftDate(last, 1)),
      days: size,
      firstDate: first,
      lastDate: last,
    };
    const m = computePeriod(src, opts, sub).revenue;
    buckets.push({
      label: first,
      firstDate: first,
      lastDate: last,
      consultPaise: m.consultPaise,
      planPaise: m.planPaise,
      reorderPaise: m.reorderPaise,
    });
  }
  return buckets;
}

export interface BreakdownRow {
  key: string;
  label: string;
  sublabel?: string;
  leads: number;
  paidConsults: number;
  planBuyers: number;
  revenuePaise: number;
}

const SOURCE_LABEL: Record<LeadSource, string> = {
  meta_ads: 'Meta ads',
  whatsapp: 'WhatsApp',
  website: 'Website',
  sales: 'Sales (manual)',
  referral: 'Referral',
  google: 'Google',
};

function breakdown(
  src: KpiSource,
  opts: KpiOptions,
  w: KpiWindow,
  keyOf: (l: Lead) => { key: string; label: string; sublabel?: string },
): BreakdownRow[] {
  const heldAt = heldAtResolver(src.events, opts.now);
  const rows = new Map<string, BreakdownRow>();
  for (const lead of src.leads.filter((l) => inWindow(l.createdAt, w))) {
    const k = keyOf(lead);
    const row = rows.get(k.key) ?? {
      ...k,
      leads: 0,
      paidConsults: 0,
      planBuyers: 0,
      revenuePaise: 0,
    };
    row.leads += 1;
    const appts = src.appointments.filter((a) => a.customerId === lead.customerId);
    const orders = src.orders.filter((o) => o.customerId === lead.customerId && isPaidOrder(o));
    if (appts.some(isCaptured)) row.paidConsults += 1;
    if (orders.some((o) => o.planId)) row.planBuyers += 1;
    row.revenuePaise +=
      appts.filter((a) => isCaptured(a) && inWindow(heldAt(a), w)).reduce((s, a) => s + a.feePaise, 0) +
      orders.filter((o) => inWindow(o.paidAt, w)).reduce((s, o) => s + o.totalPaise, 0);
    rows.set(k.key, row);
  }
  return [...rows.values()].sort((a, b) => b.leads - a.leads || b.revenuePaise - a.revenuePaise);
}

export function bySourceCampaign(src: KpiSource, opts: KpiOptions, w: KpiWindow) {
  return breakdown(src, opts, w, (l) => ({
    key: `${l.source}|${l.campaign ?? ''}`,
    label: SOURCE_LABEL[l.source],
    sublabel: l.campaign ?? 'No campaign',
  }));
}

export function bySalesRep(src: KpiSource, opts: KpiOptions, w: KpiWindow) {
  return breakdown(src, opts, w, (l) => ({
    key: l.ownerId ?? 'unassigned',
    label: opts.staff.find((u) => u.id === l.ownerId)?.name ?? 'Unassigned',
  }));
}

export interface PlanRow {
  planId: string;
  label: string;
  months: number;
  orders: number;
  revenuePaise: number;
  share: number | null;
}

export function byPlanDuration(src: KpiSource, opts: KpiOptions, w: KpiWindow): PlanRow[] {
  const paid = src.orders.filter((o) => o.planId && isPaidOrder(o) && inWindow(o.paidAt, w));
  return [...opts.plans]
    .sort((a, b) => a.months - b.months)
    .map((p) => {
      const mine = paid.filter((o) => o.planId === p.id);
      return {
        planId: p.id,
        label: p.name,
        months: p.months,
        orders: mine.length,
        revenuePaise: mine.reduce((s, o) => s + o.totalPaise, 0),
        share: paid.length ? mine.length / paid.length : null,
      };
    });
}

export function computeDashboard(src: KpiSource, opts: KpiOptions, days: RangeDays) {
  const window = windowFor(days, opts.now);
  const prev = previousWindow(window);
  return {
    window,
    prev,
    current: computePeriod(src, opts, window),
    previous: computePeriod(src, opts, prev),
    series: revenueSeries(src, opts, window),
    bySource: bySourceCampaign(src, opts, window),
    byRep: bySalesRep(src, opts, window),
    byPlan: byPlanDuration(src, opts, window),
  };
}

export type Dashboard = ReturnType<typeof computeDashboard>;
