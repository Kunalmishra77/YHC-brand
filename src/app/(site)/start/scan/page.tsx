import type { Metadata } from 'next';
import { JourneyStepper } from '@/components/journey/journey-stepper';
import { ScanStudio } from '@/components/journey/scan-studio';
import { requireJourneyStep } from '@/server/journey/guard';

export const metadata: Metadata = { title: 'Your 3D scalp scan', robots: { index: false } };

export const dynamic = 'force-dynamic';

export default async function ScanPage() {
  const { customer, journey } = await requireJourneyStep('scan');
  const firstName = customer.name === 'New customer' ? '' : (customer.name.split(' ')[0] ?? '');
  return (
    <div className="bg-hero-dark min-h-[calc(100dvh-4rem)] text-on-dark">
      <div className="container-yhc pt-6 pb-28 md:pt-8 md:pb-24">
        <JourneyStepper current="scan" tone="dark" className="mb-10 md:mb-14" />
        <ScanStudio firstName={firstName} hasScan={Boolean(journey.scan)} />
      </div>
    </div>
  );
}
