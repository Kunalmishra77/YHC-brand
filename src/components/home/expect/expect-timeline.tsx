'use client';

import { ChevronRight, Plus } from 'lucide-react';
import { MotionConfig, motion, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react';
import { useId, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export type PhaseMark = 'solid' | 'soft' | 'dots' | 'dashed' | 'gradient' | 'arrow';

export interface PhaseSource {
  name: string;
  title: string;
  url: string;
}

export interface ExpectPhase {
  id: string;
  /** Plain-language timing, e.g. "Early months". Never a promised outcome date. */
  when: string;
  title: string;
  body: string;
  /** Months on plan the phase spans on the axis (0–12). */
  range: [number, number];
  mark: PhaseMark;
  sources: PhaseSource[];
}

const MONTHS = 12;
const EASE = [0.2, 0.7, 0.2, 1] as const;
const pct = (m: number) => `${(Math.min(MONTHS, Math.max(0, m)) / MONTHS) * 100}%`;
const num = (i: number) => String(i + 1).padStart(2, '0');

/**
 * Section 9 timeline. Top: a thin, month-marked axis (0–12) where each phase is drawn as its own mark —
 * a bar, a soft band, monthly photo dots, a dashed review window, an arrow for ongoing adjustment. Marks
 * grow in slowly and the axis line fills as the section scrolls. Below: an editorial accordion, one row
 * per phase. The open (or hovered) phase is highlighted on the axis. The axis is decorative (aria-hidden):
 * every fact lives in the accordion.
 */
export function ExpectTimeline({ phases }: { phases: ExpectPhase[] }) {
  const uid = useId();
  const [open, setOpen] = useState<string | null>(phases[0]?.id ?? null);
  const [hovered, setHovered] = useState<string | null>(null);
  const active = hovered ?? open;
  const reduce = useReducedMotion() === true;
  const axisRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: axisRef, offset: ['start 0.95', 'end 0.4'] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 34, mass: 0.5 });
  const beadLeft = useTransform(progress, (v) => `${v * 100}%`);

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-w-0">
        {/* Axis */}
        <div ref={axisRef} aria-hidden onMouseLeave={() => setHovered(null)}>
          <p className="mb-5 text-[11px] font-semibold tracking-[0.2em] text-ink uppercase">Months on plan</p>
          <div className="space-y-1">
            {phases.map((p, i) => (
              <div
                key={p.id}
                className="grid cursor-pointer grid-cols-[2rem_minmax(0,1fr)] items-center gap-2"
                onMouseEnter={() => setHovered(p.id)}
                onClick={() => setOpen(p.id)}
              >
                <span
                  className={cn(
                    'text-[11px] font-semibold text-steel tabular-nums transition-colors duration-500',
                    active === p.id && 'text-ink',
                  )}
                >
                  {num(i)}
                </span>
                <div
                  className={cn(
                    'relative h-6 transition-opacity duration-500 motion-reduce:transition-none',
                    active !== null && active !== p.id && 'opacity-25',
                  )}
                >
                  <PhaseTrackMark phase={p} index={i} reduce={reduce} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 grid grid-cols-[2rem_minmax(0,1fr)] gap-2">
            <span />
            <div className="relative h-10">
              <div className="absolute inset-x-0 top-0 h-px bg-line" />
              <motion.div
                className="absolute inset-x-0 top-0 h-px origin-left bg-obsidian"
                style={{ scaleX: reduce ? 1 : progress }}
              />
              {reduce ? null : (
                <motion.span
                  className="absolute top-0 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-obsidian shadow-[0_0_0_3px_var(--yhc-card)]"
                  style={{ left: beadLeft }}
                />
              )}
              {Array.from({ length: MONTHS + 1 }, (_, m) => {
                const major = m % 3 === 0;
                return (
                  <span key={m} className="absolute top-0" style={{ left: pct(m) }}>
                    <span
                      className={cn(
                        'absolute top-0 w-px -translate-x-1/2',
                        major ? 'h-2.5 bg-steel' : 'h-1.5 bg-line',
                      )}
                    />
                    <span
                      className={cn(
                        'absolute top-4 text-[12px] whitespace-nowrap tabular-nums',
                        m === 0 ? 'translate-x-0' : m === MONTHS ? '-translate-x-full' : '-translate-x-1/2',
                        major ? 'font-medium text-body' : 'hidden text-muted-foreground md:inline',
                      )}
                    >
                      {m === 0 ? 'Start' : m === MONTHS ? '12 months' : m}
                    </span>
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* Accordion */}
        <ol className="mt-10 border-b border-line" aria-label="What to expect, step by step">
          {phases.map((p, i) => {
            const isOpen = open === p.id;
            const btnId = `${uid}-btn-${p.id}`;
            const panelId = `${uid}-panel-${p.id}`;
            return (
              <li
                key={p.id}
                className="border-t border-line"
                onMouseEnter={() => setHovered(p.id)}
                onMouseLeave={() => setHovered(null)}
              >
                <h3>
                  <button
                    id={btnId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpen(isOpen ? null : p.id)}
                    className="group/row grid min-h-16 w-full grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-2 py-3 text-left focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none focus-visible:ring-inset sm:gap-4"
                  >
                    <span className="text-[11px] font-semibold text-steel tabular-nums">{num(i)}</span>
                    <span className="min-w-0">
                      <span className="block text-[11px] font-semibold tracking-[0.18em] text-brand uppercase">
                        {p.when}
                      </span>
                      <span className="mt-1 block text-[17px] leading-snug font-medium text-ink">
                        {p.title}
                      </span>
                    </span>
                    <span className="flex items-center gap-4">
                      <MarkSwatch mark={p.mark} />
                      <span className="flex size-12 items-center justify-center rounded-full transition-colors group-hover/row:bg-mist">
                        <Plus
                          aria-hidden
                          className={cn(
                            'size-4 text-ink transition-transform duration-500 ease-yhc motion-reduce:transition-none',
                            isOpen && 'rotate-45',
                          )}
                        />
                      </span>
                    </span>
                  </button>
                </h3>
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={btnId}
                  className={cn(
                    'grid transition-[grid-template-rows] duration-500 ease-yhc motion-reduce:transition-none',
                    isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
                  )}
                >
                  <div className="overflow-hidden" inert={!isOpen}>
                    <div className="pr-4 pb-6 pl-10 sm:pr-16 sm:pl-12">
                      <p className="max-w-[58ch] text-[15px] leading-relaxed text-pretty text-body">
                        {p.body}
                      </p>
                      {p.sources.length > 0 ? (
                        <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
                          Source:{' '}
                          {p.sources.map((s, si) => (
                            <span key={s.url}>
                              {si > 0 ? ' · ' : null}
                              <a
                                href={s.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                title={s.title}
                                className="underline decoration-steel underline-offset-4 transition-colors hover:text-ink hover:decoration-current"
                              >
                                {s.name}
                                <span className="sr-only"> (opens in a new tab)</span>
                              </a>
                            </span>
                          ))}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </MotionConfig>
  );
}

/** One phase drawn on its axis row; grows slowly from the left when it enters the viewport. */
function PhaseTrackMark({ phase, index, reduce }: { phase: ExpectPhase; index: number; reduce: boolean }) {
  const [from, to] = phase.range;
  const delay = 0.2 + index * 0.14;

  if (phase.mark === 'dots') {
    const first = Math.ceil(from);
    const months = Array.from({ length: Math.floor(to) - first + 1 }, (_, k) => first + k);
    return (
      <>
        {months.map((m, k) => (
          <motion.span
            key={m}
            className="absolute top-1/2 size-2 rounded-full bg-card ring-[1.5px] ring-ink"
            style={{ left: pct(m), x: '-50%', y: '-50%' }}
            initial={reduce ? false : { scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true, amount: 1 }}
            transition={{ delay: delay + k * 0.06, duration: 0.5, ease: EASE }}
          />
        ))}
      </>
    );
  }

  return (
    <motion.div
      className="absolute top-1/2 flex h-1 origin-left -translate-y-1/2 items-center"
      style={{ left: pct(from), width: `calc(${pct(to)} - ${pct(from)})` }}
      initial={reduce ? false : { scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true, amount: 1 }}
      transition={{ delay, duration: 1.2, ease: EASE }}
    >
      <BarFill mark={phase.mark} />
    </motion.div>
  );
}

function BarFill({ mark }: { mark: PhaseMark }) {
  switch (mark) {
    case 'solid':
      return <span className="h-full w-full rounded-full bg-obsidian" />;
    case 'soft':
      return (
        <span className="h-full w-full rounded-full bg-[linear-gradient(90deg,transparent,var(--yhc-steel)_22%,var(--yhc-steel)_70%,transparent)]" />
      );
    case 'dashed':
      return <span className="h-0 w-full border-t-2 border-dashed border-brand" />;
    case 'gradient':
      return (
        <span className="h-full w-full rounded-full bg-[linear-gradient(90deg,var(--yhc-platinum),var(--yhc-obsidian))]" />
      );
    case 'arrow':
      return (
        <>
          <span className="h-0.5 w-full rounded-full bg-[linear-gradient(90deg,transparent,var(--yhc-steel))]" />
          <ChevronRight className="-ml-2 size-4 shrink-0 text-steel" />
        </>
      );
    case 'dots':
      return null;
  }
}

/** Miniature of the phase's axis mark, so each row visibly matches its line (hidden on phones). */
function MarkSwatch({ mark }: { mark: PhaseMark }) {
  if (mark === 'dots') {
    return (
      <span aria-hidden className="hidden h-1 w-10 items-center justify-between sm:flex">
        {[0, 1, 2, 3].map((k) => (
          <span key={k} className="size-1.5 rounded-full ring-[1.5px] ring-ink" />
        ))}
      </span>
    );
  }
  return (
    <span aria-hidden className="hidden h-1 w-10 items-center sm:flex">
      <BarFill mark={mark} />
    </span>
  );
}
