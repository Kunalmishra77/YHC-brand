import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { BookingFlow } from '@/components/booking/booking-flow';
import { pageMetadata } from '@/components/site/seo';
import { getDoctor } from '@/server/catalog';
import { db, getSettingNumber } from '@/server/demo/store';
import { getJourneyForCustomer, getScanForCustomer, resumeHref } from '@/server/journey/store';
import { getCurrentCustomer } from '@/server/session';
import { signedInView, slotDays } from './booking-views';

// Fee and slot length are live settings, so they stay out of the static description.
// noindex: /book redirects new visitors to /start (ADR-33); the canonical stays for shared links.
export const metadata: Metadata = {
  ...pageMetadata({
    title: 'Book a video consultation',
    description:
      'Pick a time for a video consultation with Dr. Tyagi. Share your history and scalp photos, and get a doctor-led plan if treatment can help with your hair.',
    path: '/book',
  }),
  robots: { index: false, follow: true },
};

// Slots change by the minute — always render fresh.
export const dynamic = 'force-dynamic';

export default async function BookPage() {
  const doctor = getDoctor();
  const customer = await getCurrentCustomer();
  // One funnel (ADR-33, audit FUN-03): new patients start with details → scan → health form, and book
  // from inside the journey. /book stays for signed-in patients with a scan or a past consultation
  // (follow-ups and rebooking).
  if (!customer) redirect('/start');
  const returning =
    getScanForCustomer(customer.id) !== null ||
    db().appointments.some((a) => a.customerId === customer.id && a.status === 'completed');
  if (!returning) {
    const journey = getJourneyForCustomer(customer.id);
    redirect(journey ? resumeHref(journey) : '/start');
  }
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
