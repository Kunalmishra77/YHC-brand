import { PackageCheck, Search } from 'lucide-react';
import Link from 'next/link';
import { ConfirmAction } from '@/components/admin/action-kit';
import { DataList } from '@/components/admin/data-list';
import { istShort, ORDER_TONE } from '@/components/admin/format';
import { CsvButton } from '@/components/admin/order-dialogs';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/states';
import { StatusChip } from '@/components/shared/status-chip';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { t } from '@/i18n/en';
import type { OrderStatus } from '@/lib/domain/types';
import { formatINR } from '@/lib/money';
import { cn } from '@/lib/utils';
import { requireAdminPage } from '@/server/admin/guard';
import { listOrders, ORDER_TABS, parseOrderTab, pickList, type OrderRow } from '@/server/admin/queries';
import { advanceOrderAction } from './actions';

export const metadata = { title: 'Orders' };

const NEXT_STEP: Partial<Record<OrderStatus, string>> = {
  paid: 'Mark processing',
  processing: 'Mark shipped',
  shipped: 'Mark delivered',
};

export default async function OrdersPage({ searchParams }: PageProps<'/admin/orders'>) {
  const user = await requireAdminPage({ allowOps: true });
  const sp = await searchParams;
  const tab = parseOrderTab(sp.tab);
  const q = typeof sp.q === 'string' ? sp.q.slice(0, 80) : '';
  const { rows, counts } = listOrders(tab, q);
  const picks = tab === 'to_pack' ? pickList() : [];

  const csv: string[][] = [
    [
      'Order',
      'Customer',
      'Phone',
      'Status',
      'Items',
      'Subtotal (₹)',
      'Credit (₹)',
      'Total (₹)',
      'Payment ID',
      'Placed (UTC)',
      'AWB',
    ],
    ...rows.map(({ order: o, customer }) => [
      o.code,
      customer?.name ?? '',
      customer?.phone ?? '',
      t(`status.order.${o.status}`),
      o.lines.map((l) => `${l.label} × ${l.qty}`).join('; '),
      (o.subtotalPaise / 100).toFixed(2),
      (o.creditPaise / 100).toFixed(2),
      (o.totalPaise / 100).toFixed(2),
      o.paymentId ?? '',
      o.createdAt,
      o.awb ?? '',
    ]),
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Orders"
        description={
          user.role === 'ops'
            ? 'Pack, ship and track orders. Exceptions need a reason and are audited.'
            : 'Search orders, move them through fulfilment, refund and regenerate invoices.'
        }
        actions={<CsvButton rows={csv} filename={`yhc-orders-${tab}.csv`} dataset="orders" />}
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <nav aria-label="Order status" className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1">
          {ORDER_TABS.map((tb) => (
            <Link
              key={tb.key}
              href={`/admin/orders?tab=${tb.key}${q ? `&q=${encodeURIComponent(q)}` : ''}`}
              aria-current={tb.key === tab ? 'page' : undefined}
              className={cn(
                'inline-flex min-h-9 shrink-0 items-center gap-2 rounded-md border px-3 text-sm font-medium transition-colors',
                tb.key === tab
                  ? 'border-obsidian bg-obsidian text-on-dark'
                  : 'border-line bg-card text-body hover:bg-mist',
              )}
            >
              {tb.label}
              <span
                className={cn(
                  'price rounded-full px-1.5 text-[12px]',
                  tb.key === tab ? 'bg-graphite text-on-dark' : 'bg-mist text-ink',
                )}
              >
                {counts[tb.key]}
              </span>
            </Link>
          ))}
        </nav>
        <form role="search" className="flex w-full gap-2 lg:w-80" action="/admin/orders">
          <input type="hidden" name="tab" value={tab} />
          <label htmlFor="order-q" className="sr-only">
            Search orders
          </label>
          <Input id="order-q" name="q" defaultValue={q} placeholder="Order, customer, phone, AWB" />
          <Button type="submit" variant="outline" size="icon" aria-label="Search">
            <Search className="size-4" />
          </Button>
        </form>
      </div>

      {tab === 'to_pack' && picks.length > 0 ? (
        <section
          aria-labelledby="pick-title"
          className="rounded-xl bg-card p-4 shadow-card ring-1 ring-line/80"
        >
          <div className="mb-3 flex items-center gap-2">
            <PackageCheck className="size-4 text-steel" aria-hidden />
            <h2 id="pick-title" className="text-base font-semibold text-ink">
              Pick list by product
            </h2>
            <span className="text-[13px] text-muted-foreground">· {counts.to_pack} orders to pack</span>
          </div>
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {picks.map((p) => (
              <li
                key={p.productId}
                className="flex items-start justify-between gap-3 rounded-md bg-mist/60 px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink">{p.name}</p>
                  <p className="truncate text-[12px] text-muted-foreground">{p.orders.join(', ')}</p>
                </div>
                <p className="price shrink-0 text-lg font-semibold text-ink">× {p.units}</p>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[12px] text-muted-foreground">
            Units = plan months × 30 days ÷ product days of supply.
          </p>
        </section>
      ) : null}

      <DataList<OrderRow>
        rows={rows}
        rowKey={(r) => r.order.id}
        caption="Orders"
        empty={
          <EmptyState
            title={q ? `No orders match “${q}”` : 'No orders here'}
            body={
              tab === 'to_pack' ? 'Everything paid has been packed.' : 'Try another tab or clear the search.'
            }
          />
        }
        columns={[
          {
            header: 'Order',
            cell: ({ order }) => (
              <Link
                href={`/admin/orders/${order.code}`}
                className="font-medium text-ink underline-offset-4 hover:underline"
              >
                {order.code}
              </Link>
            ),
          },
          {
            header: 'Customer',
            cell: ({ customer }) => (
              <span>
                <span className="block text-ink">{customer?.name ?? '—'}</span>
                <span className="block text-[12px] text-muted-foreground">{customer?.city}</span>
              </span>
            ),
          },
          {
            header: 'Items',
            cell: ({ order }) => (
              <span className="text-sm">{order.lines.map((l) => l.label).join(', ')}</span>
            ),
          },
          {
            header: 'Total',
            align: 'right',
            cell: ({ order }) => (
              <span className="price font-medium text-ink">{formatINR(order.totalPaise)}</span>
            ),
          },
          {
            header: 'Status',
            cell: ({ order }) => (
              <StatusChip tone={ORDER_TONE[order.status]}>{t(`status.order.${order.status}`)}</StatusChip>
            ),
          },
          {
            header: 'Placed',
            cell: ({ order }) => (
              <span className="text-sm text-muted-foreground">{istShort(order.createdAt)}</span>
            ),
          },
        ]}
        actions={({ order, customer }) => {
          const step = NEXT_STEP[order.status];
          return step ? (
            <ConfirmAction
              action={advanceOrderAction.bind(null, order.id)}
              label={step}
              title={`${step} · ${order.code}?`}
              description={
                <>
                  <p>
                    {customer?.name ?? 'Customer'} · {formatINR(order.totalPaise)}
                  </p>
                  {order.status === 'processing' ? (
                    <p>
                      A demo courier and AWB are assigned and the customer gets the “order shipped” WhatsApp.
                    </p>
                  ) : null}
                  {order.status === 'shipped' ? (
                    <p>Delivery starts the plan clock, care check-ins and refill reminders.</p>
                  ) : null}
                </>
              }
              confirmLabel={step}
              variant={order.status === 'paid' ? 'default' : 'outline'}
            />
          ) : (
            <Button asChild variant="ghost" size="sm" className="min-h-9">
              <Link href={`/admin/orders/${order.code}`}>View</Link>
            </Button>
          );
        }}
      />
    </div>
  );
}
