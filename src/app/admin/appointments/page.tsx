import { Filter } from 'lucide-react';
import Link from 'next/link';
import { ReasonDialog, RescheduleDialog } from '@/components/admin/appointment-dialogs';
import { DataList } from '@/components/admin/data-list';
import { APPOINTMENT_TONE, istShort } from '@/components/admin/format';
import { RefundDialog } from '@/components/admin/order-dialogs';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/states';
import { StatusChip } from '@/components/shared/status-chip';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { t } from '@/i18n/en';
import type { AppointmentStatus } from '@/lib/domain/types';
import { formatINR } from '@/lib/money';
import { formatIst, istDate } from '@/lib/time';
import { rescheduleOptions } from '@/server/admin/appointments';
import { requireAdminPage } from '@/server/admin/guard';
import { refundedSoFar } from '@/server/admin/orders';
import { customerById, listAppointments, type AdminAppointment } from '@/server/admin/queries';
import { cancelAppointmentAction, refundConsultAction, rescheduleAction } from './actions';

export const metadata = { title: 'Appointments' };

const STATUSES: AppointmentStatus[] = [
  'held',
  'booked',
  'completed',
  'no_show',
  'cancelled',
  'rescheduled',
  'expired',
];
const WHEN = [
  { key: 'upcoming', label: 'Today & upcoming' },
  { key: 'past', label: 'Past' },
  { key: 'all', label: 'All' },
] as const;

const selectClass =
  'h-9 rounded-md border border-input bg-card px-3 text-sm text-ink focus-visible:outline-2 focus-visible:outline-brand';

export default async function AppointmentsPage({ searchParams }: PageProps<'/admin/appointments'>) {
  await requireAdminPage();
  const sp = await searchParams;
  const when = WHEN.find((w) => w.key === sp.when)?.key ?? 'upcoming';
  const status = STATUSES.find((s) => s === sp.status) ?? null;
  const date = typeof sp.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(sp.date) ? sp.date : '';
  const today = istDate(new Date());

  const rows = listAppointments()
    .filter((a) => {
      const d = istDate(new Date(a.startsAt));
      if (date) return d === date;
      if (when === 'upcoming') return d >= today;
      if (when === 'past') return d < today;
      return true;
    })
    .filter((a) => (status ? a.status === status : true))
    .sort((a, b) =>
      when === 'upcoming' ? a.startsAt.localeCompare(b.startsAt) : b.startsAt.localeCompare(a.startsAt),
    );
  const options = rescheduleOptions();

  return (
    <div className="space-y-5">
      <PageHeader
        title="Appointments"
        description="Logistics only — intake, notes and prescriptions stay in the doctor portal."
      />

      <form
        action="/admin/appointments"
        className="flex flex-wrap items-end gap-3 rounded-lg border border-line bg-card p-3"
      >
        <div className="space-y-1">
          <label htmlFor="f-when" className="text-[13px] text-muted-foreground">
            Period
          </label>
          <select id="f-when" name="when" defaultValue={when} className={selectClass}>
            {WHEN.map((w) => (
              <option key={w.key} value={w.key}>
                {w.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label htmlFor="f-date" className="text-[13px] text-muted-foreground">
            Or a date (IST)
          </label>
          <Input id="f-date" type="date" name="date" defaultValue={date} className="h-9 w-40" />
        </div>
        <div className="space-y-1">
          <label htmlFor="f-status" className="text-[13px] text-muted-foreground">
            Status
          </label>
          <select id="f-status" name="status" defaultValue={status ?? ''} className={selectClass}>
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {t(`status.appointment.${s}`)}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit" variant="outline" className="min-h-9">
          <Filter className="size-4" aria-hidden />
          Apply
        </Button>
        {date || status || when !== 'upcoming' ? (
          <Button asChild variant="link" className="min-h-9">
            <Link href="/admin/appointments">Clear</Link>
          </Button>
        ) : null}
      </form>

      <p className="text-[13px] text-muted-foreground" aria-live="polite">
        {rows.length} appointment{rows.length === 1 ? '' : 's'}
      </p>

      <DataList<AdminAppointment>
        rows={rows}
        rowKey={(a) => a.id}
        caption="Appointments"
        empty={<EmptyState title="No appointments match these filters" body="Try another date or status." />}
        columns={[
          { header: 'Code', cell: (a) => <span className="price font-medium text-ink">{a.code}</span> },
          {
            header: 'Customer',
            cell: (a) => {
              const c = customerById(a.customerId);
              return c ? (
                <Link
                  href={`/admin/customers/${c.id}`}
                  className="text-ink underline-offset-4 hover:underline"
                >
                  {c.name}
                </Link>
              ) : (
                '—'
              );
            },
          },
          { header: 'Time (IST)', cell: (a) => <span className="text-sm">{istShort(a.startsAt)}</span> },
          {
            header: 'Type',
            cell: (a) => <span className="text-sm">{a.kind === 'follow_up' ? 'Follow-up' : 'First'}</span>,
          },
          {
            header: 'Status',
            cell: (a) => (
              <StatusChip tone={APPOINTMENT_TONE[a.status]}>{t(`status.appointment.${a.status}`)}</StatusChip>
            ),
          },
          {
            header: 'Payment',
            cell: (a) => {
              const refunded = refundedSoFar(a.code);
              if (a.feePaise === 0) return <span className="text-sm text-muted-foreground">No fee</span>;
              return (
                <span className="text-sm">
                  <span className="price text-ink">{formatINR(a.feePaise)}</span>{' '}
                  <span className="text-muted-foreground">
                    {a.paymentId
                      ? refunded > 0
                        ? `· ${formatINR(refunded)} refunded`
                        : '· paid'
                      : '· unpaid'}
                  </span>
                </span>
              );
            },
          },
        ]}
        actions={(a) => {
          const live = a.status === 'booked' || a.status === 'held';
          const refundable = a.paymentId !== null && a.feePaise > 0;
          if (!live && !refundable) return null;
          return (
            <>
              {live ? (
                <RescheduleDialog
                  action={rescheduleAction.bind(null, a.id)}
                  code={a.code}
                  current={formatIst(new Date(a.startsAt))}
                  options={options}
                />
              ) : null}
              {live ? (
                <ReasonDialog
                  action={cancelAppointmentAction.bind(null, a.id)}
                  label="Cancel"
                  title={`Cancel ${a.code} on behalf of the customer?`}
                  description="The slot is released and the customer is told on WhatsApp. Refund the fee separately if policy allows (D-P4 pending)."
                  confirmLabel="Cancel appointment"
                />
              ) : null}
              {refundable ? (
                <RefundDialog
                  action={refundConsultAction.bind(null, a.id)}
                  target={a.code}
                  remainingPaise={a.feePaise - refundedSoFar(a.code)}
                  label="Refund fee"
                />
              ) : null}
            </>
          );
        }}
      />
    </div>
  );
}
