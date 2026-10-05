import Link from 'next/link';
import { FunnelChart, InlineBar, Meter, REVENUE_COLORS, RevenueChart } from '@/components/admin/charts';
import { DataList } from '@/components/admin/data-list';
import { dateLabel, formatCount, formatPct } from '@/components/admin/format';
import { KpiTile } from '@/components/shared/kpi-tile';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/states';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { formatINR } from '@/lib/money';
import { cn } from '@/lib/utils';
import {
  computeDashboard,
  deltaWords,
  METRIC_DEFINITIONS as DEF,
  parseRange,
  RANGE_OPTIONS,
  type BreakdownRow,
  type PlanRow,
} from '@/server/admin/kpis';
import { requireAdminPage } from '@/server/admin/guard';
import { PLANS, STAFF } from '@/server/demo/fixtures';
import { db, getSettingNumber } from '@/server/demo/store';
import { Info } from 'lucide-react';

export const metadata = { title: 'Dashboard' };

function Panel({
  title,
  description,
  definition,
  children,
  className,
  aside,
}: {
  title: string;
  description?: string;
  definition?: string;
  children: React.ReactNode;
  className?: string;
  aside?: React.ReactNode;
}) {
  return (
    <section className={cn('rounded-xl bg-card p-4 shadow-card ring-1 ring-line/80 md:p-5', className)}>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="flex items-center gap-1.5 text-base font-semibold text-ink">
            {title}
            {definition ? (
              <Tooltip>
                <TooltipTrigger aria-label={`How ${title} is measured`} className="rounded-full">
                  <Info className="size-3.5 text-steel" aria-hidden />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">{definition}</TooltipContent>
              </Tooltip>
            ) : null}
          </h2>
          {description ? <p className="mt-0.5 text-[13px] text-muted-foreground">{description}</p> : null}
        </div>
        {aside}
      </div>
      {children}
    </section>
  );
}

