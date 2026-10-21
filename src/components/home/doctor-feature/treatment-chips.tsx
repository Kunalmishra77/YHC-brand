'use client';

import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useId, useRef, useState, type KeyboardEvent } from 'react';
import { cn } from '@/lib/utils';

export interface TreatmentChip {
  title: string;
  body: string;
}

/**
 * Compact "what he treats" picker for the doctor section: the areas are tabs shown as pills; the chosen
 * one's single plain line shows underneath. Arrow keys move between pills. Reduced motion: no fade.
 */
export function TreatmentChips({ items, label }: { items: TreatmentChip[]; label: string }) {
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();
  const uid = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const n = items.length;
  const current = items[active] ?? items[0];
  if (!current) return null;

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const moves: Record<string, number> = {
      ArrowRight: (active + 1) % n,
      ArrowDown: (active + 1) % n,
      ArrowLeft: (active - 1 + n) % n,
      ArrowUp: (active - 1 + n) % n,
      Home: 0,
      End: n - 1,
    };
    const next = moves[e.key];
    if (next === undefined) return;
    e.preventDefault();
    setActive(next);
    refs.current[next]?.focus();
  };

  return (
    <div>
      <div role="tablist" aria-label={label} onKeyDown={onKeyDown} className="flex flex-wrap gap-2">
        {items.map((item, i) => {
          const on = i === active;
          return (
            <button
              key={item.title}
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`${uid}-tab-${i}`}
              aria-selected={on}
              aria-controls={`${uid}-panel`}
              tabIndex={on ? 0 : -1}
              onClick={() => setActive(i)}
              className={cn(
                'min-h-11 rounded-full px-4 text-[15px] font-medium ring-1 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-on-dark',
                on
                  ? 'bg-[image:var(--yhc-silver)] text-obsidian ring-transparent'
                  : 'text-on-dark-muted ring-line-dark hover:text-on-dark hover:ring-platinum/50',
              )}
            >
              {item.title}
            </button>
          );
        })}
      </div>
      <div
        role="tabpanel"
        id={`${uid}-panel`}
        aria-labelledby={`${uid}-tab-${active}`}
        className="mt-4 min-h-[3.5rem]"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={active}
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: -4 }}
            transition={{ duration: 0.25 }}
            className="max-w-[48ch] text-base leading-relaxed text-on-dark-muted"
          >
            {current.body}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
