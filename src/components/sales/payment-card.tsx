import { IndianRupee } from 'lucide-react';
import { StatusChip, type ChipTone } from '@/components/shared/status-chip';
import type { ConsultPaymentBlock, OrderPaymentBlock } from '@/server/sales/views';

/** FR-M7-5 — "₹500 payment: PAID" · payment ID · appointment ID · slot · booking status; same for plan orders. */
export function PaymentCard({
  consults,
  orders,
}: {
  consults: ConsultPaymentBlock[];
  orders: OrderPaymentBlock[];
}) {
  return (
    <section aria-labelledby="pay-h" className="rounded-xl bg-card shadow-card ring-1 ring-line/80">
      <header className="flex items-center gap-2 border-b border-line px-4 py-3">
        <IndianRupee className="size-4 text-steel" aria-hidden />
        <h2 id="pay-h" className="font-semibold text-ink">
          Payments
        </h2>
      </header>
      {consults.length === 0 && orders.length === 0 ? (
        <p className="px-4 py-5 text-sm text-muted-foreground">
          No booking or order yet. Send the consultation link or book on behalf.
        </p>
      ) : (
        <ul className="divide-y divide-line">
          {consults.map((c) => (
            <li key={c.appointmentCode} className="px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium text-ink">
                  {c.feeLabel === 'No fee' ? c.kindLabel : `${c.feeLabel} payment: `}
                  {c.feeLabel === 'No fee' ? null : (
                    <span
                      className={
                        c.paid ? 'text-success' : c.holdUntilLabel ? 'text-warning' : 'text-muted-foreground'
                      }
                    >
                      {c.paid ? 'PAID' : c.holdUntilLabel ? 'Pending' : 'Not paid'}
                    </span>
                  )}
                </p>
                <StatusChip tone={consultTone(c)}>
                  {c.holdUntilLabel ? `Pending · slot held until ${c.holdUntilLabel}` : c.statusLabel}
                </StatusChip>
              </div>
              <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-[13px]">
                <Row label="Appointment ID" value={c.appointmentCode} />
                <Row label="Slot" value={c.slotLabel} />
                <Row label="Payment ID" value={c.paymentId ?? '—'} mono />
                <Row label="Type" value={c.kindLabel} />
              </dl>
            </li>
          ))}
          {orders.map((o) => (
            <li key={o.code} className="px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium text-ink">
                  {o.label} · <span className="price">{o.amountLabel}</span>:{' '}
                  <span className={o.paid ? 'text-success' : 'text-warning'}>
                    {o.paid ? 'PAID' : 'Not paid'}
                  </span>
                </p>
                <StatusChip tone={orderTone(o)}>{o.statusLabel}</StatusChip>
              </div>
              <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-[13px]">
                <Row label="Order" value={o.code} />
                <Row label="Payment ID" value={o.paymentId ?? '—'} mono />
                {o.paidAtLabel ? <Row label="Paid" value={o.paidAtLabel} /> : null}
              </dl>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={mono ? 'price break-all text-ink' : 'text-ink'}>{value}</dd>
    </>
  );
}

function consultTone(c: ConsultPaymentBlock): ChipTone {
  if (c.holdUntilLabel) return 'warning';
  switch (c.status) {
    case 'booked':
    case 'completed':
      return 'success';
    case 'no_show':
    case 'cancelled':
      return 'danger';
    default:
      return 'neutral';
  }
}

function orderTone(o: OrderPaymentBlock): ChipTone {
  switch (o.status) {
    case 'pending_payment':
      return 'warning';
    case 'delivered':
    case 'paid':
      return 'success';
    case 'processing':
    case 'shipped':
      return 'info';
    case 'cancelled':
    case 'refunded':
    case 'partially_refunded':
    case 'rto':
      return 'danger';
  }
}
