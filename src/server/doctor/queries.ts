import 'server-only';

import { addDays, addWeeks, differenceInCalendarDays, subDays } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import type { ChipTone } from '@/components/shared/status-chip';
import type {
  Appointment,
  AppointmentStatus,
  CareCheckin,
  ConsultationNotes,
  Customer,
  IntakeForm,
  LeadStage,
  Order,
  ProgressPhotoSet,
  Recommendation,
} from '@/lib/domain/types';
import type { Paise } from '@/lib/money';
import { formatINR } from '@/lib/money';
import { IST, istDate } from '@/lib/time';
import { t } from '@/i18n/en';
import { PLANS, PRODUCTS } from '@/server/demo/fixtures';
import { db, getAvailabilityConfig, getSetting, planProgress, quotePlan } from '@/server/demo/store';
import { recommendationStatus } from '@/components/doctor/format';

/*
 * Read models for the doctor portal (demo store). Phase 05 replaces these with Supabase queries
 * through the doctor's aal2 session (RLS) — the shapes stay the same.
 * Demo has one doctor; Phase 05 also filters by doctor_id = auth.uid().
 */

export function customerById(id: string): Customer | null {
  return db().customers.find((c) => c.id === id) ?? null;
}

export function leadStageFor(customerId: string): LeadStage | null {
  return db().leads.find((l) => l.customerId === customerId)?.stage ?? null;
}

const minutesIst = (d: Date) =>
  Number(formatInTimeZone(d, IST, 'H')) * 60 + Number(formatInTimeZone(d, IST, 'm'));

const isLiveHold = (a: Appointment, now: Date) =>
  a.status === 'held' && a.holdExpiresAt !== null && new Date(a.holdExpiresAt) > now;

/** Appointments that belong on a doctor's list (live holds, booked, completed, no-show). */
function isListed(a: Appointment, now: Date): boolean {
  if (a.status === 'held') return isLiveHold(a, now);
  return a.status === 'booked' || a.status === 'completed' || a.status === 'no_show';
}

export interface AppointmentRow {
  appt: Appointment;
  customer: Customer;
}

function withCustomer(list: Appointment[]): AppointmentRow[] {
  return list.flatMap((appt) => {
    const customer = customerById(appt.customerId);
    return customer ? [{ appt, customer }] : [];
  });
}

// ---------------------------------------------------------------------------------------------
// Today (FR-M5-2)

export function getToday(now = new Date()) {
  const s = db();
  const today = istDate(now);
  const rows = withCustomer(
    s.appointments
      .filter((a) => istDate(new Date(a.startsAt)) === today && isListed(a, now))
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt)),
  );
  const next = rows.find((r) => r.appt.status === 'booked' && new Date(r.appt.endsAt) > now) ?? null;
  const followUps = getFollowUps(now);
  const confirmed = rows.filter((r) => r.appt.status !== 'held');
  return {
    rows,
    next,
    kpis: {
      consultsToday: confirmed.length,
      completedToday: rows.filter((r) => r.appt.status === 'completed').length,
      intakePending: rows.filter((r) => r.appt.status === 'booked' && !r.appt.intakeDone).length,
      photosPending: rows.filter((r) => r.appt.status === 'booked' && r.appt.intakeDone && !r.appt.photosDone)
        .length,
      plansSentToday: s.recommendations.filter((r) => istDate(new Date(r.createdAt)) === today).length,
      awaitingPlan: rows.filter(
        (r) =>
          r.appt.status === 'completed' &&
          !s.recommendations.some((x) => x.appointmentId === r.appt.id && x.customerId === r.customer.id),
      ).length,
      followUpsDue: followUps.attentionCount,
    },
  };
}

// ---------------------------------------------------------------------------------------------
// Follow-ups (FR-M5-10)

export interface FollowUpDue {
  customer: Customer;
  appt: Appointment;
  weeks: number;
  dueOn: string;
  daysLeft: number;
  booked: Appointment | null;
}

export interface FlaggedReply {
  customer: Customer;
  checkin: CareCheckin;
}

