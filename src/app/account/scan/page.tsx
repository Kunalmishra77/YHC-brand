import { ScanFace } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { PrintButton } from '@/components/account/print-button';
import { AssessmentReport } from '@/components/journey/assessment-report';
import { EmptyState } from '@/components/shared/states';
import { Button } from '@/components/ui/button';
import { getJourneyForCustomer, resumeHref } from '@/server/journey/store';
import { getCurrentCustomer } from '@/server/session';

export const metadata: Metadata = { title: 'My 3D scan', robots: { index: false } };

export const dynamic = 'force-dynamic';

/** Patient view of their own (simulated) scan assessment. Customer-scoped: only their journey. */
export default async function AccountScanPage() {
  const customer = await getCurrentCustomer();
  if (!customer) return null;
  const journey = getJourneyForCustomer(customer.id);
  const scan = journey?.scan ?? null;

  if (!scan) {
    return (
      <EmptyState
        icon={ScanFace}
        title="No 3D scan yet"
        body="A guided phone-camera scan of your scalp and hair roots takes about 4 minutes. Your doctor reviews it before your consultation."
        action={
          <Button asChild className="h-11 px-5">
            <Link href={journey ? resumeHref(journey) : '/start'}>Start my 3D scan</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">My 3D scan</p>
          <h1 className="display mt-2 text-[32px] md:text-[40px]">Your scalp assessment</h1>
        </div>
        <PrintButton label="Download summary" />
      </div>
      <AssessmentReport
        scan={scan}
        actions={
          journey && !journey.appointmentId ? (
            <Button asChild className="h-12 px-6 text-base print:hidden">
              <Link href={resumeHref(journey)}>Continue my journey</Link>
            </Button>
          ) : (
            <p className="text-sm text-body">
              Your doctor will go through this with you during the consultation.
            </p>
          )
        }
      />
      <p className="mt-6 print:hidden">
        <Link
          href="/start/scan"
          className="inline-flex min-h-11 items-center text-sm font-medium text-brand underline-offset-4 hover:underline"
        >
          Redo my scan
        </Link>
      </p>
    </div>
  );
}