export default async function AdminDashboard({ searchParams }: PageProps<'/admin'>) {
  await requireAdminPage();
  const range = parseRange((await searchParams).range);
  const s = db();
  const d = computeDashboard(
    s,
    {
      slotMinutes: getSettingNumber('consult.slot_minutes'),
      bufferMinutes: getSettingNumber('consult.buffer_minutes'),
      plans: PLANS,
      staff: STAFF,
      now: new Date(),
    },
    range,
  );
  const c = d.current;
  const p = d.previous;
  const days = range;
  const rev = c.revenue;
  const split = [
    { label: 'Consultations', value: rev.consultPaise, color: REVENUE_COLORS.consult },
    { label: 'Plans & products', value: rev.planPaise, color: REVENUE_COLORS.plan },
    { label: 'Reorders', value: rev.reorderPaise, color: REVENUE_COLORS.reorder },
  ];

  const rateTile = (
    label: string,
    definition: string,
    cur: { value: number | null; num: number; den: number },
    prev: { value: number | null },
    empty: string,
  ) => (
    <KpiTile
      label={label}
      value={formatPct(cur.value)}
      definition={definition}
      delta={
        cur.value === null
          ? empty
          : `${formatCount(cur.num)} of ${formatCount(cur.den)} · ${deltaWords(cur.value, prev.value, 'rate', days)}`
      }
    />
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description={`Last ${days} days · ${dateLabel(d.window.firstDate)} – ${dateLabel(d.window.lastDate, true)} (IST) · compared with the ${days} days before`}
        actions={
          <nav aria-label="Date range" className="inline-flex rounded-md border border-line bg-card p-0.5">
            {RANGE_OPTIONS.map((r) => (
              <Link
                key={r}
                href={`/admin?range=${r}`}
                aria-current={r === range ? 'page' : undefined}
                className={cn(
                  'inline-flex min-h-9 items-center rounded-[5px] px-3 text-sm font-medium transition-colors',
                  r === range ? 'bg-obsidian text-on-dark' : 'text-body hover:bg-mist',
                )}
              >
                {r} days
              </Link>
            ))}
          </nav>
        }
      />

      {/* Hero: revenue */}
      <section className="grid gap-4 rounded-xl bg-card p-4 shadow-card ring-1 ring-line/80 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] md:p-6">
        <div>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            Revenue
            <Tooltip>
              <TooltipTrigger aria-label="How revenue is measured" className="rounded-full">
                <Info className="size-3.5 text-steel" aria-hidden />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">{DEF.revenue}</TooltipContent>
            </Tooltip>
          </p>
          <p className="mt-1 text-[44px] leading-none font-semibold tracking-tight text-ink md:text-[52px]">
            {formatINR(rev.totalPaise)}
          </p>
          <p className="mt-2 text-[13px] text-muted-foreground">
            {deltaWords(rev.totalPaise, p.revenue.totalPaise, 'money', days)}
          </p>
        </div>
        <div className="flex flex-col justify-end gap-3">
          <p className="text-sm font-medium text-ink">Revenue split</p>
          {rev.totalPaise > 0 ? (
            <div className="flex h-3 w-full gap-[2px] overflow-hidden rounded-[4px]" aria-hidden>
              {split
                .filter((x) => x.value > 0)
                .map((x) => (
                  <span key={x.label} style={{ background: x.color, flexGrow: x.value, flexBasis: 0 }} />
                ))}
            </div>
          ) : (
            <div className="h-3 w-full rounded-[4px] bg-mist" aria-hidden />
          )}
          <dl className="grid grid-cols-3 gap-3">
            {split.map((x) => (
              <div key={x.label}>
                <dt className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
                  <span
                    className="size-2.5 shrink-0 rounded-[3px]"
                    style={{ background: x.color }}
                    aria-hidden
                  />
                  <span className="truncate">{x.label}</span>
                </dt>
                <dd className="price mt-0.5 text-sm font-semibold text-ink">{formatINR(x.value)}</dd>
                <dd className="text-[12px] text-muted-foreground">
                  {formatPct(rev.totalPaise ? x.value / rev.totalPaise : null)}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* KPI tiles (FR-M13-1, §17 definitions as tooltips) */}
      <section aria-label="Key metrics" className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <KpiTile
          label="New leads"
          value={formatCount(c.newLeads)}
          definition={DEF.newLeads}
          delta={deltaWords(c.newLeads, p.newLeads, 'count', days)}
        />
        {rateTile(
          'Lead → paid consult rate',
          DEF.leadToPaid,
          c.leadToPaid,
          p.leadToPaid,
          'No leads in this period',
        )}
        {rateTile(
          'Booking conversion',
          DEF.bookingConversion,
          c.bookingConversion,
          p.bookingConversion,
          'No slot holds in this period',
        )}
        {rateTile('Show-up rate', DEF.showUp, c.showUp, p.showUp, 'No finished consultations yet')}
        {rateTile(
          'Consult-to-plan rate',
          DEF.consultToPlan,
          c.consultToPlan,
          p.consultToPlan,
          'No completed consultations in this period',
        )}
        <KpiTile
          label="AOV"
          value={c.aov.valuePaise === null ? '—' : formatINR(Math.round(c.aov.valuePaise / 100) * 100)}
          definition={DEF.aov}
          delta={
            c.aov.valuePaise === null
              ? 'No paid orders in this period'
              : `${formatCount(c.aov.orders)} paid orders · ${deltaWords(c.aov.valuePaise, p.aov.valuePaise, 'money', days)}`
          }
        />
        {rateTile(
          'Reorder rate',
          DEF.reorderRate,
          c.reorderRate,
          p.reorderRate,
          'No plans ended in this period',
        )}
        {rateTile(
          '90-day retention',
          DEF.retention90,
          c.retention90,
          p.retention90,
          'No first deliveries in this period',
        )}
        <KpiTile
          label="Guarantee cost"
          value={formatPct(c.guaranteeCost.value, 1)}
          definition={DEF.guaranteeCost}
          delta={
            c.guaranteeCost.value === null
              ? 'No plan revenue in this period'
              : `${formatINR(c.guaranteeCost.refundPaise)} refunded of ${formatINR(c.planRevenuePaise)} plan revenue`
          }
        />
      </section>

      <div className="grid gap-4 lg:grid-cols-12">
        <Panel
          title="Funnel"
          description="Cohort: leads created in this period · bar = share of leads · right = conversion from the previous step"
          className="lg:col-span-7"
        >
          {c.funnel[0]?.count ? (
            <FunnelChart steps={c.funnel} />
          ) : (
            <EmptyState title="No leads in this period" body="Pick a longer date range." />
          )}
        </Panel>
        <Panel
          title="Doctor utilisation"
          definition={DEF.utilisation}
          description="Dr. Tyagi · slots from the weekly availability rules"
          className="lg:col-span-5"
        >
          <p className="text-[36px] leading-none font-semibold text-ink">{formatPct(c.utilisation.value)}</p>
          <p className="mt-2 mb-3 text-[13px] text-muted-foreground">
            {formatCount(Math.round(c.utilisation.bookedMinutes))} booked of{' '}
            {formatCount(c.utilisation.availableMinutes)} available slot minutes ·{' '}
            {deltaWords(c.utilisation.value, p.utilisation.value, 'rate', days)}
          </p>
          <Meter value={c.utilisation.value} label="Doctor utilisation" />
          <div className="mt-5 grid grid-cols-2 gap-3 border-t border-line pt-4">
            <div>
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                No-show rate
                <Tooltip>
                  <TooltipTrigger aria-label="How no-show rate is measured" className="rounded-full">
                    <Info className="size-3.5 text-steel" aria-hidden />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">{DEF.noShow}</TooltipContent>
                </Tooltip>
              </p>
              <p className="mt-1 text-2xl font-semibold text-ink">{formatPct(c.noShow.value)}</p>
              <p className="text-[13px] text-muted-foreground">
                {c.noShow.den === 0
                  ? 'No finished consultations yet'
                  : `${c.noShow.num} of ${c.noShow.den} finished consultations`}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Consultations held</p>
              <p className="mt-1 text-2xl font-semibold text-ink">{formatCount(c.showUp.num)}</p>
              <p className="text-[13px] text-muted-foreground">Completed in this period</p>
            </div>
          </div>
        </Panel>
      </div>

      <Panel
        title="Revenue over time"
        definition={DEF.revenue}
        description={days > 31 ? 'Weekly, IST' : 'Daily, IST'}
      >
        <RevenueChart points={d.series} weekly={days > 31} />
      </Panel>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="By source & campaign" description="Leads created in this period, with their outcomes">
          <Breakdown rows={d.bySource} />
        </Panel>
        <Panel title="By sales rep" description="Lead owner at the time of reporting">
          <Breakdown rows={d.byRep} />
        </Panel>
      </div>

      <Panel title="By plan duration" description="Paid plan orders in this period">
        <PlanBreakdown rows={d.byPlan} />
      </Panel>

      <p className="text-[13px] text-muted-foreground">
        Sample data · computed live from the demo store. Definitions follow PRD §17; demo appointments have no
        created-at time, so a hold is dated by its slot start (capped at now).
      </p>
    </div>
  );
}

function Breakdown({ rows }: { rows: BreakdownRow[] }) {
  const max = Math.max(0, ...rows.map((r) => r.leads));
  return (
    <DataList
      rows={rows}
      rowKey={(r) => r.key}
      caption="Breakdown"
      empty={<EmptyState title="No leads in this period" />}
      columns={[
        {
          header: 'Segment',
          cell: (r) => (
            <span>
              <span className="block text-sm font-medium text-ink">{r.label}</span>
              {r.sublabel ? (
                <span className="block text-[12px] text-muted-foreground">{r.sublabel}</span>
              ) : null}
            </span>
          ),
        },
        {
          header: 'Leads',
          cell: (r) => (
            <span className="flex items-center gap-2">
              <span className="price w-6 text-sm text-ink">{r.leads}</span>
              <InlineBar value={r.leads} max={max} />
            </span>
          ),
        },
        {
          header: 'Paid consults',
          align: 'right',
          cell: (r) => <span className="price">{r.paidConsults}</span>,
        },
        { header: 'Plan buyers', align: 'right', cell: (r) => <span className="price">{r.planBuyers}</span> },
        {
          header: 'Revenue',
          align: 'right',
          cell: (r) => <span className="price font-medium text-ink">{formatINR(r.revenuePaise)}</span>,
        },
      ]}
    />
  );
}

function PlanBreakdown({ rows }: { rows: PlanRow[] }) {
  const max = Math.max(0, ...rows.map((r) => r.orders));
  if (rows.every((r) => r.orders === 0))
    return <EmptyState title="No plan orders paid in this period" body="Try the 90-day range." />;
  return (
    <>
      <DataList
        rows={rows}
        rowKey={(r) => r.planId}
        caption="By plan duration"
        columns={[
          { header: 'Plan', cell: (r) => <span className="text-sm font-medium text-ink">{r.label}</span> },
          {
            header: 'Orders',
            cell: (r) => (
              <span className="flex items-center gap-2">
                <span className="price w-6 text-sm text-ink">{r.orders}</span>
                <InlineBar value={r.orders} max={max} />
              </span>
            ),
          },
          {
            header: 'Share',
            align: 'right',
            cell: (r) => <span className="price">{formatPct(r.share)}</span>,
          },
          {
            header: 'Revenue',
            align: 'right',
            cell: (r) => <span className="price font-medium text-ink">{formatINR(r.revenuePaise)}</span>,
          },
        ]}
      />
    </>
  );
}
