'use client';

import Link from 'next/link';
import { ErrorState } from '@/components/shared/states';
import { Button } from '@/components/ui/button';
import { t } from '@/i18n/en';
import { SITE } from '@/lib/site';

export default function StartError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <div className="container-yhc py-16">
      <ErrorState
        title="We couldn't load this step of your assessment"
        body="Your progress so far is saved. Please try again, or message us and we will help."
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <Button className="h-11 px-5" onClick={() => retry()}>
              {t('common.retry')}
            </Button>
            <Button asChild variant="outline" className="h-11 px-5">
              <Link href={SITE.whatsappUrl}>{t('common.whatsapp')}</Link>
            </Button>
          </div>
        }
      />
    </div>
  );
}
