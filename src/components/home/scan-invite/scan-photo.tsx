'use client';

import { motion } from 'motion/react';
import { useReducedMotion } from '@/lib/use-reduced-motion';
import { ParallaxImage } from '@/components/home/fx/parallax-image';
import { ANGLE_LABEL } from '@/lib/journey/labels';
import { cn } from '@/lib/utils';

/** Where the decorative zone chips sit on the H03 photo (per cent of the frame). */
const CHIPS = [
  { label: ANGLE_LABEL.top, x: '54%', y: '10%' },
  { label: ANGLE_LABEL.parting, x: '62%', y: '25%' },
  { label: ANGLE_LABEL.crown, x: '50%', y: '40%' },
  { label: ANGLE_LABEL.back, x: '58%', y: '55%' },
] as const;

/**
 * Section 3 stage photo (slot H03): slow parallax, a soft scan line sweeping down over it, and the scan
 * zones popping in as chips once the photo scrolls into view. All decoration — the steps beside it carry
 * the words. Reduced motion: still photo, chips shown, no sweep.
 */
export function ScanPhoto({
  src,
  alt,
  note,
  className,
}: {
  src: string;
  alt: string;
  note: string | undefined;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <figure className={cn('group overflow-hidden rounded-[28px] bg-obsidian', className)}>
      <ParallaxImage
        src={src}
        alt={alt}
        sizes="(min-width: 1024px) 34vw, 100vw"
        amount={7}
        className="absolute inset-0"
        imgClassName="transition-transform duration-[1600ms] ease-out group-hover:scale-[1.04] motion-reduce:transition-none"
      >
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-obsidian/55 via-obsidian/5 to-transparent"
        />

        {/* Scan line: a thin bright band with a soft trail, sweeping top to bottom. */}
        {reduce ? null : (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 h-24"
            initial={{ top: '-12%' }}
            animate={{ top: ['-12%', '100%'] }}
            transition={{ duration: 3.6, ease: [0.45, 0, 0.55, 1], repeat: Infinity, repeatDelay: 1.2 }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[rgba(174,187,200,0.28)]" />
            <div className="absolute inset-x-0 bottom-0 h-px bg-white/90 shadow-[0_0_18px_3px_rgba(174,187,200,0.75)]" />
          </motion.div>
        )}

        {/* Corner brackets: the photo reads as a viewfinder. */}
        <svg
          aria-hidden
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-4 size-[calc(100%-2rem)] text-white/70"
        >
          <path
            d="M0 9 V0 H9 M91 0 H100 V9 M100 91 V100 H91 M9 100 H0 V91"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        <ul aria-hidden className="absolute inset-0">
          {CHIPS.map((c, i) => (
            <motion.li
              key={c.label}
              className="absolute flex items-center gap-2 rounded-full bg-white/90 py-1.5 pr-3 pl-2 text-[12px] font-medium whitespace-nowrap text-ink shadow-raised backdrop-blur-md sm:text-[13px]"
              style={{ left: c.x, top: c.y }}
              initial={reduce ? false : { opacity: 0, scale: 0.6, y: 10 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.25 + i * 0.18 }}
            >
              <span className="relative flex size-2.5">
                <span className="absolute inset-0 rounded-full bg-brand motion-safe:animate-ping motion-safe:opacity-60" />
                <span className="relative size-2.5 rounded-full bg-brand" />
              </span>
              {c.label}
            </motion.li>
          ))}
        </ul>

        {note ? (
          <figcaption className="absolute top-3 right-3 rounded-full bg-black/55 px-2.5 py-1 text-[12px] text-on-dark backdrop-blur">
            {note}
          </figcaption>
        ) : null}
        <p className="absolute right-4 bottom-4 hidden max-w-[11rem] text-right text-[13px] leading-snug text-on-dark lg:block">
          Try it: tap the round button on the phone.
        </p>
      </ParallaxImage>
    </figure>
  );
}
