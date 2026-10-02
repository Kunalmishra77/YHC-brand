import 'server-only';

import { addDays, addMinutes, differenceInCalendarDays, subDays, subHours, subMinutes } from 'date-fns';
import { fromZonedTime } from 'date-fns-tz';
import type {
  Activity,
  Appointment,
  AuditEntry,
  CareCheckin,
  ConsultationNotes,
  Customer,
  DomainEvent,
  GuaranteeClaim,
  HairConcern,
  IntakeForm,
  Job,
  Lead,
  LeadSource,
  LeadStage,
  Message,
  Order,
  PrescriptionItem,
  ProgressPhotoSet,
  Recommendation,
  Setting,
  Task,
} from '@/lib/domain/types';
import { AppError } from '@/lib/errors';
import { formatINR } from '@/lib/money';
import { IST, formatIst, istDate } from '@/lib/time';
import { advanceStage, canSetManually, stageForEvent, type StageEvent } from '@/server/crm/stage-map';
import {
  computeAvailability,
  type AvailabilityInput,
  type DayAvailability,
  type TimeRange,
} from '@/server/booking/availability';
import { pricePlan } from '@/server/recommendations/pricing';
import { DOCTOR, PLANS, PRODUCTS, SETTINGS, STAFF } from './fixtures';

/*
 * In-memory demo store (ADR-23). One process only — fine for `pnpm dev` / `pnpm start` demos.
 * Every mutation mirrors a real flow: it changes state, emits a domain event and lets the
 * stage map move the CRM lead. Phase 01+ replaces this module with Supabase-backed code.
 */

export interface DemoState {
  customers: Customer[];
  leads: Lead[];
  appointments: Appointment[];
  intake: IntakeForm[];
  notes: ConsultationNotes[];
  recommendations: Recommendation[];
  orders: Order[];
  credits: { customerId: string; amountPaise: number; expiresAt: string; usedOrderId: string | null }[];
  activities: Activity[];
  tasks: Task[];
  messages: Message[];
  checkins: CareCheckin[];
  photos: ProgressPhotoSet[];
  claims: GuaranteeClaim[];
  jobs: Job[];
  audit: AuditEntry[];
  events: DomainEvent[];
  settings: Setting[];
  availability: AvailabilityConfig;
  seq: number;
}

export interface AvailabilityConfig {
  weeklyRules: Record<number, TimeRange[]>;
  exceptions: AvailabilityInput['exceptions'];
  busyBlocks: { startsAt: string; endsAt: string; title: string }[];
}

const globalForDemo = globalThis as unknown as { __yhcDemo?: DemoState };

export function db(): DemoState {
  globalForDemo.__yhcDemo ??= seed(new Date());
  return globalForDemo.__yhcDemo;
}

export function resetDemo(): void {
  globalForDemo.__yhcDemo = seed(new Date());
}

// ---------------------------------------------------------------------------------------------
// helpers

const iso = (d: Date) => d.toISOString();
const istAt = (date: string, hhmm: string) => fromZonedTime(`${date}T${hhmm}:00`, IST);

function nextId(prefix: string): string {
  const s = db();
  s.seq += 1;
  return `${prefix}-${s.seq}`;
}

export function getSetting(key: string): string {
  const found = db().settings.find((x) => x.key === key);
  if (!found) throw new AppError('setting_missing', `Setting ${key} is missing`, 500);
  return found.value;
}

export const getSettingNumber = (key: string) => Number(getSetting(key));

function emit(type: string, aggregateId: string): DomainEvent {
  const s = db();
  const event = { id: (s.events.at(-1)?.id ?? 0) + 1, type, aggregateId, at: iso(new Date()) };
  s.events.push(event);
  return event;
}

function moveLead(customerId: string, event: StageEvent, summary: string) {
  const s = db();
  const lead = s.leads.find((l) => l.customerId === customerId);
  if (!lead) return;
  const next = advanceStage(lead.stage, stageForEvent(event));
  if (next !== lead.stage) {
    addActivity(lead.id, 'stage_change', `Stage → ${next.replaceAll('_', ' ')} (${summary})`, 'System');
    lead.stage = next;
    lead.updatedAt = iso(new Date());
  }
}

function addActivity(leadId: string, kind: Activity['kind'], summary: string, actor: string) {
  db().activities.unshift({ id: nextId('act'), leadId, kind, summary, actor, at: iso(new Date()) });
}

function logMessage(customerId: string, template: string, preview: string) {
  const s = db();
  const lead = s.leads.find((l) => l.customerId === customerId);
  s.messages.unshift({
    id: nextId('msg'),
    customerId,
    leadId: lead?.id ?? null,
    channel: 'whatsapp',
    direction: 'outbound',
    template,
    category: 'utility',
    preview,
    status: 'delivered',
    at: iso(new Date()),
  });
  if (lead) addActivity(lead.id, 'message', `WhatsApp: ${template}`, 'System');
}

function audit(actor: string, action: string, target: string) {
  db().audit.unshift({ id: nextId('aud'), actor, action, target, at: iso(new Date()) });
}

export function recordAudit(actor: string, action: string, target: string): void {
  audit(actor, action, target);
}

const nextApptCode = () => `YHC-A-${1000 + db().appointments.length + 1}`;
const nextOrderCode = () => `YHC-${10000 + db().orders.length + 1}`;
const token = () =>
  Array.from({ length: 36 }, () => 'abcdefghijkmnpqrstuvwxyz23456789'[Math.floor(Math.random() * 32)]).join(
    '',
  );

// ---------------------------------------------------------------------------------------------
// availability (FR-M3-2, FR-M5-4)

export function getAvailabilityConfig(): AvailabilityConfig {
  return db().availability;
}

export function updateAvailability(config: AvailabilityConfig, actor: string): void {
  db().availability = config;
  audit(actor, 'availability.update', 'weekly rules / exceptions');
}

/** Bookable slots for the next `consult.booking_window_days`, via the real availability engine. */
export function getSlots(now = new Date()): DayAvailability[] {
  const cfg = db().availability;
  return computeAvailability({
    weeklyRules: cfg.weeklyRules,
    exceptions: cfg.exceptions,
    busyBlocks: cfg.busyBlocks.map((b) => ({ startsAt: new Date(b.startsAt), endsAt: new Date(b.endsAt) })),
    taken: busyAppointments(now)
      .filter((a) => a.status !== 'completed' || new Date(a.endsAt) > now)
      .map((a) => ({ startsAt: new Date(a.startsAt), endsAt: new Date(a.endsAt) })),
    slotMinutes: getSettingNumber('consult.slot_minutes'),
    bufferMinutes: getSettingNumber('consult.buffer_minutes'),
    minNoticeMinutes: getSettingNumber('consult.min_notice_minutes'),
    maxPerDay: getSettingNumber('consult.max_per_day'),
    windowDays: getSettingNumber('consult.booking_window_days'),
    now,
  });
}

