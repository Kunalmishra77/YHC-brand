import 'server-only';

import { addDays } from 'date-fns';
import type {
  Appointment,
  CareCheckin,
  Customer,
  GuaranteeClaim,
  HairConcern,
  Order,
  PrescriptionItem,
  ProgressPhotoSet,
} from '@/lib/domain/types';
import { istDate } from '@/lib/time';
import { getDoctor, getPlan, getProducts } from '@/server/catalog';
import { db, getSetting, planProgress } from '@/server/demo/store';

/*
 * Customer-scoped reads for /account. Demo: in-memory store. Phase 03+: user-scoped Supabase client
 * (RLS) plus server functions that return patient-safe clinical summaries.
 * Every function takes the customer id and only ever returns that customer's records.
 */

export const CONCERN_LABEL: Record<HairConcern, string> = {
  hair_fall: 'Hair fall',
  thinning: 'Thinning',
  receding_hairline: 'Receding hairline',
  crown_thinning: 'Crown thinning',
  dandruff_scalp: 'Dandruff and scalp',
  other: 'Other concern',
};

const byStartAsc = (a: Appointment, b: Appointment) => a.startsAt.localeCompare(b.startsAt);

export function customerAppointments(customerId: string, now = new Date()) {
  const all = db()
    .appointments.filter((a) => a.customerId === customerId)
    .sort(byStartAsc);
  const upcoming = all.filter((a) => a.status === 'booked' && new Date(a.endsAt) > now);
  const past = all
    .filter((a) => !upcoming.includes(a) && a.status !== 'held' && a.status !== 'expired')
    .reverse();
  return { upcoming, past };
}

