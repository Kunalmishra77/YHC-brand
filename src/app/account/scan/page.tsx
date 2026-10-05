import { ScanFace } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { PrintButton } from '@/components/account/print-button';
import { AssessmentReport } from '@/components/journey/assessment-report';
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
      <div className="mx-auto max-w-3xl">
        <section className="relative overflow-hidden rounded-3xl bg-card p-6 text-center shadow-card ring-1 ring-line/80 md:p-10">
          <div
            className="pointer-events-none absolute -top-24 left-1/2 size-72 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(201,204,209,0.35),transparent_70%)]"
            aria-hidden
          />
          <span className="relative mx-auto flex size-14 items-center justify-center rounded-full bg-mist ring-1 ring-line">
            <ScanFace className="size-6 text-ink" aria-hidden />
          </span>
          <p className="eyebrow relative mt-5">My 3D scan</p>
          <h1 className="display relative mt-2 text-[clamp(1.875rem,1.5rem+1.4vw,2.5rem)] text-balance">
            No 3D scan yet
          </h1>
          <p className="relative mx-auto mt-3 max-w-[52ch] text-[16px] leading-relaxed text-pretty text-body">
            A guided phone-camera scan of your scalp and hair roots takes about 4 minutes. Your doctor reviews
            it before your consultation.
          </p>
          <Button asChild className="relative mt-6 h-12 w-full px-6 text-base sm:w-auto">
            <Link href={journey ? resumeHref(journey) : '/start'}>Start my 3D scan</Link>
          </Button>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex flex-col gap-4 md:mb-8 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <p className="eyebrow">My 3D scan</p>
          <h1 className="display mt-2 text-[clamp(2rem,1.6rem+1.6vw,2.75rem)] leading-[1.05] text-balance">
            Your scalp assessment
          </h1>
          <p className="mt-2 max-w-[60ch] text-[15px] text-muted-foreground">
            Your scan results in plain language. Your doctor reviews them before the consultation.
          </p>
        </div>
        <div className="print:hidden [&>button]:w-full md:[&>button]:w-auto">
          <PrintButton label="Download summary" />
        </div>
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
      <p className="mt-6 text-center md:text-left print:hidden">
        <Link
          href="/start/scan"
          className="inline-flex min-h-11 items-center rounded-md px-1 text-sm font-medium text-brand underline-offset-4 hover:underline"
        >
          Redo my scan
        </Link>
      </p>
    </div>
  );
}