/** Domain events after `afterId` — the demo stand-in for Supabase Realtime (FR-M7-6). */
export function getEventsSince(afterId: number): DomainEvent[] {
  return db().events.filter((e) => e.id > afterId);
}

// ---------------------------------------------------------------------------------------------
// booking (FR-M3)

export function busyAppointments(now = new Date()) {
  return db().appointments.filter(
    (a) =>
      a.status === 'booked' ||
      a.status === 'completed' ||
      (a.status === 'held' && a.holdExpiresAt && new Date(a.holdExpiresAt) > now),
  );
}

export function findOrCreateCustomer(input: {
  phone: string;
  name?: string;
  age?: number;
  source?: LeadSource;
}): Customer {
  const s = db();
  let customer = s.customers.find((c) => c.phone === input.phone);
  if (!customer) {
    customer = {
      id: nextId('cus'),
      name: input.name ?? 'New customer',
      phone: input.phone,
      email: null,
      age: input.age ?? 30,
      gender: 'male',
      city: '—',
      createdAt: iso(new Date()),
    };
    s.customers.push(customer);
  } else {
    if (input.name) customer.name = input.name;
    if (input.age) customer.age = input.age;
  }
  if (!s.leads.some((l) => l.customerId === customer.id)) {
    const owner = roundRobinOwner();
    const lead: Lead = {
      id: nextId('lead'),
      name: customer.name,
      phone: customer.phone,
      customerId: customer.id,
      source: input.source ?? 'website',
      campaign: null,
      stage: 'new',
      ownerId: owner,
      lostReason: null,
      nextAction: 'First contact',
      nextActionAt: iso(addMinutes(new Date(), 15)),
      createdAt: iso(new Date()),
      updatedAt: iso(new Date()),
    };
    s.leads.unshift(lead);
    addActivity(lead.id, 'note', `Lead created from ${lead.source}`, 'System');
    emit('lead.created', lead.id);
  } else {
    const lead = s.leads.find((l) => l.customerId === customer.id);
    if (lead && input.name) lead.name = input.name;
  }
  return customer;
}

function roundRobinOwner(): string {
  const pool = STAFF.filter((u) => u.role === 'sales' && u.active);
  const counts = pool.map((u) => db().leads.filter((l) => l.ownerId === u.id).length);
  const min = Math.min(...counts);
  return pool[counts.indexOf(min)]?.id ?? 'u-priya';
}

export function holdSlot(input: { customerId: string; startsAt: Date; concern: HairConcern }): Appointment {
  const s = db();
  const now = new Date();
  const slotMinutes = getSettingNumber('consult.slot_minutes');
  const endsAt = addMinutes(input.startsAt, slotMinutes);
  const clash = busyAppointments(now).some(
    (a) => new Date(a.startsAt) < endsAt && input.startsAt < new Date(a.endsAt),
  );
  if (clash) throw new AppError('slot_taken', 'That time was just taken. Please pick another slot.', 409);

  // One live hold per customer (FR-M3-5)
  for (const a of s.appointments) {
    if (a.customerId === input.customerId && a.status === 'held') a.status = 'expired';
  }

  const appt: Appointment = {
    id: nextId('apt'),
    code: nextApptCode(),
    customerId: input.customerId,
    doctorId: DOCTOR.id,
    kind: 'first',
    status: 'held',
    startsAt: iso(input.startsAt),
    endsAt: iso(endsAt),
    holdExpiresAt: iso(addMinutes(now, getSettingNumber('consult.hold_minutes'))),
    feePaise: getSettingNumber('consult.fee_paise'),
    concern: input.concern,
    intakeDone: false,
    photosDone: false,
    paymentId: null,
    joinUrl: '',
  };
  appt.joinUrl = `/consult/${appt.id}`;
  s.appointments.push(appt);
  emit('appointment.held', appt.id);
  moveLead(input.customerId, { type: 'appointment.held' }, appt.code);
  return appt;
}

/** Demo stand-in for webhook → capture_payment → confirm_appointment_payment (idempotent). */
export function captureConsultPayment(appointmentId: string): Appointment {
  const s = db();
  const appt = s.appointments.find((a) => a.id === appointmentId);
  if (!appt) throw new AppError('not_found', 'Appointment not found', 404);
  if (appt.status === 'booked') return appt; // already captured
  if (appt.status !== 'held') throw new AppError('invalid_state', `Appointment is ${appt.status}`, 409);
  appt.status = 'booked';
  appt.holdExpiresAt = null;
  appt.paymentId = `pay_demo_${token().slice(0, 14)}`;
  emit('appointment.booked', appt.id);
  moveLead(appt.customerId, { type: 'payment.consultation.captured' }, `${formatINR(appt.feePaise)} paid`);
  const lead = s.leads.find((l) => l.customerId === appt.customerId);
  if (lead)
    addActivity(lead.id, 'payment', `₹500 PAID · ${appt.paymentId} · ${appt.code}`, 'Razorpay (demo)');
  logMessage(
    appt.customerId,
    'booking_confirmed',
    `Your consultation is confirmed. ${formatIst(new Date(appt.startsAt))} with ${DOCTOR.name}. Appointment ID ${appt.code}.`,
  );
  scheduleJob('appointment.reminder', `reminder:${appt.id}:1440`, subHours(new Date(appt.startsAt), 24));
  scheduleJob('intake.reminder', `intake:${appt.id}:180`, subHours(new Date(appt.startsAt), 3));
  return appt;
}

export function saveIntake(input: IntakeForm & { photos: number }): void {
  const s = db();
  const appt = s.appointments.find((a) => a.id === input.appointmentId);
  if (!appt) throw new AppError('not_found', 'Appointment not found', 404);
  const { photos, ...form } = input;
  s.intake = s.intake.filter((f) => f.appointmentId !== input.appointmentId).concat(form);
  appt.intakeDone = true;
  appt.photosDone = photos >= 3;
  emit('intake.submitted', appt.id);
}

// ---------------------------------------------------------------------------------------------
// consultation (FR-M5)

export function saveNotes(input: Omit<ConsultationNotes, 'status'>): ConsultationNotes {
  const s = db();
  const existing = s.notes.find((n) => n.appointmentId === input.appointmentId);
  const notes: ConsultationNotes = { ...input, status: existing?.status ?? 'draft' };
  s.notes = s.notes.filter((n) => n.appointmentId !== input.appointmentId).concat(notes);
  return notes;
}

