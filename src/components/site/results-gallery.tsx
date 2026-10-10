import { ArrowRight, ImageOff, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { ResultEntry } from '@/server/content/results';
import { BeforeAfterSlider } from './before-after-slider';
import { RAIL, RAIL_ITEM, TEXT_LINK } from './section';

/** Shown under every result (copy rules: PRD §15). */
const RESULT_DISCLAIMER =
  'Individual results vary. Photos shared with the patient’s written consent; faces hidden for privacy. Unretouched.';

export function resultDurationLabel(months: number | null): string {
  if (months === null) return 'Duration: to be confirmed';
  return `Duration: ${months} ${months === 1 ? 'month' : 'months'} between photos`;
}

/**
 * Consented before/after results (ADR-27). With data: drag-to-compare frames — a grid on /results, a
 * featured frame plus two smaller cards on the homepage. Without data: clearly labelled placeholder
 * frames — never stock or AI imagery standing in for a patient.
 */
export function ResultsGallery({
  results,
  placeholders = 3,
  layout = 'grid',
  className,
}: {
  results: ResultEntry[];
  placeholders?: number;
  /** 'grid' wraps into 1 → 2 → 3 columns (gallery page); 'featured' is the homepage teaser. */
  layout?: 'grid' | 'featured';
  className?: string;
}) {
  if (results.length === 0) {
    const rail = layout === 'featured';
    return (
      <div className={className}>
        <ul
          className={rail ? RAIL : 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3'}
          aria-label="Result placeholders"
        >
          {Array.from({ length: placeholders }, (_, i) => (
            <li key={i} className={rail ? RAIL_ITEM : undefined}>
              <PlaceholderFrame index={i} />
            </li>
          ))}
        </ul>
        <ConsentNote />
      </div>
    );
  }

  if (layout === 'featured') {
    const [featured, ...rest] = results;
    const side = rest.slice(0, 2);
    if (!featured) return null;
    return (
      <div className={className}>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-8">
          <ResultCard result={featured} sizes="(min-width: 1024px) 55vw, 100vw" priority />
          {side.length > 0 ? (
            <div className="flex flex-col gap-6">
              <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1" aria-label="More results">
                {side.map((r) => (
                  <li key={r.id}>
                    <ResultLinkCard result={r} />
                  </li>
                ))}
              </ul>
              <Link href="/results" className={`self-start text-ink ${TEXT_LINK}`}>
                See all {results.length} results <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
          ) : null}
        </div>
        <ConsentNote />
      </div>
    );
  }

  return (
    <div className={className}>
      <ul
        className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3"
        aria-label="Before and after results"
      >
        {results.map((r) => (
          <li key={r.id}>
            <ResultCard result={r} />
          </li>
        ))}
      </ul>
      <ConsentNote />
    </div>
  );
}

function ResultCard({
  result,
  sizes,
  priority = false,
}: {
  result: ResultEntry;
  sizes?: string;
  priority?: boolean;
}) {
  return (
    <figure className="flex h-full min-w-0 flex-col">
      <BeforeAfterSlider
        before={result.before}
        after={result.after}
        label={`Compare before and after: ${result.patientLabel}, ${result.view.toLowerCase()} view`}
        sizes={sizes}
        priority={priority}
        className="shadow-card ring-1 ring-line"
      />
      <ResultCaption result={result} />
    </figure>
  );
}

function ResultCaption({ result, compact = false }: { result: ResultEntry; compact?: boolean }) {
  return (
    <figcaption className={cn('space-y-1.5', compact ? 'pt-3' : 'pt-4')}>
      <p className="text-[15px] font-medium text-pretty text-ink">
        {result.patientLabel} <span className="text-steel">·</span> {result.concern}{' '}
        <span className="text-steel">·</span> {result.view}
      </p>
      <p className="text-sm text-body">{resultDurationLabel(result.months)}</p>
      {compact ? null : <p className="text-sm leading-relaxed text-pretty text-body">{result.note}</p>}
      <p className="text-[13px] leading-relaxed text-pretty text-muted-foreground">{RESULT_DISCLAIMER}</p>
    </figcaption>
  );
}

/** Smaller homepage card: the two photos side by side, linking to the full gallery. */
function ResultLinkCard({ result }: { result: ResultEntry }) {
  return (
    <figure className="min-w-0">
      <Link
        href="/results"
        className="group grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-line shadow-card ring-1 ring-line focus-visible:ring-4 focus-visible:ring-brand/60 focus-visible:outline-none"
        aria-label={`${result.patientLabel}, ${result.concern.toLowerCase()} — see all results`}
      >
        {(
          [
            ['Before', result.before],
            ['After', result.after],
          ] as const
        ).map(([label, photo]) => (
          <span key={label} className="relative block aspect-[4/5] overflow-hidden bg-ink-2">
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              sizes="(min-width: 1024px) 20vw, (min-width: 640px) 25vw, 50vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
            <span
              className={cn(
                'absolute top-2.5 left-2.5 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-[0.12em] uppercase backdrop-blur-sm',
                label === 'Before' ? 'bg-black/60 text-white' : 'bg-white/85 text-ink',
              )}
            >
              {label}
            </span>
          </span>
        ))}
      </Link>
      <ResultCaption result={result} compact />
    </figure>
  );
}

function PlaceholderFrame({ index }: { index: number }) {
  return (
    <figure className="flex h-full flex-col overflow-hidden rounded-2xl bg-card shadow-card ring-1 ring-line">
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

function ConsentNote() {
  return (
    <p className="mt-10 flex max-w-3xl items-start gap-2.5 text-sm leading-relaxed text-pretty text-body">
      <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
      <span>
        Only real patients who gave written consent appear here. Photos are cropped so faces are not shown and
        are otherwise unretouched — we never use stock or AI images as results. Individual results vary.
      </span>
    </p>
  );
}
