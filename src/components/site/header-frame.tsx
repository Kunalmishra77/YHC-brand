'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * Sticky header: light glass everywhere, dark glass over the homepage's dark cinematic hero
 * (`#home-hero`, docs/21) until you scroll past it, and dark throughout the /start journey.
 */
export function HeaderFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const journey = pathname.startsWith('/start');
  const home = pathname === '/';
  const [overHero, setOverHero] = useState(home);

  useEffect(() => {
    if (!home) return;
    const check = () => {
      const hero = document.getElementById('home-hero');
      // Header is 64px tall; turn light once the hero's bottom edge has passed under it.
      setOverHero(hero ? hero.getBoundingClientRect().bottom > 64 : window.scrollY < window.innerHeight * 0.6);
    };
    check();
    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);
    return () => {
      window.removeEventListener('scroll', check);
      window.removeEventListener('resize', check);
    };
  }, [home]);

  const dark = journey || (home && overHero);
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
