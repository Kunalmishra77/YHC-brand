import { LogOut, Mail } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { signOutAction } from '@/app/auth/actions';
import { AccountNav, type AccountTab } from '@/components/account/account-nav';
import { Logo } from '@/components/shared/logo';
import { SkipLink } from '@/components/shared/skip-link';
import { Button } from '@/components/ui/button';
import { t } from '@/i18n/en';
import { getSessionUser } from '@/lib/rbac';
import { formatIst } from '@/lib/time';
import { getCustomer } from '@/server/live/scans';

export const metadata: Metadata = { title: 'My account', robots: { index: false } };

function greeting(now: Date) {
  const hour = Number(formatIst(now, 'H'));
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

/** Customer portal (ADR-36): scan results and contact details. Orders/consultations return later. */
export default async function AccountLayout({ children }: LayoutProps<'/account'>) {
  const user = await getSessionUser();
  const customer = user?.role === 'customer' && user.customerId ? await getCustomer(user.customerId) : null;

  const tabs: AccountTab[] = [
    { href: '/account', label: 'Overview' },
    { href: '/account/scan', label: 'My scans' },
  ];

  return (
    <div className="flex min-h-dvh flex-col bg-pearl">
      <SkipLink />
      <header className="border-b border-white/5 bg-obsidian text-on-dark print:hidden">
        <div className="container-yhc flex h-14 items-center justify-between gap-3 md:h-16">
          <Link href="/" aria-label="Your Hair Company — home">
            <Logo tone="light" />
          </Link>
          <div className="flex items-center gap-1">
            <Button asChild variant="ghost" className="h-11 px-3 text-on-dark-muted hover:bg-graphite hover:text-on-dark">
              <a href="mailto:care@yourhaircompany.com">
                <Mail className="size-4" aria-hidden />
                <span className="hidden sm:inline">Email us</span>
                <span className="sr-only sm:hidden">Email us</span>
              </a>
            </Button>
            {customer ? (
              <form action={signOutAction}>
                <Button type="submit" variant="ghost" className="h-11 px-3 text-on-dark-muted hover:bg-graphite hover:text-on-dark">
                  <LogOut className="size-4" aria-hidden />
                  <span className="hidden sm:inline">Sign out</span>
                  <span className="sr-only sm:hidden">Sign out</span>
                </Button>
              </form>
            ) : null}
          </div>
        </div>
      </header>

      {customer ? (
        <>
          <div className="relative overflow-hidden bg-obsidian text-on-dark print:hidden">
            <div
              className="pointer-events-none absolute -top-32 right-0 size-[28rem] rounded-full bg-[radial-gradient(circle,rgba(201,204,209,0.14),transparent_65%)]"
              aria-hidden
            />
            <div className="container-yhc relative pt-7 md:pt-12">
              <p className="eyebrow text-brand-on-dark">{t('nav.account')}</p>
              <p className="display mt-2.5 text-[clamp(2rem,1.6rem+2.2vw,3.25rem)] leading-[1.05] text-balance text-on-dark">
                {greeting(new Date())}, {customer.name.split(' ')[0]}
              </p>
              <div className="mt-6 border-t border-white/[0.06] md:mt-8">
                <AccountNav tabs={tabs} />
              </div>
            </div>
          </div>
          <main id="main" tabIndex={-1} className="container-yhc flex-1 py-8 outline-none md:py-12 print:p-0">
            {children}
          </main>
        </>
      ) : (
        <main id="main" tabIndex={-1} className="container-yhc flex flex-1 flex-col items-center justify-center py-16 text-center outline-none">
          <p className="display text-[28px]">Sign in to see your account</p>
          <p className="mt-2 max-w-sm text-body">
            Enter your details on the start page. We email you a code, and you are in.
          </p>
          <Button asChild className="mt-6 h-11 px-6">
            <Link href="/start">Sign in with your email</Link>
          </Button>
        </main>
      )}

      <footer className="border-t border-line print:hidden">
        <div className="container-yhc flex flex-col gap-2 py-6 text-[13px] text-muted-foreground sm:flex-row sm:justify-between">
          <p className="max-w-2xl">The scalp scan is a photo check, not a medical diagnosis. Results vary from person to person.</p>
          <Link href="/legal/grievance" className="underline underline-offset-2 hover:text-ink">
            {t('legal.grievance')}
          </Link>
        </div>
      </footer>
    </div>
  );
}
