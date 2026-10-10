'use client';

import { ArrowRight, ArrowUpRight, Plus, TriangleAlert } from 'lucide-react';
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from 'motion/react';
import Link from 'next/link';
import { useId, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { HeadDiagram } from './head-diagram';
import type { HairLossTypeView } from './types';

const EASE = [0.2, 0.7, 0.2, 1] as const;

/**
 * Editorial atlas of hair-loss types: an index of six patterns (48 px chips on phones, a numbered list
 * from `lg`) driving line-art head diagrams with the affected zone marked, and accordions for the detail.
 * WAI-ARIA tabs with roving focus (arrow keys, Home, End). Motion is slow and calm; under
 * prefers-reduced-motion MotionConfig removes movement and the content simply swaps.
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
      <div className="grid gap-8 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] lg:gap-16">
        {/* Index */}
        <div
          role="tablist"
          aria-label="Types of hair loss"
          onKeyDown={onKeyDown}
          className="-mx-[var(--yhc-gutter)] flex scroll-px-[var(--yhc-gutter)] [scrollbar-width:none] gap-2 overflow-x-auto overscroll-x-contain px-[var(--yhc-gutter)] pb-1 lg:mx-0 lg:flex-col lg:gap-0 lg:self-start lg:overflow-visible lg:border-b lg:border-line lg:px-0 lg:pb-0 [&::-webkit-scrollbar]:hidden"
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
                  'relative flex min-h-12 shrink-0 items-center gap-3 rounded-full px-5 text-left text-[15px] ring-1 transition-colors duration-300',
                  'lg:min-h-[4.5rem] lg:rounded-none lg:border-t lg:border-line lg:px-0 lg:py-3 lg:pl-5 lg:ring-0',
                  selected
                    ? 'bg-obsidian text-on-dark ring-obsidian lg:bg-transparent lg:text-ink'
                    : 'text-body ring-line hover:text-ink lg:text-muted-foreground',
                )}
              >
                {selected ? (
                  <motion.span
                    layoutId={`${baseId}-bar`}
                    className="absolute top-3 bottom-3 left-0 hidden w-0.5 bg-obsidian lg:block"
                    transition={{ duration: 0.45, ease: EASE }}
                    aria-hidden
                  />
                ) : null}
                <span
                  className={cn(
                    'hidden w-7 shrink-0 font-sans text-[13px] tabular-nums lg:block',
                    selected ? 'text-ink' : 'text-steel',
                  )}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="font-medium whitespace-nowrap lg:text-base lg:whitespace-normal">
                    {type.name}
                  </span>
                  <span className="hidden text-[13px] text-muted-foreground lg:block">{type.cue}</span>
                </span>
                <span
                  className={cn(
                    'hidden w-10 shrink-0 transition-opacity duration-300 lg:block',
                    selected ? 'opacity-100' : 'opacity-40',
                  )}
                >
                  <HeadDiagram pattern={type.pattern} view="top" showZones={selected} />
                </span>
              </button>
            );
          })}
        </div>

        {/* Diagrams + detail */}
        <div id={panelId} role="tabpanel" aria-labelledby={tabId(index)} tabIndex={0} className="min-w-0">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={active.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: EASE }}
            >
              <figure className="rounded-[var(--radius-xl)] bg-card p-4 ring-1 ring-line sm:p-6">
                <div
                  role="img"
                  aria-label={active.illustrationAlt}
                  className="grid grid-cols-2 gap-3 sm:gap-8"
                >
                  {(['side', 'top'] as const).map((view) => (
                    <div key={view} className="flex flex-col items-center">
                      <HeadDiagram pattern={active.pattern} view={view} className="max-w-[11rem]" />
                      <span
                        className="mt-2 text-[13px] tracking-[0.12em] text-muted-foreground uppercase"
                        aria-hidden
                      >
                        {view === 'side' ? 'Side' : 'Top · front ↑'}
                      </span>
                    </div>
                  ))}
                </div>
                <figcaption className="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-line pt-3 text-[13px] text-muted-foreground">
                  <span className="inline-flex items-center gap-2">
                    <span className="size-2.5 rounded-full bg-brand" aria-hidden />
                    Where it usually shows
                  </span>
                  <span>Illustration, not a diagnosis</span>
                </figcaption>
              </figure>

              <div className="mt-8">
                <p className="eyebrow">{active.aka}</p>
                <h3 className="display mt-3 text-[clamp(2rem,1.6rem+1.6vw,2.75rem)]">{active.name}</h3>
                {active.urgent ? (
                  <p className="mt-4 flex items-start gap-2.5 rounded-lg bg-warning-bg px-4 py-3 text-sm font-medium text-warning">
                    <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
                    Needs prompt in-person care from a dermatologist. An online plan is not a substitute.
                  </p>
                ) : null}
              </div>

              <DetailAccordion type={active} baseId={baseId} />

              {active.links.length > 0 ? (
                <div className="mt-5 flex flex-wrap gap-x-6 gap-y-1">
                  {active.links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="inline-flex min-h-12 items-center gap-1.5 text-sm font-medium text-ink underline decoration-steel underline-offset-[6px] hover:decoration-current"
                    >
                      {link.label}
                      <ArrowRight className="size-3.5" aria-hidden />
                    </Link>
                  ))}
                </div>
              ) : null}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </MotionConfig>
  );
}

