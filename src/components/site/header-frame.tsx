'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * Sticky header that sits as dark glass over the homepage video hero (the hero pulls up under it) and
 * turns light once you scroll past it.
 */
export function HeaderFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const overHero = pathname === '/';
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    if (!overHero) return;
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [overHero]);
  // The /start journey is an all-dark experience, so the header stays dark there.
  const journey = pathname.startsWith('/start');
  const dark = journey || (overHero && !scrolled);
  return (
    <header
      data-dark={dark}
      className={cn(
        'group/hdr sticky top-0 z-40 border-b backdrop-blur transition-colors duration-300',
        dark
          ? cn('border-white/10 text-on-dark backdrop-blur-md', journey ? 'bg-obsidian' : 'bg-obsidian/35')
          : 'border-line bg-pearl/90 supports-[backdrop-filter]:bg-pearl/75',
      )}
    >
      {children}
    </header>
  );
}
