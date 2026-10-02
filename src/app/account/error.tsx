'use client';

import Link from 'next/link';
import { ErrorState } from '@/components/shared/states';
import { Button } from '@/components/ui/button';
import { t } from '@/i18n/en';
import { SITE } from '@/lib/site';

export default function AccountError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <ErrorState
      title="We couldn't load this part of your account"
      body={t('common.errorBody')}
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
  );
}
