'use client';

import { ChevronLeft, ChevronRight, ImageOff, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import { useId, useState } from 'react';
import { cn } from '@/lib/utils';
import type { ResultEntry } from '@/server/content/results';

/**
 * Consented before/after results (ADR-27). With data: a drag-to-compare frame per result and a
 * carousel between results. Without data: elegant, clearly labelled placeholder frames — never stock
 * or AI imagery standing in for a patient.
 */
export function ResultsGallery({
  results,
  placeholders = 3,
  className,
}: {
  results: ResultEntry[];
  placeholders?: number;
  className?: string;
}) {
  if (results.length === 0) {
    return (
      <div className={className}>
        <ul className="grid gap-6 md:grid-cols-3">
          {Array.from({ length: placeholders }, (_, i) => (
            <li key={i}>
              <PlaceholderFrame index={i} />
            </li>
          ))}
        </ul>
        <ConsentNote />
      </div>
    );
  }
  return (
    <div className={className}>
      <ResultsCarousel results={results} />
      <ConsentNote />
    </div>
  );
}

function PlaceholderFrame({ index }: { index: number }) {
  return (
    <figure className="overflow-hidden rounded-2xl bg-card ring-1 ring-line">
      <div className="grid grid-cols-2 gap-px bg-line">
        {(['Before', 'After'] as const).map((label) => (
          <div
            key={label}
            className="relative flex aspect-[4/5] flex-col items-center justify-center gap-2 bg-[#f1efec] bg-[radial-gradient(circle_at_1px_1px,rgba(107,112,120,0.18)_1px,transparent_0)] [background-size:14px_14px]"
          >
            <span className="absolute top-3 left-3 rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-semibold tracking-[0.1em] text-ink uppercase">
              {label}
            </span>
            <ImageOff className="size-5 text-steel" aria-hidden />
          </div>
        ))}
      </div>
      <figcaption className="space-y-1 p-5">
        <p className="font-medium text-ink">Consented patient result — to be added</p>
        <p className="text-sm text-body">Duration on plan: shown with each result</p>
        <p className="text-[13px] text-muted-foreground">Result {index + 1} · Individual results vary</p>
      </figcaption>
    </figure>
  );
}

function ResultsCarousel({ results }: { results: ResultEntry[] }) {
  const [index, setIndex] = useState(0);
  const current = results[index % results.length];
  if (!current) return null;
  const go = (delta: number) => setIndex((i) => (i + delta + results.length) % results.length);
  return (
    <div className="grid gap-8 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:items-center">
      <CompareFrame key={current.id} result={current} />
      <div>
        <p className="eyebrow">
          Result {index + 1} of {results.length}
        </p>
        <h3 className="display mt-3 text-3xl">{current.concern}</h3>
        <dl className="mt-6 divide-y divide-line border-y border-line text-[15px]">
          <div className="flex justify-between gap-4 py-3">
            <dt className="text-muted-foreground">Time between photos</dt>
            <dd className="text-right font-medium text-ink">{current.durationLabel}</dd>
          </div>
          <div className="flex justify-between gap-4 py-3">
            <dt className="text-muted-foreground">Plan</dt>
            <dd className="text-right text-ink">{current.planSummary}</dd>
          </div>
        </dl>
        <p className="mt-4 text-sm text-body">Individual results vary. Shared with written consent.</p>
        {results.length > 1 ? (
          <div className="mt-6 flex gap-2">
            <button
              type="button"
              onClick={() => go(-1)}
              className="flex size-11 items-center justify-center rounded-full border border-steel text-ink hover:bg-mist"
              aria-label="Previous result"
            >
              <ChevronLeft className="size-5" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              className="flex size-11 items-center justify-center rounded-full border border-steel text-ink hover:bg-mist"
              aria-label="Next result"
            >
              <ChevronRight className="size-5" aria-hidden />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

/** Drag (or use arrow keys on) the handle to compare the two photos. */
function CompareFrame({ result }: { result: ResultEntry }) {
  const [pos, setPos] = useState(50);
  const id = useId();
  return (
    <figure className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-ink-2 select-none md:aspect-square">
      <Image
        src={result.after.src}
        alt={result.after.alt}
        fill
        sizes="(min-width: 768px) 55vw, 100vw"
        className="object-cover"
      />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        <Image
          src={result.before.src}
          alt={result.before.alt}
          fill
          sizes="(min-width: 768px) 55vw, 100vw"
          className="object-cover"
        />
      </div>
      <div
        className="pointer-events-none absolute inset-y-0 w-px bg-white/90"
        style={{ left: `${pos}%` }}
        aria-hidden
      >
        <span className="absolute top-1/2 left-1/2 flex size-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-ink shadow-raised">
          <ChevronLeft className="size-4" />
          <ChevronRight className="-ml-1 size-4" />
        </span>
      </div>
      <span className="absolute top-3 left-3 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-semibold tracking-[0.1em] text-white uppercase">
        Before
      </span>
      <span className="absolute top-3 right-3 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-semibold tracking-[0.1em] text-white uppercase">
        After · {result.durationLabel}
      </span>
      <label htmlFor={id} className="sr-only">
        Compare before and after photos
      </label>
      <input
        id={id}
        type="range"
        min={0}
        max={100}
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        className="absolute inset-0 size-full cursor-ew-resize opacity-0"
      />
    </figure>
  );
}

function ConsentNote() {
  return (
    <p className={cn('mt-6 flex items-start gap-2.5 text-sm text-body')}>
      <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
      <span>
        Only real patients who gave written consent appear here, photographed under the same conditions, with
        the time on plan stated. We never use stock or AI images as results. Individual results vary.
      </span>
    </p>
  );
}
