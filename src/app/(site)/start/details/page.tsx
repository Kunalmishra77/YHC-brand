import type { Metadata } from 'next';
import type { DefaultValues } from 'react-hook-form';
import { HealthForm } from '@/components/journey/health-form';
import { JourneyCard, JourneyShell } from '@/components/journey/journey-shell';
import type { HairConcern } from '@/lib/domain/types';
import type { ScanAnswers } from '@/lib/journey/types';
import type { JourneyDetailsInput } from '@/lib/validation/journey';
import { getDoctor } from '@/server/catalog';
import { requireJourneyStep } from '@/server/journey/guard';
import { markAssessmentSeen } from '@/server/journey/store';

export const metadata: Metadata = { title: 'Your health form', robots: { index: false } };

export const dynamic = 'force-dynamic';

const PATTERN_TEXT: Record<ScanAnswers['pattern'], string> = {
  hairline: 'Front hairline / temples',
  crown: 'Crown (top of head)',
  diffuse: 'All over (diffuse)',
  parting: 'Parting widening',
  patches: 'Patches',
  not_sure: 'Not sure',
};

const CONCERN_FROM_PATTERN: Record<ScanAnswers['pattern'], HairConcern> = {
  hairline: 'receding_hairline',
  crown: 'crown_thinning',
  diffuse: 'thinning',
  parting: 'thinning',
  patches: 'other',
  not_sure: 'hair_fall',
};

const FAMILY_TEXT: Record<ScanAnswers['familyHistory'], string> = {
  yes: 'Yes',
  no: 'No',
  not_sure: 'Not sure',
};

export default async function DetailsPage() {
  const { customer, journey } = await requireJourneyStep('health_form');
  markAssessmentSeen(customer.id);
  const doctor = getDoctor();
  const answers = journey.scan?.answers;
  const d = journey.details;

  // Prefill from an earlier submission, else from the pre-scan answers.
  const defaults: DefaultValues<JourneyDetailsInput> = d
    ? { ...d, age: String(d.age) }
    : {
        age: '',
        concern: answers ? CONCERN_FROM_PATTERN[answers.pattern] : 'hair_fall',
        duration:
          answers && (answers.duration === '3_5y' || answers.duration === 'gt_5y') ? 'More than 2 years' : '',
        pattern: answers ? PATTERN_TEXT[answers.pattern] : '',
        previousTreatments: '',
        currentProducts: '',
        medicalHistory: '',
        medications: '',
        allergies: '',
        familyHistory: answers ? FAMILY_TEXT[answers.familyHistory] : '',
        consentTelemedicine: false,
        consentPrivacy: false,
      };

  return (
    <JourneyShell
      current="health_form"
      eyebrow="Health form · about 3 minutes"
      title={`A few details for ${doctor.name}`}
      lede="We have filled in what we learned from your scan — please check it. Your answers and scan go to the doctor before your consultation."
    >
      <JourneyCard>
        <HealthForm defaults={defaults} doctorName={doctor.name} />
      </JourneyCard>
    </JourneyShell>
  );
}
