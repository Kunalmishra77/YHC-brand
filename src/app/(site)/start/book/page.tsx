import type { Metadata } from 'next';
import { JourneyBooking } from '@/components/journey/journey-booking';
import { JourneyCard, JourneyShell } from '@/components/journey/journey-shell';
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

  const slotMinutes = getSettingNumber('consult.slot_minutes');

  return (
    <JourneyShell
      current={confirmed ? 'consultation' : 'book'}
      eyebrow={confirmed ? 'Booked' : 'Book your consultation'}
      title={`A ${slotMinutes}-minute video consultation with ${doctor.name}`}
      lede={`${doctor.qualifications} · Your scan and health form are shared with the doctor before the call.`}
    >
      <JourneyCard>
        <JourneyBooking
          initialDays={slotDays()}
          doctor={{ name: doctor.name, qualifications: doctor.qualifications }}
          feePaise={getSettingNumber('consult.fee_paise')}
          slotMinutes={slotMinutes}
          holdMinutes={getSettingNumber('consult.hold_minutes')}
          creditDays={getSettingNumber('consult.credit_window_days')}
          initialConfirmed={confirmed}
        />
      </JourneyCard>
    </JourneyShell>
  );
}
