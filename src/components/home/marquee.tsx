'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * Seamless infinite marquee: the track holds two identical copies of the items and slides by exactly
 * half its width, so the loop never jumps. Pauses on hover/focus and with the visible Pause control;
 * with prefers-reduced-motion it becomes a normal horizontal scroller showing a single copy.
 * The duplicate copy stays clickable (pointer users can tap any visible card) but is hidden from
 * assistive tech and removed from the tab order.
 */
export function Marquee({
  children,
  durationSec = 40,
  reverse = false,
  label,
  tone = 'light',
  className,
  itemClassName,
}: {
  /** The items (each child is one card). Rendered twice internally. */
  children: React.ReactNode[];
  durationSec?: number;
  reverse?: boolean;
  /** Accessible name of the region, e.g. "Patient results". */
  label: string;
  /** Styles the Pause control for light or dark sections. */
  tone?: 'light' | 'dark';
  className?: string;
  itemClassName?: string;
}) {
  const [paused, setPaused] = useState(false);
  const trackRef = useRef<HTMLUListElement>(null);

  // Keep the decorative duplicate out of keyboard navigation without blocking pointer clicks.
  useEffect(() => {
    trackRef.current
      ?.querySelectorAll<HTMLElement>(
        '[data-marquee-copy="1"] a, [data-marquee-copy="1"] button, [data-marquee-copy="1"] [tabindex]',
      )
      .forEach((el) => el.setAttribute('tabindex', '-1'));
  }, [children]);

  const items = (copy: number) =>
    children.map((child, i) => (
      <li
        key={`${copy}-${i}`}
        data-marquee-copy={copy}
        className={cn('shrink-0', copy === 1 && 'motion-reduce:hidden', itemClassName)}
        aria-hidden={copy === 1 ? true : undefined}
      >
        {child}
      </li>
    ));

  return (
    <div className={cn('group/marquee relative', className)} role="region" aria-label={label}>
      <div className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)] motion-reduce:overflow-x-auto motion-reduce:[mask-image:none]">
        <ul
          ref={trackRef}
          className={cn(
            'flex w-max gap-5 py-2 group-focus-within/marquee:[animation-play-state:paused] group-hover/marquee:[animation-play-state:paused] motion-safe:animate-[yhc-marquee_var(--marquee-duration)_linear_infinite]',
            reverse && 'motion-safe:[animation-direction:reverse]',
            paused && '[animation-play-state:paused]',
          )}
          style={{ ['--marquee-duration' as string]: `${durationSec}s` }}
        >
          {items(0)}
          {items(1)}
        </ul>
      </div>
      <button
        type="button"
        onClick={() => setPaused((p) => !p)}
        aria-pressed={paused}
        className={cn(
          'mt-4 inline-flex min-h-12 items-center rounded-full px-5 text-[13px] font-medium ring-1 transition-colors motion-reduce:hidden',
          tone === 'dark'
            ? 'text-on-dark-muted ring-line-dark hover:text-on-dark'
            : 'text-body ring-line hover:text-ink',
        )}
      >
        {paused ? 'Play' : 'Pause'} carousel
      </button>
    </div>
  );
}
