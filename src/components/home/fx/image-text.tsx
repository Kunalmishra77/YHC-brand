'use client';

import { motion, useScroll, useTransform } from 'motion/react';
import { useReducedMotion } from '@/lib/use-reduced-motion';
import { useRef } from 'react';
import { cn } from '@/lib/utils';

/**
 * Giant words filled with a photo (background-clip: text) whose picture drifts slowly with the scroll
 * (ADR-35, meridian "image-in-text" band). Text stays real text; the photo is decoration. Reduced
 * motion: the fill is still.
 */
export function ImageText({
  src,
  children,
  className,
}: {
  /** Photo URL (from SLOTS). */
  src: string;
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const backgroundPositionY = useTransform(scrollYProgress, [0, 1], ['10%', '90%']);
  const backgroundSize = useTransform(scrollYProgress, [0, 1], ['130%', '110%']);

  return (
    <motion.p
      ref={ref}
      className={cn(
        'bg-clip-text bg-center bg-no-repeat text-transparent [-webkit-background-clip:text]',
        className,
      )}
      style={{
        backgroundImage: `url(${src})`,
        backgroundSize: reduce ? 'cover' : backgroundSize,
        ...(reduce ? {} : { backgroundPositionY }),
      }}
    >
      {children}
    </motion.p>
  );
}
