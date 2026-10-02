import { Menu } from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/shared/logo';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { t } from '@/i18n/en';
import { SITE_NAV } from '@/lib/site';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-pearl/90 backdrop-blur supports-[backdrop-filter]:bg-pearl/75">
      <div className="container-yhc flex h-16 items-center justify-between gap-4">
        <Logo />
        <nav aria-label="Main" className="hidden items-center gap-6 lg:flex">
          {SITE_NAV.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm font-medium text-body hover:text-ink">
              {t(item.key)}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/account"
            className="hidden text-sm font-medium text-body hover:text-ink sm:inline-block"
          >
            {t('nav.account')}
          </Link>
          <Button asChild className="hidden h-11 px-5 sm:inline-flex">
            <Link href="/book">{t('common.bookConsultation')}</Link>
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="size-11 lg:hidden" aria-label="Open menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] bg-pearl">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <nav aria-label="Mobile" className="mt-10 flex flex-col px-4">
                {SITE_NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="border-b border-line py-3.5 text-base font-medium text-ink"
                  >
                    {t(item.key)}
                  </Link>
                ))}
                <Link href="/account" className="border-b border-line py-3.5 text-base font-medium text-ink">
                  {t('nav.account')}
                </Link>
                <Button asChild className="mt-6 h-12">
                  <Link href="/book">{t('common.bookConsultationPrice')}</Link>
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
