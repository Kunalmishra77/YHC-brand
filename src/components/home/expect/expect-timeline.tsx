'use client';

import { Plus } from 'lucide-react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import Image from 'next/image';
import { useId, useState } from 'react';
import type { SiteImage } from '@/lib/images';
import { cn } from '@/lib/utils';

export interface StageSource {
  name: string;
  title: string;
  url: string;
}

export interface ExpectStage {
  id: string;
  /** Plain timing, e.g. "Every month". Never a promised outcome date. */
  when: string;
  title: string;
  /** One short line under the title. */
  line: string;
  /** The longer explanation, shown on tap over the picture. */
  detail: string;
  image: SiteImage;
  /** "Illustrative image" chip text, when needed. */
  note: string | undefined;
  sources: StageSource[];
}

const EASE = [0.2, 0.7, 0.2, 1] as const;

/**
 * Section 9 timeline: four square pictures joined by a thin line that draws in once. A swipe rail on
 * phones, four columns from `lg`. "More" slides the detail up over the picture, so the section never
 * grows taller when a stage is opened.
 */
export function ExpectTimeline({ stages }: { stages: ExpectStage[] }) {
  const uid = useId();
  const [open, setOpen] = useState<string | null>(null);

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative">
        {/* The line joining the stages (decorative; the list order carries the sequence). */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-[1.125rem] hidden lg:block">
          <div className="h-px bg-line" />
          <motion.div
            className="absolute inset-x-0 top-0 h-px origin-left bg-obsidian"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, amount: 1 }}
            transition={{ duration: 1.6, ease: EASE }}
          />
        </div>

        <ol
          aria-label="What to expect, step by step"
          className="relative -mx-[var(--yhc-gutter)] flex snap-x snap-mandatory scroll-px-[var(--yhc-gutter)] [scrollbar-width:none] gap-4 overflow-x-auto overscroll-x-contain px-[var(--yhc-gutter)] pb-1 lg:mx-0 lg:grid lg:grid-cols-4 lg:gap-6 lg:overflow-visible lg:px-0 [&::-webkit-scrollbar]:hidden"
        >
          {stages.map((s, i) => {
            const isOpen = open === s.id;
            const btnId = `${uid}-btn-${s.id}`;
            const panelId = `${uid}-panel-${s.id}`;
            return (
              <li
                key={s.id}
                className="w-[78%] max-w-[20rem] shrink-0 snap-start sm:w-[44%] lg:w-auto lg:max-w-none"
              >
                {/* Step marker on the line */}
                <div className="mb-4 flex items-center gap-3">
                  <span className="relative z-10 flex size-9 items-center justify-center rounded-full bg-obsidian text-sm font-semibold text-on-dark tabular-nums ring-4 ring-card">
                    {i + 1}
                  </span>
                  <span className="text-sm font-medium text-brand">{s.when}</span>
                </div>

                <div className="group/stage relative aspect-square overflow-hidden rounded-[1.75rem] bg-mist ring-1 ring-line">
                  <Image
                    src={s.image.src}
                    alt={s.image.alt}
                    fill
                    sizes="(min-width: 1024px) 18rem, (min-width: 640px) 44vw, 78vw"
                    className="object-cover transition-transform duration-[1400ms] ease-yhc group-hover/stage:scale-[1.04] motion-reduce:transition-none"
                  />
                  {s.note ? (
                    <span className="absolute bottom-3 left-3 rounded-full bg-black/55 px-2.5 py-1 text-xs text-white backdrop-blur-sm">
                      {s.note}
                    </span>
                  ) : null}

                  <AnimatePresence initial={false}>
                    {isOpen ? (
                      <motion.div
                        key="detail"
                        id={panelId}
                        role="region"
                        aria-labelledby={btnId}
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ duration: 0.45, ease: EASE }}
                        className="absolute inset-0 overflow-y-auto bg-obsidian/95 text-on-dark backdrop-blur-sm"
                      >
                        <div className="flex min-h-full flex-col justify-end p-5">
                          <p className="text-[15px] leading-relaxed text-pretty">{s.detail}</p>
                          {s.sources.length > 0 ? (
                            <p className="mt-3 text-xs leading-relaxed text-on-dark-muted">
                              Source:{' '}
                              {s.sources.map((src, si) => (
                                <span key={src.url}>
                                  {si > 0 ? ', ' : null}
                                  <a
                                    href={src.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title={src.title}
                                    className="underline underline-offset-4 hover:text-on-dark"
                                  >
                                    {src.name}
                                    <span className="sr-only"> (opens in a new tab)</span>
                                  </a>
                                </span>
                              ))}
                            </p>
                          ) : null}
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>

                <div className="mt-4 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-lg leading-snug font-medium text-ink">{s.title}</h3>
                    <p className="mt-1 text-[15px] leading-relaxed text-pretty text-body">{s.line}</p>
                  </div>
                  <button
                    id={btnId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={isOpen ? panelId : undefined}
                    onClick={() => setOpen(isOpen ? null : s.id)}
                    className="flex size-11 shrink-0 items-center justify-center rounded-full text-ink ring-1 ring-line transition-colors hover:bg-mist"
                  >
                    <Plus
                      aria-hidden
                      className={cn(
                        'size-4 transition-transform duration-500 ease-yhc motion-reduce:transition-none',
                        isOpen && 'rotate-45',
                      )}
                    />
                    <span className="sr-only">
                      {isOpen ? 'Hide' : 'More about'} {s.title.toLowerCase()}
                    </span>
                  </button>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </MotionConfig>
  );
}
