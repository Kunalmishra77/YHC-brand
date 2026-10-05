'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export interface AccountTab {
  href: string;
  label: string;
}

/** Horizontal account tabs — scrolls sideways on small screens, underline marks the current page. */
export function AccountNav({ tabs }: { tabs: AccountTab[] }) {
  const pathname = usePathname();
  return (
    <nav
      aria-label="My account"
      className="-mx-4 [scrollbar-width:none] overflow-x-auto px-4 sm:mx-0 sm:px-0"
    >
      <ul className="flex min-w-max gap-1">
        {tabs.map((tab) => {
          const active = tab.href === '/account' ? pathname === '/account' : pathname.startsWith(tab.href);
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'relative inline-flex min-h-11 items-center px-3 text-sm font-medium whitespace-nowrap transition-colors',
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
