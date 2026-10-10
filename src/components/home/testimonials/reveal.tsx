'use client';

import { MotionConfig, motion } from 'motion/react';

/**
 * Once-only 10 px rise + fade on scroll-in (docs/07 §7). Under prefers-reduced-motion MotionConfig drops
 * the movement, leaving only the short fade. Same markup on server and client (no hydration mismatch).
 */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        className={className}
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '0px 0px -10% 0px' }}
        transition={{ duration: 0.25, ease: [0.2, 0.7, 0.2, 1], delay }}
      >
        {children}
      </motion.div>
    </MotionConfig>
  );
}
