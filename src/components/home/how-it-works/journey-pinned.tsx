'use client';

import { ArrowRight } from 'lucide-react';
import { motion, useMotionValueEvent, useScroll, useTransform, type MotionValue } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRamp } from '@/lib/use-ramp';
import { cn } from '@/lib/utils';
import type { HowStep, SlotTerms } from './types';

const EASE = [0.2, 0.7, 0.2, 1] as const;
const pad = (n: number) => String(n).padStart(2, '0');

/** One dark tint per step: the panel's colour drifts as the journey moves on (dewlab "ritual" pattern). */
const TINTS = ['#1c1e21', '#1b2129', '#1e252d', '#24262b', '#2a2620', '#1f2622', '#222029'];

/**
 * Desktop "ritual with step bar" (ADR-35, dewlab): the section pins for 200vh while the scroll walks
 * through the steps — the step photo large on the right, the step name huge on the left, a segmented
 * progress bar along the bottom that fills with scroll, and the panel tint shifting per step. Rendered
 * only from `lg` with motion allowed (CSS); phones and reduced motion get the tab stepper instead.
 * Keyboard: every segment label is a button that scrolls to its step; all step text stays in the DOM
 * as an ordered list for screen readers.
 */
export function JourneyPinned({ steps, terms }: { steps: HowStep[]; terms: SlotTerms }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ['start start', 'end end'] });
  const n = steps.length;
  const [active, setActive] = useState(0);
  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    const i = Math.min(n - 1, Math.max(0, Math.floor(p * n)));
    setActive((cur) => (cur === i ? cur : i));
  });

  const stops = steps.map((_, i) => i / Math.max(1, n - 1));
  const tints = steps.map((_, i) => TINTS[i % TINTS.length] ?? '#1c1e21');
  const background = useTransform(scrollYProgress, stops, tints);
  const photoScale = useRamp(scrollYProgress, [0, 1], [1.1, 1]);

  const goTo = (i: number) => {
    const el = trackRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const range = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + range * ((i + 0.5) / n), behavior: 'auto' });
  };

  const current = steps[active] ?? steps[0];

  return (
    <div ref={trackRef} className="relative h-[200vh]">
      <div className="sticky top-0 flex h-svh px-4 pt-[4.75rem] pb-4">
        <motion.div
          className="relative isolate flex w-full overflow-hidden rounded-[32px] text-on-dark shadow-raised"
          style={{ backgroundColor: background }}
        >
          {/* Warm light from the top left, as in a lit room */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_12%_0%,rgba(217,167,102,0.16),transparent_55%)]"
          />

          {/* Photos: stacked, the active one fades in; all drift in scale with the scroll */}
          <motion.div
            aria-hidden
            className="absolute inset-y-0 right-0 w-[54%]"
            style={{ scale: photoScale }}
          >
            {steps.map((s, i) => (
              <motion.div
                key={s.id}
                className="absolute inset-0"
                initial={false}
                animate={{ opacity: i === active ? 1 : 0 }}
                transition={{ duration: 0.8, ease: EASE }}
              >
                <Image
                  src={s.image.src}
                  alt=""
                  fill
                  sizes="54vw"
                  className={cn('object-cover', !s.image.ready && 'opacity-60 grayscale')}
                />
              </motion.div>
            ))}
          </motion.div>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 w-[54%] bg-[linear-gradient(to_right,rgba(18,19,21,0.92),rgba(18,19,21,0.15)_45%,transparent_70%)]"
          />
          {current?.image.note ? (
            <span className="absolute top-6 right-6 z-10 rounded-full bg-black/55 px-2.5 py-1 text-[12px] backdrop-blur">
              {current.image.note}
            </span>
          ) : null}

          <div className="relative z-10 flex w-full flex-col px-10 pt-9 pb-7 xl:px-14">
            <div className="flex items-center justify-between gap-6">
              <p className="text-[13px] font-medium tracking-[0.08em] text-on-dark-muted" aria-hidden>
                Step {pad(active + 1)} of {pad(n)}
              </p>
            </div>

            {/* Every step's words, stacked; only the active one shows. */}
            <ol className="relative mt-4 flex-1" aria-label="Your journey, step by step">
              {steps.map((s, i) => {
                const on = i === active;
                return (
                  <motion.li
                    key={s.id}
                    className="absolute inset-x-0 top-0 max-w-[34rem]"
                    initial={false}
                    animate={{ opacity: on ? 1 : 0, y: on ? 0 : i < active ? -28 : 28 }}
                    transition={{ duration: 0.6, ease: EASE }}
                    aria-current={on ? 'step' : undefined}
                  >
                    <h3 className="bg-[linear-gradient(180deg,#f2f2f0_30%,#aebbc8)] bg-clip-text pb-2 font-display text-[clamp(3.5rem,1rem+5.4vw,6.75rem)] leading-[0.92] font-medium tracking-[-0.015em] text-balance text-transparent">
                      {s.title}
                      <span className="sr-only">
                        . Step {i + 1} of {n}.
                      </span>
                    </h3>
                    <p className="mt-5 max-w-[36ch] text-lg leading-relaxed text-pretty text-on-dark/85">
                      {s.body}
                    </p>
                    {s.meta || s.after ? (
                      <p className="mt-3 flex flex-wrap items-center gap-2 text-[13px] font-medium text-brand-on-dark">
                        {s.after ? (
                          <span className="rounded-full px-2.5 py-0.5 ring-1 ring-white/25">
                            After the call
                          </span>
                        ) : null}
                        {s.meta}
                      </p>
                    ) : null}
                  </motion.li>
                );
              })}
            </ol>

            <div className="mb-8 flex items-center gap-5">
              <Button
                asChild
                className="h-12 bg-[image:var(--yhc-silver)] px-7 text-base font-semibold text-obsidian hover:opacity-95"
              >
                <Link href="/start">
                  Begin my free 3D scan <ArrowRight className="size-4" aria-hidden />
                </Link>
              </Button>
              <p className="max-w-[26ch] text-[13px] leading-snug text-on-dark-muted">
                Starting is free. The {terms.fee} fee is only for the doctor’s call.
              </p>
            </div>

            {/* Segmented step bar, filled by scroll. Each label jumps to its step. */}
            <nav aria-label="Jump to a step">
              <ol className="grid gap-3" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
                {steps.map((s, i) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => goTo(i)}
                      aria-current={i === active ? 'step' : undefined}
                      className="group/seg block w-full rounded-md pt-1 pb-1 text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-on-dark"
                    >
                      <Segment progress={scrollYProgress} index={i} count={n} />
                      <span
                        className={cn(
                          'mt-3 block truncate text-[13px] font-medium transition-colors duration-300',
                          i === active ? 'text-on-dark' : 'text-on-dark-muted group-hover/seg:text-on-dark',
                        )}
                      >
                        {s.title}
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
            </nav>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function Segment({
  progress,
  index,
  count,
}: {
  progress: MotionValue<number>;
  index: number;
  count: number;
}) {
  const fill = useRamp(progress, [index / count, (index + 1) / count], [0, 1]);
  return (
    <span className="relative block h-1.5 overflow-hidden rounded-full bg-white/15">
      <motion.span
        className="absolute inset-0 origin-left rounded-full bg-[image:var(--yhc-silver)]"
        style={{ scaleX: fill }}
      />
    </span>
  );
}
