'use client';

import { ErrorState } from '@/components/shared/states';
import { Button } from '@/components/ui/button';
import { t } from '@/i18n/en';

export default function DoctorError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <ErrorState
      title="This page could not load"
      body="Your notes are autosaved. Try again — if it keeps happening, tell the YHC team."
      action={
        <Button variant="outline" onClick={reset}>
          {t('common.retry')}
        </Button>
      }
    />
  );
}
