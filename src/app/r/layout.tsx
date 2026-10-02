import { ShieldCheck } from 'lucide-react';
import { Logo } from '@/components/shared/logo';
import { SiteFooter } from '@/components/site/site-footer';
import { getDoctor } from '@/server/catalog';

/** Focused layout for plan links (ADR-14): no shop navigation, just the plan and the footer disclosures. */
export default function PlanLinkLayout({ children }: LayoutProps<'/r'>) {
  return (
    <>
      <header className="border-b border-line bg-pearl">
        <div className="container-yhc flex h-16 items-center justify-between gap-4">
          <Logo />
          <span className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground">
            <ShieldCheck className="size-4 text-brand" aria-hidden />
            Your private plan link
          </span>
        </div>
      </header>
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter doctor={getDoctor()} />
    </>
  );
}
