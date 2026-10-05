'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * Subtle fade-and-rise as a block scrolls into view. Content is visible by default (server render,
 * no-JS, reduced motion); it is only hidden after mount when it is still below the fold.
 */
export function Reveal({
  children,
  className,
  delayMs = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<'idle' | 'hidden' | 'shown'>('idle');

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return;
    setState('hidden');
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setState('shown');
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -8% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={state === 'shown' && delayMs ? { transitionDelay: `${delayMs}ms` } : undefined}
      className={cn(
        state !== 'idle' && 'transition-[opacity,transform] duration-700 ease-out',
        state === 'hidden' && 'translate-y-5 opacity-0',
        state === 'shown' && 'translate-y-0 opacity-100',
        className,
      )}
    >
      {children}
    </div>
  );
}
