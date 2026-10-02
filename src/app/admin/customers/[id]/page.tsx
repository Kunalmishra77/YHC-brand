import { ArrowLeft, CalendarClock, MessageSquare, Package, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ConfirmAction } from '@/components/admin/action-kit';
import { MergeDialog } from '@/components/admin/customer-dialogs';
import { istDay, istShort } from '@/components/admin/format';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/states';
import { StatusChip } from '@/components/shared/status-chip';
import { t } from '@/i18n/en';
import { formatINR } from '@/lib/money';
import { cn } from '@/lib/utils';
import { requireAdminPage } from '@/server/admin/guard';
import { isPaidOrder } from '@/server/admin/kpis';
import { customerTimeline, type TimelineItem } from '@/server/admin/queries';
import { adminState } from '@/server/admin/state';
import { STAFF } from '@/server/demo/fixtures';
import { db } from '@/server/demo/store';
import { advanceDataRequestAction, mergeCustomerAction } from '../actions';

export async function generateMetadata({ params }: PageProps<'/admin/customers/[id]'>) {
  const id = decodeURIComponent((await params).id);
  const c = db().customers.find((x) => x.id === id);
  return { title: c?.name ?? 'Customer' };
}

const KIND_ICON: Record<TimelineItem['kind'], React.ReactNode> = {
  order: <Package className="size-4" />,
  appointment: <CalendarClock className="size-4" />,
  message: <MessageSquare className="size-4" />,
  refund: <RotateCcw className="size-4" />,
};