export function customerOrders(customerId: string): Order[] {
  return db()
    .orders.filter((o) => o.customerId === customerId && o.status !== 'pending_payment')
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function findCustomerOrder(customerId: string, code: string): Order | null {
  return db().orders.find((o) => o.customerId === customerId && o.code === code) ?? null;
}

export function findCustomerAppointment(customerId: string, id: string): Appointment | null {
  return db().appointments.find((a) => a.customerId === customerId && a.id === id) ?? null;
}

/** The delivered plan order that is running now (or most recently finished). */
export function activePlan(customerId: string, now = new Date()) {
  const delivered = customerOrders(customerId).filter((o) => o.planId && o.deliveredOn && o.planEndOn);
  const today = istDate(now);
  const running = delivered.find((o) => (o.deliveredOn ?? '') <= today && (o.planEndOn ?? '') >= today);
  const order = running ?? delivered[0];
  if (!order) return null;
  const progress = planProgress(order, now);
  const plan = order.planId ? getPlan(order.planId) : null;
  if (!progress || !plan || !order.deliveredOn || !order.planEndOn) return null;
  const newer = customerOrders(customerId).some(
    (o) => o.planId && o.id !== order.id && o.createdAt > order.createdAt && o.status !== 'cancelled',
  );
  return {
    order,
    plan,
    progress,
    deliveredOn: order.deliveredOn,
    planEndOn: order.planEndOn,
    hasNewerPlanOrder: newer,
  };
}

export function customerCheckins(customerId: string): CareCheckin[] {
  return db()
    .checkins.filter((c) => c.customerId === customerId)
    .sort((a, b) => b.sentAt.localeCompare(a.sentAt));
}

export function customerPhotos(customerId: string): ProgressPhotoSet[] {
  return db()
    .photos.filter((p) => p.customerId === customerId)
    .sort((a, b) => a.takenOn.localeCompare(b.takenOn));
}

export function customerClaims(customerId: string): GuaranteeClaim[] {
  return db()
    .claims.filter((c) => c.customerId === customerId)
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
}

/** IST date the doctor asked for a follow-up, if no follow-up has been booked/attended since. */
export function followUpDueOn(customerId: string, now = new Date()): string | null {
  const { upcoming, past } = customerAppointments(customerId, now);
  const lastCompleted = past.find((a) => a.status === 'completed');
  if (!lastCompleted) return null;
  const notes = db().notes.find((n) => n.appointmentId === lastCompleted.id && n.status === 'completed');
  if (!notes?.followUpInWeeks) return null;
  if (upcoming.some((a) => a.kind === 'follow_up')) return null;
  return istDate(addDays(new Date(lastCompleted.startsAt), notes.followUpInWeeks * 7));
}

export function completedConsultStarts(customerId: string): string[] {
  return db()
    .appointments.filter((a) => a.customerId === customerId && a.status === 'completed')
    .map((a) => a.startsAt);
}

/** Patient-facing consultation summary — explicit field pick, NEVER `privateNotes` (FR-M4-3). */
export interface PatientSummary {
  chiefComplaint: string;
  assessment: string;
  treatmentPlan: string;
  followUpInstructions: string;
  followUpInWeeks: number | null;
}

export function patientSummary(customerId: string, appointmentId: string): PatientSummary | null {
  const appt = findCustomerAppointment(customerId, appointmentId);
  if (!appt) return null;
  const notes = db().notes.find((n) => n.appointmentId === appt.id && n.status === 'completed');
  if (!notes) return null;
  return {
    chiefComplaint: notes.chiefComplaint,
    assessment: notes.assessment,
    treatmentPlan: notes.treatmentPlan,
    followUpInstructions: notes.followUpInstructions,
    followUpInWeeks: notes.followUpInWeeks,
  };
}

export function hasPatientSummary(appointmentId: string): boolean {
  return db().notes.some((n) => n.appointmentId === appointmentId && n.status === 'completed');
}

export interface PrescriptionView {
  appointment: Appointment;
  customer: Customer;
  doctor: ReturnType<typeof getDoctor>;
  items: PrescriptionItem[];
  advice: string[];
  issuedAt: string;
  rxNo: string;
}

export function prescriptionFor(customerId: string, appointmentId: string): PrescriptionView | null {
  const appt = findCustomerAppointment(customerId, appointmentId);
  const customer = db().customers.find((c) => c.id === customerId);
  if (!appt || !customer || appt.status !== 'completed') return null;
  const rec = db()
    .recommendations.filter((r) => r.appointmentId === appt.id && r.customerId === customerId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  if (!rec || rec.items.length === 0) return null;
  const summary = patientSummary(customerId, appt.id);
  const advice = [summary?.followUpInstructions, rec.note].filter((x): x is string => Boolean(x?.trim()));
  return {
    appointment: appt,
    customer,
    doctor: getDoctor(),
    items: rec.items,
    advice,
    issuedAt: rec.createdAt,
    rxNo: `RX-${appt.code.replace('YHC-A-', '')}`,
  };
}

export function hasPrescription(customerId: string, appointmentId: string): boolean {
  return db().recommendations.some(
    (r) => r.appointmentId === appointmentId && r.customerId === customerId && r.items.length > 0,
  );
}

/** Saved delivery addresses — derived from past orders (Phase 03: `addresses` table). */
export function customerAddresses(customerId: string): string[] {
  return Array.from(
    new Set(
      customerOrders(customerId)
        .map((o) => o.address)
        .filter(Boolean),
    ),
  );
}

export function freeRescheduleHours(): number {
  return Number(getSetting('consult.free_reschedule_hours'));
}

/** Days before plan end at which reorder is suggested = the earliest refill reminder. */
export function reorderWindowDays(): number {
  try {
    const parsed: unknown = JSON.parse(getSetting('refill.reminder_days_before'));
    if (Array.isArray(parsed)) {
      const nums = parsed.filter((n): n is number => typeof n === 'number');
      if (nums.length) return Math.max(...nums);
    }
  } catch {
    // fall through
  }
  return 7;
}

// ---------------------------------------------------------------------------------------------
// Invoice (FR-M4-4) — HTML placeholder until Phase 09 GST invoices.

export interface InvoiceLine {
  label: string;
  qty: number;
  amountPaise: number;
  hsn: string | null;
  gstRate: number | null;
  includes: { name: string; hsn: string; gstRate: number }[];
}

export function invoiceFor(order: Order) {
  const products = getProducts();
  const rec = order.recommendationId
    ? db().recommendations.find((r) => r.id === order.recommendationId)
    : undefined;
  const lines: InvoiceLine[] = order.lines.map((line) => {
    const match = products.find((p) => p.name.toLowerCase() === line.label.toLowerCase());
    const includes =
      !match && order.planId && rec
        ? rec.productIds
            .map((id) => products.find((p) => p.id === id))
            .filter((p): p is NonNullable<typeof p> => Boolean(p))
            .map((p) => ({ name: p.name, hsn: p.hsn, gstRate: p.gstRate }))
        : [];
    return { ...line, hsn: match?.hsn ?? null, gstRate: match?.gstRate ?? null, includes };
  });
  const paid = new Date(order.paidAt ?? order.createdAt);
  const istYear = Number(istDate(paid).slice(0, 4));
  const istMonth = Number(istDate(paid).slice(5, 7));
  const fyStart = istMonth >= 4 ? istYear : istYear - 1;
  const fy = `${fyStart}-${String((fyStart + 1) % 100).padStart(2, '0')}`;
  const seq = String(Number(order.code.replace(/\D/g, '')) - 10000).padStart(5, '0');
  return { invoiceNo: `YHC/${fy}/${seq}`, issuedAt: order.paidAt ?? order.createdAt, lines };
}
