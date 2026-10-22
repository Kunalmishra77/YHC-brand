'use client';

import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import Image from 'next/image';
import { useRef } from 'react';
import { cn } from '@/lib/utils';

/**
 * A photo that drifts inside its frame while the frame scrolls past (ADR-35 cinematic pass). The image
 * is oversized by `amount` on both ends so its edges never show. Static with reduced motion.
 */
export function ParallaxImage({
  src,
  alt,
  sizes,
  className,
  imgClassName,
  amount = 8,
  priority = false,
  children,
}: {
  src: string;
  alt: string;
  sizes: string;
  /** Frame classes — give it a size (aspect or height) and a radius. */
  className?: string;
  imgClassName?: string;
  /** Drift in per cent of the frame height, each way. */
  amount?: number;
  priority?: boolean;
  /** Overlays inside the frame (gradients, chips). */
  children?: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [`-${amount}%`, `${amount}%`]);

  return (
    <div ref={ref} className={cn('relative overflow-hidden', className)}>
      <motion.div
        className="absolute inset-x-0"
        style={{ top: `-${amount + 1}%`, bottom: `-${amount + 1}%`, ...(reduce ? {} : { y }) }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className={cn('object-cover', imgClassName)}
        />
      </motion.div>
      {children}
    </div>
  );
}
