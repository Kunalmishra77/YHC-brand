'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';
import { cn } from '@/lib/utils';

/**
 * Subtle fade-and-rise as a block scrolls into view. Content is visible by default (server render,
 * no-JS, reduced motion); it is only hidden after mount when it is still below the fold.
 * Stagger a list by giving each item a growing `delayMs`; `as="li"` keeps list markup valid.
 */
export function Reveal({
  children,
  className,
  delayMs = 0,
  as = 'div',
}: {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
  as?: 'div' | 'li' | 'article';
}) {
  const ref = useRef<HTMLElement>(null);
  const [state, setState] = useState<'idle' | 'hidden' | 'shown'>('idle');

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return;
    setState('hidden');
    const show = () => {
      setState('shown');
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
    const io = new IntersectionObserver((entries) => entries.some((e) => e.isIntersecting) && show(), {
      rootMargin: '0px 0px 10% 0px',
    });
    // Fail-safe: never leave content invisible if the observer misses (fast scroll, odd browsers).
    const onScroll = () => {
      if (el.getBoundingClientRect().top < window.innerHeight * 1.1) show();
    };
    io.observe(el);
    window.addEventListener('scroll', onScroll, { passive: true });
    const timer = window.setTimeout(show, 3000);
    return () => {
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.clearTimeout(timer);
    };
  }, []);

  const props = {
    style: state === 'shown' && delayMs ? { transitionDelay: `${delayMs}ms` } : undefined,
    className: cn(
      state !== 'idle' && 'transition-[opacity,translate] duration-700 ease-out',
      state === 'hidden' && 'translate-y-5 opacity-0',
      state === 'shown' && 'translate-y-0 opacity-100',
      className,
    ),
  };
  if (as === 'li') {
    return (
      <li ref={ref as RefObject<HTMLLIElement | null>} {...props}>
        {children}
      </li>
    );
  }
  if (as === 'article') {
    return (
      <article ref={ref} {...props}>
        {children}
      </article>
    );
  }
  return (
    <div ref={ref as RefObject<HTMLDivElement | null>} {...props}>
      {children}
    </div>
  );
}
