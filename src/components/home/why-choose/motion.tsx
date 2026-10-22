'use client';

import { motion, useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';

/** Bento tile entrance: rise + fade once in view, staggered by `order`. Static with reduced motion. */
export function RiseTile({
  children,
  className,
  order = 0,
}: {
  children: React.ReactNode;
  className?: string;
  order?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0, margin: '0px 0px 10% 0px' }}
      transition={{ duration: 0.7, delay: order * 0.08, ease: [0.2, 0.7, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}

/**
 * A real, settings-driven figure that fades up once visible. It is never animated through other
 * numbers: a factual value (e.g. consultation length) must read the same in every frame, screenshot
 * and text extraction (audit CON-03).
 */
export function CountUp({ value, className }: { value: number; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.span
      className={cn('inline-block tabular-nums', className)}
      initial={reduce ? false : { opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10% 0px' }}
      transition={{ duration: 0.9, ease: [0.2, 0.7, 0.2, 1] }}
    >
      {value}
    </motion.span>
  );
}

/** Slowly rotating dashed ring (scan tile). CSS-only; stops with reduced motion. */
export function ScanRings({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden>
      <circle cx="100" cy="100" r="92" fill="none" stroke="currentColor" strokeOpacity="0.18" />
      <g className="origin-center motion-safe:animate-[spin_28s_linear_infinite]">
        <circle
          cx="100"
          cy="100"
          r="74"
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.45"
          strokeDasharray="2 7"
        />
      </g>
      <g className="origin-center motion-safe:animate-[spin_18s_linear_infinite_reverse]">
        <circle
          cx="100"
          cy="100"
          r="54"
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.3"
          strokeDasharray="38 14"
        />
      </g>
      <circle cx="100" cy="100" r="30" fill="none" stroke="currentColor" strokeOpacity="0.6" />
      <path
        d="M100 4 V22 M100 178 V196 M4 100 H22 M178 100 H196"
        stroke="currentColor"
        strokeOpacity="0.55"
        strokeWidth="1.5"
      />
      {[
        [86, 90],
        [112, 94],
        [100, 114],
      ].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="3" fill="currentColor" fillOpacity="0.8" />
      ))}
    </svg>
  );
}