export function completeConsultation(appointmentId: string, actor: string): void {
  const s = db();
  const appt = s.appointments.find((a) => a.id === appointmentId);
  const notes = s.notes.find((n) => n.appointmentId === appointmentId);
  if (!appt) throw new AppError('not_found', 'Appointment not found', 404);
  if (!notes?.identityVerified || !notes.consentRecorded) {
    throw new AppError('consent_required', 'Confirm patient identity and consent before completing.', 422);
  }
  if (appt.status === 'completed') return;
  appt.status = 'completed';
  notes.status = 'completed';
  if (appt.kind === 'first' && appt.feePaise > 0) {
    s.credits.push({
      customerId: appt.customerId,
      amountPaise: appt.feePaise,
      expiresAt: iso(addDays(new Date(), getSettingNumber('consult.credit_window_days'))),
      usedOrderId: null,
    });
  }
  emit('consultation.completed', appt.id);
  moveLead(appt.customerId, { type: 'consultation.completed' }, appt.code);
  audit(actor, 'consultation.complete', appt.code);
}

export function markNoShow(appointmentId: string, actor: string): void {
  const appt = db().appointments.find((a) => a.id === appointmentId);
  if (!appt) throw new AppError('not_found', 'Appointment not found', 404);
  appt.status = 'no_show';
  emit('appointment.no_show', appt.id);
  logMessage(
    appt.customerId,
    'no_show_rebook',
    'We missed you at your consultation today. Would you like to pick a new time?',
  );
  audit(actor, 'appointment.no_show', appt.code);
}

// ---------------------------------------------------------------------------------------------
// recommendation & purchase (FR-M6)

export function quotePlan(customerId: string, planId: string) {
  const plan = PLANS.find((p) => p.id === planId);
  if (!plan) throw new AppError('not_found', 'Plan not found', 404);
  return pricePlan({
    planPricePaise: plan.pricePaise,
    credits: db().credits.filter((c) => c.customerId === customerId),
    creditEnabled: getSetting('consult.credit_enabled') === 'true',
    now: new Date(),
  });
}

export function createRecommendation(input: {
  appointmentId: string;
  planId: string;
  productIds: string[];
  items: PrescriptionItem[];
  note: string;
  actor: string;
}): Recommendation {
  const s = db();
  const appt = s.appointments.find((a) => a.id === input.appointmentId);
  if (!appt) throw new AppError('not_found', 'Appointment not found', 404);
  if (appt.status !== 'completed') completeConsultation(appt.id, input.actor);
  const rec: Recommendation = {
    id: nextId('rec'),
    token: token(),
    appointmentId: appt.id,
    customerId: appt.customerId,
    status: 'sent',
    planId: input.planId,
    productIds: input.productIds,
    note: input.note,
    items: input.items,
    createdAt: iso(new Date()),
    expiresAt: iso(addMinutes(new Date(), getSettingNumber('recommendation.link_ttl_hours') * 60)),
  };
  s.recommendations.push(rec);
  emit('recommendation.sent', rec.id);
  moveLead(appt.customerId, { type: 'recommendation.sent' }, 'plan link sent');
  const customer = s.customers.find((c) => c.id === appt.customerId);
  logMessage(
    appt.customerId,
    'plan_ready',
    `Hi ${customer?.name.split(' ')[0] ?? ''}, ${DOCTOR.name} has shared your personalised hair plan.`,
  );
  scheduleJob('recommendation.nudge', `rec:${rec.id}:nudge`, addMinutes(new Date(), 24 * 60));
  audit(input.actor, 'recommendation.create', rec.id);
  return rec;
}

export function payRecommendation(input: { token: string; planId: string; address: string }): Order {
  const s = db();
  const rec = s.recommendations.find((r) => r.token === input.token);
  if (!rec) throw new AppError('not_found', 'This link is not valid.', 404);
  if (rec.status === 'paid') {
    const paid = s.orders.find((o) => o.recommendationId === rec.id && o.status !== 'pending_payment');
    if (paid) return paid;
  }
  if (new Date(rec.expiresAt) < new Date())
    throw new AppError('expired', 'This plan link has expired. Ask our team for a new one.', 410);
  const plan = PLANS.find((p) => p.id === input.planId);
  if (!plan) throw new AppError('not_found', 'Plan not found', 404);
  const price = quotePlan(rec.customerId, plan.id);
  const order = createOrder({
    customerId: rec.customerId,
    source: 'recommendation',
    planId: plan.id,
    recommendationId: rec.id,
    lines: [{ label: plan.name, qty: 1, amountPaise: plan.pricePaise }],
    price,
    address: input.address,
  });
  const credit = s.credits.find((c) => c.customerId === rec.customerId && c.usedOrderId === null);
  if (credit && price.creditPaise > 0) credit.usedOrderId = order.id;
  rec.status = 'paid';
  return markOrderPaid(order.id);
}

export function buyProducts(input: {
  customerId: string;
  items: { productId: string; qty: number }[];
  address: string;
}): Order {
  const lines = input.items.map((i) => {
    const p = PRODUCTS.find((x) => x.id === i.productId);
    if (!p || p.requiresConsultation || p.pricePaise === null) {
      throw new AppError('not_buyable', 'This product needs a consultation first.', 422);
    }
    return { label: p.name, qty: i.qty, amountPaise: p.pricePaise * i.qty };
  });
  const subtotal = lines.reduce((sum, l) => sum + l.amountPaise, 0);
  const order = createOrder({
    customerId: input.customerId,
    source: 'shop',
    planId: null,
    recommendationId: null,
    lines,
    price: { subtotalPaise: subtotal, creditPaise: 0, totalPaise: subtotal },
    address: input.address,
  });
  return markOrderPaid(order.id);
}

export function reorder(orderId: string): Order {
  const s = db();
  const parent = s.orders.find((o) => o.id === orderId);
  if (!parent?.planId) throw new AppError('not_found', 'Order not found', 404);
  const plan = PLANS.find((p) => p.id === parent.planId);
  if (!plan) throw new AppError('not_found', 'Plan not found', 404);
  const order = createOrder({
    customerId: parent.customerId,
    source: 'reorder',
    planId: plan.id,
    recommendationId: parent.recommendationId,
    lines: [{ label: plan.name, qty: 1, amountPaise: plan.pricePaise }],
    price: { subtotalPaise: plan.pricePaise, creditPaise: 0, totalPaise: plan.pricePaise },
    address: parent.address,
  });
  for (const j of s.jobs)
    if (j.dedupeKey.startsWith(`refill:${parent.id}:`) && j.status === 'pending') j.status = 'cancelled';
  return markOrderPaid(order.id);
}

