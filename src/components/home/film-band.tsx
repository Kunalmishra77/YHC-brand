'use client';

import { motion, useReducedMotion, useScroll, type MotionValue } from 'motion/react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ScrollSequence } from '@/components/site/scroll-sequence';
import { useRamp } from '@/lib/use-ramp';
import { cn } from '@/lib/utils';

/*
 * Cinematic film band (ADR-35, as in the showcase templates): one of the client's Google Flow films,
 * exported to frames, plays as you scroll. Desktop: pinned for 220vh, full-bleed, three short lines
 * ("beats") appear in turn. Phones: a framed film that scrubs as it passes through the screen, beats
 * listed below. Reduced motion: the poster frame and the beats, static.
 */

export interface FilmBeat {
  title: string;
  body: string;
}

function useIsDesktop() {
  const [desk, setDesk] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const on = () => setDesk(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return desk;
}

export function FilmBand({
  name,
  poster,
  eyebrow,
  beats,
  cta,
  align = 'left',
  id,
}: {
  /** Sequence folder under /media/seq. */
  name: string;
  poster: { src: string; alt: string };
  eyebrow: string;
  beats: FilmBeat[];
  cta?: { href: string; label: string };
  /** Side the text sits on, away from the film's subject. */
  align?: 'left' | 'right';
  id: string;
}) {
  const desk = useIsDesktop();
  const reduce = useReducedMotion();
  const pinned = desk && !reduce;
  const trackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: pinned ? ['start start', 'end end'] : ['start end', 'end start'],
  });

  return (
    <section aria-labelledby={id} className="relative bg-obsidian text-on-dark">
      <div ref={trackRef} className={cn('relative', pinned ? 'h-[220vh]' : 'py-14')}>
        <div className={cn(pinned ? 'sticky top-0 h-svh overflow-hidden' : 'container-yhc')}>
          <ScrollSequence
            name={name}
            progress={scrollYProgress}
            poster={poster}
            className={cn(pinned ? 'absolute inset-0' : 'aspect-[16/10] rounded-[28px] ring-1 ring-line-dark')}
          />
          {pinned ? (
            <>
              <div
                aria-hidden
                className={cn(
                  'absolute inset-0',
                  align === 'left'
                    ? 'bg-gradient-to-r from-obsidian/85 via-obsidian/35 via-45% to-transparent'
                    : 'bg-gradient-to-l from-obsidian/85 via-obsidian/35 via-45% to-transparent',
                )}
              />
              <div aria-hidden className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-obsidian to-transparent" />
              <div className={cn('container-yhc relative flex h-full flex-col justify-center', align === 'right' && 'items-end text-right')}>
                <p className="eyebrow text-brand-on-dark">{eyebrow}</p>
                <h2 id={id} className="sr-only">
                  {beats.map((b) => b.title).join(' ')}
                </h2>
                <div className="relative mt-5 h-[16rem] w-full max-w-xl">
                  {beats.map((b, i) => (
                    <Beat key={b.title} beat={b} index={i} count={beats.length} progress={scrollYProgress} align={align} />
                  ))}
                </div>
                {cta ? (
                  <Link
                    href={cta.href}
                    className="mt-4 inline-flex h-12 items-center self-start rounded-full bg-[image:var(--yhc-silver)] px-7 text-[15px] font-semibold text-obsidian transition-opacity hover:opacity-90"
                  >
                    {cta.label}
                  </Link>
                ) : null}
              </div>
              <Progress progress={scrollYProgress} count={beats.length} />
            </>
          ) : (
            <div className="mt-8">
              <p className="eyebrow text-brand-on-dark">{eyebrow}</p>
              <h2 id={id} className="display mt-4 text-[clamp(2.25rem,1.6rem+2.6vw,3.5rem)] leading-[1.02] text-balance text-on-dark">
                {beats[0]?.title}
              </h2>
              <ol className="mt-6 space-y-4">
                {beats.map((b, i) => (
                  <li key={b.title} className="flex gap-4">
                    <span className="price text-[13px] text-brand-on-dark">{String(i + 1).padStart(2, '0')}</span>
                    <span>
                      {i > 0 ? <span className="block font-display text-2xl leading-tight text-on-dark">{b.title}</span> : null}
                      <span className="mt-1 block text-base leading-relaxed text-on-dark-muted">{b.body}</span>
                    </span>
                  </li>
                ))}
              </ol>
              {cta ? (
                <Link
                  href={cta.href}
                  className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-full bg-[image:var(--yhc-silver)] px-7 text-[15px] font-semibold text-obsidian sm:w-auto"
                >
                  {cta.label}
                </Link>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Beat({
  beat,
  index,
  count,
  progress,
  align,
}: {
  beat: FilmBeat;
  index: number;
  count: number;
  progress: MotionValue<number>;
  align: 'left' | 'right';
}) {
  const start = index / count;
  const end = (index + 1) / count;
  const last = index === count - 1;
  const first = index === 0;
  // Fade in after the previous beat has fully gone, fade out before the next arrives — never overlap.
  const opacity = useRamp(
    progress,
    [start + (first ? 0 : 0.02), start + 0.07, end - 0.08, end - 0.03],
    [first ? 1 : 0, 1, 1, last ? 1 : 0],
  );
  const y = useRamp(progress, [start + 0.02, start + 0.09], [first ? 0 : 36, 0]);
  return (
    <motion.div aria-hidden className={cn('absolute inset-x-0 top-0', align === 'right' && 'text-right')} style={{ opacity, y }}>
      <p className="display text-[clamp(3rem,1.6rem+4.4vw,6rem)] leading-[0.95] text-balance text-on-dark">{beat.title}</p>
      <p className={cn('mt-5 max-w-md text-lg leading-relaxed text-on-dark-muted', align === 'right' && 'ml-auto')}>{beat.body}</p>
    </motion.div>
  );
}

function Progress({ progress, count }: { progress: MotionValue<number>; count: number }) {
  return (
    <div aria-hidden className="absolute inset-x-0 bottom-8">
      <div className="container-yhc flex gap-2">
        {Array.from({ length: count }, (_, i) => (
          <Segment key={i} progress={progress} index={i} count={count} />
        ))}
      </div>
    </div>
  );
}

function Segment({ progress, index, count }: { progress: MotionValue<number>; index: number; count: number }) {
  const scaleX = useRamp(progress, [index / count, (index + 1) / count], [0, 1]);
  return (
    <span className="relative h-0.5 flex-1 overflow-hidden rounded-full bg-white/15">
      <motion.span className="absolute inset-0 origin-left bg-platinum" style={{ scaleX }} />
    </span>
  );
}
