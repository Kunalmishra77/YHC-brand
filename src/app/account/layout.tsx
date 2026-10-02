import { MessageCircle, Repeat } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { AccountNav, type AccountTab } from '@/components/account/account-nav';
import { Logo } from '@/components/shared/logo';
import { Button } from '@/components/ui/button';
import { t } from '@/i18n/en';
import { formatIst } from '@/lib/time';
import { SITE } from '@/lib/site';
import { getGuarantee } from '@/server/catalog';
import { getCurrentCustomer } from '@/server/session';

export const metadata: Metadata = { title: 'My account', robots: { index: false } };

function greeting(now: Date) {
  const hour = Number(formatIst(now, 'H'));
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default async function AccountLayout({ children }: LayoutProps<'/account'>) {
  const customer = await getCurrentCustomer();
  const guarantee = getGuarantee();

  const tabs: AccountTab[] = [
    { href: '/account', label: 'Overview' },
    { href: '/account/consultations', label: 'Consultations' },
    { href: '/account/orders', label: 'Orders' },
    { href: '/account/progress', label: 'Progress' },
    ...(guarantee ? [{ href: '/account/guarantee', label: 'Guarantee' }] : []),
    { href: '/account/profile', label: 'Profile' },
    { href: '/account/support', label: 'Support' },
  ];

  return (
    <div className="flex min-h-dvh flex-col bg-pearl">
      <header className="border-b border-line bg-pearl/90 backdrop-blur print:hidden">
        <div className="container-yhc flex h-14 items-center justify-between gap-3 md:h-16">
          <Logo className="[&>span]:text-[22px] md:[&>span]:text-[26px]" />
          <div className="flex items-center gap-1">
            <Button asChild variant="ghost" className="h-11 px-3 text-body">
              <a href={SITE.whatsappUrl} target="_blank" rel="noreferrer">
                <MessageCircle className="size-4" aria-hidden />
                <span className="hidden sm:inline">{t('common.whatsapp')}</span>
                <span className="sr-only sm:hidden">Message us on WhatsApp</span>
              </a>
            </Button>
            <Button asChild variant="ghost" className="h-11 px-3 text-body">
              <Link href="/demo">
                <Repeat className="size-4" aria-hidden />
                <span className="hidden sm:inline">Switch demo role</span>
                <span className="sr-only sm:hidden">Switch demo role</span>
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {customer ? (
        <>
          <div className="border-b border-line bg-card print:hidden">
            <div className="container-yhc pt-6 md:pt-8">
              <p className="eyebrow">{t('nav.account')}</p>
              <p className="display mt-2 text-[28px] md:text-[34px]">
                {greeting(new Date())}, {customer.name.split(' ')[0]}
              </p>
              <div className="mt-4">
                <AccountNav tabs={tabs} />
              </div>
            </div>
          </div>
          <main id="main" className="container-yhc flex-1 py-6 md:py-10 print:p-0">
            {children}
          </main>
        </>
      ) : (
        <main
          id="main"
          className="container-yhc flex flex-1 flex-col items-center justify-center py-16 text-center"
        >
          <p className="display text-[28px]">Sign in to see your account</p>
          <p className="mt-2 max-w-sm text-body">
            Your consultations, orders and progress live here. In this demo, pick the customer role to
            continue.
          </p>
          <Button asChild className="mt-6 h-11 px-6">
            <Link href="/demo?next=/account">Choose a demo role</Link>
          </Button>
        </main>
      )}

      <footer className="border-t border-line print:hidden">
        <div className="container-yhc flex flex-col gap-2 py-6 text-[13px] text-muted-foreground sm:flex-row sm:justify-between">
          <p className="max-w-2xl">{t('legal.disclaimer')}</p>
          <Link href="/legal/grievance" className="underline underline-offset-2 hover:text-ink">
            {t('legal.grievance')}
          </Link>
        </div>
      </footer>
    </div>
  );
}