function createOrder(input: {
  customerId: string;
  source: Order['source'];
  planId: string | null;
  recommendationId: string | null;
  lines: Order['lines'];
  price: { subtotalPaise: number; creditPaise: number; totalPaise: number };
  address: string;
}): Order {
  const order: Order = {
    id: nextId('ord'),
    code: nextOrderCode(),
    customerId: input.customerId,
    source: input.source,
    status: 'pending_payment',
    planId: input.planId,
    recommendationId: input.recommendationId,
    lines: input.lines,
    subtotalPaise: input.price.subtotalPaise,
    creditPaise: input.price.creditPaise,
    totalPaise: input.price.totalPaise,
    paymentId: null,
    createdAt: iso(new Date()),
    paidAt: null,
    deliveredOn: null,
    planEndOn: null,
    courier: null,
    awb: null,
    address: input.address,
  };
  db().orders.push(order);
  return order;
}

/** Demo stand-in for capture_payment → mark_order_paid. */
export function markOrderPaid(orderId: string): Order {
  const s = db();
  const order = s.orders.find((o) => o.id === orderId);
  if (!order) throw new AppError('not_found', 'Order not found', 404);
  if (order.status !== 'pending_payment') return order;
  order.status = 'paid';
  order.paidAt = iso(new Date());
  order.paymentId = `pay_demo_${token().slice(0, 14)}`;
  emit('order.paid', order.id);
  const source = order.source === 'reorder' ? 'reorder' : order.source === 'shop' ? 'shop' : 'recommendation';
  if (order.planId) moveLead(order.customerId, { type: 'order.paid', source }, `${order.code} paid`);
  const lead = s.leads.find((l) => l.customerId === order.customerId);
  if (lead)
    addActivity(lead.id, 'payment', `${formatINR(order.totalPaise)} PAID · ${order.code}`, 'Razorpay (demo)');
  logMessage(
    order.customerId,
    'order_confirmed',
    `Order ${order.code} confirmed. Amount paid ${formatINR(order.totalPaise)}.`,
  );
  scheduleJob('shipping.create', `ship:${order.id}`, new Date());
  scheduleJob('invoice.generate', `invoice:${order.id}`, new Date());
  return order;
}

// ---------------------------------------------------------------------------------------------
// fulfilment (FR-M9)

const FLOW: Order['status'][] = ['paid', 'processing', 'shipped', 'delivered'];

export function advanceOrder(orderId: string, actor: string): Order {
  const s = db();
  const order = s.orders.find((o) => o.id === orderId);
  if (!order) throw new AppError('not_found', 'Order not found', 404);
  const i = FLOW.indexOf(order.status);
  const next = FLOW[i + 1];
  if (i < 0 || !next) throw new AppError('invalid_state', `Order is ${order.status}`, 409);
  order.status = next;
  if (next === 'shipped') {
    order.courier = 'Delhivery (demo)';
    order.awb = `AWB${Math.floor(1e9 + Math.random() * 9e9)}`;
    logMessage(
      order.customerId,
      'order_shipped',
      `Your order ${order.code} has shipped with ${order.courier}.`,
    );
  }
  if (next === 'delivered') {
    const today = istDate(new Date());
    order.deliveredOn = today;
    const plan = PLANS.find((p) => p.id === order.planId);
    if (plan) {
      const end = addDays(new Date(`${today}T00:00:00Z`), plan.months * 30);
      order.planEndOn = end.toISOString().slice(0, 10);
      for (const d of [7, 4, 1])
        scheduleJob('refill.reminder', `refill:${order.id}:${d}`, istAt(istDate(subDays(end, d)), '10:00'));
      for (let w = 1; w <= 4; w++)
        scheduleJob(
          'care.checkin',
          `checkin:${order.id}:${w}`,
          istAt(istDate(addDays(new Date(), 7 * w)), '10:00'),
        );
      moveLead(order.customerId, { type: 'order.delivered' }, `${order.code} delivered`);
    }
    logMessage(order.customerId, 'order_delivered', `Your order ${order.code} was delivered.`);
    emit('order.delivered', order.id);
  }
  audit(actor, `order.${next}`, order.code);
  return order;
}

// ---------------------------------------------------------------------------------------------
// CRM (FR-M7)

export function setLeadStage(leadId: string, stage: LeadStage, actor: string, reason?: string): Lead {
  const lead = db().leads.find((l) => l.id === leadId);
  if (!lead) throw new AppError('not_found', 'Lead not found', 404);
  if (!canSetManually(lead.stage, stage)) {
    throw new AppError('stage_locked', 'This stage is set automatically by payments and bookings.', 422);
  }
  lead.stage = stage;
  lead.lostReason = stage === 'lost' ? (reason ?? 'Not specified') : null;
  lead.updatedAt = iso(new Date());
  addActivity(
    lead.id,
    'stage_change',
    `Stage → ${stage.replaceAll('_', ' ')}${reason ? ` (${reason})` : ''}`,
    actor,
  );
  return lead;
}

export function logLeadActivity(
  leadId: string,
  kind: 'call' | 'whatsapp' | 'note',
  summary: string,
  actor: string,
): void {
  if (!db().leads.some((l) => l.id === leadId)) throw new AppError('not_found', 'Lead not found', 404);
  addActivity(leadId, kind, summary, actor);
}

export function sendConsultLink(leadId: string, actor: string): void {
  const lead = db().leads.find((l) => l.id === leadId);
  if (!lead) throw new AppError('not_found', 'Lead not found', 404);
  if (lead.customerId)
    logMessage(
      lead.customerId,
      'consult_link',
      `Hi ${lead.name.split(' ')[0]}, here is your link to book a consultation with ${DOCTOR.name}.`,
    );
  else addActivity(lead.id, 'message', 'WhatsApp: consult_link', actor);
  const next = advanceStage(lead.stage, stageForEvent({ type: 'consult_link.sent' }));
  if (next !== lead.stage) {
    lead.stage = next;
    addActivity(lead.id, 'stage_change', 'Stage → consult link sent', actor);
  }
  emit('consult_link.sent', lead.id);
}

export function createManualLead(input: {
  name: string;
  phone: string;
  source: LeadSource;
  actor: string;
}): Lead {
  const customer = findOrCreateCustomer({ phone: input.phone, name: input.name, source: input.source });
  const lead = db().leads.find((l) => l.customerId === customer.id);
  if (!lead) throw new AppError('internal', 'Lead not created', 500);
  addActivity(lead.id, 'note', `Added manually by ${input.actor}`, input.actor);
  return lead;
}

export function completeTask(taskId: string): void {
  const task = db().tasks.find((t) => t.id === taskId);
  if (task) task.status = 'done';
}

export function updateSetting(key: string, value: string, actor: string): void {
  const setting = db().settings.find((x) => x.key === key);
  if (!setting) throw new AppError('not_found', 'Unknown setting', 404);
  setting.value = value;
  audit(actor, 'settings.update', `${key} = ${value}`);
}

function scheduleJob(kind: string, dedupeKey: string, runAt: Date) {
  const s = db();
  if (s.jobs.some((j) => j.dedupeKey === dedupeKey)) return;
  s.jobs.unshift({
    id: nextId('job'),
    kind,
    status: 'pending',
    runAt: iso(runAt),
    attempts: 0,
    dedupeKey,
    lastError: null,
  });
}