function Card({
  title,
  children,
  className,
  aside,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
  aside?: React.ReactNode;
}) {
  return (
    <section className={cn('rounded-lg border border-line bg-card p-4 md:p-5', className)}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-ink">{title}</h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

export default async function CustomerPage({ params }: PageProps<'/admin/customers/[id]'>) {
  await requireAdminPage();
  const id = decodeURIComponent((await params).id);
  const s = db();
  const customer = s.customers.find((c) => c.id === id);
  if (!customer) notFound();
  const lead = s.leads.find((l) => l.customerId === id);
  const paid = s.orders.filter((o) => o.customerId === id && isPaidOrder(o));
  const appts = s.appointments.filter((a) => a.customerId === id);
  const timeline = customerTimeline(id);
  const requests = adminState().dataRequests.filter((r) => r.customerId === id);
  const merges = adminState().merged.filter((m) => m.intoId === id);
  const owner = STAFF.find((u) => u.id === lead?.ownerId);

  const firstName = customer.name.split(' ')[0]?.toLowerCase() ?? '';
  const candidates = s.customers
    .filter((c) => c.id !== id)
    .map((c) => ({
      id: c.id,
      label: `${c.name} · ${c.phone}`,
      likely: c.name.toLowerCase().startsWith(firstName) || c.phone.slice(-6) === customer.phone.slice(-6),
    }))
    .sort((a, b) => Number(b.likely) - Number(a.likely));

  // Demo consents derived from activity. TODO(phase-03): `consents` rows with policy version (FR-M14-1).
  const consents: { label: string; given: boolean; at: string | null }[] = [
    { label: 'Privacy policy & terms', given: true, at: customer.createdAt },
    { label: 'Telemedicine consent', given: appts.length > 0, at: appts[0]?.startsAt ?? null },
    { label: 'WhatsApp — service & order updates', given: true, at: customer.createdAt },
    {
      label: 'WhatsApp — offers (marketing)',
      given: lead?.source === 'meta_ads' || lead?.source === 'whatsapp',
      at: customer.createdAt,
    },
    { label: 'Clinical photo use', given: appts.some((a) => a.photosDone), at: null },
    { label: 'Marketing photo use', given: false, at: null },
    {
      label: 'Guarantee terms',
      given: paid.some((o) => o.planId),
      at: paid.find((o) => o.planId)?.paidAt ?? null,
    },
    { label: 'Review publication', given: false, at: null },
  ];

  return (
    <div className="space-y-5">
      <Link
        href="/admin/customers"
        className="inline-flex min-h-9 items-center gap-1.5 text-sm text-brand hover:underline"
      >
        <ArrowLeft className="size-4" aria-hidden />
        All customers
      </Link>
      <PageHeader
        title={customer.name}
        description={
          <span className="inline-flex flex-wrap items-center gap-2">
            {lead ? <StatusChip tone="info">{t(`status.leadStage.${lead.stage}`)}</StatusChip> : null}
            <span>Customer since {istDay(customer.createdAt)}</span>
          </span>
        }
        actions={
          <MergeDialog
            action={mergeCustomerAction.bind(null, customer.id)}
            keepName={customer.name}
            candidates={candidates}
          />
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4">
          <Card title="Profile">
            <dl className="grid grid-cols-[7rem_1fr] gap-y-1.5 text-sm">
              <dt className="text-muted-foreground">Phone</dt>
              <dd className="price text-ink">{customer.phone}</dd>
              <dt className="text-muted-foreground">Email</dt>
              <dd className="break-all text-ink">{customer.email ?? '—'}</dd>
              <dt className="text-muted-foreground">City</dt>
              <dd className="text-ink">{customer.city}</dd>
              <dt className="text-muted-foreground">Age · gender</dt>
              <dd className="text-ink capitalize">
                {customer.age} · {customer.gender}
              </dd>
              <dt className="text-muted-foreground">Source</dt>
              <dd className="text-ink">
                {lead ? `${lead.source.replace('_', ' ')}${lead.campaign ? ` · ${lead.campaign}` : ''}` : '—'}
              </dd>
              <dt className="text-muted-foreground">Sales owner</dt>
              <dd className="text-ink">{owner?.name ?? '—'}</dd>
              <dt className="text-muted-foreground">Paid orders</dt>
              <dd className="price text-ink">
                {paid.length} · {formatINR(paid.reduce((sum, o) => sum + o.totalPaise, 0))}
              </dd>
            </dl>
            {merges.length ? (
              <p className="mt-3 text-[13px] text-muted-foreground">
                {merges.length} duplicate merge{merges.length > 1 ? 's' : ''} recorded (demo).
              </p>
            ) : null}
          </Card>

          <Card title="Consents">
            <ul className="space-y-2">
              {consents.map((c) => (
                <li key={c.label} className="flex items-start justify-between gap-3 text-sm">
                  <span className="text-body">{c.label}</span>
                  <StatusChip tone={c.given ? 'success' : 'neutral'}>
                    {c.given ? 'Given' : 'Not given'}
                  </StatusChip>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[12px] text-muted-foreground">
              Demo: derived from activity. Production stores each consent with its policy version and allows
              withdrawal.
            </p>
          </Card>

          <Card title="Data requests">
            {requests.length ? (
              <ul className="space-y-3">
                {requests.map((r) => (
                  <li key={r.id} className="space-y-1.5 text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-ink capitalize">{r.kind}</span>
                      <StatusChip
                        tone={r.status === 'closed' ? 'success' : r.status === 'open' ? 'warning' : 'info'}
                      >
                        {r.status === 'in_progress' ? 'In progress' : r.status === 'open' ? 'Open' : 'Closed'}
                      </StatusChip>
                    </div>
                    <p className="text-[13px] text-muted-foreground">
                      Opened {istDay(r.openedAt)} · due {istDay(r.dueAt)}
                    </p>
                    {r.status !== 'closed' ? (
                      <ConfirmAction
                        action={advanceDataRequestAction.bind(null, { requestId: r.id })}
                        label={r.status === 'open' ? 'Start work' : 'Close request'}
                        title={r.status === 'open' ? 'Start this request?' : 'Close this request?'}
                        description={
                          <p>
                            {r.kind === 'erasure'
                              ? 'Erasure respects medical-record retention — clinical records are anonymised, not deleted.'
                              : 'The change is audited.'}
                          </p>
                        }
                      />
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                title="No data requests"
                body="Access, correction, erasure and grievance requests appear here."
              />
            )}
          </Card>
        </div>

        <Card title="Timeline" className="lg:col-span-2">
          {timeline.length ? (
            <ol className="space-y-0">
              {timeline.map((item, i) => (
                <li key={`${item.kind}-${item.at}-${i}`} className="relative flex gap-3 pb-4 last:pb-0">
                  {i < timeline.length - 1 ? (
                    <span className="absolute top-8 left-4 h-[calc(100%-2rem)] w-px bg-line" aria-hidden />
                  ) : null}
                  <span
                    className="z-10 flex size-8 shrink-0 items-center justify-center rounded-full bg-mist text-ink"
                    aria-hidden
                  >
                    {KIND_ICON[item.kind]}
                  </span>
                  <div className="min-w-0 pt-1">
                    <p className="text-sm font-medium text-ink">
                      {item.href ? (
                        <Link href={item.href} className="underline-offset-4 hover:underline">
                          {item.title}
                        </Link>
                      ) : (
                        item.title
                      )}
                    </p>
                    <p className="text-[13px] text-muted-foreground">
                      {istShort(item.at)} · {item.detail}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <EmptyState title="No activity yet" />
          )}
          <p className="mt-4 border-t border-line pt-3 text-[12px] text-muted-foreground">
            Clinical records (intake, photos, notes, prescriptions) are visible only in the doctor portal.
          </p>
        </Card>
      </div>
    </div>
  );
}
