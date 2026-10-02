'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { withdrawConsentAction } from '@/app/account/actions';
import { StatusChip } from '@/components/shared/status-chip';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export type WithdrawableConsent =
  | 'whatsapp_utility'
  | 'whatsapp_marketing'
  | 'clinical_photo_use'
  | 'marketing_photo_use'
  | 'review_publication';

export interface ConsentRow {
  key: string;
  title: string;
  purpose: string;
  version: string;
  givenOn: string | null; // display date
  required: boolean;
  /** what happens if withdrawn — shown in the confirmation */
  effect?: string;
}

/** FR-M14-1 consents: view + withdraw. Demo: withdrawals are audited and reflected in this view only. */
export function ConsentsList({ rows, termsHref }: { rows: ConsentRow[]; termsHref: string }) {
  const [withdrawn, setWithdrawn] = useState<Set<string>>(new Set());
  const [confirming, setConfirming] = useState<ConsentRow | null>(null);
  const [pending, start] = useTransition();

  function withdraw(row: ConsentRow) {
    start(async () => {
      const res = await withdrawConsentAction({ key: row.key as WithdrawableConsent });
      if (!res.ok) {
        toast.error(res.error.message);
        return;
      }
      setWithdrawn((s) => new Set(s).add(row.key));
      setConfirming(null);
      toast.success(`${row.title}: permission withdrawn`);
    });
  }

  return (
    <>
      <ul className="divide-y divide-line">
        {rows.map((row) => {
          const isWithdrawn = withdrawn.has(row.key);
          const active = row.givenOn !== null && !isWithdrawn;
          return (
            <li
              key={row.key}
              className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-ink">{row.title}</p>
                  {active ? (
                    <StatusChip tone="success">Given</StatusChip>
                  ) : isWithdrawn ? (
                    <StatusChip tone="neutral">Withdrawn</StatusChip>
                  ) : (
                    <StatusChip tone="neutral">Not given</StatusChip>
                  )}
                </div>
                <p className="mt-1 text-sm text-body">{row.purpose}</p>
                <p className="mt-1 text-[13px] text-muted-foreground">
                  {row.version}
                  {row.givenOn && !isWithdrawn ? ` · given ${row.givenOn}` : ''}
                  {isWithdrawn ? ' · withdrawn today' : ''}
                </p>
                {row.key === 'whatsapp_marketing' && active ? (
                  <p className="mt-1 text-[13px] text-muted-foreground">
                    You can also reply STOP to any offer message.
                  </p>
                ) : null}
              </div>
              {active && !row.required ? (
                <Button variant="outline" className="h-11 shrink-0 px-4" onClick={() => setConfirming(row)}>
                  Withdraw
                </Button>
              ) : active && row.required ? (
                <p className="shrink-0 text-[13px] text-muted-foreground sm:max-w-[180px] sm:text-right">
                  Needed for your care. To withdraw, raise a data request below.
                </p>
              ) : null}
            </li>
          );
        })}
      </ul>
      <p className="mt-4 text-[13px] text-muted-foreground">
        Read how we use your data in our{' '}
        <Link href={termsHref} className="underline underline-offset-2">
          privacy policy
        </Link>
        .
      </p>

      <Dialog open={confirming !== null} onOpenChange={(o) => (o ? null : setConfirming(null))}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Withdraw “{confirming?.title}”?</DialogTitle>
            <DialogDescription>
              {confirming?.effect ?? 'We will stop using your data for this purpose.'}
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm text-body">
            This does not affect anything done before today. You can give permission again later.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              className="h-11 px-5"
              onClick={() => setConfirming(null)}
              disabled={pending}
            >
              Keep it
            </Button>
            <Button
              variant="destructive"
              className="h-11 px-5"
              onClick={() => confirming && withdraw(confirming)}
              disabled={pending}
              aria-busy={pending}
            >
              {pending ? 'Withdrawing…' : 'Withdraw permission'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
