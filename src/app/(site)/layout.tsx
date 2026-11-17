import { SkipLink } from '@/components/shared/skip-link';
import { SiteFooter } from '@/components/site/site-footer';
import { SiteHeader } from '@/components/site/site-header';
import { SmoothScroll } from '@/components/site/smooth-scroll';
import { StickyMobileBar } from '@/components/site/sticky-mobile-bar';
import { getDoctor, getGuarantee } from '@/server/catalog';

export default function SiteLayout({ children }: LayoutProps<'/'>) {
  const guaranteeOn = getGuarantee() !== null;
  return (
    <>
      <SkipLink />
      <SmoothScroll />
      <SiteHeader guaranteeOn={guaranteeOn} />
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        {children}
      </main>
      <SiteFooter doctor={getDoctor()} guaranteeOn={guaranteeOn} />
      <StickyMobileBar />
    </>
  );
}
