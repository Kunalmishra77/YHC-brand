'use client';

import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import Image from 'next/image';
import { useRef } from 'react';
import type { SiteImage } from '@/lib/images';
import { cn } from '@/lib/utils';

/**
 * Portrait with a gentle scroll parallax: the photo drifts a few per cent inside its frame while the
 * frame scrolls normally. Static with reduced motion. The image is slightly oversized so edges never show.
 */
export function PortraitParallax({
  image,
  sizes,
  className,
  priority = false,
}: {
  image: SiteImage;
  sizes: string;
  className?: string;
  priority?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['-5%', '5%']);

  return (
    <div ref={ref} className={cn('relative overflow-hidden', className)}>
      <motion.div className="absolute inset-x-0 -inset-y-[7%]" style={reduce ? undefined : { y }}>
        <Image
          src={image.src}
          alt={image.alt}
          fill
          priority={priority}
          sizes={sizes}
          className="object-cover object-[50%_18%]"
        />
      </motion.div>
    </div>
  );
}