/** Editorial accordion (one open at a time): looks like · causes · what helps · research. */
function DetailAccordion({ type, baseId }: { type: HairLossTypeView; baseId: string }) {
  const [open, setOpen] = useState<string | null>('look');
  // height is not a transform, so MotionConfig would still animate it: drop the duration explicitly
  const reduce = useReducedMotion();
  const items: { id: string; label: string; body: React.ReactNode }[] = [
    {
      id: 'look',
      label: 'What it looks like',
      body: <p className="leading-relaxed text-pretty">{type.looksLike}</p>,
    },
    {
      id: 'causes',
      label: 'Common causes and triggers',
      body: (
        <ul className="space-y-2">
          {type.triggers.map((line) => (
            <li key={line} className="flex gap-3">
              <span className="mt-[0.7em] h-px w-3 shrink-0 bg-steel" aria-hidden />
              {line}
            </li>
          ))}
        </ul>
      ),
    },
    {
      id: 'helps',
      label: 'What helps — see a doctor',
      body: <p className="leading-relaxed text-pretty">{type.helps}</p>,
    },
    ...(type.fact
      ? [
          {
            id: 'research',
            label: 'What the research says',
            body: (
              <div>
                <p className="text-ink">
                  {type.fact.stat ? <span className="price mr-1.5 text-lg">{type.fact.stat}</span> : null}
                  {type.fact.label}
                </p>
                <p className="mt-2 leading-relaxed text-pretty">{type.fact.detail}</p>
                <a
                  href={type.fact.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex min-h-12 items-center gap-1 text-[13px] text-muted-foreground underline underline-offset-4 hover:text-ink"
                >
                  Source: {type.fact.sourceName}
                  <ArrowUpRight className="size-3.5" aria-hidden />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              </div>
            ),
          },
        ]
      : []),
  ];

  return (
    <div className="mt-6 border-b border-line">
      {items.map((item) => {
        const expanded = open === item.id;
        const btnId = `${baseId}-acc-${item.id}`;
        const regionId = `${btnId}-region`;
        return (
          <div key={item.id} className="border-t border-line">
            <h4 className="m-0">
              <button
                id={btnId}
                type="button"
                aria-expanded={expanded}
                aria-controls={regionId}
                onClick={() => setOpen(expanded ? null : item.id)}
                className="flex min-h-14 w-full items-center justify-between gap-4 py-3 text-left text-[13px] font-semibold tracking-[0.12em] text-ink uppercase"
              >
                {item.label}
                <Plus
                  className={cn(
                    'size-4 shrink-0 text-steel transition-transform duration-300 ease-[var(--yhc-ease)]',
                    expanded && 'rotate-45',
                  )}
                  aria-hidden
                />
              </button>
            </h4>
            <AnimatePresence initial={false}>
              {expanded ? (
                <motion.div
                  id={regionId}
                  role="region"
                  aria-labelledby={btnId}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: reduce ? 0 : 0.4, ease: EASE }}
                  className="overflow-hidden"
                >
                  <div className="max-w-[62ch] pb-5 text-[15px] text-body">{item.body}</div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
