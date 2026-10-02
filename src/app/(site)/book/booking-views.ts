import 'server-only';

import { addDays } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import type { ConfirmedView, HoldView, SignedInView, SlotDayView } from '@/components/booking/types';
import type { Appointment, Customer } from '@/lib/domain/types';
import { IST, formatIst, istDate } from '@/lib/time';
import { getSlots } from '@/server/demo/store';

/** Demo OTP (ADR-23) — no SMS/WhatsApp is sent. TODO(client): MSG91 / WhatsApp OTP template — docs/12. */
export const DEMO_OTP = '123456';
export const OTP_RESEND_SECONDS = 20;

/** Slot days for the picker, labelled in IST (FR-M3-1). */
export function slotDays(now = new Date()): SlotDayView[] {
  const today = istDate(now);
  const tomorrow = istDate(addDays(now, 1));
  return getSlots(now).map((d) => {
    const noon = new Date(`${d.date}T06:30:00Z`); // 12:00 IST on that date — only used for labels
    return {
      date: d.date,
      tab:
        d.date === today
          ? 'Today'
          : d.date === tomorrow
            ? 'Tomorrow'
            : formatInTimeZone(noon, IST, 'EEE d MMM'),
      long: formatInTimeZone(noon, IST, 'EEEE d MMMM'),
      remaining: d.remaining,
      slots: d.slots.map((s) => {
        const hour = Number(formatInTimeZone(s.startsAt, IST, 'H'));
        return {
          startsAt: s.startsAt.toISOString(),
          time: formatInTimeZone(s.startsAt, IST, 'h:mm aaa'),
          period: hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : 'Evening',
        };
      }),
    };
  });
}

export function maskPhone(e164: string): string {
  const digits = e164.replace(/\D/g, '').slice(-10);
  return `+91 ••••• ${digits.slice(-5)}`;
}

export function signedInView(c: Customer): SignedInView {
  const placeholder = c.name === 'New customer';
  return {
    customerId: c.id,
    name: placeholder ? null : c.name,
    age: placeholder ? null : c.age,
    maskedPhone: maskPhone(c.phone),
  };
}

export function holdView(a: Appointment, now = new Date()): HoldView {
  const left = a.holdExpiresAt
    ? Math.max(0, Math.floor((Date.parse(a.holdExpiresAt) - now.getTime()) / 1000))
    : 0;
  return {
    appointmentId: a.id,
    code: a.code,
    startsAt: a.startsAt,
    when: formatIst(new Date(a.startsAt)),
    feePaise: a.feePaise,
    holdSecondsLeft: left,
  };
}

export function confirmedView(a: Appointment, paidAt: string): ConfirmedView {
  return {
    appointmentId: a.id,
    code: a.code,
    when: formatIst(new Date(a.startsAt)),
    startsAt: a.startsAt,
    endsAt: a.endsAt,
    feePaise: a.feePaise,
    paymentId: a.paymentId,
    paidAt: formatIst(new Date(paidAt)),
  };
}

/** When the `appointment.booked` event was written — the demo's "paid at". */
export function bookedAt(appointmentId: string, events: { type: string; aggregateId: string; at: string }[]) {
  return events.find((e) => e.type === 'appointment.booked' && e.aggregateId === appointmentId)?.at ?? null;
}

/*
 * FR-M3-8 demo stand-in: a payment that arrived after the slot was lost is "kept" so the next hold
 * is confirmed without a second payment. Real flow: payments row linked to the new hold.
 * TODO(store): replace with a store-level `slot_lost` state + payment link.
 */
const kept = globalThis as unknown as { __yhcKeptConsultPayments?: Map<string, string> };
export function keptPayments(): Map<string, string> {
  kept.__yhcKeptConsultPayments ??= new Map();
  return kept.__yhcKeptConsultPayments;
}

/** Demo OTP attempt counter per phone (stand-in for Upstash rate limiting). */
const attempts = globalThis as unknown as { __yhcOtpAttempts?: Map<string, { n: number; until: number }> };
export function otpAttempts(): Map<string, { n: number; until: number }> {
  attempts.__yhcOtpAttempts ??= new Map();
  return attempts.__yhcOtpAttempts;
}