/** Day X of Y for a delivered plan order. */
export function planProgress(order: Order, now = new Date()) {
  if (!order.deliveredOn || !order.planEndOn) return null;
  const total = differenceInCalendarDays(new Date(order.planEndOn), new Date(order.deliveredOn));
  const day = Math.min(
    total,
    differenceInCalendarDays(new Date(istDate(now)), new Date(order.deliveredOn)) + 1,
  );
  return { day, total };
}

// ---------------------------------------------------------------------------------------------
// seed

interface SeedPerson {
  name: string;
  phone: string;
  age: number;
  gender: Customer['gender'];
  city: string;
  source: LeadSource;
  campaign: string | null;
  stage: LeadStage;
  owner: string;
  concern: HairConcern;
}

const PEOPLE: SeedPerson[] = [
  {
    name: 'Rahul Mehra',
    phone: '+919000000001',
    age: 32,
    gender: 'male',
    city: 'Jaipur',
    source: 'meta_ads',
    campaign: 'hairfall-oct',
    stage: 'followup_active',
    owner: 'u-priya',
    concern: 'crown_thinning',
  },
  {
    name: 'Ankit Sharma',
    phone: '+919000000002',
    age: 28,
    gender: 'male',
    city: 'Lucknow',
    source: 'meta_ads',
    campaign: 'hairfall-oct',
    stage: 'payment_successful',
    owner: 'u-priya',
    concern: 'receding_hairline',
  },
  {
    name: 'Sneha Kapoor',
    phone: '+919000000003',
    age: 34,
    gender: 'female',
    city: 'Indore',
    source: 'website',
    campaign: null,
    stage: 'payment_successful',
    owner: 'u-rohit',
    concern: 'thinning',
  },
  {
    name: 'Vikram Singh',
    phone: '+919000000004',
    age: 41,
    gender: 'male',
    city: 'Chandigarh',
    source: 'google',
    campaign: 'search-brand',
    stage: 'payment_successful',
    owner: 'u-neha',
    concern: 'crown_thinning',
  },
  {
    name: 'Pooja Nair',
    phone: '+919000000005',
    age: 29,
    gender: 'female',
    city: 'Kochi',
    source: 'whatsapp',
    campaign: null,
    stage: 'payment_successful',
    owner: 'u-rohit',
    concern: 'hair_fall',
  },
  {
    name: 'Aditya Rao',
    phone: '+919000000006',
    age: 26,
    gender: 'male',
    city: 'Nagpur',
    source: 'meta_ads',
    campaign: 'reels-sept',
    stage: 'payment_successful',
    owner: 'u-priya',
    concern: 'hair_fall',
  },
  {
    name: 'Karan Malhotra',
    phone: '+919000000007',
    age: 37,
    gender: 'male',
    city: 'Delhi',
    source: 'referral',
    campaign: null,
    stage: 'product_recommended',
    owner: 'u-neha',
    concern: 'receding_hairline',
  },
  {
    name: 'Meera Joshi',
    phone: '+919000000008',
    age: 31,
    gender: 'female',
    city: 'Pune',
    source: 'meta_ads',
    campaign: 'hairfall-oct',
    stage: 'consult_completed',
    owner: 'u-rohit',
    concern: 'thinning',
  },
  {
    name: 'Siddharth Jain',
    phone: '+919000000009',
    age: 35,
    gender: 'male',
    city: 'Ahmedabad',
    source: 'website',
    campaign: null,
    stage: 'product_purchased',
    owner: 'u-priya',
    concern: 'crown_thinning',
  },
  {
    name: 'Ritu Agarwal',
    phone: '+919000000010',
    age: 44,
    gender: 'female',
    city: 'Kanpur',
    source: 'meta_ads',
    campaign: 'reels-sept',
    stage: 'reorder_due',
    owner: 'u-neha',
    concern: 'thinning',
  },
  {
    name: 'Manish Kumar',
    phone: '+919000000011',
    age: 30,
    gender: 'male',
    city: 'Patna',
    source: 'meta_ads',
    campaign: 'hairfall-oct',
    stage: 'new',
    owner: 'u-rohit',
    concern: 'hair_fall',
  },
  {
    name: 'Divya Menon',
    phone: '+919000000012',
    age: 27,
    gender: 'female',
    city: 'Bengaluru',
    source: 'whatsapp',
    campaign: null,
    stage: 'new',
    owner: 'u-priya',
    concern: 'dandruff_scalp',
  },
  {
    name: 'Harsh Vardhan',
    phone: '+919000000013',
    age: 24,
    gender: 'male',
    city: 'Bhopal',
    source: 'meta_ads',
    campaign: 'reels-sept',
    stage: 'contacted',
    owner: 'u-neha',
    concern: 'receding_hairline',
  },
  {
    name: 'Nisha Bansal',
    phone: '+919000000014',
    age: 33,
    gender: 'female',
    city: 'Ludhiana',
    source: 'google',
    campaign: 'search-generic',
    stage: 'interested',
    owner: 'u-rohit',
    concern: 'hair_fall',
  },
  {
    name: 'Rajat Khanna',
    phone: '+919000000015',
    age: 39,
    gender: 'male',
    city: 'Gurugram',
    source: 'meta_ads',
    campaign: 'hairfall-oct',
    stage: 'consult_suggested',
    owner: 'u-priya',
    concern: 'crown_thinning',
  },
  {
    name: 'Tanvi Desai',
    phone: '+919000000016',
    age: 30,
    gender: 'female',
    city: 'Surat',
    source: 'website',
    campaign: null,
    stage: 'consult_link_sent',
    owner: 'u-neha',
    concern: 'thinning',
  },
  {
    name: 'Gaurav Chauhan',
    phone: '+919000000017',
    age: 36,
    gender: 'male',
    city: 'Dehradun',
    source: 'meta_ads',
    campaign: 'reels-sept',
    stage: 'consult_booked',
    owner: 'u-rohit',
    concern: 'hair_fall',
  },
  {
    name: 'Ishaan Bose',
    phone: '+919000000018',
    age: 22,
    gender: 'male',
    city: 'Kolkata',
    source: 'meta_ads',
    campaign: 'hairfall-oct',
    stage: 'lost',
    owner: 'u-priya',
    concern: 'hair_fall',
  },
  {
    name: 'Farhan Qureshi',
    phone: '+919000000019',
    age: 33,
    gender: 'male',
    city: 'Hyderabad',
    source: 'whatsapp',
    campaign: null,
    stage: 'new',
    owner: 'u-neha',
    concern: 'receding_hairline',
  },
  {
    name: 'Lakshmi Iyer',
    phone: '+919000000020',
    age: 46,
    gender: 'female',
    city: 'Chennai',
    source: 'referral',
    campaign: null,
    stage: 'contacted',
    owner: 'u-rohit',
    concern: 'thinning',
  },
];

