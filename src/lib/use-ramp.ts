'use client';

import { type MotionValue, interpolate, useTransform } from 'motion/react';
import { useMemo } from 'react';

/**
 * Scroll-linked value ramp (clamped), computed in JS each frame. Use this instead of the array form
 * `useTransform(scrollYProgress, [..], [..])` for opacity/transform on pinned sections: motion hands
 * the array form to the browser's ScrollTimeline, which mis-maps progress under Lenis + sticky
 * (opacity drifted back up while scrolling — found 2026-10-22).
 */
export function useRamp(value: MotionValue<number>, input: number[], output: number[]): MotionValue<number> {
  const key = `${input.join(',')}|${output.join(',')}`;
  // eslint-disable-next-line react-hooks/exhaustive-deps -- `key` captures the array contents
  const map = useMemo(() => interpolate(input, output, { clamp: true }), [key]);
  return useTransform(value, (v) => map(v));
}
