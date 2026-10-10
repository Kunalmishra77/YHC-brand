'use client';

import { ArrowUpRight } from 'lucide-react';
import { motion, useInView } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from '@/components/site/background-video';
import { cn } from '@/lib/utils';
import {
  CycleVisual,
  FollicleVisual,
  MiniaturisationVisual,
  PlanTargetsVisual,
  ScanFieldVisual,
} from './science-visuals';
import type { Chapter, ChapterCite, ChapterId, PlanTarget } from './types';

const EASE = [0.2, 0.7, 0.2, 1] as const;
const EXTERNAL = { target: '_blank', rel: 'noopener noreferrer' } as const;
const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Chapter narrative. lg+: chapter text scrolls on the left while a sticky "specimen" stage on the right
 * cross-fades to the active chapter's figure (IntersectionObserver on a thin band mid-viewport — no
 * scroll listeners). Below lg: each chapter shows its own figure inline, animating once in view.
 */
export function ScienceChapters({ chapters, targets }: { chapters: Chapter[]; targets: PlanTarget[] }) {
  const reduced = usePrefersReducedMotion();
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const i = Number((e.target as HTMLElement).dataset.index);
          if (Number.isFinite(i)) setActive(i);
        }
      },
      { rootMargin: '-45% 0px -45% 0px' },
    );
    for (const el of refs.current) if (el) io.observe(el);
    return () => io.disconnect();
  }, [chapters.length]);

  const current = chapters[active] ?? chapters[0];

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-14 xl:gap-24">
      <div>
        {chapters.map((c, i) => (
          <article
            key={c.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            data-index={i}
            aria-labelledby={`science-ch-${c.id}`}
            className="border-t border-line-dark py-14 first:border-t-0 first:pt-2 md:py-20 lg:flex lg:min-h-[86svh] lg:flex-col lg:justify-center lg:border-t-0 lg:py-16"
          >
            <InlineFigure id={c.id} index={i} targets={targets} reduced={reduced} />
            <ChapterText chapter={c} index={i} active={i === active} reduced={reduced} />
          </article>
        ))}
      </div>

      <div className="hidden lg:block">
        <div className="sticky top-16 flex h-[calc(100svh-4rem)] items-center">
          <div className="relative mx-auto aspect-square w-full max-w-[min(100%,calc(100svh-8rem))] rounded-[2rem] border border-line-dark bg-ink-2/50 shadow-[0_0_120px_-40px_rgba(174,187,200,0.35)] backdrop-blur-sm">
            <StageChrome index={active} total={chapters.length} kicker={current?.kicker ?? ''} />
            {chapters.map((c, i) => {
              const on = i === active;
              return (
                <motion.div
                  key={c.id}
                  initial={false}
                  animate={{ opacity: on ? 1 : 0, scale: on ? 1 : 0.96 }}
                  transition={reduced ? { duration: 0 } : { duration: 0.7, ease: EASE }}
                  aria-hidden={!on}
                  inert={!on}
                  className="absolute inset-0 px-8 pt-14 pb-12 xl:px-10"
                >
                  <Figure id={c.id} play={on} reduced={reduced} targets={targets} />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function Figure({
  id,
  play,
  reduced,
  targets,
}: {
  id: ChapterId;
  play: boolean;
  reduced: boolean;
  targets: PlanTarget[];
}) {
  switch (id) {
    case 'follicle':
      return <FollicleVisual play={play} reduced={reduced} />;
    case 'cycle':
      return <CycleVisual play={play} reduced={reduced} />;
    case 'thinning':
      return <MiniaturisationVisual play={play} reduced={reduced} />;
    case 'scan':
      return <ScanFieldVisual play={play} reduced={reduced} />;
    case 'plan':
      return <PlanTargetsVisual play={play} reduced={reduced} targets={targets} />;
  }
}

/** Phones/tablets: the chapter's figure above its text; plays once it is half in view. */
function InlineFigure({
  id,
  index,
  targets,
  reduced,
}: {
  id: ChapterId;
  index: number;
  targets: PlanTarget[];
  reduced: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.45, once: id !== 'cycle' });
  const tall = id === 'cycle';
  return (
    <div
      ref={ref}
      className={cn(
        'relative mx-auto mb-8 w-full max-w-md rounded-3xl border border-line-dark bg-ink-2/50 px-4 pt-10 pb-5 sm:px-6 lg:hidden',
        tall ? 'aspect-[4/5.4]' : 'aspect-square',
      )}
    >
      <p className="price absolute top-4 left-5 text-[11px] tracking-[0.16em] text-steel uppercase">
        Fig. {pad(index + 1)}
      </p>
      <Figure id={id} play={inView} reduced={reduced} targets={targets} />
    </div>
  );
}

function StageChrome({ index, total, kicker }: { index: number; total: number; kicker: string }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {/* Corner ticks */}
      <svg
        className="absolute inset-3 size-[calc(100%-1.5rem)]"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
      >
        <path
          d="M0 6 V0 H6 M94 0 H100 V6 M100 94 V100 H94 M6 100 H0 V94"
          fill="none"
          stroke="rgba(201,204,209,0.55)"
          strokeWidth="0.4"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div className="absolute inset-x-8 top-5 flex items-center justify-between gap-4 xl:inset-x-10">
        <p className="price truncate text-[11px] tracking-[0.16em] text-on-dark-muted uppercase">
          Fig. {pad(index + 1)} — {kicker}
        </p>
        <p className="shrink-0 text-[11px] tracking-[0.16em] text-steel uppercase">Illustrative</p>
      </div>
      <div className="absolute inset-x-8 bottom-5 flex gap-1.5 xl:inset-x-10">
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className="h-px flex-1 bg-line-dark">
            <span
              className={cn(
                'block h-px origin-left bg-[image:var(--yhc-silver)] transition-transform duration-700',
                i <= index ? 'scale-x-100' : 'scale-x-0',
              )}
            />
          </span>
        ))}
      </div>
    </div>
  );
}

