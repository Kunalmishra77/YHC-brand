'use client';

import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';

/** Secondary "save as PDF" action for the assessment — outline, so the next step stays the clear lead. */
export function PrintSummaryButton({ label = 'Download summary' }: { label?: string }) {
  return (
    <Button
      type="button"
      variant="outline"
      className="h-12 border-steel px-6 text-base print:hidden"
      onClick={() => window.print()}
    >
      <Printer className="size-4" aria-hidden />
      {label}
    </Button>
  );
}
