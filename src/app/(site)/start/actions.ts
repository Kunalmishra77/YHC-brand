'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { z } from 'zod';
import type { ConfirmedView, HoldView, SlotDayView } from '@/components/booking/types';
import type { Suitability } from '@/lib/journey/types';
import { AppError } from '@/lib/errors';
import { serverEnv } from '@/lib/env.server';
import { requireRole } from '@/lib/rbac';
import type { Result } from '@/lib/result';
import { appointmentIdSchema } from '@/lib/validation/booking';
import {
  journeyDetailsSchema,
  journeyHoldSchema,
  startJourneySchema,
  submitScanSchema,
  verifyJourneySchema,
} from '@/lib/validation/journey';
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
import {
  getJourneyForCustomer,
  linkAppointment,
  resumeHref,
  saveDetails,
  saveScan,
  startJourney,
} from '@/server/journey/store';
import { guard, setCustomerSession } from '../book/action-utils';
import {
  DEMO_OTP,
  OTP_RESEND_SECONDS,
  bookedAt,
  confirmedView,
  holdView,
  maskPhone,
  otpAttempts,
  slotDays,
} from '../book/booking-views';

/*
 * Patient journey actions (ADR-26). The demo store plays Postgres; `journeyPayAction` plays the
 * Razorpay webhook → capture_payment() path (server decides). Clinical answers never go to logs.
 */

const MAX_OTP_ATTEMPTS = 5;

async function currentJourneyCustomer() {
  const user = await requireRole(['customer']);
  const customer = db().customers.find((c) => c.id === user.customerId);
  if (!customer) throw new AppError('unauthenticated', 'Please start again with your mobile number.', 401);
  const journey = getJourneyForCustomer(customer.id);
  if (!journey) throw new AppError('journey_missing', 'Please start with your basic details.', 409);
  return { customer, journey };
}

// ---------------------------------------------------------------------------------------------
// step 1 — basic details + demo OTP

/**
 * Without `code`: validates the details and "sends" the demo OTP. With `code`: verifies it, creates or
 * finds the customer, starts the journey, signs the customer in and redirects to the scan.
 */
export async function startJourneyAction(
  raw: z.input<typeof startJourneySchema> & { code?: string },
): Promise<Result<{ sentTo: string; demoCode: string; resendIn: number }>> {
  return guard(async () => {
    // TODO(phase-03): Supabase phone OTP (WhatsApp first, SMS fallback) replaces the demo code.
    if (!serverEnv.DEMO_MODE)
      throw new AppError('not_available', 'Online assessment is not available yet.', 503);

    if (raw.code === undefined) {
      const input = startJourneySchema.parse(raw);
      return { sentTo: maskPhone(`+91${input.mobile}`), demoCode: DEMO_OTP, resendIn: OTP_RESEND_SECONDS };
    }

    const input = verifyJourneySchema.parse(raw);
    const phone = `+91${input.mobile}`;
    const now = Date.now();
    const tries = otpAttempts().get(phone);
    if (tries && tries.until > now && tries.n >= MAX_OTP_ATTEMPTS)
      throw new AppError(
        'rate_limited',
        'Too many tries. Please wait 10 minutes and request a new code.',
        429,
      );
    if (input.code !== DEMO_OTP) {
      otpAttempts().set(phone, { n: tries && tries.until > now ? tries.n + 1 : 1, until: now + 10 * 60_000 });
      throw new AppError('otp_invalid', 'That code does not match. Please check and try again.', 422);
    }
    otpAttempts().delete(phone);

    const customer = findOrCreateCustomer({ phone, name: input.name, source: 'website' });
    const town = input.address.split(',').at(-1)?.trim();
    if (customer.city === '—' && town) customer.city = town.slice(0, 40);
    const journey = startJourney({
      customerId: customer.id,
      address: { line: input.address, pincode: input.pincode },
    });
    // TODO(store): a proper consents table (docs/09); the audit log records it for the demo.
    recordAudit(
      `customer:${customer.id}`,
      'consent.recorded',
      `journey ${journey.id} · privacy, whatsapp_contact`,
    );
    await setCustomerSession(customer.id);
    redirect(resumeHref(journey));
  });
}

// ---------------------------------------------------------------------------------------------
// step 2 — scan (demo: answers + which zones were captured/skipped; photos never leave the device)

export async function submitScanAction(
  raw: z.input<typeof submitScanSchema>,
): Promise<Result<{ suitability: Suitability }>> {
  return guard(async () => {
    const input = submitScanSchema.parse(raw);
    const { customer } = await currentJourneyCustomer();
    const scan = saveScan(customer.id, input);
    revalidatePath('/account');
    return { suitability: scan.suitability };
  });
}

// ---------------------------------------------------------------------------------------------
// step 4 — detailed health form

