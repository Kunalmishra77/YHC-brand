'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

/** True when `href` is the current page or one of its sub-pages. */
export function isActivePath(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Navigation link that marks the current section (`aria-current="page"`, `data-active`). Extra props
 * are forwarded so it can sit inside Radix `asChild` slots (e.g. SheetClose).
 */
export function SiteNavLink({
  href,
  className,
  activeClassName,
  children,
  ...rest
}: Omit<React.ComponentProps<typeof Link>, 'href'> & {
  href: string;
  activeClassName?: string;
}) {
  const pathname = usePathname();
  const active = isActivePath(pathname, href);
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      data-active={active}
      className={cn(className, active && activeClassName)}
      {...rest}
    >
      {children}
    </Link>
  );
}