function ChapterText({
  chapter: c,
  index,
  active,
  reduced,
}: {
  chapter: Chapter;
  index: number;
  active: boolean;
  reduced: boolean;
}) {
  return (
    <div className="relative lg:pl-8">
      {/* Desktop: a silver hairline grows beside the active chapter */}
      <span aria-hidden className="absolute top-1 bottom-1 left-0 hidden w-px bg-line-dark lg:block">
        <span
          className={cn(
            'block h-full w-px origin-top bg-[image:var(--yhc-silver)]',
            !reduced && 'transition-transform duration-700',
            active ? 'scale-y-100' : 'scale-y-0',
          )}
        />
      </span>
      <p className="flex items-center gap-3">
        <span className="price text-[13px] text-brand-on-dark">{pad(index + 1)}</span>
        <span aria-hidden className="h-px w-6 bg-line-dark" />
        <span className="eyebrow text-brand-on-dark">{c.kicker}</span>
      </p>
      <h3
        id={`science-ch-${c.id}`}
        className="display mt-4 text-[clamp(1.75rem,1.35rem+1.6vw,2.625rem)] text-balance text-on-dark"
      >
        {c.title}
      </h3>
      <p className="mt-5 max-w-[56ch] text-[17px] leading-relaxed text-pretty text-on-dark-muted">{c.body}</p>
      {c.extra}
      {c.cite ? <CiteCard cite={c.cite} secondary={c.secondary} /> : null}
    </div>
  );
}

function CiteCard({ cite, secondary }: { cite: ChapterCite; secondary?: ChapterCite }) {
  return (
    <figure className="relative mt-8 max-w-[34rem] rounded-2xl border border-line-dark bg-ink-2/70 p-5 sm:p-6">
      <span aria-hidden className="absolute top-0 left-5 h-px w-10 bg-[image:var(--yhc-silver)] sm:left-6" />
      {cite.stat ? (
        <p className="bg-[image:var(--yhc-silver)] bg-clip-text font-display text-[clamp(2.25rem,1.9rem+1.2vw,2.75rem)] leading-none font-medium text-transparent">
          {cite.stat}
        </p>
      ) : null}
      <p className={cn('leading-snug text-on-dark', cite.stat ? 'mt-2' : 'font-medium')}>{cite.label}</p>
      <figcaption className="mt-3 space-y-1 text-[13px] text-on-dark-muted">
        <SourceLink cite={cite} />
        {secondary ? (
          <p>
            Also: {secondary.label} — <SourceLink cite={secondary} />
          </p>
        ) : null}
      </figcaption>
    </figure>
  );
}

function SourceLink({ cite }: { cite: ChapterCite }) {
  return (
    <a
      href={cite.url}
      {...EXTERNAL}
      className="inline-flex min-h-12 items-center gap-1 underline decoration-line-dark underline-offset-4 hover:text-on-dark sm:min-h-0"
    >
      Source: {cite.source}
      {cite.year ? `, ${cite.year}` : ''}
      <ArrowUpRight className="size-3.5 shrink-0" aria-hidden />
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}
