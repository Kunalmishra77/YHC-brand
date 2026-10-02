'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import type { ConfirmedView, HoldView, SignedInView, SlotDayView } from '@/components/booking/types';
import type { AppointmentStatus } from '@/lib/domain/types';
import { AppError } from '@/lib/errors';
import { serverEnv } from '@/lib/env.server';
import { requireRole } from '@/lib/rbac';
import type { Result } from '@/lib/result';
import {
  appointmentIdSchema,
  holdRequestSchema,
  saveIntakeSchema,
  sendOtpSchema,
  verifyOtpSchema,
} from '@/lib/validation/booking';
import {
  busyAppointments,
  captureConsultPayment,
  db,
  findOrCreateCustomer,
  getSlots,
  holdSlot,
  recordAudit,
  saveIntake,
} from '@/server/demo/store';
import { guard, setCustomerSession } from './action-utils';
import {
  DEMO_OTP,
  OTP_RESEND_SECONDS,
  bookedAt,
  confirmedView,
  holdView,
  keptPayments,
  maskPhone,
  otpAttempts,
  signedInView,
  slotDays,
} from './booking-views';

/*
 * Booking server actions (FR-M3-3..10). The demo store plays Postgres; `payConsultationAction` plays
 * the Razorpay webhook → capture_payment() → confirm_appointment_payment() path (server decides).
 */

const MAX_OTP_ATTEMPTS = 5;

function assertDemo() {
  // TODO(phase-03): Supabase phone OTP (WhatsApp first, SMS fallback) replaces the demo code.
  if (!serverEnv.DEMO_MODE) throw new AppError('not_available', 'Phone sign-in is not available yet.', 503);
}

async function currentCustomer() {
  const user = await requireRole(['customer']);
  const customer = db().customers.find((c) => c.id === user.customerId);
  if (!customer) throw new AppError('unauthenticated', 'Please verify your mobile number again.', 401);
  return customer;
}

function ownAppointment(customerId: string, appointmentId: string) {
  const appt = db().appointments.find((a) => a.id === appointmentId && a.customerId === customerId);
  if (!appt) throw new AppError('not_found', 'We could not find this booking.', 404);
  return appt;
}

// ---------------------------------------------------------------------------------------------
// phone OTP (FR-M3-3, FR-M2-4)

export async function sendOtpAction(
  raw: z.input<typeof sendOtpSchema>,
): Promise<Result<{ sentTo: string; channel: 'whatsapp' | 'sms'; demoCode: string; resendIn: number }>> {
  return guard(() => {
    assertDemo();
    const { mobile, channel } = sendOtpSchema.parse(raw);
    // TODO(client): WhatsApp authentication template + MSG91 SMS sender ID — docs/12.
    return { sentTo: maskPhone(`+91${mobile}`), channel, demoCode: DEMO_OTP, resendIn: OTP_RESEND_SECONDS };
  });
}

export async function verifyOtpAction(
  raw: z.input<typeof verifyOtpSchema> & { source?: 'website' },
): Promise<Result<SignedInView>> {
  return guard(async () => {
    assertDemo();
    const { mobile, code } = verifyOtpSchema.parse(raw);
    const phone = `+91${mobile}`;
    const now = Date.now();
    const tries = otpAttempts().get(phone);
    if (tries && tries.until > now && tries.n >= MAX_OTP_ATTEMPTS)
      throw new AppError(
        'rate_limited',
        'Too many tries. Please wait 10 minutes and request a new code.',
        429,
      );
    if (code !== DEMO_OTP) {
      const n = tries && tries.until > now ? tries.n + 1 : 1;
      otpAttempts().set(phone, { n, until: now + 10 * 60_000 });
      throw new AppError('otp_invalid', 'That code does not match. Check the message and try again.', 422);
    }
    otpAttempts().delete(phone);
    const customer = findOrCreateCustomer({ phone, source: 'website' });
    await setCustomerSession(customer.id);
    return signedInView(customer);
  });
}

// ---------------------------------------------------------------------------------------------
// slots & hold (FR-M3-1, FR-M3-4, FR-M3-5)

export async function refreshSlotsAction(): Promise<Result<SlotDayView[]>> {
  return guard(() => slotDays());
}

