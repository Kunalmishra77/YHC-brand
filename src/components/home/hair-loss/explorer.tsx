'use client';

import { ArrowRight, ArrowUpRight, Plus, TriangleAlert } from 'lucide-react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { useReducedMotion } from '@/lib/use-reduced-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useId, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { HeadDiagram } from './head-diagram';
import type { HairLossTypeView } from './types';

const EASE = [0.2, 0.7, 0.2, 1] as const;

/**
 * Picture-led atlas of hair-loss types. The selector is a list of picture tabs (a swipe rail of tiles on
 * phones, a list with thumbnails from `lg`); the selected type shows its illustration large — or the
 * line-art head diagrams until the illustration is ready — with one short line, and the detail behind a
 * tap. WAI-ARIA tabs with roving focus (arrow keys, Home, End). Under reduced motion content just swaps.
 */
export function HairLossExplorer({ types }: { types: HairLossTypeView[] }) {
  const [index, setIndex] = useState(0);
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const baseId = useId();
  const active = types[index];
  if (!active) return null;

  function select(next: number) {
    const n = (next + types.length) % types.length;
    setIndex(n);
    const tab = tabsRef.current[n];
    tab?.focus();
    tab?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }

  function onKeyDown(e: React.KeyboardEvent) {
    const keys: Record<string, () => void> = {
      ArrowRight: () => select(index + 1),
      ArrowDown: () => select(index + 1),
      ArrowLeft: () => select(index - 1),
      ArrowUp: () => select(index - 1),
      Home: () => select(0),
      End: () => select(types.length - 1),
    };
    const run = keys[e.key];
    if (run) {
      e.preventDefault();
      run();
    }
  }

  const tabId = (i: number) => `${baseId}-tab-${i}`;
  const panelId = `${baseId}-panel`;

  return (
    <MotionConfig reducedMotion="user">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-12">
        {/* Picture tabs */}
        <div
          role="tablist"
          aria-label="Types of hair loss"
          onKeyDown={onKeyDown}
          className="relative -mx-[var(--yhc-gutter)] flex snap-x scroll-px-[var(--yhc-gutter)] [scrollbar-width:none] gap-2.5 overflow-x-auto overscroll-x-contain px-[var(--yhc-gutter)] pb-1 lg:mx-0 lg:flex-col lg:gap-1.5 lg:self-start lg:overflow-visible lg:px-0 lg:pb-0 [&::-webkit-scrollbar]:hidden"
        >
          {types.map((type, i) => {
            const selected = i === index;
            return (
              <button
                key={type.id}
                ref={(el) => {
                  tabsRef.current[i] = el;
                }}
                id={tabId(i)}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={panelId}
                tabIndex={selected ? 0 : -1}
                onClick={() => setIndex(i)}
                className={cn(
                  'group/tab relative flex w-[7.5rem] shrink-0 snap-start flex-col gap-2 rounded-[1.25rem] p-1.5 pb-2.5 text-left ring-1 transition-[background-color,box-shadow] duration-300',
                  'lg:w-auto lg:flex-row lg:items-center lg:gap-4 lg:p-2 lg:pr-4',
                  selected ? 'bg-card shadow-card ring-obsidian' : 'ring-line hover:bg-card',
                )}
              >
                <Thumb type={type} selected={selected} />
                <span className="flex min-w-0 flex-col px-1 lg:px-0">
                  <span className="text-sm leading-snug font-medium text-ink lg:text-base">{type.name}</span>
                  <span
                    className={cn(
                      'hidden text-[13px] lg:block',
                      type.urgent ? 'font-medium text-warning' : 'text-muted-foreground',
                    )}
                  >
                    {type.cue}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Picture + short text */}
        <div id={panelId} role="tabpanel" aria-labelledby={tabId(index)} tabIndex={0} className="min-w-0">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={active.id}
              initial={{ opacity: 0, scale: 0.975 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.015 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-start md:gap-8"
            >
              <Figure type={active} />

              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">{active.aka}</p>
                <h3 className="display mt-1 text-[clamp(2rem,1.6rem+1.6vw,2.75rem)] leading-[1.05] text-balance">
                  {active.name}
                </h3>
                <p className="mt-3 text-lg leading-relaxed text-pretty text-ink">{active.short}</p>
                {active.urgent ? (
                  <p className="mt-4 flex items-start gap-2.5 rounded-2xl bg-warning-bg px-4 py-3 text-sm font-medium text-warning">
                    <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
                    See a skin doctor in person soon. An online plan is not enough for this.
                  </p>
                ) : null}

                <Details type={active} baseId={baseId} />

                {active.links.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-x-6">
                    {active.links.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-ink underline decoration-steel underline-offset-[6px] hover:decoration-current"
                      >
                        {link.label}
                        <ArrowRight className="size-3.5" aria-hidden />
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </MotionConfig>
  );
}

/** Tab picture: the illustration when ready, else the top-view head diagram on a soft tile. */
function Thumb({ type, selected }: { type: HairLossTypeView; selected: boolean }) {
  return (
    <span className="relative flex aspect-square w-full shrink-0 items-center justify-center overflow-hidden rounded-[0.875rem] bg-mist lg:size-14 lg:w-14">
      {type.image ? (
        <Image
          src={type.image.src}
          alt=""
          fill
          sizes="(min-width: 1024px) 56px, 112px"
          className="object-cover transition-transform duration-700 ease-yhc group-hover/tab:scale-105 motion-reduce:transition-none"
        />
      ) : (
        <HeadDiagram
          pattern={type.pattern}
          view="top"
          showZones={selected}
          className={cn('w-[62%] transition-opacity duration-300', !selected && 'opacity-60')}
        />
      )}
    </span>
  );
}

/** The big picture with its "Illustration, not a diagnosis" chip. */
function Figure({ type }: { type: HairLossTypeView }) {
  return (
    <figure className="relative">
      <div className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] bg-card ring-1 ring-line md:aspect-square">
        {type.image ? (
          <>
            <motion.div
              className="absolute inset-0"
              initial={{ scale: 1.14 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1.1, ease: EASE }}
            >
              <Image
                src={type.image.src}
                alt={type.image.alt}
                fill
                sizes="(min-width: 1024px) 26rem, (min-width: 768px) 45vw, 100vw"
                className="object-cover"
              />
            </motion.div>
            {/* The line diagram stays as a small key to where it shows. */}
            <span className="absolute right-3 bottom-3 w-16 rounded-xl bg-white/90 p-1.5 shadow-card backdrop-blur-sm">
              <HeadDiagram pattern={type.pattern} view="top" />
            </span>
          </>
        ) : (
          <div
            role="img"
            aria-label={type.illustrationAlt}
            className="grid h-full grid-cols-2 items-center gap-3 px-5 sm:gap-6 sm:px-8"
          >
            <HeadDiagram pattern={type.pattern} view="side" />
            <HeadDiagram pattern={type.pattern} view="top" />
          </div>
        )}
      </div>
      <figcaption className="absolute top-3 left-3 flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs text-ink shadow-card backdrop-blur-sm">
        <span className="size-2 rounded-full bg-brand" aria-hidden />
        Illustration, not a diagnosis
      </figcaption>
    </figure>
  );
}

/** Detail behind one tap: what it looks like, causes, what helps, the research. */
function Details({ type, baseId }: { type: HairLossTypeView; baseId: string }) {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const btnId = `${baseId}-more`;
  const regionId = `${btnId}-region`;

  return (
    <div className="mt-5 border-y border-line">
      <h4 className="m-0">
        <button
          id={btnId}
          type="button"
          aria-expanded={open}
          aria-controls={regionId}
          onClick={() => setOpen((o) => !o)}
          className="flex min-h-12 w-full items-center justify-between gap-4 text-left text-[15px] font-medium text-ink"
        >
          Causes and what helps
          <Plus
            className={cn(
              'size-4 shrink-0 text-steel transition-transform duration-300 ease-yhc motion-reduce:transition-none',
              open && 'rotate-45',
            )}
            aria-hidden
          />
        </button>
      </h4>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            id={regionId}
            role="region"
            aria-labelledby={btnId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            // height is not a transform, so MotionConfig would still animate it: drop the duration explicitly
            transition={{ duration: reduce ? 0 : 0.4, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="max-w-[60ch] space-y-4 pb-5 text-[15px] leading-relaxed text-pretty text-body">
              <p>{type.looksLike}</p>
              <div>
                <p className="font-medium text-ink">Common causes</p>
                <ul className="mt-1.5 space-y-1">
                  {type.triggers.map((line) => (
                    <li key={line} className="flex gap-3">
                      <span className="mt-[0.7em] h-px w-3 shrink-0 bg-steel" aria-hidden />
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-medium text-ink">What helps</p>
                <p className="mt-1.5">{type.helps}</p>
              </div>
              {type.fact ? (
                <div>
                  <p className="text-ink">
                    {type.fact.stat ? <span className="price mr-1.5">{type.fact.stat}</span> : null}
                    {type.fact.label}
                  </p>
                  <a
                    href={type.fact.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center gap-1 text-[13px] text-muted-foreground underline underline-offset-4 hover:text-ink"
                  >
                    Source: {type.fact.sourceName}
                    <ArrowUpRight className="size-3.5" aria-hidden />
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                </div>
              ) : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
