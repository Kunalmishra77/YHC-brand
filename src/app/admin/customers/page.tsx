import { Search } from 'lucide-react';
import Link from 'next/link';
import { DataList } from '@/components/admin/data-list';
import { istDay } from '@/components/admin/format';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/states';
import { StatusChip } from '@/components/shared/status-chip';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { t } from '@/i18n/en';
import type { Customer, Lead } from '@/lib/domain/types';
import { formatINR } from '@/lib/money';
import { requireAdminPage } from '@/server/admin/guard';
import { isPaidOrder } from '@/server/admin/kpis';
import { db } from '@/server/demo/store';

export const metadata = { title: 'Customers' };

interface Row {
  customer: Customer;
  lead: Lead | undefined;
  orders: number;
  spendPaise: number;
}

export default async function CustomersPage({ searchParams }: PageProps<'/admin/customers'>) {
  await requireAdminPage();
  const sp = await searchParams;
  const q = typeof sp.q === 'string' ? sp.q.trim().slice(0, 80) : '';
  const s = db();
  const needle = q.toLowerCase();
  const rows: Row[] = s.customers
    .filter((c) =>
      needle ? [c.name, c.phone, c.email ?? '', c.city].join(' ').toLowerCase().includes(needle) : true,
    )
    .map((customer) => {
      const paid = s.orders.filter((o) => o.customerId === customer.id && isPaidOrder(o));
      return {
        customer,
        lead: s.leads.find((l) => l.customerId === customer.id),
        orders: paid.length,
        spendPaise: paid.reduce((sum, o) => sum + o.totalPaise, 0),
      };
    })
    .sort((a, b) => b.customer.createdAt.localeCompare(a.customer.createdAt));

  return (
    <div className="space-y-5">
      <PageHeader
        title="Customers"
        description={`${s.customers.length} customers · profiles, timelines, consents and data requests`}
      />
      <form role="search" action="/admin/customers" className="flex max-w-md gap-2">
        <label htmlFor="cust-q" className="sr-only">
          Search customers
        </label>
        <Input id="cust-q" name="q" defaultValue={q} placeholder="Name, phone, email or city" />
        <Button type="submit" variant="outline" size="icon" aria-label="Search">
          <Search className="size-4" />
        </Button>
      </form>
      <DataList<Row>
        rows={rows}
        rowKey={(r) => r.customer.id}
        caption="Customers"
        empty={
          <EmptyState title={`No customers match “${q}”`} body="Search by name, phone, email or city." />
        }
        columns={[
          {
            header: 'Name',
            cell: (r) => (
              <Link
                href={`/admin/customers/${r.customer.id}`}
                className="font-medium text-ink underline-offset-4 hover:underline"
              >
                {r.customer.name}
              </Link>
            ),
          },
          { header: 'Phone', cell: (r) => <span className="price text-sm">{r.customer.phone}</span> },
          { header: 'City', cell: (r) => r.customer.city },
          {
            header: 'Stage',
            cell: (r) =>
              r.lead ? (
                <StatusChip tone={r.lead.stage === 'lost' ? 'neutral' : 'info'}>
                  {t(`status.leadStage.${r.lead.stage}`)}
                </StatusChip>
              ) : (
                '—'
              ),
          },
          { header: 'Paid orders', align: 'right', cell: (r) => <span className="price">{r.orders}</span> },
          {
            header: 'Spend',
            align: 'right',
            cell: (r) => <span className="price font-medium text-ink">{formatINR(r.spendPaise)}</span>,
          },
          {
            header: 'Joined',
            cell: (r) => (
              <span className="text-sm text-muted-foreground">{istDay(r.customer.createdAt)}</span>
            ),
          },
        ]}
      />
    </div>
  );
}
