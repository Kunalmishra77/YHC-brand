import { ChevronRight, Menu, MessageCircle, UserRound, X } from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/shared/logo';
import { Button } from '@/components/ui/button';
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { t } from '@/i18n/en';
import { SITE, SITE_NAV } from '@/lib/site';
import { HeaderFrame } from './header-frame';
import { SiteNavLink } from './site-nav-link';

/** Colour classes shared by header text links on the light and dark (over-hero) header. */
const HDR_LINK =
  'text-body transition-colors hover:text-ink group-data-[dark=true]/hdr:text-on-dark-muted group-data-[dark=true]/hdr:hover:text-on-dark';
const HDR_LINK_ACTIVE = 'text-ink group-data-[dark=true]/hdr:text-on-dark';

export function SiteHeader() {
  return (
    <HeaderFrame>
      <div className="container-yhc flex h-16 items-center justify-between gap-4">
        <Logo className="shrink-0 [&_span]:transition-colors group-data-[dark=true]/hdr:[&_span]:text-on-dark" />

        <nav aria-label="Main" className="hidden h-full items-stretch gap-5 lg:flex xl:gap-7">
          {SITE_NAV.map((item) => (
            <SiteNavLink
              key={item.href}
              href={item.href}
              className={`relative inline-flex items-center text-sm font-medium ${HDR_LINK} after:absolute after:inset-x-0 after:bottom-0 after:h-[1.5px] after:origin-center after:scale-x-0 after:bg-current after:transition-transform after:duration-300 after:content-[''] hover:after:scale-x-100`}
              activeClassName={`${HDR_LINK_ACTIVE} after:scale-x-100`}
            >
              {t(item.key)}
            </SiteNavLink>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          {/* Account: text from sm to lg and from xl; an icon in the tighter lg range */}
          <SiteNavLink
            href="/account"
            className={`hidden min-h-11 items-center rounded-full px-3 text-sm font-medium sm:inline-flex lg:hidden xl:inline-flex ${HDR_LINK}`}
            activeClassName={HDR_LINK_ACTIVE}
          >
            {t('nav.account')}
          </SiteNavLink>
          <SiteNavLink
            href="/account"
            aria-label={t('nav.account')}
            className={`hidden size-11 items-center justify-center rounded-full lg:inline-flex xl:hidden ${HDR_LINK}`}
            activeClassName={HDR_LINK_ACTIVE}
          >
            <UserRound className="size-[18px]" aria-hidden />
          </SiteNavLink>
          <Button
            asChild
            className="hidden h-11 px-5 group-data-[dark=true]/hdr:bg-[image:var(--yhc-silver)] group-data-[dark=true]/hdr:text-obsidian sm:inline-flex"
          >
            <Link href="/start">{t('nav.beginScan')}</Link>
          </Button>

          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="-mr-2 size-11 group-data-[dark=true]/hdr:text-on-dark group-data-[dark=true]/hdr:hover:bg-graphite sm:mr-0 lg:hidden"
                aria-label="Open menu"
              >
                <Menu className="size-5" aria-hidden />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              showCloseButton={false}
              className="w-full gap-0 border-line bg-pearl p-0 sm:max-w-sm"
            >
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <div className="flex h-16 shrink-0 items-center justify-between border-b border-line px-[var(--yhc-gutter)]">
                <SheetClose asChild>
                  <Link
                    href="/"
                    aria-label="Your Hair Company — home"
                    className="inline-flex min-h-11 items-center rounded-sm font-display text-[24px] leading-none font-medium tracking-tight text-ink"
                  >
                    Your Hair Company
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Button variant="ghost" size="icon" className="-mr-2 size-11" aria-label="Close menu">
                    <X className="size-5" aria-hidden />
                  </Button>
                </SheetClose>
              </div>

              <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-[var(--yhc-gutter)] py-2">
                <ul>
                  {[
                    ...SITE_NAV.map((item) => ({ href: item.href, label: t(item.key) })),
                    { href: '/account', label: t('nav.account') },
                  ].map((item) => (
                    <li key={item.href}>
                      <SheetClose asChild>
                        <SiteNavLink
                          href={item.href}
                          className="group/row flex min-h-14 items-center justify-between gap-4 border-b border-line text-[17px] font-medium text-body transition-colors hover:text-ink"
                          activeClassName="text-ink"
                        >
                          <span className="flex items-center gap-3">
                            <span
                              className="size-1.5 rounded-full bg-transparent group-data-[active=true]/row:bg-brand"
                              aria-hidden
                            />
                            {item.label}
                          </span>
                          <ChevronRight className="size-4 text-steel" aria-hidden />
                        </SiteNavLink>
                      </SheetClose>
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="shrink-0 space-y-3 border-t border-line bg-card px-[var(--yhc-gutter)] pt-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
                <SheetClose asChild>
                  <Button asChild className="h-12 w-full text-base">
                    <Link href="/start">{t('nav.beginScan')}</Link>
                  </Button>
                </SheetClose>
                <div className="grid grid-cols-2 gap-3">
                  <SheetClose asChild>
                    <Button asChild variant="outline" className="h-12 border-steel">
                      <Link href="/book">{t('common.bookConsultation')}</Link>
                    </Button>
                  </SheetClose>
                  <Button asChild variant="outline" className="h-12 border-steel">
                    <a href={SITE.whatsappUrl}>
                      <MessageCircle className="size-4" aria-hidden />
                      {t('common.whatsapp')}
                    </a>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </HeaderFrame>
  );
}
