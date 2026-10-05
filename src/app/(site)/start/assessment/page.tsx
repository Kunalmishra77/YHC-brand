import { ArrowRight, MessageCircle, RotateCcw } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { AssessmentReport } from '@/components/journey/assessment-report';
import { JourneyShell } from '@/components/journey/journey-shell';
import { PrintSummaryButton } from '@/components/journey/print-summary-button';
import { Button } from '@/components/ui/button';
import { formatINR } from '@/lib/money';
import { SITE } from '@/lib/site';
import { getSettingNumber } from '@/server/demo/store';
import { requireJourneyStep } from '@/server/journey/guard';

export const metadata: Metadata = { title: 'Your hair assessment', robots: { index: false } };

export const dynamic = 'force-dynamic';

export default async function AssessmentPage() {
  const { journey } = await requireJourneyStep('assessment');
  // Guard guarantees a scan; narrow for TypeScript.
  const scan = journey.scan;
  if (!scan) return null;
  const fee = formatINR(getSettingNumber('consult.fee_paise'));

  const actions =
    scan.suitability === 'not_suitable' ? (
      <div className="space-y-4">
        <p className="max-w-2xl text-sm text-body">
          We would rather be honest than sell you a plan that is unlikely to work. Here is what you can do
          next:
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <Button asChild className="h-auto min-h-12 px-6 py-3 text-base whitespace-normal">
            <Link href="/start/details">Talk to a doctor about other options</Link>
          </Button>
          <PrintSummaryButton />
          <Button asChild variant="outline" className="h-12 border-steel px-6 text-base">
            <a href={SITE.whatsappUrl} target="_blank" rel="noreferrer">
              <MessageCircle className="size-4" aria-hidden />
              Ask us on WhatsApp
            </a>
          </Button>
        </div>
        <p className="text-[13px] text-muted-foreground">
          A consultation can still help you understand the cause and talk through other options with the
          doctor. The {fee} consultation fee applies.
        </p>
      </div>
    ) : (
      <div className="space-y-4">
        {scan.suitability === 'doctor_review' ? (
          <p className="max-w-2xl rounded-2xl bg-mist/70 px-4 py-3 text-sm text-body">
            Why a doctor first? Some signs — like long-standing bald areas, round patches or low root density
            — can have more than one cause. The doctor will look at your scan and history together before
            suggesting anything.
          </p>
        ) : null}
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <Button asChild className="h-12 px-6 text-base">
            <Link href="/start/details">
              Continue to your health form
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Button>
          <PrintSummaryButton />
        </div>
      </div>
    );

  return (
    <JourneyShell
      current="assessment"
      eyebrow="Your personalised assessment"
      title="What your scan shows"
      lede="A first look at your roots, in plain language. The doctor confirms everything at your consultation."
    >
      <AssessmentReport scan={scan} actions={actions} />
      <p className="mt-6 print:hidden">
        <Link
          href="/start/scan"
          className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-brand underline-offset-4 hover:underline"
        >
          <RotateCcw className="size-4" aria-hidden />
          Redo the scan
        </Link>
      </p>
    </JourneyShell>
  );
}
