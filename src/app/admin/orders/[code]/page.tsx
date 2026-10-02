import { ArrowLeft, Check, FileText, Truck } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ConfirmAction } from '@/components/admin/action-kit';
import { istDateTime, istShort, ORDER_TONE } from '@/components/admin/format';
import { ActionButton, OverrideStatusDialog, RefundDialog } from '@/components/admin/order-dialogs';
import { PageHeader } from '@/components/shared/page-header';
import { StatusChip } from '@/components/shared/status-chip';
import { Button } from '@/components/ui/button';
import { t } from '@/i18n/en';
import { formatINR } from '@/lib/money';
import { cn } from '@/lib/utils';
import { requireAdminPage } from '@/server/admin/guard';
import { refundedSoFar } from '@/server/admin/orders';
import { adminState } from '@/server/admin/state';
import { PLANS } from '@/server/demo/fixtures';
import { db } from '@/server/demo/store';
import {
  advanceOrderAction,
  overrideOrderAction,
  refundOrderAction,
  regenerateInvoiceAction,
} from '../actions';

export async function generateMetadata({ params }: PageProps<'/admin/orders/[code]'>) {
  return { title: `Order ${(await params).code}` };
}

const FLOW = ['paid', 'processing', 'shipped', 'delivered'] as const;

function Card({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('rounded-lg border border-line bg-card p-4 md:p-5', className)}>
      <h2 className="mb-3 text-base font-semibold text-ink">{title}</h2>
      {children}
    </section>
  );
}