export interface MissingPhotos {
  customer: Customer;
  order: Order;
  lastPhotoOn: string | null;
  daysSinceDelivery: number;
}

export function getFollowUps(now = new Date()) {
  const s = db();
  const today = istDate(now);

  const latestCompleted = new Map<string, Appointment>();
  for (const a of [...s.appointments].sort((x, y) => x.startsAt.localeCompare(y.startsAt))) {
    if (a.status === 'completed') latestCompleted.set(a.customerId, a);
  }

  const consultsDue: FollowUpDue[] = [];
  for (const [customerId, appt] of latestCompleted) {
    const notes = s.notes.find((n) => n.appointmentId === appt.id);
    const customer = customerById(customerId);
    if (!notes?.followUpInWeeks || !customer) continue;
    const dueOn = istDate(addWeeks(new Date(appt.startsAt), notes.followUpInWeeks));
    const booked =
      s.appointments.find(
        (x) =>
          x.customerId === customerId &&
          x.kind === 'follow_up' &&
          x.startsAt > appt.startsAt &&
          (x.status === 'booked' || isLiveHold(x, now)),
      ) ?? null;
    consultsDue.push({
      customer,
      appt,
      weeks: notes.followUpInWeeks,
      dueOn,
      daysLeft: differenceInCalendarDays(new Date(dueOn), new Date(today)),
      booked,
    });
  }
  consultsDue.sort((a, b) => a.daysLeft - b.daysLeft);

  const flagged: FlaggedReply[] = s.checkins
    .filter((c) => c.reply === 'have_questions' || c.reply === 'side_effect')
    .sort((a, b) => b.sentAt.localeCompare(a.sentAt))
    .flatMap((checkin) => {
      const customer = customerById(checkin.customerId);
      return customer ? [{ customer, checkin }] : [];
    });

  const missingPhotos: MissingPhotos[] = [];
  const seen = new Set<string>();
  for (const order of s.orders) {
    if (order.status !== 'delivered' || !order.planId || !order.deliveredOn || !order.planEndOn) continue;
    if (order.planEndOn < today || seen.has(order.customerId)) continue;
    const customer = customerById(order.customerId);
    if (!customer) continue;
    const daysSinceDelivery = differenceInCalendarDays(new Date(today), new Date(order.deliveredOn));
    if (daysSinceDelivery < 21) continue; // first monthly photo request goes out around day 30
    const sets = s.photos
      .filter((p) => p.customerId === customer.id)
      .sort((a, b) => b.takenOn.localeCompare(a.takenOn));
    const last = sets[0]?.takenOn ?? null;
    if (last && differenceInCalendarDays(new Date(today), new Date(last)) <= 30) continue;
    seen.add(customer.id);
    missingPhotos.push({ customer, order, lastPhotoOn: last, daysSinceDelivery });
  }

  const dueSoon = consultsDue.filter((c) => c.daysLeft <= 14 && !c.booked).length;
  return {
    consultsDue,
    flagged,
    missingPhotos,
    dueSoon,
    attentionCount: dueSoon + flagged.length + missingPhotos.length,
  };
}

// ---------------------------------------------------------------------------------------------
// Calendar (FR-M5-3)

export type CalendarKind =
  'available' | 'busy' | 'unavailable' | 'held' | 'booked' | 'completed' | 'no_show' | 'cancelled';

export interface CalendarBlock {
  kind: CalendarKind;
  startMin: number;
  endMin: number;
  title: string;
  sub?: string;
  href?: string;
}

export interface CalendarDay {
  date: string;
  weekday: number;
  isToday: boolean;
  leave: boolean;
  background: CalendarBlock[];
  appointments: CalendarBlock[];
}

export const dateShift = (date: string, days: number) =>
  addDays(new Date(`${date}T12:00:00Z`), days)
    .toISOString()
    .slice(0, 10);

export const weekdayOf = (date: string) => new Date(`${date}T12:00:00Z`).getUTCDay();

