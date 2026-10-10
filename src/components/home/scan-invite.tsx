import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Reveal } from '@/components/site/reveal';
import { SECTION_Y } from '@/components/site/section';
import { Button } from '@/components/ui/button';
import { CAPTURE_ZONES, MIN_CAPTURED_ZONES } from '@/lib/journey/types';
import { ScanExplorer } from './scan-invite/scan-explorer';

/**
 * Homepage section 3 · Take your scalp scan — interactive invitation to start the 3D scan (/start).
 * Editorial split on pearl: an oversized serif word and a short promise on one side, a phone running a
 * tappable preview of the guided scan (client island) on the other, then three steps and a full-width
 * (on phones) CTA. On phones the device sits between the promise and the steps. Step copy matches /start.
 */

const STEPS = [
  { title: 'A few details', body: 'Name, mobile and address — about 30 seconds.' },
  {
    title: `Up to ${CAPTURE_ZONES.length} guided zones`,
    body: `Your phone camera, with on-screen guidance. At least ${MIN_CAPTURED_ZONES} are needed.`,
  },
  {
    title: 'Your personal assessment',
    body: 'Suitable, needs a doctor’s review, or not suitable — with the reasons.',
  },
];

export function ScanInvite() {
  return (
    <section
      id="scan"
      aria-labelledby="scan-invite-heading"
      className="relative isolate scroll-mt-20 overflow-hidden bg-pearl"
    >
      <div
        className={`container-yhc grid gap-12 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:grid-rows-[auto_1fr] lg:gap-x-20 lg:gap-y-12 xl:gap-x-28 ${SECTION_Y}`}
      >
        {/* Promise */}
        <Reveal className="lg:col-start-1 lg:row-start-1">
          <p className="eyebrow">Take your scalp scan</p>
          <h2 id="scan-invite-heading" className="mt-5">
            <span className="display block text-[clamp(4.25rem,2.5rem+8vw,9rem)] leading-[0.9] tracking-[-0.01em]">
              Look closer.
            </span>
            <span className="mt-5 block max-w-[24ch] font-display text-[clamp(1.75rem,1.4rem+1.2vw,2.375rem)] leading-tight font-medium text-body">
              Your scalp, mapped before anything is prescribed.
            </span>
          </h2>
          <p className="mt-6 max-w-[46ch] text-lg leading-relaxed text-pretty text-body">
            A guided 3D scan on your phone maps your scalp zone by zone, from the hairline to the crown. You
            see a personal assessment straight away — and a dermatologist makes the final call.
          </p>
        </Reveal>

        {/* Device */}
        <Reveal delayMs={120} className="lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-center">
          <ScanExplorer />
        </Reveal>

        {/* Steps + CTA */}
        <Reveal className="lg:col-start-1 lg:row-start-2">
          <ol className="grid border-t border-line sm:grid-cols-3">
            {STEPS.map((step, i) => (
              <li
                key={step.title}
                className="flex gap-4 border-b border-line py-5 sm:flex-col sm:gap-3 sm:border-b-0 sm:py-6 sm:pr-6"
              >
                <span className="price pt-0.5 text-[13px] text-muted-foreground">0{i + 1}</span>
                <div className="min-w-0">
                  <p className="font-semibold text-ink">{step.title}</p>
                  <p className="mt-1 text-[15px] leading-relaxed text-body">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
            <Button asChild className="group h-14 w-full rounded-full px-8 text-base sm:w-auto">
              <Link href="/start">
                Begin my 3D scan
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </Link>
            </Button>
            <p className="text-center text-[13px] leading-snug text-muted-foreground sm:max-w-[18rem] sm:text-left">
              Free to start. A screening aid — the doctor makes the final assessment.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
