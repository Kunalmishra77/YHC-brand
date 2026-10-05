'use client';

import { RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { reorderAction } from '@/app/account/actions';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

/** FR-M10-4 one-tap reorder (same plan, same address). FR-M10-5: blocked → offer a follow-up. */
export function ReorderButton({
  orderCode,
  label = 'Reorder this plan',
  priceLabel,
  address,
  followUpHref,
  className,
}: {
  orderCode: string;
  label?: string;
  priceLabel: string;
  address: string;
  followUpHref: string;
  className?: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [blocked, setBlocked] = useState<string | null>(null);

  function confirm() {
    start(async () => {
      const res = await reorderAction({ orderCode });
      if (res.ok) {
        setConfirmOpen(false);
        toast.success(`Order ${res.data.code} confirmed`, {
          description: 'We will message you on WhatsApp when it ships.',
        });
        router.push(`/account/orders/${res.data.code}`);
        return;
      }
      setConfirmOpen(false);
      if (res.error.needsFollowUp) setBlocked(res.error.message);
      else toast.error(res.error.message);
    });
  }

  return (
    <>
      <Button className={cn('h-11 px-5', className)} onClick={() => setConfirmOpen(true)}>
        <RotateCcw className="size-4" aria-hidden />
        {label}
      </Button>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent mobileSheet className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reorder the same plan</DialogTitle>
            <DialogDescription>Same plan and products, delivered to the same address.</DialogDescription>
          </DialogHeader>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-muted-foreground">You pay</dt>
              <dd className="price text-lg text-ink">{priceLabel}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Delivering to</dt>
              <dd className="text-ink">{address}</dd>
            </div>
          </dl>
          <p className="rounded-md bg-info-bg p-3 text-sm text-info">
            Demo: payment is simulated — no money moves. In the live app this opens Razorpay.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              className="h-11 px-5"
              onClick={() => setConfirmOpen(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button className="h-11 px-5" onClick={confirm} disabled={pending} aria-busy={pending}>
              {pending ? 'Placing order…' : `Pay ${priceLabel}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={blocked !== null} onOpenChange={(open) => (open ? null : setBlocked(null))}>
        <DialogContent mobileSheet className="max-w-md">
          <DialogHeader>
            <DialogTitle>A quick follow-up first</DialogTitle>
            <DialogDescription>{blocked}</DialogDescription>
          </DialogHeader>
          <p className="text-sm text-body">
            The follow-up is a short video call. Once Dr. Tyagi has reviewed your progress, you can continue
            your plan.
          </p>
          <DialogFooter>
            <Button asChild className="h-11 px-5">
              <Link href={followUpHref}>Book follow-up</Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
