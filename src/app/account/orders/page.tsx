import { ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { OrderChip } from '@/components/account/chips';
import { formatIstDay } from '@/components/account/format';
import { ACCOUNT_LINKS } from '@/components/account/links';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/states';
import { Button } from '@/components/ui/button';
import { formatINR } from '@/lib/money';
import { customerOrders } from '@/server/account/queries';
import { getCurrentCustomer } from '@/server/session';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Orders' };

export default async function OrdersPage() {
  const customer = await getCurrentCustomer();
  if (!customer) return null;
  const orders = customerOrders(customer.id);

  return (
    <div>
      <PageHeader title="Orders" description="Track deliveries, view invoices and reorder your plan." />
      {orders.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="No orders yet"
          body="Your plan is recommended by Dr. Tyagi after your consultation. Care products are available in the shop any time."
          action={
            <Button asChild className="h-11 px-5">
              <Link href="/products">Browse products</Link>
            </Button>
          }
        />
      ) : (
        <ul className="space-y-3">
          {orders.map((o) => (
            <li key={o.id}>
              <Link
                href={ACCOUNT_LINKS.order(o.code)}
                className="flex flex-col gap-3 rounded-2xl bg-card p-5 shadow-card ring-1 ring-line/80 transition-colors hover:border-steel sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-medium text-ink">{o.lines.map((l) => l.label).join(', ')}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {o.code} · ordered {formatIstDay(o.createdAt)}
                    {o.source === 'reorder' ? ' · reorder' : ''}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-4 sm:justify-end">
                  <OrderChip status={o.status} />
                  <span className="price text-ink">{formatINR(o.totalPaise)}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
