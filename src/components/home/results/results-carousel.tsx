'use client';

import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Marquee } from '@/components/home/marquee';
import { BeforeAfterSlider, type SliderPhoto } from '@/components/site/before-after-slider';
import { TEXT_LINK } from '@/components/site/section';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { RESULT_DISCLAIMER } from './copy';

/** Display-ready result (server maps ResultEntry → this, so no server module reaches the client). */
export interface ResultCardData {
  id: string;
  patientLabel: string;
  concern: string;
  view: string;
  before: SliderPhoto;
  after: SliderPhoto;
  /** "Duration: to be confirmed" until the clinic confirms the months between photos. */
  duration: string;
  note: string;
}

/** The marquee track must be wider than the widest viewport: repeat short lists up to this many cards. */
const MIN_CARDS = 8;
/** Seconds of travel per card — slow and confident; long enough to read a caption as it passes. */
const SECONDS_PER_CARD = 8;

/**
 * Section 8 carousel: a seamless, slowly drifting gallery wall. Each card is a white mat holding the
 * two photos with a hairline seam and a thin caption; tapping opens the drag-to-compare slider. Repeats
 * (added only to fill wide screens) stay out of the tab order and the accessibility tree.
 */
export function ResultsCarousel({ results }: { results: ResultCardData[] }) {
  const reps = Math.max(1, Math.ceil(MIN_CARDS / results.length));
  const cards = Array.from({ length: reps }, (_, rep) =>
    results.map((r) => <ResultCard key={`${rep}-${r.id}`} result={r} decorative={rep > 0} />),
  ).flat();

  return (
    <Marquee
      label="Patient results, before and after"
      durationSec={cards.length * SECONDS_PER_CARD}
      className="text-center"
      itemClassName="w-[17.5rem] min-[400px]:w-[19rem] sm:w-[22rem] lg:w-[25rem]"
    >
      {cards}
    </Marquee>
  );
}

function ResultCard({ result, decorative }: { result: ResultCardData; decorative: boolean }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          tabIndex={decorative ? -1 : undefined}
          aria-hidden={decorative ? true : undefined}
          aria-label={`Compare before and after: ${result.patientLabel}, ${result.concern.toLowerCase()}, ${result.view.toLowerCase()} view`}
          className="group/card block w-full rounded-sm text-left focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-4 focus-visible:ring-offset-pearl focus-visible:outline-none"
        >
          {/* Gallery mat */}
          <span className="relative block bg-white p-2.5 shadow-[0_1px_0_rgba(18,19,21,0.04)] ring-1 ring-line transition-shadow duration-700 ease-yhc group-hover/card:shadow-[0_30px_60px_-30px_rgba(18,19,21,0.35)] motion-reduce:transition-none sm:p-3">
            <span className="relative grid grid-cols-2 gap-px bg-line">
              <Pane photo={result.before} />
              <Pane photo={result.after} />
              {/* Compare handle: fades in on hover, hinting at the slider inside. */}
              <span
                aria-hidden
                className="absolute top-1/2 left-1/2 flex size-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-ink opacity-0 shadow-raised transition-opacity duration-500 group-hover/card:opacity-100 group-focus-visible/card:opacity-100 motion-reduce:transition-none"
              >
                <ChevronLeft className="size-3.5" />
                <ChevronRight className="-ml-1 size-3.5" />
              </span>
            </span>
            <span
              aria-hidden
              className="grid grid-cols-2 pt-2.5 text-[10px] font-semibold tracking-[0.2em] text-muted-foreground uppercase"
            >
              <span>Before</span>
              <span className="pl-2">After</span>
            </span>
          </span>

          {/* Thin caption */}
          <span className="block px-0.5 pt-4">
            <span className="block text-[11px] font-semibold tracking-[0.18em] text-ink uppercase">
              {result.patientLabel} — {result.concern}
            </span>
            <span className="mt-1.5 flex items-baseline justify-between gap-3 text-[13px] text-muted-foreground">
              <span>
                {result.view} · {result.duration}
              </span>
              <span className="shrink-0 text-ink underline decoration-steel underline-offset-4 transition-colors group-hover/card:decoration-current">
                Compare
              </span>
            </span>
          </span>
        </button>
      </DialogTrigger>

      <DialogContent mobileSheet className="gap-5 sm:max-w-[34rem]">
        <DialogHeader className="pr-8 text-left">
          <DialogTitle className="font-display text-[1.75rem] leading-tight font-medium text-ink">
            {result.patientLabel} · {result.concern}
          </DialogTitle>
          <DialogDescription className="text-body">
            {result.view} view · {result.duration}. Drag the handle, or use the arrow keys, to compare.
          </DialogDescription>
        </DialogHeader>
        <BeforeAfterSlider
          before={result.before}
          after={result.after}
          label={`Compare before and after: ${result.patientLabel}, ${result.view.toLowerCase()} view`}
          sizes="(min-width: 640px) 32rem, 100vw"
          // Keep the 4:5 frame inside short viewports without scrolling the dialog.
          className="mx-auto w-full max-w-[min(100%,calc((100dvh-18rem)*0.8))] ring-1 ring-line"
        />
        <div className="space-y-2">
          <p className="text-sm leading-relaxed text-pretty text-body">{result.note}</p>
          <p className="text-[13px] leading-relaxed text-pretty text-muted-foreground">{RESULT_DISCLAIMER}</p>
        </div>
        <Link href="/results" className={cn('self-start text-ink', TEXT_LINK)}>
          See all results <ArrowRight className="size-4" aria-hidden />
        </Link>
      </DialogContent>
    </Dialog>
  );
}

function Pane({ photo }: { photo: SliderPhoto }) {
  return (
    <span className="relative block aspect-[4/5] overflow-hidden bg-mist">
      <Image
        src={photo.src}
        alt={photo.alt}
        fill
        sizes="(min-width: 1024px) 12rem, (min-width: 640px) 10.5rem, 9rem"
        draggable={false}
        className="object-cover transition-transform duration-[1200ms] ease-yhc group-hover/card:scale-[1.03] motion-reduce:transition-none"
      />
    </span>
  );
}