export const DEMO_CUSTOMER_PHONE = '+919000000001';

function seed(now: Date): DemoState {
  const s: DemoState = {
    customers: [],
    leads: [],
    appointments: [],
    intake: [],
    notes: [],
    recommendations: [],
    orders: [],
    credits: [],
    activities: [],
    tasks: [],
    messages: [],
    checkins: [],
    photos: [],
    claims: [],
    jobs: [],
    audit: [],
    events: [],
    settings: SETTINGS.map((x) => ({ ...x })),
    availability: {
      weeklyRules: {
        1: [
          { start: '10:00', end: '13:00' },
          { start: '14:00', end: '18:00' },
        ],
        2: [
          { start: '10:00', end: '13:00' },
          { start: '14:00', end: '18:00' },
        ],
        3: [
          { start: '10:00', end: '13:00' },
          { start: '14:00', end: '18:00' },
        ],
        4: [
          { start: '10:00', end: '13:00' },
          { start: '14:00', end: '18:00' },
        ],
        5: [
          { start: '10:00', end: '13:00' },
          { start: '14:00', end: '18:00' },
        ],
        6: [{ start: '10:00', end: '14:00' }],
      },
      exceptions: [],
      busyBlocks: [
        {
          startsAt: iso(istAt(istDate(addDays(now, 2)), '16:00')),
          endsAt: iso(istAt(istDate(addDays(now, 2)), '18:00')),
          title: 'Google Calendar: busy',
        },
      ],
    },
    seq: 100,
  };
  const today = istDate(now);
  const id = (p: string, i: number) => `${p}-s${i}`;
  let apptNo = 1000;
  let orderNo = 10000;

  PEOPLE.forEach((p, i) => {
    const created = subHours(now, (i + 1) * 9 + (i % 3) * 17);
    const customer: Customer = {
      id: id('cus', i),
      name: p.name,
      phone: p.phone,
      email: i % 3 === 0 ? `${p.name.split(' ')[0]?.toLowerCase()}@example.com` : null,
      age: p.age,
      gender: p.gender,
      city: p.city,
      createdAt: iso(created),
    };
    s.customers.push(customer);
    s.leads.push({
      id: id('lead', i),
      name: p.name,
      phone: p.phone,
      customerId: customer.id,
      source: p.source,
      campaign: p.campaign,
      stage: p.stage,
      ownerId: p.owner,
      lostReason: p.stage === 'lost' ? 'Price concern' : null,
      nextAction: nextActionFor(p.stage),
      nextActionAt: iso(addMinutes(now, (i % 5) * 45 - 30)),
      createdAt: iso(created),
      updatedAt: iso(subHours(now, i % 6)),
    });
    s.activities.push({
      id: id('act', i * 10),
      leadId: id('lead', i),
      kind: 'note',
      summary: `Lead created from ${p.source}${p.campaign ? ` · ${p.campaign}` : ''}`,
      actor: 'System',
      at: iso(created),
    });
    if (p.stage !== 'new') {
      s.activities.push({
        id: id('act', i * 10 + 1),
        leadId: id('lead', i),
        kind: 'call',
        summary: 'Call · connected · explained consultation process',
        actor: STAFF.find((u) => u.id === p.owner)?.name ?? 'Sales',
        at: iso(addMinutes(created, 12)),
      });
    }
  });

  const customerAt = (i: number) => s.customers[i] as Customer;

  // Today's consultations for the doctor (FR-M5-2)
  const todaySlots = ['10:00', '10:40', '11:20', '12:00', '14:00', '14:40', '15:20'];
  const todayPeople = [7, 1, 2, 3, 4, 5, 16];
  todaySlots.forEach((time, k) => {
    const pi = todayPeople[k] as number;
    const c = customerAt(pi);
    const starts = istAt(today, time);
    const status: Appointment['status'] = k === 0 ? 'completed' : 'booked';
    const appt: Appointment = {
      id: id('apt', k),
      code: `YHC-A-${++apptNo}`,
      customerId: c.id,
      doctorId: DOCTOR.id,
      kind: 'first',
      status: k === 6 ? 'held' : status,
      startsAt: iso(starts),
      endsAt: iso(addMinutes(starts, 30)),
      holdExpiresAt: k === 6 ? iso(addMinutes(now, 8)) : null,
      feePaise: 50000,
      concern: PEOPLE[pi]?.concern ?? 'hair_fall',
      intakeDone: k !== 4 && k !== 6,
      photosDone: k !== 4 && k !== 5 && k !== 6,
      paymentId: k === 6 ? null : `pay_demo_S${k}xyz${k}`,
      joinUrl: `/consult/${id('apt', k)}`,
    };
    s.appointments.push(appt);
    if (appt.intakeDone) s.intake.push(sampleIntake(appt.id, k));
  });
  s.notes.push({
    appointmentId: id('apt', 0),
    chiefComplaint: 'Thinning over 8 months, worse after a stressful period.',
    observations: 'Diffuse thinning, mid-scalp. Scalp healthy; no scaling.',
    assessment: 'Likely pattern thinning with a shedding component (provisional).',
    treatmentPlan: 'Topical solution nightly, scalp serum, nutrition tablets. Review in 8 weeks.',
    followUpInstructions: 'Use the routine daily. Share progress photos every month.',
    privateNotes: 'Discussed realistic expectations; patient anxious about cost.',
    identityVerified: true,
    consentRecorded: true,
    status: 'completed',
    followUpInWeeks: 8,
  });
  s.credits.push({
    customerId: customerAt(7).id,
    amountPaise: 50000,
    expiresAt: iso(addDays(now, 7)),
    usedOrderId: null,
  });

  // Upcoming days
  for (let d = 1; d <= 5; d++) {
    const date = istDate(addDays(now, d));
    ['11:20', '15:20'].forEach((time, k) => {
      const pi = (d * 2 + k) % PEOPLE.length;
      if ([0, 8, 9, 17].includes(pi)) return;
      const starts = istAt(date, time);
      s.appointments.push({
        id: id('apt', 100 + d * 10 + k),
        code: `YHC-A-${++apptNo}`,
        customerId: customerAt(pi).id,
        doctorId: DOCTOR.id,
        kind: d === 3 ? 'follow_up' : 'first',
        status: 'booked',
        startsAt: iso(starts),
        endsAt: iso(addMinutes(starts, 30)),
        holdExpiresAt: null,
        feePaise: d === 3 ? 0 : 50000,
        concern: PEOPLE[pi]?.concern ?? 'hair_fall',
        intakeDone: k === 0,
        photosDone: k === 0,
        paymentId: `pay_demo_U${d}${k}`,
        joinUrl: `/consult/${id('apt', 100 + d * 10 + k)}`,
      });
    });
  }

  // Past history for the demo customer (Rahul) — consult 34 days ago, 3-month plan delivered
  const rahul = customerAt(0);
  const pastConsult = subDays(now, 38);
  s.appointments.push({
    id: id('apt', 900),
    code: `YHC-A-${++apptNo}`,
    customerId: rahul.id,
    doctorId: DOCTOR.id,
    kind: 'first',
    status: 'completed',
    startsAt: iso(pastConsult),
    endsAt: iso(addMinutes(pastConsult, 30)),
    holdExpiresAt: null,
    feePaise: 50000,
    concern: 'crown_thinning',
    intakeDone: true,
    photosDone: true,
    paymentId: 'pay_demo_RAHUL1',
    joinUrl: '',
  });
  s.notes.push({
    appointmentId: id('apt', 900),
    chiefComplaint: 'Crown thinning for about 2 years.',
    observations: 'Reduced density at crown; mild miniaturisation.',
    assessment: 'Pattern thinning at crown (provisional).',
    treatmentPlan: 'Topical solution once daily at night; scalp serum; nutrition tablets after breakfast.',
    followUpInstructions: 'Follow-up consultation in 8 weeks. Upload progress photos monthly.',
    privateNotes: 'Family history paternal side.',
    identityVerified: true,
    consentRecorded: true,
    status: 'completed',
    followUpInWeeks: 8,
  });
  s.intake.push(sampleIntake(id('apt', 900), 1));
  const rahulRec: Recommendation = {
    id: id('rec', 0),
    token: 'demo-rahul-plan-token-0000000000000',
    appointmentId: id('apt', 900),
    customerId: rahul.id,
    status: 'paid',
    planId: 'plan-3',
    productIds: ['prod-topical', 'prod-serum', 'prod-tablets'],
    note: 'Rahul, consistency matters most. Use the routine every day and send photos each month.',
    items: SAMPLE_RX,
    createdAt: iso(addMinutes(pastConsult, 40)),
    expiresAt: iso(addDays(pastConsult, 3)),
  };
  s.recommendations.push(rahulRec);
  const delivered = istDate(subDays(now, 33));
  s.orders.push({
    id: id('ord', 0),
    code: `YHC-${++orderNo}`,
    customerId: rahul.id,
    source: 'recommendation',
    status: 'delivered',
    planId: 'plan-3',
    recommendationId: rahulRec.id,
    lines: [{ label: '3-month plan', qty: 1, amountPaise: 1499900 }],
    subtotalPaise: 1499900,
    creditPaise: 50000,
    totalPaise: 1449900,
    paymentId: 'pay_demo_RAHUL2',
    createdAt: iso(subDays(now, 37)),
    paidAt: iso(subDays(now, 37)),
    deliveredOn: delivered,
    planEndOn: addDays(new Date(`${delivered}T00:00:00Z`), 90)
      .toISOString()
      .slice(0, 10),
    courier: 'Delhivery (demo)',
    awb: 'AWB4417702931',
    address: '12, Shanti Nagar, Jaipur, Rajasthan 302006',
  });
  for (let w = 1; w <= 4; w++) {
    s.checkins.push({
      id: id('chk', w),
      customerId: rahul.id,
      orderId: id('ord', 0),
      week: w,
      sentAt: iso(subDays(now, 33 - w * 7)),
      reply: w === 3 ? null : w === 2 ? 'have_questions' : 'going_well',
      replyText: w === 2 ? 'Slight itching after applying at night. Is that normal?' : null,
    });
  }
  s.photos.push(
    { id: id('ph', 0), customerId: rahul.id, takenOn: istDate(subDays(now, 38)), label: 'Baseline (intake)' },
    { id: id('ph', 1), customerId: rahul.id, takenOn: istDate(subDays(now, 3)), label: 'Month 1' },
  );

  // More orders for ops/admin
  const orderSpecs: [number, Order['status'], string | null, number][] = [
    [8, 'paid', 'plan-2', 1], // Siddharth — to pack
    [9, 'delivered', 'plan-1', 26], // Ritu — reorder due
    [6, 'pending_payment', 'plan-3', 0], // Karan — unpaid recommendation
    [2, 'shipped', null, 2],
    [13, 'processing', null, 1],
  ];
  orderSpecs.forEach(([pi, status, planId, daysAgo], k) => {
    const c = customerAt(pi);
    const plan = PLANS.find((p) => p.id === planId);
    const total = plan ? plan.pricePaise - (k === 0 ? 50000 : 0) : 69900 + 59900;
    const deliveredOn = status === 'delivered' ? istDate(subDays(now, daysAgo)) : null;
    s.orders.push({
      id: id('ord', k + 1),
      code: `YHC-${++orderNo}`,
      customerId: c.id,
      source: plan ? 'recommendation' : 'shop',
      status,
      planId,
      recommendationId: null,
      lines: plan
        ? [{ label: plan.name, qty: 1, amountPaise: plan.pricePaise }]
        : [
            { label: 'Gentle Strengthening Shampoo', qty: 1, amountPaise: 69900 },
            { label: 'Lightweight Conditioner', qty: 1, amountPaise: 59900 },
          ],
      subtotalPaise: plan?.pricePaise ?? total,
      creditPaise: k === 0 ? 50000 : 0,
      totalPaise: total,
      paymentId: status === 'pending_payment' ? null : `pay_demo_O${k}`,
      createdAt: iso(subDays(now, daysAgo + 2)),
      paidAt: status === 'pending_payment' ? null : iso(subDays(now, daysAgo + 2)),
      deliveredOn,
      planEndOn:
        deliveredOn && plan
          ? addDays(new Date(`${deliveredOn}T00:00:00Z`), plan.months * 30)
              .toISOString()
              .slice(0, 10)
          : null,
      courier: status === 'shipped' || status === 'delivered' ? 'Blue Dart (demo)' : null,
      awb: status === 'shipped' || status === 'delivered' ? `AWB88120${k}4410` : null,
      address: `${c.city}, India`,
    });
  });
  s.recommendations.push({
    id: id('rec', 1),
    token: 'demo-karan-plan-token-00000000000000',
    appointmentId: id('apt', 0),
    customerId: customerAt(6).id,
    status: 'sent',
    planId: 'plan-3',
    productIds: ['prod-topical', 'prod-serum'],
    note: 'Karan, start with the topical at night and the serum in the morning. We will review at 8 weeks.',
    items: SAMPLE_RX.slice(0, 2),
    createdAt: iso(subHours(now, 30)),
    expiresAt: iso(addHours(now, 42)),
  });
  // Meera completed today → recommendation not yet sent (doctor demo)

  // Tasks (FR-M7-9)
  const taskSpecs: [number, Task['kind'], string, boolean, number][] = [
    [10, 'first_contact', 'Call new lead — not contacted in 15 min', false, -10],
    [11, 'first_contact', 'Call new lead — WhatsApp enquiry', false, 5],
    [6, 'unpaid_plan', 'Plan unpaid for 30 h — call to help with payment', false, 60],
    [9, 'refill_call', 'Refill call — plan ends in 4 days', false, 120],
    [0, 'side_effect', 'Check-in reply mentions itching — review with doctor', true, -60],
    [16, 'abandoned_hold', 'Slot held, payment pending', false, 8],
    [4, 'intake_missing', 'Intake form missing — consult at 14:00', false, 30],
  ];
  taskSpecs.forEach(([pi, kind, title, urgent, dueMin], k) => {
    s.tasks.push({
      id: id('task', k),
      leadId: id('lead', pi),
      title,
      kind,
      urgent,
      status: 'open',
      ownerId: PEOPLE[pi]?.owner ?? null,
      dueAt: iso(addMinutes(now, dueMin)),
    });
  });

  // Messages
  const msgSpecs: [number, string, string, Message['status'], Message['direction']][] = [
    [
      1,
      'booking_confirmed',
      'Your consultation is confirmed. Today at 10:40 am IST with Dr. Tyagi.',
      'read',
      'outbound',
    ],
    [6, 'plan_ready', 'Hi Karan, Dr. Tyagi has shared your personalised hair plan.', 'read', 'outbound'],
    [0, 'care_checkin', 'Week 2 check-in: how is your routine going?', 'read', 'outbound'],
    [0, '', 'Slight itching after applying at night. Is that normal?', 'received', 'inbound'],
    [
      9,
      'refill_reminder',
      'Your current plan ends around 6 Oct. Continue your plan so there is no gap.',
      'delivered',
      'outbound',
    ],
    [11, 'lead_welcome', 'Hi Divya, thanks for reaching out to Your Hair Company.', 'failed', 'outbound'],
  ];
  msgSpecs.forEach(([pi, template, preview, status, direction], k) => {
    s.messages.push({
      id: id('msg', k),
      customerId: customerAt(pi).id,
      leadId: id('lead', pi),
      channel: 'whatsapp',
      direction,
      template: template || null,
      category: template === 'lead_welcome' ? 'marketing' : direction === 'inbound' ? 'service' : 'utility',
      preview,
      status,
      at: iso(subHours(now, k * 3 + 1)),
    });
  });

  // Jobs, audit, claims
  const jobSpecs: [string, Job['status'], number, string | null][] = [
    ['appointment.reminder', 'pending', 50, null],
    ['intake.reminder', 'pending', 140, null],
    ['message.send', 'done', -20, null],
    ['shipping.create', 'done', -300, null],
    ['refill.reminder', 'pending', 60 * 20, null],
    ['message.send', 'failed', -90, 'Provider 470: re-engagement window closed'],
    ['calendar.sync', 'done', -5, null],
    ['payments.reconcile', 'done', -3, null],
  ];
  jobSpecs.forEach(([kind, status, mins, lastError], k) => {
    s.jobs.push({
      id: id('job', k),
      kind,
      status,
      runAt: iso(addMinutes(now, mins)),
      attempts: status === 'failed' ? 3 : status === 'done' ? 1 : 0,
      dedupeKey: `${kind}:seed:${k}`,
      lastError,
    });
  });
  const auditSpecs: [string, string, string, number][] = [
    ['Dr. Tyagi', 'clinical.view', 'Intake · YHC-A-1001', 90],
    ['Dr. Tyagi', 'consultation.complete', 'YHC-A-1001', 70],
    ['Kavya Iyer', 'settings.update', 'consult.hold_minutes = 10', 60 * 26],
    ['Arjun Mehta', 'order.shipped', 'YHC-10005', 60 * 30],
    ['Kavya Iyer', 'role.change', 'neha@demo.yhc → sales', 60 * 72],
  ];
  auditSpecs.forEach(([actor, action, target, mins], k) =>
    s.audit.push({ id: id('aud', k), actor, action, target, at: iso(subMinutes(now, mins)) }),
  );
  s.claims.push({
    id: id('clm', 0),
    code: 'GC-1001',
    customerId: customerAt(9).id,
    status: 'under_review',
    statement:
      'Followed the 1-month plan but did not see a change. (Demo claim — under the draft policy this plan is below the 3-month minimum.)',
    submittedAt: iso(subDays(now, 2)),
    decisionNotes: null,
    refundPaise: 0,
  });
  s.events.push({ id: 1, type: 'demo.seeded', aggregateId: 'demo', at: iso(now) });
  return s;
}

