'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * Seamless infinite marquee: the track holds two identical halves and slides by exactly half its
 * width, so the loop never jumps. Each half repeats the items enough times (`minItems`) to be wider
 * than the viewport. Pauses on hover/focus and with the visible Pause control; with
 * prefers-reduced-motion it becomes a normal horizontal scroller showing a single copy.
 *
 * Accessibility (WCAG 1.3.1 / 2.4.3): only the first copy of each item is exposed. Every clone is
 * `aria-hidden` and `inert` (out of the accessibility tree and the tab order). Inert content ignores
 * pointer events, so a click on a visible clone falls through to the track, which forwards it to the
 * matching live item — pointer users can still tap any card they see.
 */
export function Marquee({
  children,
  durationSec = 40,
  reverse = false,
  label,
  tone = 'light',
  minItems = 0,
  className,
  itemClassName,
}: {
  /** The unique items (each child is one card). Repeated internally as needed. */
  children: React.ReactNode[];
  /** Seconds for one full loop of a half-track. */
  durationSec?: number;
  reverse?: boolean;
  /** Accessible name of the region, e.g. "Patient results". */
  label: string;
  /** Styles the Pause control for light or dark sections. */
  tone?: 'light' | 'dark';
  /** Minimum number of cards in each half of the track (short lists are repeated to fill wide screens). */
  minItems?: number;
  className?: string;
  itemClassName?: string;
}) {
  const [paused, setPaused] = useState(false);
  const count = children.length;
  const reps = count === 0 ? 1 : Math.max(1, Math.ceil(minItems / count));
  /** Total copies of the list on the track: `reps` per half × two halves. */
  const copies = reps * 2;

  /** Forward a click that landed on an inert clone to the live item with the same index. */
  function onTrackClick(e: React.MouseEvent<HTMLUListElement>) {
    if (e.target !== e.currentTarget) return;
    const track = e.currentTarget;
    const clone = Array.from(track.querySelectorAll<HTMLElement>('[data-marquee-clone]')).find((li) => {
      const r = li.getBoundingClientRect();
      return e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    });
    if (!clone) return;
    const live = track.querySelector<HTMLElement>(
      `[data-marquee-live][data-marquee-index="${clone.dataset.marqueeIndex ?? ''}"]`,
    );
    live?.querySelector<HTMLElement>('a[href], button')?.click();
  }

  return (
    <div className={cn('group/marquee relative', className)} role="region" aria-label={label}>
      <div className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)] motion-reduce:overflow-x-auto motion-reduce:[mask-image:none]">
        {/* The click handler only forwards pointer clicks from decorative clones; keyboard users reach the live items directly. */}
        <ul
          className={cn(
            'flex w-max gap-5 py-2 group-focus-within/marquee:[animation-play-state:paused] group-hover/marquee:[animation-play-state:paused] motion-safe:animate-[yhc-marquee_var(--marquee-duration)_linear_infinite]',
            reverse && 'motion-safe:[animation-direction:reverse]',
            paused && '[animation-play-state:paused]',
          )}
          style={{ ['--marquee-duration' as string]: `${durationSec}s` }}
          onClick={onTrackClick}
        >
          {Array.from({ length: copies }, (_, copy) =>
            children.map((child, i) => {
              const clone = copy > 0;
              return (
                <li
                  key={`${copy}-${i}`}
                  data-marquee-index={i}
                  data-marquee-live={clone ? undefined : ''}
                  data-marquee-clone={clone ? '' : undefined}
                  className={cn('shrink-0', clone && 'cursor-pointer motion-reduce:hidden', itemClassName)}
                  aria-hidden={clone ? true : undefined}
                  inert={clone}
                >
                  {child}
                </li>
              );
            }),
          )}
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