export function mondayOf(date: string): string {
  return dateShift(date, -((weekdayOf(date) + 6) % 7));
}

export function getCalendarWeek(weekStart: string, now = new Date()): CalendarDay[] {
  const s = db();
  const cfg = getAvailabilityConfig();
  const today = istDate(now);
  return Array.from({ length: 7 }, (_, i) => {
    const date = dateShift(weekStart, i);
    const weekday = weekdayOf(date);
    const exceptions = cfg.exceptions.filter((e) => e.date === date);
    const leave = exceptions.some((e) => e.kind === 'unavailable' && e.range === null);
    const background: CalendarBlock[] = [];
    if (!leave) {
      for (const r of cfg.weeklyRules[weekday] ?? []) {
        background.push({
          kind: 'available',
          startMin: toMin(r.start),
          endMin: toMin(r.end),
          title: 'Available',
        });
      }
      for (const e of exceptions) {
        if (e.kind === 'extra' && e.range)
          background.push({
            kind: 'available',
            startMin: toMin(e.range.start),
            endMin: toMin(e.range.end),
            title: 'Available · extra hours',
          });
        if (e.kind === 'unavailable' && e.range)
          background.push({
            kind: 'unavailable',
            startMin: toMin(e.range.start),
            endMin: toMin(e.range.end),
            title: 'Unavailable',
          });
      }
    }
    for (const b of cfg.busyBlocks) {
      if (istDate(new Date(b.startsAt)) !== date) continue;
      background.push({
        kind: 'busy',
        startMin: minutesIst(new Date(b.startsAt)),
        endMin: minutesIst(new Date(b.endsAt)),
        title: b.title,
      });
    }
    const appointments: CalendarBlock[] = withCustomer(
      s.appointments.filter(
        (a) =>
          istDate(new Date(a.startsAt)) === date &&
          (isListed(a, now) || a.status === 'cancelled' || a.status === 'rescheduled'),
      ),
    ).map(({ appt, customer }) => ({
      kind:
        appt.status === 'rescheduled' || appt.status === 'cancelled'
          ? 'cancelled'
          : (appt.status as Exclude<AppointmentStatus, 'expired' | 'rescheduled' | 'cancelled'>),
      startMin: minutesIst(new Date(appt.startsAt)),
      endMin: minutesIst(new Date(appt.endsAt)),
      title: customer.name,
      sub: `${t(`status.appointment.${appt.status}`)}${appt.kind === 'follow_up' ? ' · follow-up' : ''}`,
      href: `/doctor/consult/${appt.id}`,
    }));
    return { date, weekday, isToday: date === today, leave, background, appointments };
  });
}

