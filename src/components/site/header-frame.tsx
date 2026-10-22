'use client';

import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

/**
 * Sticky header: light glass everywhere (the homepage hero is light and pulls up under it), dark only in
 * the /start journey.
 */
export function HeaderFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // The /start journey is an all-dark experience, so the header stays dark there.
  const journey = pathname.startsWith('/start');
  const dark = journey;
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
