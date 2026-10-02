'use client';

import Link from 'next/link';
import { ErrorState } from '@/components/shared/states';
import { Button } from '@/components/ui/button';
import { t } from '@/i18n/en';

/** Shared error boundary body for marketing routes. Never shows the error message or stack. */
export function SiteError({ retry }: { retry: () => void }) {
  return (
    <div className="container-yhc py-16">
      <ErrorState
        body="This page did not load. Please try again, or go straight to booking — it takes a few minutes."
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <Button onClick={() => retry()} className="h-11 px-5">
              {t('common.retry')}
            </Button>
            <Button asChild variant="outline" className="h-11 px-5">
              <Link href="/book">{t('common.bookConsultation')}</Link>
            </Button>
          </div>
        }
      />
    </div>
  );
}
