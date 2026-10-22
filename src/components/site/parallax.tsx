'use client';

import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
import { cn } from '@/lib/utils';

/**
 * Slow scroll parallax for a background layer (docs/21). Fills its positioned parent; the inner layer
 * is taller than the frame so the drift never shows an edge.
 * - `through`: drifts while the frame crosses the viewport (closing bands, image cards).
 * - `exit`: still at the top, drifts as the frame scrolls away (page-top banners).
 * Reduced motion: a still layer.
 */
export function Parallax({
  children,
  className,
  mode = 'through',
  strength = 8,
}: {
  children: React.ReactNode;
  className?: string;
  mode?: 'through' | 'exit';
  /** Maximum drift, in % of the layer height. */
  strength?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: mode === 'exit' ? ['start start', 'end start'] : ['start end', 'end start'],
  });
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    mode === 'exit' ? ['0%', `${strength}%`] : [`-${strength / 2}%`, `${strength / 2}%`],
  );

  return (
    <div ref={ref} className={cn('absolute inset-0 overflow-hidden', className)}>
      <motion.div
        className={cn(
          'absolute inset-x-0',
          mode === 'exit' ? '-top-[12%] bottom-0' : '-top-[8%] -bottom-[8%]',
        )}
        style={reduce ? undefined : { y }}
      >
        {children}
      </motion.div>
    </div>
  );
}
