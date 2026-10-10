'use client';

import { motion, useInView, useMotionValueEvent, useScroll } from 'motion/react';
import { useRef, useState } from 'react';
import { usePrefersReducedMotion } from '@/components/site/background-video';
import { cn } from '@/lib/utils';
import { StepVisual } from './step-visuals';
import type { HowStep, SlotTerms } from './types';

const EASE = [0.2, 0.7, 0.2, 1] as const;
const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Desktop (lg+, motion allowed): a sticky scroll-driven stepper. Below lg — and at every size when the
 * visitor prefers reduced motion — a plain vertical timeline that is fully readable without animation.
 */
export function JourneyStepper({ steps, terms }: { steps: HowStep[]; terms: SlotTerms }) {
  const reduced = usePrefersReducedMotion();
  return (
    <>
      {reduced ? null : <ScrollStepper steps={steps} terms={terms} />}
      <Timeline steps={steps} terms={terms} reduced={reduced} className={reduced ? undefined : 'lg:hidden'} />
    </>
  );
}

function ScrollStepper({ steps, terms }: { steps: HowStep[]; terms: SlotTerms }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const n = steps.length;
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ['start start', 'end end'] });
  const [active, setActive] = useState(0);

  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    const i = Math.min(n - 1, Math.max(0, Math.floor(p * n)));
    setActive((prev) => (prev === i ? prev : i));
  });

  /** Keyboard/click: scroll to the middle of that step's band so the stepper lands on it. */
  const goTo = (i: number) => {
    const el = trackRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const range = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + range * ((i + 0.5) / n), behavior: 'smooth' });
  };

  const current = steps[active] ?? steps[0];

  return (
    <div ref={trackRef} className="relative hidden lg:block" style={{ height: `${n * 62}svh` }}>
      <div className="sticky top-16 flex h-[calc(100svh-4rem)] items-center">
        <div className="grid w-full grid-cols-[minmax(0,5fr)_minmax(0,7fr)] items-center gap-14 xl:gap-20">
          {/* Step list + progress rail */}
          <div className="relative">
            <span aria-hidden className="absolute top-5 bottom-5 left-5 w-px bg-line" />
            <motion.span
              aria-hidden
              style={{ scaleY: scrollYProgress }}
              className="absolute top-5 bottom-5 left-5 w-px origin-top bg-obsidian"
            />
            <ol aria-label="Your journey, step by step" className="relative space-y-1">
              {steps.map((s, i) => {
                const on = i === active;
                const done = i < active;
                return (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => goTo(i)}
                      aria-current={on ? 'step' : undefined}
                      className="group flex min-h-12 w-full gap-5 rounded-xl py-2 pr-2 text-left"
                    >
                      <span
                        className={cn(
                          'price relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full text-[13px] ring-4 ring-card transition-colors duration-500',
                          on
                            ? 'bg-[image:var(--yhc-silver)] text-obsidian shadow-[0_0_0_1px_var(--yhc-obsidian)]'
                            : done
                              ? 'bg-obsidian text-on-dark'
                              : 'bg-card text-muted-foreground shadow-[0_0_0_1px_var(--yhc-line-light)] group-hover:text-ink',
                        )}
                      >
                        {pad(i + 1)}
                      </span>
                      <span className="min-w-0 pt-2">
                        <span
                          className={cn(
                            'block text-[17px] leading-snug font-semibold transition-colors duration-500 xl:text-lg',
                            on ? 'text-ink' : 'text-muted-foreground group-hover:text-ink',
                          )}
                        >
                          {s.title}
                        </span>
                        <span
                          className={cn(
                            'grid transition-[grid-template-rows,opacity] duration-500 ease-out',
                            on ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
                          )}
                        >
                          <span className="overflow-hidden">
                            <span className="block max-w-[44ch] pt-1.5 text-[15px] leading-relaxed text-pretty text-body">
                              {s.body}
                            </span>
                            {s.meta ? (
                              <span className="mt-2 block pb-1 text-[13px] font-medium text-brand">
                                {s.meta}
                              </span>
                            ) : null}
                          </span>
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Visual panel — decorative; the step text lives in the list */}
          <div
            aria-hidden
            className="relative h-[min(36rem,calc(100svh-9rem))] w-full overflow-hidden rounded-[2rem] bg-obsidian shadow-raised ring-1 ring-line-dark"
          >
            <PanelBackdrop />
            <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-4 px-7 pt-6">
              <p className="price text-[12px] tracking-[0.16em] text-on-dark-muted uppercase">
                Step {pad(active + 1)} <span className="text-steel">/ {pad(n)}</span>
              </p>
              <p className="truncate text-[13px] text-on-dark-muted">{current?.title}</p>
            </div>
            <div className="absolute inset-x-7 top-14 z-10 h-px bg-line-dark">
              <motion.div
                style={{ scaleX: scrollYProgress }}
                className="h-px origin-left bg-[image:var(--yhc-silver)]"
              />
            </div>
            {steps.map((s, i) => {
              const on = i === active;
              return (
                <motion.div
                  key={s.id}
                  initial={false}
                  animate={{ opacity: on ? 1 : 0, y: on ? 0 : i < active ? -28 : 28, scale: on ? 1 : 0.97 }}
                  transition={{ duration: 0.6, ease: EASE }}
                  className="absolute inset-0 flex items-center justify-center px-8 pt-20 pb-8"
                >
                  <StepVisual id={s.id} active={on} terms={terms} />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function Timeline({
  steps,
  terms,
  reduced,
  className,
}: {
  steps: HowStep[];
  terms: SlotTerms;
  reduced: boolean;
  className?: string;
}) {
  const listRef = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: listRef, offset: ['start 75%', 'end 60%'] });

  return (
    <ol ref={listRef} aria-label="Your journey, step by step" className={cn('relative max-w-3xl', className)}>
      <span aria-hidden className="absolute top-5 bottom-5 left-5 w-px bg-line" />
      {reduced ? null : (
        <motion.span
          aria-hidden
          style={{ scaleY: scrollYProgress }}
          className="absolute top-5 bottom-5 left-5 w-px origin-top bg-obsidian"
        />
      )}
      {steps.map((s, i) => (
        <li key={s.id} className="relative flex gap-5 pb-12 last:pb-0">
          <span className="price relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full bg-obsidian text-[13px] text-on-dark ring-4 ring-card">
            {pad(i + 1)}
          </span>
          <div className="min-w-0 flex-1 pt-1.5">
            <h3 className="text-lg leading-snug font-semibold text-balance text-ink">{s.title}</h3>
            <p className="mt-1.5 max-w-[52ch] text-[15px] leading-relaxed text-pretty text-body">{s.body}</p>
            {s.meta ? <p className="mt-2 text-[13px] font-medium text-brand">{s.meta}</p> : null}
            <InViewVisual id={s.id} terms={terms} reduced={reduced} />
          </div>
        </li>
      ))}
    </ol>
  );
}

/** Compact visual card for the timeline; its small animation plays once the card is in view. */
function InViewVisual({ id, terms, reduced }: { id: HowStep['id']; terms: SlotTerms; reduced: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.5, once: true });
  return (
    <div
      ref={ref}
      aria-hidden
      className="relative mt-5 -mr-[var(--yhc-gutter)] h-56 max-w-md overflow-hidden rounded-l-2xl bg-obsidian ring-1 ring-line-dark sm:mr-0 sm:h-60 sm:rounded-2xl"
    >
      <PanelBackdrop />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-[0.58] sm:scale-[0.68]">
        <StepVisual id={id} active={reduced || inView} terms={terms} still={reduced} />
      </div>
    </div>
  );
}

/** Fine grid + soft cool glow behind every visual. */
function PanelBackdrop() {
  return (
    <>
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_35%,rgba(174,187,200,0.16),transparent_60%)]" />
    </>
  );
}
