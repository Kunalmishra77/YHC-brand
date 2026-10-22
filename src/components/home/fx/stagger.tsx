'use client';

import { MotionConfig, motion, type Variants } from 'motion/react';

const EASE = [0.2, 0.7, 0.2, 1] as const;

const LIST: Variants = { hidden: {}, shown: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } } };
const ITEM: Variants = {
  hidden: { opacity: 0, y: 14, scale: 0.96 },
  shown: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: EASE } },
};

/** A list whose items rise in one after another when it scrolls into view. Reduced motion: fade only. */
export function StaggerList({
  children,
  className,
  label,
}: {
  children: React.ReactNode;
  className?: string;
  label?: string;
}) {
  return (
    <MotionConfig reducedMotion="user">
      <motion.ul
        className={className}
        aria-label={label}
        initial="hidden"
        whileInView="shown"
        viewport={{ once: true, amount: 0.3 }}
        variants={LIST}
      >
        {children}
      </motion.ul>
    </MotionConfig>
  );
}

export function StaggerItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.li className={className} variants={ITEM}>
      {children}
    </motion.li>
  );
}
