import type { Metadata } from 'next';
import { BookingFlow } from '@/components/booking/booking-flow';
import { getDoctor } from '@/server/catalog';
import { getSettingNumber } from '@/server/demo/store';
import { getCurrentCustomer } from '@/server/session';
import { signedInView, slotDays } from './booking-views';

export const metadata: Metadata = {
  title: 'Book a video consultation',
  description: 'Pick a time for a 30-minute video consultation with Dr. Tyagi. ₹500.',
};

// Slots change by the minute — always render fresh.
export const dynamic = 'force-dynamic';

export default async function BookPage() {
  const doctor = getDoctor();
  const customer = await getCurrentCustomer();
  return (
    <BookingFlow
      initialDays={slotDays()}
      signedIn={customer ? signedInView(customer) : null}
      doctor={{ name: doctor.name, qualifications: doctor.qualifications }}
      feePaise={getSettingNumber('consult.fee_paise')}
      slotMinutes={getSettingNumber('consult.slot_minutes')}
      holdMinutes={getSettingNumber('consult.hold_minutes')}
      creditDays={getSettingNumber('consult.credit_window_days')}
    />
  );
}