function toMin(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

// ---------------------------------------------------------------------------------------------
// Patients (FR-M5-12)

export interface PlanState {
  label: string;
  tone: ChipTone;
}

export function planStateFor(customerId: string, now = new Date()): PlanState {
  const s = db();
  const today = istDate(now);
  const order = s.orders
    .filter((o) => o.customerId === customerId && o.planId && o.status !== 'cancelled')
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  if (order) {
    const plan = PLANS.find((p) => p.id === order.planId);
    const name = plan ? plan.name : 'Plan';
    if (order.status === 'delivered') {
      if (order.planEndOn && order.planEndOn >= today) {
        const progress = planProgress(order, now);
        return {
          label: progress ? `${name} · day ${progress.day} of ${progress.total}` : `${name} · active`,
          tone: 'success',
        };
      }
      return { label: `${name} · ended`, tone: 'neutral' };
    }
    if (order.status === 'pending_payment') return { label: 'Plan sent · unpaid', tone: 'warning' };
    if (order.status === 'refunded' || order.status === 'partially_refunded')
      return { label: t(`status.order.${order.status}`), tone: 'neutral' };
    return { label: `${name} · ${t(`status.order.${order.status}`)}`, tone: 'info' };
  }
  const rec = s.recommendations
    .filter((r) => r.customerId === customerId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  if (rec) return recommendationStatus(rec.status);
  return { label: 'No plan yet', tone: 'neutral' };
}

export interface PatientRow {
  customer: Customer;
  last: Appointment | null;
  next: Appointment | null;
  consults: number;
  plan: PlanState;
}

export function searchPatients(q: string, now = new Date()): PatientRow[] {
  const s = db();
  const query = q.trim().toLowerCase();
  const digits = query.replace(/\D/g, '');
  const rows: PatientRow[] = [];
  for (const customer of s.customers) {
    const appts = s.appointments
      .filter((a) => a.customerId === customer.id && isListed(a, now))
      .sort((a, b) => b.startsAt.localeCompare(a.startsAt));
    if (appts.length === 0) continue;
    if (query) {
      const match =
        customer.name.toLowerCase().includes(query) ||
        (digits.length >= 3 && customer.phone.replace(/\D/g, '').includes(digits)) ||
        appts.some((a) => a.code.toLowerCase().includes(query));
      if (!match) continue;
    }
    const past = appts.filter((a) => new Date(a.startsAt) <= now);
    const upcoming = appts.filter((a) => new Date(a.startsAt) > now && a.status === 'booked');
    rows.push({
      customer,
      last: past[0] ?? null,
      next: upcoming.at(-1) ?? null,
      consults: appts.filter((a) => a.status === 'completed').length,
      plan: planStateFor(customer.id, now),
    });
  }
  return rows.sort((a, b) => (b.last?.startsAt ?? '').localeCompare(a.last?.startsAt ?? ''));
}

export interface TimelineEntry {
  at: string;
  kind: 'consult' | 'recommendation' | 'order' | 'checkin' | 'photos';
  title: string;
  detail: string;
  chip: PlanState;
  href?: string;
}

export interface ConsultHistoryItem {
  appt: Appointment;
  notes: ConsultationNotes | null;
}

export function getPatientFile(customerId: string, now = new Date()) {
  const s = db();
  const customer = customerById(customerId);
  if (!customer) return null;
  const appointments = s.appointments
    .filter((a) => a.customerId === customerId && (isListed(a, now) || a.status === 'cancelled'))
    .sort((a, b) => b.startsAt.localeCompare(a.startsAt));
  const consults: ConsultHistoryItem[] = appointments.map((appt) => ({
    appt,
    notes: s.notes.find((n) => n.appointmentId === appt.id) ?? null,
  }));
  const recommendations = s.recommendations.filter((r) => r.customerId === customerId);
  const orders = s.orders.filter((o) => o.customerId === customerId);
  const checkins = s.checkins.filter((c) => c.customerId === customerId);
  const photos = s.photos
    .filter((p) => p.customerId === customerId)
    .sort((a, b) => b.takenOn.localeCompare(a.takenOn));

  const timeline: TimelineEntry[] = [
    ...appointments.map<TimelineEntry>((a) => ({
      at: a.startsAt,
      kind: 'consult',
      title: `${a.kind === 'follow_up' ? 'Follow-up consultation' : 'Consultation'} · ${a.code}`,
      detail: s.notes.find((n) => n.appointmentId === a.id)?.assessment || 'No notes yet',
      chip: appointmentChip(a),
      href: `/doctor/consult/${a.id}`,
    })),
    ...recommendations.map<TimelineEntry>((r) => ({
      at: r.createdAt,
      kind: 'recommendation',
      title: `Plan recommended · ${PLANS.find((p) => p.id === r.planId)?.name ?? 'Plan'}`,
      detail: r.productIds.map((id) => PRODUCTS.find((p) => p.id === id)?.name ?? id).join(', '),
      chip: recommendationStatus(r.status),
    })),
    ...orders.map<TimelineEntry>((o) => ({
      at: o.createdAt,
      kind: 'order',
      title: `Order ${o.code} · ${formatINR(o.totalPaise)}`,
      detail: o.lines.map((l) => l.label).join(', '),
      chip: { label: t(`status.order.${o.status}`), tone: o.status === 'delivered' ? 'success' : 'info' },
    })),
    ...checkins.map<TimelineEntry>((c) => ({
      at: c.sentAt,
      kind: 'checkin',
      title: `Week ${c.week} check-in`,
      detail: c.replyText ?? (c.reply ? replyLabel(c.reply).label : 'No reply yet'),
      chip: c.reply ? replyLabel(c.reply) : { label: 'No reply', tone: 'neutral' },
    })),
    ...photos.map<TimelineEntry>((p) => ({
      at: `${p.takenOn}T06:30:00.000Z`,
      kind: 'photos',
      title: `Progress photos · ${p.label}`,
      detail: 'Front hairline, crown, parting',
      chip: { label: 'Photos received', tone: 'success' },
    })),
  ].sort((a, b) => b.at.localeCompare(a.at));

  return {
    customer,
    leadStage: leadStageFor(customerId),
    plan: planStateFor(customerId, now),
    consults,
    recommendations,
    orders,
    checkins,
    photos,
    timeline,
  };
}

export function replyLabel(reply: NonNullable<CareCheckin['reply']>): PlanState {
  switch (reply) {
    case 'going_well':
      return { label: 'Going well', tone: 'success' };
    case 'have_questions':
      return { label: 'Has questions', tone: 'warning' };
    case 'side_effect':
      return { label: 'Possible side effect', tone: 'danger' };
  }
}

/** Primary chip for an appointment (status in words). */
export function appointmentChip(a: Appointment): PlanState {
  switch (a.status) {
    case 'completed':
      return { label: t('status.appointment.completed'), tone: 'success' };
    case 'no_show':
      return { label: t('status.appointment.no_show'), tone: 'danger' };
    case 'held':
      return { label: t('status.appointment.held'), tone: 'pending' };
    case 'booked':
      return { label: t('status.appointment.booked'), tone: 'info' };
    default:
      return { label: t(`status.appointment.${a.status}`), tone: 'neutral' };
  }
}

// ---------------------------------------------------------------------------------------------
// Workspace (FR-M5-5..9, FR-M6-1/2)

export interface PlanQuote {
  planId: string;
  subtotalPaise: Paise;
  creditPaise: Paise;
  totalPaise: Paise;
}

export function getWorkspace(appointmentId: string, now = new Date()) {
  const s = db();
  const appt = s.appointments.find((a) => a.id === appointmentId);
  if (!appt) return null;
  const customer = customerById(appt.customerId);
  if (!customer) return null;

  const intake: IntakeForm | null = s.intake.find((f) => f.appointmentId === appt.id) ?? null;
  const notes: ConsultationNotes | null = s.notes.find((n) => n.appointmentId === appt.id) ?? null;
  const photoSets: ProgressPhotoSet[] = s.photos
    .filter((p) => p.customerId === customer.id)
    .sort((a, b) => a.takenOn.localeCompare(b.takenOn));
  const pastConsults: ConsultHistoryItem[] = s.appointments
    .filter(
      (a) =>
        a.customerId === customer.id &&
        a.id !== appt.id &&
        a.startsAt < appt.startsAt &&
        (a.status === 'completed' || a.status === 'no_show'),
    )
    .sort((a, b) => b.startsAt.localeCompare(a.startsAt))
    .map((a) => ({ appt: a, notes: s.notes.find((n) => n.appointmentId === a.id) ?? null }));
  const orders = s.orders
    .filter((o) => o.customerId === customer.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const checkins = s.checkins
    .filter((c) => c.customerId === customer.id)
    .sort((a, b) => b.sentAt.localeCompare(a.sentAt));

  // Guard on customer too: a recommendation always belongs to the appointment's patient.
  const recommendation: Recommendation | null =
    s.recommendations.find((r) => r.appointmentId === appt.id && r.customerId === customer.id) ?? null;

  // Price preview (TRD §6.4). Before completion the credit does not exist yet, but completing a paid
  // first consult creates it (FR-M6-4) — show it as "applies on completion".
  const creditEnabled = getSetting('consult.credit_enabled') === 'true';
  const willEarnCredit =
    creditEnabled && appt.kind === 'first' && appt.feePaise > 0 && appt.status === 'booked';
  const quotes: PlanQuote[] = PLANS.map((plan) => {
    const q = quotePlan(customer.id, plan.id);
    if (q.creditPaise === 0 && willEarnCredit) {
      const credit = Math.min(appt.feePaise, q.subtotalPaise);
      return {
        planId: plan.id,
        subtotalPaise: q.subtotalPaise,
        creditPaise: credit,
        totalPaise: q.totalPaise - credit,
      };
    }
    return { planId: plan.id, ...q };
  });
  const liveCredit = s.credits
    .filter((c) => c.customerId === customer.id && c.usedOrderId === null && new Date(c.expiresAt) > now)
    .sort((a, b) => a.expiresAt.localeCompare(b.expiresAt))[0];
  const credit =
    creditEnabled && liveCredit
      ? { amountPaise: liveCredit.amountPaise, expiresAt: liveCredit.expiresAt, projected: false }
      : willEarnCredit
        ? { amountPaise: appt.feePaise, expiresAt: null, projected: true }
        : null;

  return {
    appt,
    customer,
    intake,
    notes,
    photoSets,
    pastConsults,
    orders,
    checkins,
    recommendation,
    leadStage: leadStageFor(customer.id),
    quotes,
    credit,
    creditWindowDays: Number(getSetting('consult.credit_window_days')),
    linkTtlHours: Number(getSetting('recommendation.link_ttl_hours')),
  };
}

// ---------------------------------------------------------------------------------------------
// Revenue (FR-M5-13)

const monthKey = (d: Date) => formatInTimeZone(d, IST, 'yyyy-MM');

export function getRevenue(now = new Date()) {
  const s = db();
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = subDays(new Date(`${formatInTimeZone(now, IST, 'yyyy-MM')}-15T06:00:00Z`), i * 30);
    return monthKey(d);
  }).reverse();
  const thisMonth = monthKey(now);
  const lastMonth = months.at(-2) ?? thisMonth;

  const consultFees = s.appointments.filter(
    (a) =>
      a.paymentId &&
      a.feePaise > 0 &&
      (a.status === 'booked' || a.status === 'completed' || a.status === 'no_show'),
  );
  const planOrders = s.orders.filter(
    (o) =>
      o.source === 'recommendation' &&
      o.planId &&
      o.paidAt &&
      !['pending_payment', 'cancelled', 'refunded'].includes(o.status),
  );

  const series = months.map((m) => {
    const fees = consultFees.filter((a) => monthKey(new Date(a.startsAt)) === m);
    const plans = planOrders.filter((o) => o.paidAt && monthKey(new Date(o.paidAt)) === m);
    return {
      month: m,
      label: formatInTimeZone(new Date(`${m}-15T06:00:00Z`), IST, 'MMM yyyy'),
      consultPaise: fees.reduce((sum, a) => sum + a.feePaise, 0),
      consultCount: fees.length,
      planPaise: plans.reduce((sum, o) => sum + o.totalPaise, 0),
      planCount: plans.length,
    };
  });
  const pick = (m: string) =>
    series.find((x) => x.month === m) ?? {
      month: m,
      label: m,
      consultPaise: 0,
      consultCount: 0,
      planPaise: 0,
      planCount: 0,
    };

  const byPlan = PLANS.map((plan) => {
    const list = planOrders.filter((o) => o.planId === plan.id);
    return { plan, count: list.length, paise: list.reduce((sum, o) => sum + o.totalPaise, 0) };
  });

  const recsSent = s.recommendations.length;
  const recsPaid = s.recommendations.filter((r) => r.status === 'paid').length;

  return {
    series,
    current: pick(thisMonth),
    previous: pick(lastMonth),
    byPlan,
    recsSent,
    recsPaid,
  };
}

export function guaranteeQueueCount(): number {
  return db().claims.filter((c) => c.status === 'submitted' || c.status === 'under_review').length;
}
