'use client';

import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Plus } from 'lucide-react';
import { useId, useState } from 'react';
import { cn } from '@/lib/utils';

export interface TreatmentArea {
  title: string;
  body: React.ReactNode;
}

const TONES = {
  dark: {
    rule: 'border-line-dark',
    focus: 'focus-visible:outline-brand-on-dark',
    num: ['text-on-dark', 'text-on-dark-muted'],
    title: ['text-on-dark', 'text-on-dark/75 group-hover:text-on-dark'],
    icon: [
      'rotate-45 bg-[image:var(--yhc-silver)] text-obsidian ring-transparent',
      'text-on-dark-muted ring-line-dark group-hover:text-on-dark',
    ],
    body: 'text-on-dark-muted',
  },
  light: {
    rule: 'border-line',
    focus: '',
    num: ['text-ink', 'text-muted-foreground'],
    title: ['text-ink', 'text-ink/75 group-hover:text-ink'],
    icon: ['rotate-45 bg-obsidian text-on-dark ring-obsidian', 'text-body ring-line group-hover:text-ink'],
    body: 'text-body',
  },
} as const;

/**
 * Numbered editorial accordion (doctor's treatment areas; also the "why choose" detail list). One row
 * open at a time; click/tap or Enter/Space toggles and the detail slides down. Reduced motion: no tween.
 */
export function TreatmentIndex({
  items,
  tone = 'dark',
  headingLevel = 'h4',
  defaultOpen = 0,
}: {
  items: TreatmentArea[];
  tone?: 'dark' | 'light';
  headingLevel?: 'h3' | 'h4';
  defaultOpen?: number;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const reduce = useReducedMotion();
  const uid = useId();
  const c = TONES[tone];
  const Heading = headingLevel;

  return (
    <ul className={cn('border-t', c.rule)}>
      {items.map((item, i) => {
        const expanded = open === i;
        const panelId = `${uid}-panel-${i}`;
        const on = expanded ? 0 : 1;
        return (
          <li key={item.title} className={cn('border-b', c.rule)}>
            <Heading>
              <button
                type="button"
                aria-expanded={expanded}
                aria-controls={expanded ? panelId : undefined}
                onClick={() => setOpen(expanded ? -1 : i)}
                className={cn(
                  'group flex min-h-16 w-full items-center gap-4 py-4 text-left sm:gap-6',
                  c.focus,
                )}
              >
                <span className={cn('price w-7 shrink-0 text-[13px] transition-colors', c.num[on])}>
                  0{i + 1}
                </span>
                <span
                  className={cn(
                    'flex-1 font-display text-[clamp(1.75rem,1.5rem+0.9vw,2.125rem)] leading-tight font-medium transition-colors',
                    c.title[on],
                  )}
                >
                  {item.title}
                </span>
                <span
                  className={cn(
                    'flex size-10 shrink-0 items-center justify-center rounded-full ring-1 transition-[transform,background-color,color] duration-300',
                    c.icon[on],
                  )}
                  aria-hidden
                >
                  <Plus className="size-4" />
                </span>
              </button>
            </Heading>
            <AnimatePresence initial={false}>
              {expanded ? (
                <motion.div
                  id={panelId}
                  key="panel"
                  initial={reduce ? false : { height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: [0.2, 0.7, 0.2, 1] }}
                  className="overflow-hidden"
                >
                  <div
                    className={cn(
                      'max-w-[56ch] pb-6 pl-11 text-[15px] leading-relaxed sm:pl-[3.25rem]',
                      c.body,
                    )}
                  >
                    {item.body}
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </li>
        );
      })}
    </ul>
  );
}