export async function holdSlotAction(raw: z.input<typeof holdRequestSchema>): Promise<Result<HoldView>> {
  return guard(async () => {
    const input = holdRequestSchema.parse(raw);
    const customer = await currentCustomer();
    const startsAt = new Date(input.startsAt);
    const now = new Date();

    // Retrying the same time reuses the customer's live hold (idempotent).
    const existing = db().appointments.find(
      (a) =>
        a.customerId === customer.id &&
        a.status === 'held' &&
        a.startsAt === startsAt.toISOString() &&
        a.holdExpiresAt !== null &&
        Date.parse(a.holdExpiresAt) > now.getTime(),
    );
    findOrCreateCustomer({ phone: customer.phone, name: input.name, age: input.age });
    if (existing) return holdView(existing, now);

    // The server decides what is bookable — only times the availability engine offers right now.
    const offered = getSlots(now).some((d) =>
      d.slots.some((s) => s.startsAt.getTime() === startsAt.getTime()),
    );
    if (!offered)
      throw new AppError('slot_taken', 'That time was just taken. Please pick another slot.', 409);

    const appt = holdSlot({ customerId: customer.id, startsAt, concern: input.concern });
    const consents = [
      'telemedicine',
      'privacy_terms',
      ...(input.consentWhatsapp ? ['whatsapp_updates'] : []),
    ];
    // TODO(store): a proper consents table (docs/09); the audit log records it for the demo.
    recordAudit(`customer:${customer.id}`, 'consent.recorded', `${appt.code} · ${consents.join(', ')}`);
    revalidatePath('/book');
    return holdView(appt, now);
  });
}

// ---------------------------------------------------------------------------------------------
// payment (FR-M3-6, FR-M3-7, FR-M3-8) — demo webhook role

export async function payConsultationAction(raw: {
  appointmentId: string;
}): Promise<Result<{ status: AppointmentStatus }>> {
  return guard(async () => {
    const appointmentId = appointmentIdSchema.parse(raw.appointmentId);
    const customer = await currentCustomer();
    const appt = ownAppointment(customer.id, appointmentId);
    if (appt.status === 'booked') return { status: appt.status }; // already captured — idempotent

    const now = new Date();
    const holdOver =
      appt.status === 'expired' ||
      (appt.status === 'held' && (!appt.holdExpiresAt || Date.parse(appt.holdExpiresAt) <= now.getTime()));
    if (holdOver) {
      // FR-M3-8: rebook the same slot if it is still free; otherwise keep the payment.
      const clash = busyAppointments(now).some(
        (a) =>
          a.id !== appt.id &&
          Date.parse(a.startsAt) < Date.parse(appt.endsAt) &&
          Date.parse(appt.startsAt) < Date.parse(a.endsAt),
      );
      if (appt.status !== 'held' || clash) {
        keptPayments().set(customer.id, appt.id);
        throw new AppError(
          'slot_lost',
          'Your payment is kept, but this time was released before it finished. Please pick a new time — you will not be charged again.',
          409,
        );
      }
    }
    const booked = captureConsultPayment(appt.id);
    keptPayments().delete(customer.id);
    revalidatePath('/account');
    return { status: booked.status };
  });
}

/** FR-M3-8: confirm a new hold with the payment kept from a lost slot (no second payment). */
export async function applyKeptPaymentAction(raw: {
  appointmentId: string;
}): Promise<Result<{ status: AppointmentStatus }>> {
  return guard(async () => {
    const appointmentId = appointmentIdSchema.parse(raw.appointmentId);
    const customer = await currentCustomer();
    if (!keptPayments().has(customer.id))
      throw new AppError(
        'no_kept_payment',
        'We could not find an earlier payment. Please pay to confirm.',
        409,
      );
    const appt = ownAppointment(customer.id, appointmentId);
    if (appt.status !== 'held' && appt.status !== 'booked')
      throw new AppError('invalid_state', 'Please pick a new time first.', 409);
    const booked = captureConsultPayment(appt.id);
    keptPayments().delete(customer.id);
    revalidatePath('/account');
    return { status: booked.status };
  });
}

export async function hasKeptPaymentAction(): Promise<Result<boolean>> {
  return guard(async () => {
    const customer = await currentCustomer();
    return keptPayments().has(customer.id);
  });
}

/** Polled by the "Confirming payment…" state (FR-M2-6 style). */
export async function appointmentStatusAction(raw: {
  appointmentId: string;
}): Promise<Result<{ status: AppointmentStatus; confirmed: ConfirmedView | null }>> {
  return guard(async () => {
    const appointmentId = appointmentIdSchema.parse(raw.appointmentId);
    const customer = await currentCustomer();
    const appt = ownAppointment(customer.id, appointmentId);
    const paidAt = bookedAt(appt.id, db().events);
    return {
      status: appt.status,
      confirmed: appt.status === 'booked' && paidAt ? confirmedView(appt, paidAt) : null,
    };
  });
}

// ---------------------------------------------------------------------------------------------
// intake (FR-M3-10)

export async function saveIntakeAction(
  raw: z.input<typeof saveIntakeSchema>,
): Promise<Result<{ photos: number }>> {
  return guard(async () => {
    const input = saveIntakeSchema.parse(raw);
    const customer = await currentCustomer();
    const appt = ownAppointment(customer.id, input.appointmentId);
    if (appt.status !== 'booked' && appt.status !== 'held')
      throw new AppError('invalid_state', 'This consultation can no longer be updated.', 409);
    // Demo: photos are re-encoded in the browser and only their count is stored (no clinical uploads).
    // TODO(phase-05): signed upload URLs to the private `clinical` bucket.
    saveIntake(input);
    revalidatePath(`/book/intake/${appt.id}`);
    revalidatePath('/account');
    return { photos: input.photos };
  });
}
