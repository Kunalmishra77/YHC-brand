'use client';

import { ErrorState } from '@/components/shared/states';
import { Button } from '@/components/ui/button';
import { t } from '@/i18n/en';

export default function SalesError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <ErrorState
      title="This view could not load"
      body="Your leads and payments are safe. Try again; if it keeps happening, tell the admin."
      action={
        <Button className="h-11" onClick={() => retry()}>
          {t('common.retry')}
        </Button>
      }
    />
  );
}
