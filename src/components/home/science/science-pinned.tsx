'use client';

import { ArrowUpRight } from 'lucide-react';
import { motion, useScroll, useTransform, type MotionValue } from 'motion/react';
import Image from 'next/image';
import { useRef } from 'react';
import { ScrollSequence } from '@/components/site/scroll-sequence';
import { useRamp } from '@/lib/use-ramp';
import { cn } from '@/lib/utils';

export interface PinnedFact {
  id: string;
  /** Short callout label, e.g. "A living root". */
  label: string;
  title: string;
  body: string;
  image: { src: string; alt: string; ready: boolean };
  source: { name: string; year?: number; url: string } | null;
}

const EXTERNAL = { target: '_blank', rel: 'noopener noreferrer' } as const;
const pad = (n: number) => String(n).padStart(2, '0');

/** Callout positions around the stage (meridian "exploded" layout): top-left, bottom-centre, top-right. */
const CALLOUT_POS = ['top-6 left-6', 'bottom-6 left-1/2 -ml-[9rem] xl:-ml-[10rem]', 'top-6 right-6'];

/**
 * Desktop science story (ADR-35, meridian/halden pattern): pinned for 200vh, the three illustrations
 * (H13 → H14 → H15) cross-fade and settle in scale with the scroll, and a labelled callout appears at
 * each third. Only from `lg` with motion allowed (CSS); otherwise the three cards show. The callout text
 * is real text (read in order by screen readers); the sources sit in a static row below the stage so
 * their links are never hidden.
 */
export function SciencePinned({ facts }: { facts: PinnedFact[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ['start start', 'end end'] });
  const n = facts.length;
  const bar = useRamp(scrollYProgress, [0, 1], [0, 1]);
  // The client's film (V02: scalp → living root) plays through the first two facts; the last fact
  // (scarred roots) cross-fades to its own illustration.
  const film = useRamp(scrollYProgress, [0, (n - 1) / n], [0, 1]);
  const first = facts[0];

  return (
    <div>
      <div ref={trackRef} className="relative h-[200vh]">
        <div className="sticky top-0 flex h-svh flex-col justify-center overflow-x-clip pt-20 pb-8">
          <div className="relative mx-auto aspect-[16/9] w-full max-w-[min(100%,calc((100svh-10rem)*1.78))]">
            {/* Glow behind the specimen */}
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-[8%] bg-[radial-gradient(ellipse_at_50%_55%,rgba(174,187,200,0.22),rgba(217,167,102,0.08)_40%,transparent_70%)]"
            />
            <div className="absolute inset-0 overflow-hidden rounded-[28px] ring-1 ring-line-dark">
              {first ? (
                <ScrollSequence
                  name="science"
                  progress={film}
                  poster={{ src: first.image.src, alt: first.image.alt }}
                  className="absolute inset-0"
                />
              ) : null}
              {facts.slice(-1).map((f) => (
                <StageImage key={f.id} fact={f} index={n - 1} count={n} progress={scrollYProgress} />
              ))}
              <div
                aria-hidden
                className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(18,19,21,0.7))]"
              />
            </div>

            <ol className="absolute inset-0" aria-label="Three facts about hair roots">
              {facts.map((f, i) => (
                <Callout
                  key={f.id}
                  fact={f}
                  index={i}
                  count={n}
                  progress={scrollYProgress}
                  className={CALLOUT_POS[i % CALLOUT_POS.length]}
                />
              ))}
            </ol>
          </div>

          <div aria-hidden className="mx-auto mt-6 flex w-full items-center gap-5">
            <span className="text-[13px] font-medium text-on-dark-muted">{n} facts about your roots</span>
            <span className="relative h-px flex-1 bg-line-dark">
              <motion.span className="absolute inset-0 origin-left bg-platinum" style={{ scaleX: bar }} />
            </span>
          </div>
        </div>
      </div>

      <ul className="flex flex-wrap gap-x-6 gap-y-1 pt-2" aria-label="Sources">
        {facts.map((f, i) =>
          f.source ? (
            <li key={f.id}>
              <a
                href={f.source.url}
                {...EXTERNAL}
                className="inline-flex min-h-11 items-center gap-1 text-[13px] text-on-dark underline decoration-line-dark underline-offset-4 hover:decoration-on-dark"
              >
                {pad(i + 1)} · Source: {f.source.name}
                {f.source.year ? `, ${f.source.year}` : ''}
                <ArrowUpRight className="size-3.5 shrink-0" aria-hidden />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
          ) : null,
        )}
      </ul>
    </div>
  );
}

/** Each image owns a third of the scroll: it fades in, settles from 1.12 to 1, then hands over. */
function StageImage({
  fact,
  index,
  count,
  progress,
}: {
  fact: PinnedFact;
  index: number;
  count: number;
  progress: MotionValue<number>;
}) {
  const start = index / count;
  const end = (index + 1) / count;
  const fade = 0.08;
  const first = index === 0;
  const last = index === count - 1;
  const opacity = useTransform(
    progress,
    // Scroll offsets must stay inside [0, 1] (motion hands them to a browser ScrollTimeline).
    [Math.max(0, start - fade), Math.min(1, start + fade), Math.max(0, end - fade - 0.001), Math.min(1, end + fade)],
    [first && count === 1 ? 1 : 0, 1, 1, last ? 1 : 0],
  );
  const scale = useRamp(progress, [Math.max(0, start - fade), Math.min(1, end)], [1.12, 1]);
  return (
    <motion.div className="absolute inset-0" style={{ opacity, scale }}>
      <Image
        src={fact.image.src}
        alt={fact.image.alt}
        fill
        sizes="(min-width: 1024px) 80vw, 100vw"
        className={cn('object-cover', !fact.image.ready && 'opacity-80 grayscale')}
      />
    </motion.div>
  );
}

/** A callout appears at its third and stays, so the stage builds up like an exploded diagram. */
function Callout({
  fact,
  index,
  count,
  progress,
  className,
}: {
  fact: PinnedFact;
  index: number;
  count: number;
  progress: MotionValue<number>;
  className?: string;
}) {
  const at = index / count + 0.04;
  const opacity = useTransform(progress, [at, at + 0.08], [index === 0 ? 1 : 0, 1]);
  const y = useTransform(progress, [at, at + 0.08], [index === 0 ? 0 : 14, 0]);
  return (
    <motion.li
      className={cn(
        'absolute w-[18rem] rounded-2xl bg-obsidian/70 p-5 ring-1 ring-white/10 backdrop-blur-md xl:w-[20rem]',
        className,
      )}
      style={{ opacity, y }}
    >
      <p className="text-[13px] font-semibold tracking-[0.12em] text-brand-on-dark">
        {pad(index + 1)} · {fact.label.toUpperCase()}
      </p>
      <h3 className="mt-1.5 font-display text-[1.5rem] leading-tight font-medium text-on-dark">
        {fact.title}
      </h3>
      <p className="mt-1 text-[15px] leading-snug text-on-dark-muted">{fact.body}</p>
    </motion.li>
  );
}
