import { SiteFooter } from '@/components/site/site-footer';
import { SiteHeader } from '@/components/site/site-header';
import { StickyMobileBar } from '@/components/site/sticky-mobile-bar';
import { getDoctor } from '@/server/catalog';

export default function SiteLayout({ children }: LayoutProps<'/'>) {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter doctor={getDoctor()} />
      <StickyMobileBar />
    </>
  );
}
