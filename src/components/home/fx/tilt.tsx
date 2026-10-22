'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { useReducedMotion } from '@/lib/use-reduced-motion';
import type { PointerEvent } from 'react';
import { cn } from '@/lib/utils';

const SPRING = { stiffness: 180, damping: 22, mass: 0.6 };

/**
 * Subtle 3D tilt that follows a mouse or pen over a tile (max `max` degrees). Touch, keyboard and
 * reduced-motion users get a still tile — the tilt is decoration, never information.
 */
export function Tilt({
  children,
  className,
  max = 5,
}: {
  children: React.ReactNode;
  className?: string;
  max?: number;
}) {
  const reduce = useReducedMotion();
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-max, max]), SPRING);
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [max, -max]), SPRING);
  // A soft light that follows the pointer across the tile.
  const glowX = useTransform(px, [-0.5, 0.5], ['0%', '100%']);
  const glowY = useTransform(py, [-0.5, 0.5], ['0%', '100%']);
  const glow = useTransform(
    [glowX, glowY],
    ([x, y]) =>
      `radial-gradient(420px circle at ${String(x)} ${String(y)}, rgba(255,214,170,0.16), transparent 60%)`,
  );

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (reduce || e.pointerType === 'touch') return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => {
    px.set(0);
    py.set(0);
  };

  return (
    <div
      className={cn('group/tilt [perspective:1100px]', className)}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      <motion.div
        className="relative h-full [transform-style:preserve-3d]"
        style={reduce ? undefined : { rotateX, rotateY }}
      >
        {children}
        {reduce ? null : (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[28px] opacity-0 transition-opacity duration-500 group-hover/tilt:opacity-100"
            style={{ background: glow }}
          />
        )}
      </motion.div>
    </div>
  );
}
