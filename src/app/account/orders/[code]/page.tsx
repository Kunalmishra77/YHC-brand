import { Check, ChevronLeft, FileText, Truck } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { OrderChip } from '@/components/account/chips';
import { formatDay, formatWhen } from '@/components/account/format';
import { ACCOUNT_LINKS } from '@/components/account/links';
import { ReorderButton } from '@/components/account/reorder-button';
import { Button } from '@/components/ui/button';
import { t } from '@/i18n/en';
import type { Order, OrderStatus } from '@/lib/domain/types';
import { formatINR } from '@/lib/money';
import { cn } from '@/lib/utils';
import { findCustomerOrder } from '@/server/account/queries';
import { getPlan } from '@/server/catalog';
import { getCurrentCustomer } from '@/server/session';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Order' };

const FLOW: { status: OrderStatus; label: string; hint: string }[] = [
  { status: 'paid', label: 'Paid', hint: 'Payment received' },
  { status: 'processing', label: 'Packing', hint: 'Being packed at our pharmacy partner' },
  { status: 'shipped', label: 'Shipped', hint: 'Handed to the courier' },
  { status: 'delivered', label: 'Delivered', hint: 'Your plan starts on delivery' },
];

const REORDERABLE: OrderStatus[] = ['paid', 'processing', 'shipped', 'delivered'];

function stepDate(order: Order, status: OrderStatus): string | null {
  if (status === 'paid' && order.paidAt) return formatWhen(order.paidAt);
  if (status === 'delivered' && order.deliveredOn) return formatDay(order.deliveredOn);
  return null;
}

