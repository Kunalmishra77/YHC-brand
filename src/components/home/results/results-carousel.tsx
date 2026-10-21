'use client';

import { ArrowRight, ChevronLeft, ChevronRight, MoveHorizontal } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Marquee } from '@/components/home/marquee';
import { BeforeAfterSlider, type SliderPhoto } from '@/components/site/before-after-slider';
import { TEXT_LINK } from '@/components/site/section';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { RESULT_DISCLAIMER, plainConcern, plainView } from './copy';

/** Display-ready result (server maps ResultEntry → this, so no server module reaches the client). */
export interface ResultCardData {
  id: string;
  patientLabel: string;
  concern: string;
  view: string;
  before: SliderPhoto;
  after: SliderPhoto;
  /** Empty until the clinic confirms the months between photos (then nothing is shown — ADR-33). */
  duration: string;
  note: string;
}

/** The marquee track must be wider than the widest viewport: repeat short lists up to this many cards. */
const MIN_CARDS = 6;
/** Seconds of travel per card — slow enough to look at each pair as it passes. */
const SECONDS_PER_CARD = 10;

/**
 * Section 8 gallery: a slow, seamless wall of large before/after pairs. Each card is one rounded frame
 * holding both photos with a seam and a compare handle; tapping opens one shared dialog with the
 * drag-to-compare slider and previous/next between cases. The Marquee repeats short lists to fill wide
 * screens; every repeat is aria-hidden + inert, so each case is exposed to assistive tech exactly once.
 */
export function ResultsCarousel({ results }: { results: ResultCardData[] }) {
  const [active, setActive] = useState<number | null>(null);
  const perHalf = results.length * Math.max(1, Math.ceil(MIN_CARDS / Math.max(1, results.length)));
  const current = active === null ? undefined : results[active];
  const step = (by: number) =>
    setActive((i) => (i === null ? i : (i + by + results.length) % results.length));

  return (
    <>
      <Marquee
        label="Patient photos, before and after"
        durationSec={perHalf * SECONDS_PER_CARD}
        minItems={MIN_CARDS}
        className="text-center"
        itemClassName="w-[19rem] min-[400px]:w-[21rem] sm:w-[26rem] lg:w-[32rem]"
      >
        {results.map((r, i) => (
          <ResultCard key={r.id} result={r} onOpen={() => setActive(i)} />
        ))}
      </Marquee>

      <Dialog open={current !== undefined} onOpenChange={(open) => (open ? null : setActive(null))}>
        {current ? (
          <DialogContent mobileSheet className="gap-4 sm:max-w-[36rem]">
            <DialogHeader className="pr-8 text-left">
              <DialogTitle className="font-display text-[1.75rem] leading-tight font-medium text-ink">
                {current.patientLabel}: {plainConcern(current.concern).toLowerCase()}
              </DialogTitle>
              <DialogDescription className="text-body">
                {plainView(current.view)}
                {current.duration ? `. ${current.duration}` : ''}. Drag the line to compare.
              </DialogDescription>
            </DialogHeader>
            <BeforeAfterSlider
              key={current.id}
              before={current.before}
              after={current.after}
              label={`Compare before and after: ${current.patientLabel}, ${plainView(current.view).toLowerCase()}`}
              sizes="(min-width: 640px) 34rem, 100vw"
              // Keep the 4:5 frame inside short viewports without scrolling the dialog.
              className="mx-auto w-full max-w-[min(100%,calc((100dvh-19rem)*0.8))] rounded-[1.75rem] ring-1 ring-line"
            />
            <p className="text-[13px] leading-relaxed text-pretty text-muted-foreground">
              {RESULT_DISCLAIMER}
            </p>
            <div className="flex items-center justify-between gap-3">
              <Link href="/results" className={cn('text-ink', TEXT_LINK)}>
                See all results <ArrowRight className="size-4" aria-hidden />
              </Link>
              {results.length > 1 ? (
                <div className="flex items-center gap-2">
                  <span className="text-[13px] text-muted-foreground tabular-nums" aria-live="polite">
                    {(active ?? 0) + 1} of {results.length}
                  </span>
                  <StepButton label="Previous patient" onClick={() => step(-1)}>
                    <ChevronLeft className="size-4" aria-hidden />
                  </StepButton>
                  <StepButton label="Next patient" onClick={() => step(1)}>
                    <ChevronRight className="size-4" aria-hidden />
                  </StepButton>
                </div>
              ) : null}
            </div>
          </DialogContent>
        ) : null}
      </Dialog>
    </>
  );
}

function StepButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex size-11 items-center justify-center rounded-full text-ink ring-1 ring-line transition-colors hover:bg-mist"
    >
      {children}
    </button>
  );
}

function ResultCard({ result, onOpen }: { result: ResultCardData; onOpen: () => void }) {
  const concern = plainConcern(result.concern);
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-haspopup="dialog"
      aria-label={`Compare before and after: ${result.patientLabel}, ${concern.toLowerCase()}, ${plainView(result.view).toLowerCase()}`}
      className="group/card block w-full rounded-[1.75rem] text-left focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-4 focus-visible:ring-offset-pearl focus-visible:outline-none"
    >
      <span className="relative grid grid-cols-2 gap-0.5 overflow-hidden rounded-[1.75rem] bg-white shadow-[0_1px_0_rgba(18,19,21,0.04)] ring-1 ring-line transition-[box-shadow,translate] duration-700 ease-yhc group-hover/card:-translate-y-1 group-hover/card:shadow-[0_40px_70px_-36px_rgba(18,19,21,0.45)] motion-reduce:transition-none">
        <Pane photo={result.before} tag="Before" dark />
        <Pane photo={result.after} tag="After" />
        {/* Compare handle on the seam: says "this compares" without words. */}
        <span
          aria-hidden
          className="absolute top-1/2 left-1/2 flex size-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-ink shadow-raised ring-1 ring-black/5 transition-transform duration-500 ease-yhc group-hover/card:scale-110 motion-reduce:transition-none"
        >
          <MoveHorizontal className="size-5" />
        </span>
      </span>

      <span className="flex items-baseline justify-between gap-3 px-2 pt-4">
        <span className="min-w-0">
          <span className="block font-medium text-ink">{result.patientLabel}</span>
          <span className="block text-sm text-body">
            {concern}
            {result.duration ? `. ${result.duration}` : null}
          </span>
        </span>
        <span className="shrink-0 text-sm font-medium text-ink underline decoration-steel underline-offset-4 transition-colors group-hover/card:decoration-current">
          Compare
        </span>
      </span>
    </button>
  );
}

function Pane({ photo, tag, dark = false }: { photo: SliderPhoto; tag: string; dark?: boolean }) {
  return (
    <span className="relative block aspect-[4/5] overflow-hidden bg-mist">
      <Image
        src={photo.src}
        alt={photo.alt}
        fill
        sizes="(min-width: 1024px) 16rem, (min-width: 640px) 13rem, 10.5rem"
        draggable={false}
        className="object-cover transition-transform duration-[1400ms] ease-yhc group-hover/card:scale-[1.04] motion-reduce:transition-none"
      />
      <span
        aria-hidden
        className={cn(
          'absolute top-3 left-3 rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-sm',
          dark ? 'bg-black/60 text-white' : 'bg-white/90 text-ink',
        )}
      >
        {tag}
      </span>
    </span>
  );
}
