'use client';

import { ArrowRight } from 'lucide-react';
import { AnimatePresence, motion, useInView } from 'motion/react';
import Link from 'next/link';
import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { usePrefersReducedMotion } from '@/components/site/background-video';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { StepVisual } from './step-visuals';
import type { HowStep, SlotTerms } from './types';

const EASE = [0.2, 0.7, 0.2, 1] as const;
const AUTO_MS = 5200;
const pad = (n: number) => String(n).padStart(2, '0');

/**
 * One-viewport journey stepper (audit UX-02): the steps are tabs (click, arrow keys), the visual panel
 * shows the selected step. While in view it advances gently on its own until the visitor interacts —
 * never with reduced motion. Replaces the earlier 4,700 px sticky scroll section.
 */
export function JourneyStepper({ steps, terms }: { steps: HowStep[]; terms: SlotTerms }) {
  const uid = useId();
  const reduced = usePrefersReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const inView = useInView(rootRef, { amount: 0.45 });
  const [active, setActive] = useState(0);
  const [interacted, setInteracted] = useState(false);
  const n = steps.length;

  useEffect(() => {
    if (reduced || interacted || !inView) return;
    const t = window.setInterval(() => setActive((i) => (i + 1) % n), AUTO_MS);
    return () => window.clearInterval(t);
  }, [reduced, interacted, inView, n]);

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

  const current = steps[active] ?? steps[0];
  if (!current) return null;
  const panelId = `${uid}-panel`;

  return (
    <div ref={rootRef} className="grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-stretch lg:gap-14 xl:gap-20">
      {/* Steps = tabs. Phones: a swipeable numbered row; desktop: the full list with a progress rail. */}
      <div className="flex min-w-0 flex-col">
        <div
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
                <span className="price text-[13px] lg:hidden">{pad(i + 1)}</span>
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
            Starting is free. You pay the {terms.fee} consultation fee only when you book a doctor slot.
          </p>
          <Button asChild className="mt-4 h-12 px-7 text-base">
            <Link href="/start">
              Start with your details <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Button>
        </div>
      </div>

      {/* Selected step: text + visual in one panel */}
      <div
        role="tabpanel"
        id={panelId}
        aria-labelledby={`${uid}-tab-${current.id}`}
        className="relative min-h-[26rem] overflow-hidden rounded-[2rem] bg-obsidian text-on-dark shadow-raised ring-1 ring-line-dark sm:min-h-[30rem] lg:min-h-[34rem]"
      >
        <PanelBackdrop />
        <div className="absolute inset-x-6 top-6 z-10 flex items-center justify-between gap-4 sm:inset-x-8">
          <p className="price text-[12px] tracking-[0.16em] text-on-dark-muted uppercase">
            Step {pad(active + 1)} <span className="text-steel">/ {pad(n)}</span>
          </p>
          <div className="flex gap-1" aria-hidden>
            {steps.map((s, i) => (
              <span
                key={s.id}
                className={cn('h-1 w-5 rounded-full transition-colors duration-500', i <= active ? 'bg-platinum' : 'bg-line-dark')}
              />
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={current.id}
            initial={reduced ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -12 }}
            transition={{ duration: reduced ? 0 : 0.5, ease: EASE }}
            className="relative z-10 flex h-full flex-col px-6 pt-16 pb-7 sm:px-8 sm:pt-20"
          >
            <div aria-hidden className="flex flex-1 items-center justify-center py-2">
              <div className="origin-center scale-[0.72] sm:scale-[0.85] lg:scale-100">
                <StepVisual id={current.id} active terms={terms} still={reduced} />
              </div>
            </div>
            <div className="mt-2">
              <h3 className="font-display text-[clamp(1.75rem,1.4rem+1vw,2.25rem)] leading-tight text-on-dark">
                {current.title}
              </h3>
              <p className="mt-2 max-w-[52ch] text-base leading-relaxed text-pretty text-on-dark-muted">{current.body}</p>
              {current.meta ? <p className="mt-2 text-[13px] font-medium text-brand-on-dark">{current.meta}</p> : null}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Phones: CTA under the panel */}
      <div className="border-t border-line pt-6 lg:hidden">
        <p className="text-sm leading-relaxed text-body">
          Starting is free. You pay the {terms.fee} consultation fee only when you book a doctor slot.
        </p>
        <Button asChild className="mt-4 h-12 w-full px-7 text-base sm:w-auto">
          <Link href="/start">
            Start with your details <ArrowRight className="size-4" aria-hidden />
          </Link>
        </Button>
      </div>
    </div>
  );
}

/** Fine grid + soft cool glow behind every visual. */
function PanelBackdrop() {
  return (
    <>
      <div
        aria-hidden
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_35%,rgba(174,187,200,0.16),transparent_60%)]" />
    </>
  );
}
