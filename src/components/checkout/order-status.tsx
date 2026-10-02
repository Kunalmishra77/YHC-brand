'use client';

import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { orderStatusAction } from '@/app/(site)/order/actions';
import { StatusChip, type ChipTone } from '@/components/shared/status-chip';
import type { OrderStatus } from '@/lib/domain/types';

const LABEL: Record<OrderStatus, { tone: ChipTone; text: string }> = {
  pending_payment: { tone: 'pending', text: 'Awaiting payment' },
  paid: { tone: 'success', text: 'Paid · being prepared' },
  processing: { tone: 'success', text: 'Paid · being packed' },
  shipped: { tone: 'info', text: 'Shipped · on the way' },
  delivered: { tone: 'success', text: 'Delivered' },
  cancelled: { tone: 'neutral', text: 'Cancelled' },
  refunded: { tone: 'neutral', text: 'Refunded' },
  partially_refunded: { tone: 'neutral', text: 'Partly refunded' },
  rto: { tone: 'warning', text: 'Returned to us' },
};

/**
 * "Confirming payment…" until the server says the order is paid (FR-M2-6): polls up to 60 s, then
 * reassures that we'll message on WhatsApp. Renders `children` (the paid details) once confirmed.
 */
export function OrderStatusGate({
  code,
  token,
  initialStatus,
  justPaid,
  children,
}: {
  code: string;
  token?: string;
  initialStatus: OrderStatus;
  justPaid: boolean;
  children: React.ReactNode;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [phase, setPhase] = useState<'confirming' | 'slow' | 'done'>(
    justPaid || initialStatus === 'pending_payment' ? 'confirming' : 'done',
  );

  useEffect(() => {
    if (phase !== 'confirming') return;
    let stopped = false;
    const started = Date.now();
    let timer = 0;
    const poll = async () => {
      const res = await orderStatusAction({ code, token });
      if (stopped) return;
      if (res.ok && res.data.status !== 'pending_payment') {
        setStatus(res.data.status);
        setPhase('done');
        return;
      }
      if (Date.now() - started > 60_000) {
        setPhase('slow');
        return;
      }
      timer = window.setTimeout(poll, 1500);
    };
    timer = window.setTimeout(poll, 900);
    return () => {
      stopped = true;
      window.clearTimeout(timer);
    };
  }, [phase, code, token]);

  if (phase !== 'done') {
    return (
      <div aria-live="polite" aria-busy={phase === 'confirming'} className="py-6">
        <p className="eyebrow">Order {code}</p>
        <h1 className="display mt-2 text-[32px] md:text-[44px]">Confirming payment…</h1>
        {phase === 'confirming' ? (
          <div className="mt-5 flex items-center gap-3 text-body">
            <Loader2 className="size-5 animate-spin text-brand motion-reduce:animate-none" aria-hidden />
            <p>We&apos;re waiting for our server to confirm your payment. Please keep this page open.</p>
          </div>
        ) : (
          <p className="mt-5 max-w-xl text-body">
            This is taking longer than usual. If money left your account, your order is safe — we&apos;ll
            message you on WhatsApp as soon as it&apos;s confirmed. You won&apos;t be charged twice.
          </p>
        )}
      </div>
    );
  }

  const chip = LABEL[status];
  return (
    <div>
      <StatusChip tone={chip.tone}>{chip.text}</StatusChip>
      {children}
    </div>
  );
}