export default async function OrderDetailPage({ params }: PageProps<'/admin/orders/[code]'>) {
  const user = await requireAdminPage({ allowOps: true });
  const { code } = await params;
  const s = db();
  const order = s.orders.find((o) => o.code === decodeURIComponent(code));
  if (!order) notFound();
  const customer = s.customers.find((c) => c.id === order.customerId);
  const plan = PLANS.find((p) => p.id === order.planId);
  const refunds = adminState().refunds.filter((r) => r.target === order.code);
  const refunded = refundedSoFar(order.code);
  const audits = s.audit.filter((a) => a.target === order.code || a.target.startsWith(`${order.code}:`));
  const at = (status: string) => audits.find((a) => a.action === `order.${status}`)?.at ?? null;

  const flowIndex = (FLOW as readonly string[]).indexOf(order.status);
  const timeline = [
    { label: 'Order placed', at: order.createdAt, done: true },
    ...FLOW.map((st, i) => ({
      label: t(`status.order.${st}`),
      at: st === 'paid' ? order.paidAt : st === 'delivered' && order.deliveredOn ? null : at(st),
      note: st === 'delivered' && order.deliveredOn ? `Delivered on ${order.deliveredOn} (IST)` : undefined,
      done: flowIndex >= i || (st === 'paid' && order.paidAt !== null),
    })),
  ];
  const nextLabel =
    order.status === 'paid'
      ? 'Mark processing'
      : order.status === 'processing'
        ? 'Mark shipped'
        : order.status === 'shipped'
          ? 'Mark delivered'
          : null;

  return (
    <div className="space-y-5">
      <Link
        href="/admin/orders"
        className="inline-flex min-h-9 items-center gap-1.5 text-sm text-brand hover:underline"
      >
        <ArrowLeft className="size-4" aria-hidden />
        All orders
      </Link>
      <PageHeader
        title={`Order ${order.code}`}
        description={
          <span className="inline-flex flex-wrap items-center gap-2">
            <StatusChip tone={ORDER_TONE[order.status]}>{t(`status.order.${order.status}`)}</StatusChip>
            <span>Placed {istDateTime(order.createdAt)}</span>
          </span>
        }
        actions={
          <>
            {nextLabel ? (
              <ConfirmAction
                action={advanceOrderAction.bind(null, order.id)}
                label={nextLabel}
                title={`${nextLabel} · ${order.code}?`}
                description={<p>The customer is notified on WhatsApp where a template applies.</p>}
                confirmLabel={nextLabel}
                variant="default"
              />
            ) : null}
            {order.paymentId ? (
              <RefundDialog
                action={refundOrderAction.bind(null, order.id)}
                target={order.code}
                remainingPaise={order.totalPaise - refunded}
              />
            ) : null}
            {order.paymentId ? (
              <ActionButton
                action={regenerateInvoiceAction.bind(null, order.id)}
                label="Regenerate invoice"
                icon={<FileText className="size-4" aria-hidden />}
              />
            ) : null}
            {order.status !== 'pending_payment' && order.status !== 'rto' && order.status !== 'cancelled' ? (
              <OverrideStatusDialog action={overrideOrderAction.bind(null, order.id)} code={order.code} />
            ) : null}
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card title="Items">
            <ul className="divide-y divide-line">
              {order.lines.map((l) => (
                <li key={l.label} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <span className="text-ink">
                    {l.label} <span className="text-muted-foreground">× {l.qty}</span>
                  </span>
                  <span className="price text-ink">{formatINR(l.amountPaise)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-3 space-y-1.5 border-t border-line pt-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd className="price">{formatINR(order.subtotalPaise)}</dd>
              </div>
              {order.creditPaise > 0 ? (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Consultation credit</dt>
                  <dd className="price text-success">− {formatINR(order.creditPaise)}</dd>
                </div>
              ) : null}
              <div className="flex justify-between text-base font-semibold text-ink">
                <dt>Total paid</dt>
                <dd className="price">{order.paymentId ? formatINR(order.totalPaise) : 'Not paid yet'}</dd>
              </div>
              {refunded > 0 ? (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Refunded (demo)</dt>
                  <dd className="price text-danger">− {formatINR(refunded)}</dd>
                </div>
              ) : null}
            </dl>
            <p className="mt-3 text-[12px] text-muted-foreground">
              {t('common.inclGst')}
              {plan ? ` · ${plan.name} · ${plan.months * 30} days of supply` : ''} · source: {order.source}
            </p>
          </Card>

          <Card title="Status timeline">
            <ol className="space-y-0">
              {timeline.map((step, i) => (
                <li key={step.label} className="relative flex gap-3 pb-4 last:pb-0">
                  {i < timeline.length - 1 ? (
                    <span
                      className="absolute top-6 left-[11px] h-[calc(100%-1.25rem)] w-px bg-line"
                      aria-hidden
                    />
                  ) : null}
                  <span
                    className={cn(
                      'z-10 mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border',
                      step.done
                        ? 'border-obsidian bg-obsidian text-on-dark'
                        : 'border-line bg-card text-steel',
                    )}
                    aria-hidden
                  >
                    {step.done ? (
                      <Check className="size-3.5" />
                    ) : (
                      <span className="size-1.5 rounded-full bg-steel" />
                    )}
                  </span>
                  <div>
                    <p
                      className={cn('text-sm font-medium', step.done ? 'text-ink' : 'text-muted-foreground')}
                    >
                      {step.label}
                      <span className="sr-only">{step.done ? ' — done' : ' — not yet'}</span>
                    </p>
                    <p className="text-[13px] text-muted-foreground">
                      {'note' in step && step.note
                        ? step.note
                        : step.at
                          ? istShort(step.at)
                          : step.done
                            ? 'Done'
                            : 'Not yet'}
                    </p>
                  </div>
                </li>
              ))}
              {order.status === 'rto' || order.status === 'cancelled' ? (
                <li className="mt-3">
                  <StatusChip tone={ORDER_TONE[order.status]}>{t(`status.order.${order.status}`)}</StatusChip>
                </li>
              ) : null}
            </ol>
          </Card>

          {refunds.length > 0 ? (
            <Card title="Refunds (demo)">
              <ul className="divide-y divide-line text-sm">
                {refunds.map((r) => (
                  <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                    <span>
                      <span className="text-ink">
                        {r.full ? 'Full' : 'Partial'} · {r.reason}
                      </span>
                      <span className="block text-[12px] text-muted-foreground">
                        {r.actor} · {istShort(r.at)}
                      </span>
                    </span>
                    <span className="price font-medium text-ink">{formatINR(r.amountPaise)}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}
        </div>

        <div className="space-y-4">
          <Card title="Customer">
            {customer ? (
              <dl className="space-y-1.5 text-sm">
                <dd className="font-medium text-ink">{customer.name}</dd>
                <dd className="price">{customer.phone}</dd>
                {customer.email ? <dd>{customer.email}</dd> : null}
                <dd className="text-muted-foreground">{order.address}</dd>
              </dl>
            ) : (
              <p className="text-sm text-muted-foreground">Customer record not found.</p>
            )}
            {customer && user.role === 'admin' ? (
              <Button asChild variant="link" className="mt-2 h-auto p-0">
                <Link href={`/admin/customers/${customer.id}`}>Open customer</Link>
              </Button>
            ) : null}
          </Card>
          <Card title="Payment">
            <dl className="space-y-1.5 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Payment ID</dt>
                <dd className="price truncate text-ink">{order.paymentId ?? '—'}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Paid at</dt>
                <dd className="text-ink">{order.paidAt ? istShort(order.paidAt) : '—'}</dd>
              </div>
            </dl>
          </Card>
          <Card title="Shipment">
            {order.awb ? (
              <dl className="space-y-1.5 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Courier</dt>
                  <dd className="text-ink">{order.courier}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">AWB</dt>
                  <dd className="price text-ink">{order.awb}</dd>
                </div>
                {order.planEndOn ? (
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Plan ends</dt>
                    <dd className="text-ink">{order.planEndOn}</dd>
                  </div>
                ) : null}
              </dl>
            ) : (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Truck className="size-4 text-steel" aria-hidden />
                No shipment yet — the AWB appears when the order is marked shipped.
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
