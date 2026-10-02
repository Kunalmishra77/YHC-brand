'use client';

import { Menu, Repeat } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

export interface PortalNavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  /** small count shown on the right (e.g. open tasks) */
  count?: number;
}

/** Portal layout: obsidian 248 px sidebar, light content area (docs/07 §6). */
export function PortalShell({
  portal,
  nav,
  user,
  topbar,
  children,
}: {
  portal: string;
  nav: PortalNavItem[];
  user: { name: string; role: string };
  topbar?: React.ReactNode;
  children: React.ReactNode;
}) {
  const sidebar = <SidebarContent portal={portal} nav={nav} user={user} />;
  return (
    <div className="flex min-h-dvh bg-pearl">
      <aside className="sticky top-0 hidden h-dvh w-[248px] shrink-0 flex-col bg-sidebar text-sidebar-foreground lg:flex">
        {sidebar}
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-line bg-pearl/90 px-4 backdrop-blur md:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="size-10 lg:hidden" aria-label="Open navigation">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-[260px] border-none bg-sidebar p-0 text-sidebar-foreground"
            >
              <SheetTitle className="sr-only">{portal} navigation</SheetTitle>
              <div className="flex h-full flex-col">{sidebar}</div>
            </SheetContent>
          </Sheet>
          <div className="flex min-w-0 flex-1 items-center gap-3">{topbar}</div>
        </header>
        <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-6 md:px-6 md:py-8">{children}</main>
      </div>
    </div>
  );
}

function SidebarContent({
  portal,
  nav,
  user,
}: {
  portal: string;
  nav: PortalNavItem[];
  user: { name: string; role: string };
}) {
  const pathname = usePathname();
  const root = nav[0]?.href ?? '/';
  return (
    <>
      <div className="px-5 pt-6 pb-5">
        <Link href="/" className="font-display text-[22px] leading-none text-on-dark">
          Your Hair Company
        </Link>
        <p className="mt-1.5 text-[13px] text-on-dark-muted">{portal}</p>
      </div>
      <nav aria-label={portal} className="flex-1 space-y-0.5 overflow-y-auto px-3">
        {nav.map((item) => {
          const active = item.href === root ? pathname === root : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors',
                active
                  ? 'bg-sidebar-accent text-on-dark'
                  : 'text-on-dark-muted hover:bg-sidebar-accent/60 hover:text-on-dark',
              )}
            >
              <span className="[&_svg]:size-4" aria-hidden>
                {item.icon}
              </span>
              <span className="flex-1">{item.label}</span>
              {item.count ? (
                <span className="price rounded-full bg-platinum px-2 py-0.5 text-[12px] text-obsidian">
                  {item.count}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-sidebar-border p-4">
        <p className="text-sm font-medium text-on-dark">{user.name}</p>
        <p className="text-[13px] text-on-dark-muted capitalize">{user.role}</p>
        <Link
          href="/demo"
          className="mt-3 inline-flex items-center gap-1.5 text-[13px] text-brand-on-dark hover:text-on-dark"
        >
          <Repeat className="size-3.5" aria-hidden />
          Switch demo role
        </Link>
      </div>
    </>
  );
}
