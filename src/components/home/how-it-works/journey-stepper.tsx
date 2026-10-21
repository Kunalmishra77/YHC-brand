'use client';

import { ArrowRight } from 'lucide-react';
import { AnimatePresence, motion, useInView, type PanInfo } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { usePrefersReducedMotion } from '@/components/site/background-video';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { StepVisual } from './step-visuals';
import type { HowStep, SlotTerms } from './types';

const EASE = [0.2, 0.7, 0.2, 1] as const;
const AUTO_MS = 5200;
/** Horizontal drag distance (px) that counts as a swipe to the next/previous step. */
const SWIPE_PX = 60;
const pad = (n: number) => String(n).padStart(2, '0');

/**
 * One-viewport, picture-led journey stepper (audit UX-02, docs/20): the steps are tabs (click, arrow
 * keys, or swipe the picture on phones); the panel crossfades to the selected step's photo with its
 * words laid over it. Until a step's generated photo is in, the small UI mock of that step stays in
 * front of a dimmed fallback photo. While in view it advances on its own until the visitor
 * interacts — never with reduced motion (then everything is static).
 */
export function JourneyStepper({ steps, terms }: { steps: HowStep[]; terms: SlotTerms }) {
  const uid = useId();
  const reduced = usePrefersReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const inView = useInView(rootRef, { amount: 0.45 });
  const [active, setActive] = useState(0);
  const [interacted, setInteracted] = useState(false);
  const n = steps.length;
  const auto = !reduced && !interacted && inView;

  useEffect(() => {
    if (!auto) return;
    const t = window.setInterval(() => setActive((i) => (i + 1) % n), AUTO_MS);
    return () => window.clearInterval(t);
  }, [auto, n]);

  // Phones: keep the selected pill visible in the swipe rail (horizontal scroll only — never the page).
  useEffect(() => {
    const rail = railRef.current;
    const tab = tabRefs.current[active];
    if (!rail || !tab || rail.scrollWidth <= rail.clientWidth) return;
    rail.scrollTo({ left: Math.max(0, tab.offsetLeft - 16), behavior: reduced ? 'auto' : 'smooth' });
  }, [active, reduced]);

  const select = (i: number, focus = false) => {
    setInteracted(true);
    setActive(i);
    if (focus) tabRefs.current[i]?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const moves: Record<string, number> = {
      ArrowDown: (active + 1) % n,
      ArrowRight: (active + 1) % n,
      ArrowUp: (active - 1 + n) % n,
      ArrowLeft: (active - 1 + n) % n,
      Home: 0,
      End: n - 1,
    };
    const next = moves[e.key];
    if (next === undefined) return;
    e.preventDefault();
    select(next, true);
  };

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x <= -SWIPE_PX) select((active + 1) % n);
    else if (info.offset.x >= SWIPE_PX) select((active - 1 + n) % n);
  };

  const current = steps[active] ?? steps[0];
  if (!current) return null;
  const panelId = `${uid}-panel`;

  return (
    <div ref={rootRef} className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-stretch lg:gap-14 xl:gap-20">
      {/* Steps = tabs. Phones: a swipeable numbered row; desktop: the full list with a progress rail. */}
      <div className="flex min-w-0 flex-col">
        <div
          ref={railRef}
          role="tablist"
          aria-label="Your journey, step by step"
          aria-orientation="vertical"
          onKeyDown={onKeyDown}
          className="relative -mx-[var(--yhc-gutter)] flex snap-x gap-2 overflow-x-auto px-[var(--yhc-gutter)] [scrollbar-width:none] lg:mx-0 lg:flex-col lg:gap-0 lg:overflow-visible lg:px-0 [&::-webkit-scrollbar]:hidden"
        >
          <span aria-hidden className="absolute top-6 bottom-6 left-6 hidden w-px bg-line lg:block" />
          <span
            aria-hidden
            className="absolute top-6 left-6 hidden w-px origin-top bg-obsidian transition-[height] duration-700 ease-out lg:block"
            style={{ height: `calc((100% - 3rem) * ${active / Math.max(1, n - 1)})` }}
          />
          {steps.map((s, i) => {
            const on = i === active;
            const done = i < active;
            return (
              <button
                key={s.id}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                type="button"
                role="tab"
                id={`${uid}-tab-${s.id}`}
                aria-selected={on}
                aria-controls={panelId}
                tabIndex={on ? 0 : -1}
                onClick={() => select(i)}
                className={cn(
                  'group relative flex min-h-12 shrink-0 snap-start items-center gap-3 rounded-full px-4 text-left ring-1 transition-colors focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none',
                  'lg:min-h-14 lg:gap-5 lg:rounded-xl lg:px-1 lg:ring-0',
                  on ? 'bg-obsidian text-on-dark ring-obsidian lg:bg-transparent lg:text-ink' : 'text-body ring-line',
                )}
              >
                <span
                  className={cn(
                    'price relative z-10 hidden size-10 shrink-0 items-center justify-center rounded-full text-[13px] ring-4 ring-card transition-colors duration-500 lg:flex',
                    on
                      ? 'bg-[image:var(--yhc-silver)] text-obsidian shadow-[0_0_0_1px_var(--yhc-obsidian)]'
                      : done
                        ? 'bg-obsidian text-on-dark'
                        : 'bg-card text-muted-foreground shadow-[0_0_0_1px_var(--yhc-line-light)] group-hover:text-ink',
                  )}
                >
                  {pad(i + 1)}
                </span>
                <span className="price text-[13px] lg:hidden">{i + 1}</span>
                <span
                  className={cn(
                    'text-[15px] leading-snug font-semibold whitespace-nowrap transition-colors lg:text-[17px] lg:whitespace-normal',
                    on ? 'lg:text-ink' : 'lg:text-muted-foreground lg:group-hover:text-ink',
                  )}
                >
                  {s.title}
                </span>
                {s.after ? (
                  <span className="hidden rounded-full px-2 py-0.5 text-[12px] font-medium text-muted-foreground ring-1 ring-line lg:inline">
                    After
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        {/* CTA with the fee note, beside the steps (audit UX-02). */}
        <div className="mt-8 hidden border-t border-line pt-6 lg:mt-auto lg:block">
          <p className="max-w-md text-sm leading-relaxed text-body">
            Starting is free. You pay the {terms.fee} fee only when you book a call with the doctor.
          </p>
          <Button asChild className="mt-4 h-12 px-7 text-base">
            <Link href="/start">
              Begin my free 3D scan <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Button>
        </div>
      </div>

      {/* Selected step: photo + words in one panel */}
      <div
        role="tabpanel"
        id={panelId}
        aria-labelledby={`${uid}-tab-${current.id}`}
        className="relative aspect-square overflow-hidden rounded-[28px] bg-obsidian text-on-dark shadow-raised ring-1 ring-line-dark sm:aspect-auto sm:min-h-[30rem] lg:min-h-[34rem]"
      >
        <motion.div
          className="absolute inset-0"
          drag="x"
          dragSnapToOrigin
          dragElastic={0.12}
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={onDragEnd}
          style={{ touchAction: 'pan-y' }}
        >
          {/* Every step's photo is stacked; only the active one is opaque — a true crossfade, and the
              next photo is already loaded when its step comes up. */}
          {steps.map((s, i) => {
            const on = i === active;
            return (
              <motion.div
                key={s.id}
                aria-hidden={!on}
                className="absolute inset-0"
                initial={false}
                animate={{ opacity: on ? 1 : 0, scale: on || reduced ? 1 : 1.06 }}
                transition={{ duration: reduced ? 0 : 0.9, ease: EASE }}
              >
                <Image
                  src={s.image.src}
                  alt={on ? s.image.alt : ''}
                  fill
                  draggable={false}
                  sizes="(min-width: 1024px) 55vw, 100vw"
                  className={cn('object-cover', !s.image.ready && 'grayscale')}
                />
              </motion.div>
            );
          })}

          {/* Contrast: a stronger veil while the UI mock is in front of a temporary photo */}
          <div
            aria-hidden
            className={cn(
              'absolute inset-0 transition-colors duration-700',
              current.image.ready ? 'bg-obsidian/0' : 'bg-obsidian/65',
            )}
          />
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-obsidian via-obsidian/70 to-transparent"
          />

          {!current.image.ready ? (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-14 bottom-36 hidden items-center justify-center sm:flex"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={current.id}
                  initial={reduced ? false : { opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduced ? { opacity: 0 } : { opacity: 0, y: -10 }}
                  transition={{ duration: reduced ? 0 : 0.45, ease: EASE }}
                  className="origin-center sm:scale-[0.8] lg:scale-100"
                >
                  <StepVisual id={current.id} active terms={terms} still={reduced} />
                </motion.div>
              </AnimatePresence>
            </div>
          ) : null}
        </motion.div>

        {/* Top bar: step count + progress (the active dash fills while it auto-advances) */}
        <div className="pointer-events-none absolute inset-x-5 top-5 z-10 flex items-center justify-between gap-4 sm:inset-x-8 sm:top-6">
          <p className="rounded-full bg-black/45 px-3 py-1 text-[13px] font-medium text-on-dark backdrop-blur">
            Step {active + 1} of {n}
          </p>
          <div className="flex gap-1" aria-hidden>
            {steps.map((s, i) => (
              <span key={s.id} className="relative h-1 w-5 overflow-hidden rounded-full bg-white/25">
                {i < active || (i === active && !auto) ? (
                  <span className="absolute inset-0 bg-platinum" />
                ) : i === active ? (
                  <motion.span
                    key={`fill-${active}`}
                    className="absolute inset-0 origin-left bg-platinum"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: AUTO_MS / 1000, ease: 'linear' }}
                  />
                ) : null}
              </span>
            ))}
          </div>
        </div>

        {current.image.note ? (
          <span className="pointer-events-none absolute top-16 right-5 z-10 rounded-full bg-black/55 px-2.5 py-1 text-[12px] text-on-dark backdrop-blur sm:top-[4.5rem] sm:right-8">
            {current.image.note}
          </span>
        ) : null}

        {/* Words, laid over the bottom of the photo */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 px-5 pb-6 sm:px-8 sm:pb-8">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={current.id}
              initial={reduced ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
              transition={{ duration: reduced ? 0 : 0.4, ease: EASE }}
            >
              <h3 className="font-display text-[clamp(1.75rem,1.4rem+1vw,2.25rem)] leading-tight text-on-dark">
                {current.title}
              </h3>
              <p className="mt-2 max-w-[44ch] text-base leading-relaxed text-pretty text-on-dark/85">{current.body}</p>
              {current.meta ? <p className="mt-2 text-[13px] font-medium text-brand-on-dark">{current.meta}</p> : null}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Phones: swipe hint + CTA under the panel */}
      <div className="border-t border-line pt-6 lg:hidden">
        <p className="text-sm leading-relaxed text-body">
          Swipe the picture to see each step. Starting is free. You pay the {terms.fee} fee only when you
          book a call with the doctor.
        </p>
        <Button asChild className="mt-4 h-12 w-full px-7 text-base sm:w-auto">
          <Link href="/start">
            Begin my free 3D scan <ArrowRight className="size-4" aria-hidden />
          </Link>
        </Button>
      </div>
    </div>
  );
}
