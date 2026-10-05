import type { Metadata } from 'next';
import { JourneyBooking } from '@/components/journey/journey-booking';
import { JourneyStepper } from '@/components/journey/journey-stepper';
import { db, getSettingNumber } from '@/server/demo/store';
import { getDoctor } from '@/server/catalog';
import { requireJourneyStep } from '@/server/journey/guard';
import { journeyAppointment } from '@/server/journey/store';
import { bookedAt, confirmedView, slotDays } from '../../book/booking-views';

export const metadata: Metadata = { title: 'Book your consultation', robots: { index: false } };

// Slots change by the minute — always render fresh.
export const dynamic = 'force-dynamic';

export default async function JourneyBookPage() {
  const { journey } = await requireJourneyStep('book');
  const doctor = getDoctor();
  const appt = journeyAppointment(journey);
  const paidAt = appt && appt.status !== 'held' ? bookedAt(appt.id, db().events) : null;
  const confirmed = appt && paidAt ? confirmedView(appt, paidAt) : null;

  return (
    <div className="bg-pearl">
      <div className="bg-obsidian">
        <div className="container-yhc py-6 md:py-8">
          <JourneyStepper current={confirmed ? 'consultation' : 'book'} tone="dark" />
        </div>
      </div>
      <div className="container-yhc py-8 pb-32 md:py-12">
        <div className="mx-auto max-w-5xl">
          <p className="eyebrow">{confirmed ? 'Booked' : 'Book your consultation'}</p>
          <div className="mt-2">
            <JourneyBooking
              initialDays={slotDays()}
              doctor={{ name: doctor.name, qualifications: doctor.qualifications }}
              feePaise={getSettingNumber('consult.fee_paise')}
              slotMinutes={getSettingNumber('consult.slot_minutes')}
              holdMinutes={getSettingNumber('consult.hold_minutes')}
              creditDays={getSettingNumber('consult.credit_window_days')}
              initialConfirmed={confirmed}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