export async function saveJourneyDetailsAction(
  raw: z.input<typeof journeyDetailsSchema>,
): Promise<Result<{ next: string }>> {
  return guard(async () => {
    const details = journeyDetailsSchema.parse(raw);
    const { customer, journey } = await currentJourneyCustomer();
    if (!journey.scan) throw new AppError('scan_missing', 'Please complete your 3D scan first.', 409);
    findOrCreateCustomer({ phone: customer.phone, age: details.age });
    customer.gender = details.gender;
    saveDetails(customer.id, details);
    recordAudit(
      `customer:${customer.id}`,
      'consent.recorded',
      `journey ${journey.id} · telemedicine, privacy_terms`,
    );

    // Already booked (patient came back to edit): keep the intake on the appointment in sync.
    const appt = journey.appointmentId
      ? db().appointments.find((a) => a.id === journey.appointmentId && a.status === 'booked')
      : undefined;
    if (appt) {
      saveIntake({
        ...intakeFrom(details),
        appointmentId: appt.id,
        photos: Math.min(3, journey.scan.angles.length),
      });
      revalidatePath('/account');
      return { next: '/account' };
    }
    return { next: '/start/book' };
  });
}

function intakeFrom(d: z.output<typeof journeyDetailsSchema>) {
  return {
    duration: d.duration,
    pattern: d.pattern,
    previousTreatments: d.previousTreatments,
    currentProducts: d.currentProducts,
    medicalHistory: d.medicalHistory,
    medications: d.medications,
    allergies: d.allergies,
    familyHistory: d.familyHistory,
  };
}

// ---------------------------------------------------------------------------------------------
// step 5 — slot + ₹500 demo payment

export async function journeySlotsAction(): Promise<Result<SlotDayView[]>> {
  return guard(() => slotDays());
}

export async function journeyHoldAction(raw: z.input<typeof journeyHoldSchema>): Promise<Result<HoldView>> {
  return guard(async () => {
    const { startsAt: iso } = journeyHoldSchema.parse(raw);
    const { customer, journey } = await currentJourneyCustomer();
    if (!journey.details)
      throw new AppError('details_missing', 'Please complete your health form first.', 409);
    const startsAt = new Date(iso);
    const now = new Date();

    const existing = db().appointments.find(
      (a) =>
        a.customerId === customer.id &&
        a.status === 'held' &&
        a.startsAt === startsAt.toISOString() &&
        a.holdExpiresAt !== null &&
        Date.parse(a.holdExpiresAt) > now.getTime(),
    );
    if (existing) return holdView(existing, now);

    // The server decides what is bookable — only times the availability engine offers right now.
    const offered = getSlots(now).some((d) =>
      d.slots.some((s) => s.startsAt.getTime() === startsAt.getTime()),
    );
    if (!offered)
      throw new AppError('slot_taken', 'That time was just taken. Please pick another slot.', 409);

    const appt = holdSlot({ customerId: customer.id, startsAt, concern: journey.details.concern });
    revalidatePath('/start/book');
    return holdView(appt, now);
  });
}

export async function journeyPayAction(raw: { appointmentId: string }): Promise<Result<ConfirmedView>> {
  return guard(async () => {
    const appointmentId = appointmentIdSchema.parse(raw.appointmentId);
    const { customer, journey } = await currentJourneyCustomer();
    const appt = db().appointments.find((a) => a.id === appointmentId && a.customerId === customer.id);
    if (!appt) throw new AppError('not_found', 'We could not find this booking.', 404);

    if (appt.status !== 'booked') {
      const now = new Date();
      const expired =
        appt.status === 'expired' ||
        (appt.status === 'held' && (!appt.holdExpiresAt || Date.parse(appt.holdExpiresAt) <= now.getTime()));
      if (expired) {
        const clash = busyAppointments(now).some(
          (a) =>
            a.id !== appt.id &&
            Date.parse(a.startsAt) < Date.parse(appt.endsAt) &&
            Date.parse(appt.startsAt) < Date.parse(a.endsAt),
        );
        if (appt.status !== 'held' || clash)
          throw new AppError(
            'slot_lost',
            'This time was released before the payment finished. Nothing was charged in this demo — please pick another time.',
            409,
          );
      }
      captureConsultPayment(appt.id);
    }

    if (journey.details && journey.scan) {
      saveIntake({
        ...intakeFrom(journey.details),
        appointmentId: appt.id,
        photos: Math.min(3, journey.scan.angles.length),
      });
    }
    linkAppointment(customer.id, appt.id, Boolean(journey.details));
    revalidatePath('/account');
    revalidatePath('/start/book');
    const paidAt = bookedAt(appt.id, db().events) ?? new Date().toISOString();
    return confirmedView(appt, paidAt);
  });
}
