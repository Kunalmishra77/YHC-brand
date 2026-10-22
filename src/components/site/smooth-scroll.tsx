'use client';

import Lenis from 'lenis';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Lenis smooth scrolling for the marketing site (ADR-35, as in the showcase templates). Lenis drives the
 * real window scroll, so motion's `useScroll`, sticky sections and anchor links keep working. Off with
 * prefers-reduced-motion, and never inside the /start journey (forms, camera).
 */
export function SmoothScroll() {
  const pathname = usePathname();
  useEffect(() => {
    if (pathname.startsWith('/start')) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const lenis = new Lenis({ lerp: 0.12, wheelMultiplier: 1, smoothWheel: true, anchors: { offset: -80 } });
    let raf = 0;
    const loop = (t: number) => {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    document.documentElement.classList.add('lenis');
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      document.documentElement.classList.remove('lenis');
    };
  }, [pathname]);
  return null;
}
