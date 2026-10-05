'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

export interface AccountTab {
  href: string;
  label: string;
}

/**
 * Horizontal account tabs — scrolls sideways on small screens with faded edges as a scroll hint,
 * keeps the current tab in view, underline marks the current page.
 */
export function AccountNav({ tabs }: { tabs: AccountTab[] }) {
  const pathname = usePathname();
  const nav = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = nav.current?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!el || !nav.current) return;
    const box = nav.current;
    const left = el.offsetLeft - (box.clientWidth - el.offsetWidth) / 2;
    box.scrollTo({ left: Math.max(0, left), behavior: 'smooth' });
  }, [pathname]);

  return (
    <nav
      ref={nav}
      aria-label="My account"
      className={cn(
        'relative -mx-4 [scrollbar-width:none] overflow-x-auto overscroll-x-contain px-4 sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden',
        'max-sm:[mask-image:linear-gradient(to_right,transparent,#000_16px,#000_calc(100%-28px),transparent)]',
      )}
    >
      <ul className="flex min-w-max gap-1 pr-4 sm:pr-0">
        {tabs.map((tab) => {
          const active = tab.href === '/account' ? pathname === '/account' : pathname.startsWith(tab.href);
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'relative inline-flex min-h-12 items-center px-3 text-sm font-medium whitespace-nowrap transition-colors',
                  'after:absolute after:inset-x-3 after:bottom-0 after:h-[3px] after:rounded-full after:transition-colors',
                  active
                    ? 'text-on-dark after:bg-[image:var(--yhc-silver)]'
                    : 'text-on-dark-muted after:bg-transparent hover:text-on-dark',
                )}
              >
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