function addHours(d: Date, h: number) {
  return addMinutes(d, h * 60);
}

function nextActionFor(stage: LeadStage): string | null {
  switch (stage) {
    case 'new':
      return 'First contact';
    case 'contacted':
    case 'interested':
      return 'Send consultation link';
    case 'consult_suggested':
    case 'consult_link_sent':
      return 'Follow up on booking';
    case 'product_recommended':
      return 'Help with plan payment';
    case 'reorder_due':
      return 'Refill call';
    default:
      return null;
  }
}

const SAMPLE_RX: PrescriptionItem[] = [
  {
    genericName: 'Topical solution (as discussed)',
    strength: 'As prescribed',
    dosage: '1 ml',
    frequency: 'Once daily, night',
    duration: '12 weeks',
    instructions: 'Apply to dry scalp; wash hands after use',
  },
  {
    genericName: 'Scalp serum',
    strength: '—',
    dosage: '4–5 drops',
    frequency: 'Once daily, morning',
    duration: '12 weeks',
    instructions: 'Massage gently',
  },
  {
    genericName: 'Nutrition tablets',
    strength: '—',
    dosage: '1 tablet',
    frequency: 'Once daily after breakfast',
    duration: '12 weeks',
    instructions: 'With water',
  },
];

function sampleIntake(appointmentId: string, k: number): IntakeForm {
  const variants = [
    { duration: '8 months', pattern: 'Diffuse, mid-scalp' },
    { duration: '2 years', pattern: 'Temples receding' },
    { duration: '1 year', pattern: 'Widening parting' },
    { duration: '3 years', pattern: 'Crown' },
  ];
  const v = variants[k % variants.length] ?? { duration: '1 year', pattern: 'Diffuse' };
  return {
    appointmentId,
    duration: v.duration,
    pattern: v.pattern,
    previousTreatments: k % 2 ? 'Over-the-counter oil for 6 months' : 'None',
    currentProducts: 'Regular shampoo',
    medicalHistory: k % 3 ? 'None reported' : 'Thyroid (on medication)',
    medications: k % 3 ? 'None' : 'Levothyroxine',
    allergies: 'None known',
    familyHistory: k % 2 ? 'Father — hair loss' : 'Not sure',
  };
}
