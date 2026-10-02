'use client';

import { Building2, CreditCard, Loader2, Lock, Smartphone } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { formatINR } from '@/lib/money';
import { cn } from '@/lib/utils';

type Method = 'upi' | 'card' | 'netbanking';

const METHODS: { id: Method; label: string; hint: string; icon: typeof Smartphone }[] = [
  { id: 'upi', label: 'UPI', hint: 'Google Pay, PhonePe, Paytm or any UPI app', icon: Smartphone },
  { id: 'card', label: 'Card', hint: 'Debit or credit card', icon: CreditCard },
  { id: 'netbanking', label: 'Netbanking', hint: 'All major Indian banks', icon: Building2 },
];

/**
 * Stand-in for Razorpay Checkout (demo only — no real payment). "Pay" calls `onConfirm`, which runs a
 * server action playing the webhook role; the server, not this sheet, decides the amount and status.
 * Bottom sheet on mobile, dialog on desktop (docs/07 §5 Modal/Sheet).
 */
export function DemoPaymentSheet({
  open,
  onOpenChange,
  amountPaise,
  description,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amountPaise: number;
  description: string;
  /** resolves when the server answered; return an error message to show inside the sheet */
  onConfirm: (method: Method) => Promise<string | null>;
}) {
  const [method, setMethod] = useState<Method>('upi');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pay = async () => {
    setBusy(true);
    setError(null);
    try {
      const message = await onConfirm(method);
      if (message) setError(message);
    } catch {
      setError('We could not reach the server. Nothing was charged — please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (busy) return;
        setError(null);
        onOpenChange(v);
      }}
    >
      <DialogContent
        showCloseButton={!busy}
        className={cn(
          'top-auto bottom-0 max-w-full translate-y-0 gap-0 rounded-b-none border-line p-0 pb-[env(safe-area-inset-bottom)]',
          'sm:top-[50%] sm:bottom-auto sm:max-w-md sm:translate-y-[-50%] sm:rounded-lg sm:pb-0',
        )}
      >
        <div className="rounded-t-lg bg-obsidian px-5 pt-5 pb-4 text-on-dark sm:rounded-t-lg">
          <div className="flex items-center gap-2">
            <span className="rounded-sm bg-warning-bg px-2 py-0.5 text-[12px] font-semibold text-warning">
              DEMO
            </span>
            <span className="text-[13px] text-on-dark-muted">Razorpay (demo) · no real payment</span>
          </div>
          <DialogTitle className="mt-3 text-base font-medium text-on-dark">Your Hair Company</DialogTitle>
          <DialogDescription className="text-sm text-on-dark-muted">{description}</DialogDescription>
          <p className="price mt-3 text-2xl text-on-dark">{formatINR(amountPaise)}</p>
        </div>

        <div className="space-y-3 px-5 py-5">
          <p className="text-sm font-medium text-ink">Pay with</p>
          <div role="radiogroup" aria-label="Payment method" className="space-y-2">
            {METHODS.map((m) => {
              const Icon = m.icon;
              const active = method === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  disabled={busy}
                  onClick={() => setMethod(m.id)}
                  className={cn(
                    'flex min-h-14 w-full items-center gap-3 rounded-md border px-3 text-left transition-colors',
                    active ? 'border-brand bg-info-bg/60' : 'border-line bg-card hover:border-steel',
                  )}
                >
                  <Icon className="size-5 text-steel" aria-hidden />
                  <span className="flex-1">
                    <span className="block text-sm font-medium text-ink">{m.label}</span>
                    <span className="block text-[13px] text-muted-foreground">{m.hint}</span>
                  </span>
                  <span
                    aria-hidden
                    className={cn(
                      'size-4 rounded-full border',
                      active ? 'border-[5px] border-brand' : 'border-steel',
                    )}
                  />
                </button>
              );
            })}
          </div>

          <div aria-live="polite" className="min-h-0">
            {error ? (
              <p role="alert" className="rounded-md bg-danger-bg px-3 py-2 text-sm text-danger">
                {error}
              </p>
            ) : null}
          </div>

          <Button onClick={pay} disabled={busy} className="h-12 w-full text-base">
            {busy ? (
              <>
                <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden />
                Processing…
              </>
            ) : (
              <>
                <Lock className="size-4" aria-hidden />
                Pay {formatINR(amountPaise)}
              </>
            )}
          </Button>
          <button
            type="button"
            disabled={busy}
            onClick={() =>
              setError('Payment failed at the bank (simulated). Nothing was charged — you can try again.')
            }
            className="mx-auto block min-h-11 text-[13px] text-muted-foreground underline underline-offset-4"
          >
            Simulate a failed payment
          </button>
          <p className="text-center text-[13px] text-muted-foreground">
            On the live site this is Razorpay&apos;s secure checkout. Nothing is confirmed until our server
            receives the payment from Razorpay.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export type { Method as DemoPaymentMethod };
