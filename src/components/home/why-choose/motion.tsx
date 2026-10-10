'use client';

import { animate, motion, useInView, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
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
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 0.7, delay: order * 0.08, ease: [0.2, 0.7, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Counts up to a real, settings-driven number once visible. Server-rendered with the final value so
 * no-JS, crawlers and reduced-motion users always see the true figure.
 */
export function CountUp({ value, className }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-10% 0px' });
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(value);

  useEffect(() => {
    if (!inView || reduce) return;
    const controls = animate(0, value, {
      duration: 1.4,
      ease: [0.2, 0.7, 0.2, 1],
      onUpdate: (v) => setShown(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, reduce, value]);

  return (
    <span ref={ref} className={cn('tabular-nums', className)}>
      <span aria-hidden>{shown}</span>
      <span className="sr-only">{value}</span>
    </span>
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