export default async function OrderPage({ params }: PageProps<'/account/orders/[code]'>) {
  const { code } = await params;
  const customer = await getCurrentCustomer();
  if (!customer) notFound();
  const order = findCustomerOrder(customer.id, code);
  if (!order || order.status === 'pending_payment') notFound();
  const plan = order.planId ? getPlan(order.planId) : null;
  const reached = FLOW.findIndex((s) => s.status === order.status);
  const offFlow = reached < 0;

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/account/orders"
        className="inline-flex min-h-11 items-center gap-1 text-sm font-medium text-brand hover:underline"
      >
        <ChevronLeft className="size-4" aria-hidden />
        All orders
      </Link>

      <header className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Order {order.code}</p>
          <h1 className="display mt-2 text-[clamp(2rem,1.6rem+1.6vw,2.75rem)] leading-[1.05]">
            {order.lines.map((l) => l.label).join(', ')}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Ordered {formatWhen(order.createdAt)}</p>
        </div>
        <OrderChip status={order.status} />
      </header>

      {/* Timeline */}
      <section
        aria-labelledby="status-heading"
        className="mt-6 rounded-xl border border-line bg-card p-5 md:p-6"
      >
        <h2 id="status-heading" className="sr-only">
          Delivery status
        </h2>
        {offFlow ? (
          <p className="text-sm text-body">
            This order is{' '}
            <strong className="text-ink">{t(`status.order.${order.status}`).toLowerCase()}</strong>. If you
            have questions about it, message the care team.
          </p>
        ) : (
          <ol className="relative grid gap-5 sm:grid-cols-4 sm:gap-3">
            {FLOW.map((step, i) => {
              const done = i <= reached;
              const current = i === reached;
              const when = stepDate(order, step.status);
              return (
                <li key={step.status} className="relative flex gap-3 sm:flex-col sm:gap-2">
                  {i < FLOW.length - 1 ? (
                    <span
                      aria-hidden
                      className={cn(
                        'absolute top-8 left-[15px] h-[calc(100%-12px)] w-0.5 sm:top-[15px] sm:left-8 sm:h-0.5 sm:w-[calc(100%-20px)]',
                        i < reached ? 'bg-obsidian' : 'bg-line',
                      )}
                    />
                  ) : null}
                  <span
                    className={cn(
                      'relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border text-[13px] font-semibold',
                      done
                        ? 'border-obsidian bg-obsidian text-on-dark'
                        : 'border-line bg-card text-muted-foreground',
                    )}
                  >
                    {done ? <Check className="size-4" aria-hidden /> : i + 1}
                  </span>
                  <div>
                    <p className={cn('text-sm font-semibold', done ? 'text-ink' : 'text-muted-foreground')}>
                      {step.label}
                      <span className="sr-only">{done ? ' — done' : ' — not yet'}</span>
                      {current ? <span className="ml-1.5 font-normal text-brand">· now</span> : null}
                    </p>
                    <p className="text-[13px] text-muted-foreground">{when ?? step.hint}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        )}

        {order.awb ? (
          <div className="mt-6 flex flex-col gap-2 rounded-lg bg-mist p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <Truck className="mt-0.5 size-5 text-graphite" aria-hidden />
              <div>
                <p className="text-sm font-medium text-ink">{order.courier}</p>
                <p className="price text-sm text-ink">AWB {order.awb}</p>
              </div>
            </div>
            {/* TODO(phase-09): Shiprocket tracking URL from the shipment record. */}
            <p className="text-[13px] text-ink">Live tracking link arrives on WhatsApp when it ships.</p>
          </div>
        ) : !offFlow ? (
          <p className="mt-6 text-[13px] text-muted-foreground">
            Courier and tracking number appear here once your order ships. We will also send them on WhatsApp.
          </p>
        ) : null}
      </section>

      {/* Plan + reorder */}
      {plan && REORDERABLE.includes(order.status) ? (
        <section className="mt-6 flex flex-col gap-4 rounded-xl border border-line bg-card p-5 sm:flex-row sm:items-center sm:justify-between md:p-6">
          <div>
            <p className="font-medium text-ink">Continue the same plan</p>
            <p className="mt-1 text-sm text-body">
              {plan.name} · {formatINR(plan.pricePaise)}
              {order.planEndOn ? ` · current plan ends ${formatDay(order.planEndOn, 'd MMM yyyy')}` : ''}
            </p>
          </div>
          <ReorderButton
            orderCode={order.code}
            priceLabel={formatINR(plan.pricePaise)}
            address={order.address}
            followUpHref={ACCOUNT_LINKS.bookFollowUp}
          />
        </section>
      ) : null}

      {/* Payment + address */}
      <section className="mt-6 grid gap-6 rounded-xl border border-line bg-card p-5 md:grid-cols-2 md:p-6">
        <div>
          <h2 className="text-sm font-semibold text-ink">Payment</h2>
          <dl className="mt-3 space-y-2 text-sm">
            {order.lines.map((l) => (
              <div key={l.label} className="flex justify-between gap-3">
                <dt className="text-body">
                  {l.label}
                  {l.qty > 1 ? ` × ${l.qty}` : ''}
                </dt>
                <dd className="price text-ink">{formatINR(l.amountPaise)}</dd>
              </div>
            ))}
            {order.creditPaise > 0 ? (
              <div className="flex justify-between gap-3">
                <dt className="text-body">Consultation fee credit</dt>
                <dd className="price text-success">− {formatINR(order.creditPaise)}</dd>
              </div>
            ) : null}
            <div className="flex justify-between gap-3 border-t border-line pt-2">
              <dt className="font-medium text-ink">Total paid</dt>
              <dd className="price text-ink">{formatINR(order.totalPaise)}</dd>
            </div>
          </dl>
          <p className="mt-2 text-[13px] text-muted-foreground">{t('common.inclGst')}</p>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-ink">Delivery address</h2>
          <p className="mt-3 text-sm text-body">{order.address}</p>
          <Button asChild variant="outline" className="mt-5 h-11 px-5">
            <Link href={`/account/orders/${order.code}/invoice`}>
              <FileText className="size-4" aria-hidden />
              View invoice
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
