import { MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { t } from '@/i18n/en';
import { SITE } from '@/lib/site';

/** Sticky mobile action bar: WhatsApp + Book (FR-M1-3). */
export function StickyMobileBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-pearl/95 p-3 backdrop-blur md:hidden">
      <div className="flex gap-2">
        <Button asChild variant="outline" className="h-12 flex-1 border-steel">
          <a href={SITE.whatsappUrl}>
            <MessageCircle className="size-4" aria-hidden />
            {t('common.whatsapp')}
          </a>
        </Button>
        <Button asChild className="h-12 flex-[1.6]">
          <Link href="/book">{t('common.bookConsultationPrice')}</Link>
        </Button>
      </div>
    </div>
  );
}
