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

/**
 * Portal layout (docs/07 §6): fixed obsidian 248 px sidebar with a faint metallic light at the top,
 * light content area up to 1440 px. One shell for Doctor, Sales and Admin.
 */
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
    <div className="min-h-dvh bg-pearl">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[248px] flex-col overflow-hidden bg-sidebar text-sidebar-foreground lg:flex">
        {sidebar}
      </aside>
      <div className="flex min-h-dvh min-w-0 flex-col lg:pl-[248px]">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-pearl/85 px-4 backdrop-blur-md md:px-8">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="size-10 lg:hidden" aria-label="Open navigation">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-[264px] border-none bg-sidebar p-0 text-sidebar-foreground"
            >
              <SheetTitle className="sr-only">{portal} navigation</SheetTitle>
              <div className="relative flex h-full flex-col overflow-hidden">{sidebar}</div>
            </SheetContent>
          </Sheet>
          <div className="flex min-w-0 flex-1 items-center gap-3">{topbar}</div>
        </header>
        <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-7 md:px-8 md:py-10">{children}</main>
      </div>
    </div>
  );
}

function initials(name: string) {
  return name
    .replace(/^Dr\.?\s+/i, '')
    .split(/\s+/)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
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
      {/* faint metallic light, echoing the site hero */}
      <div
        className="pointer-events-none absolute -top-24 -left-16 size-72 rounded-full bg-[radial-gradient(circle,rgba(201,204,209,0.16),transparent_65%)]"
        aria-hidden
      />
      <div className="relative px-6 pt-7 pb-6">
        <Link href="/" className="font-display text-[24px] leading-none text-on-dark">
          Your Hair Company
        </Link>
        <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-line-dark bg-ink-2/80 px-2.5 py-1 text-[12px] font-medium text-on-dark-muted">
          <span className="size-1.5 rounded-full bg-[image:var(--yhc-silver)]" aria-hidden />
          {portal}
        </p>
      </div>
      <nav aria-label={portal} className="relative flex-1 space-y-0.5 overflow-y-auto px-3 pt-2">
        {nav.map((item) => {
          const active = item.href === root ? pathname === root : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'group relative flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors',
                active
                  ? 'bg-white/[0.06] text-on-dark'
                  : 'text-on-dark-muted hover:bg-white/[0.04] hover:text-on-dark',
              )}
            >
              <span
                className={cn(
                  'absolute top-2.5 bottom-2.5 left-0 w-[3px] rounded-full transition-opacity',
                  active ? 'bg-[image:var(--yhc-silver)] opacity-100' : 'opacity-0',
                )}
                aria-hidden
              />
              <span
                className={cn(
                  '[&_svg]:size-[18px]',
                  active ? 'text-platinum' : 'text-steel group-hover:text-platinum',
                )}
                aria-hidden
              >
                {item.icon}
              </span>
              <span className="flex-1">{item.label}</span>
              {item.count ? (
                <span className="price min-w-6 rounded-full bg-[image:var(--yhc-silver)] px-1.5 py-0.5 text-center text-[11px] font-semibold text-obsidian">
                  {item.count}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>
      <div className="relative m-3 rounded-xl border border-line-dark bg-ink-2/70 p-3">
        <div className="flex items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[image:var(--yhc-silver)] text-[13px] font-semibold text-obsidian">
            {initials(user.name)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-on-dark">{user.name}</p>
            <p className="text-[12px] text-on-dark-muted capitalize">{user.role}</p>
          </div>
        </div>
        <Link
          href="/demo"
          className="mt-3 flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-line-dark text-[12px] text-on-dark-muted transition-colors hover:border-steel hover:text-on-dark"
        >
          <Repeat className="size-3.5" aria-hidden />
          Switch demo role
        </Link>
      </div>
    </>
  );
}
