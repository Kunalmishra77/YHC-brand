'use client';

import { useEffect } from 'react';
import { ErrorState } from '@/components/shared/states';
import { Button } from '@/components/ui/button';
import { t } from '@/i18n/en';

export default function AdminError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    // No clinical data reaches admin pages; log the digest only.
    console.error('admin error', error.digest);
  }, [error]);
  return (
    <ErrorState
      body="This admin page could not load. Your data is safe — try again, or switch pages."
      action={
        <Button variant="outline" onClick={() => retry()}>
          {t('common.retry')}
        </Button>
      }
    />
  );
}
