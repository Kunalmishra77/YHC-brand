'use client';

import { MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { t } from '@/i18n/en';
import { SITE } from '@/lib/site';
import { cn } from '@/lib/utils';

/**
 * Sticky mobile action bar: WhatsApp + Begin 3D scan (FR-M1-3, ADR-26). On the homepage it waits until
 * the hero (which has the start form) has scrolled away.
 */
export function StickyMobileBar() {
  const pathname = usePathname();
  const deferred = pathname === '/';
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    if (!deferred) return;
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.9);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [deferred]);
  // Hidden inside focused flows (scan, booking, checkout, consult) where its CTA would compete.
  const inFlow = /^\/(start|book|cart|checkout|order|consult|r\/)/.test(pathname);
  const visible = !inFlow && (!deferred || scrolled);
  if (inFlow) return null;
  return (
    <div
      aria-hidden={!visible}
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 border-t border-line bg-pearl/95 px-[var(--yhc-gutter)] pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-8px_24px_-12px_rgba(18,19,21,0.18)] backdrop-blur transition-transform duration-300 motion-reduce:transition-none md:hidden',
        visible ? 'translate-y-0' : 'pointer-events-none translate-y-full',
      )}
    >
      <div className="flex gap-2">
        <Button asChild variant="outline" className="h-12 flex-1 border-steel" tabIndex={visible ? 0 : -1}>
          <a href={SITE.whatsappUrl}>
            <MessageCircle className="size-4" aria-hidden />
            {t('common.whatsapp')}
          </a>
        </Button>
        <Button asChild className="h-12 flex-[1.6]" tabIndex={visible ? 0 : -1}>
          <Link href="/start">{t('nav.beginScan')}</Link>
        </Button>
      </div>
    </div>
  );
}
