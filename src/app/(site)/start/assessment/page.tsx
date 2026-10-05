import { ArrowRight, MessageCircle, RotateCcw } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { PrintButton } from '@/components/account/print-button';
import { AssessmentReport } from '@/components/journey/assessment-report';
import { JourneyStepper } from '@/components/journey/journey-stepper';
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
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Button asChild className="h-12 px-6 text-base">
            <Link href="/start/details">Talk to a doctor about other options</Link>
          </Button>
          <PrintButton label="Download summary" />
          <Button asChild variant="outline" className="h-11 px-5">
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
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <Button asChild className="h-12 px-6 text-base">
            <Link href="/start/details">
              Continue to your health form
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Button>
          <PrintButton label="Download summary" />
        </div>
      </div>
    );

  return (
    <div className="bg-pearl">
      <div className="bg-obsidian">
        <div className="container-yhc py-6 md:py-8 print:hidden">
          <JourneyStepper current="assessment" tone="dark" />
        </div>
      </div>
      <div className="container-yhc py-8 pb-28 md:py-12">
        <div className="mx-auto max-w-5xl">
          <p className="eyebrow">Your personalised assessment</p>
          <h1 className="display mt-2 text-[34px] md:text-[48px]">What your scan shows</h1>
          <AssessmentReport scan={scan} actions={actions} className="mt-6" />
          <p className="mt-6 print:hidden">
            <Link
              href="/start/scan"
              className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-brand underline-offset-4 hover:underline"
            >
              <RotateCcw className="size-4" aria-hidden />
              Redo the scan
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
