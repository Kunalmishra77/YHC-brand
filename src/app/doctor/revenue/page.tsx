import type { Metadata } from 'next';
import { KpiTile } from '@/components/shared/kpi-tile';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/states';
import { formatINR } from '@/lib/money';
import { requireDoctorPage } from '@/server/doctor/auth';
import { getRevenue } from '@/server/doctor/queries';

export const metadata: Metadata = { title: 'Revenue · Doctor Portal' };

function delta(current: number, previous: number, unit: 'money' | 'count') {
  const fmt = (v: number) => (unit === 'money' ? formatINR(v) : String(v));
  if (previous === 0 && current === 0) return 'No change vs last month';
  if (previous === 0) return `Up from ${fmt(0)} last month`;
  const pct = Math.round(((current - previous) / previous) * 100);
  if (pct === 0) return `Same as last month (${fmt(previous)})`;
  return `${pct > 0 ? 'Up' : 'Down'} ${Math.abs(pct)}% vs last month (${fmt(previous)})`;
}

export default async function RevenuePage() {
  await requireDoctorPage('/doctor/revenue');
  const { series, current, previous, byPlan, recsSent, recsPaid } = getRevenue();
  const max = Math.max(1, ...series.map((s) => s.consultPaise + s.planPaise));
  const planMax = Math.max(1, ...byPlan.map((b) => b.paise));
  const avgPlan = current.planCount ? Math.round(current.planPaise / current.planCount) : 0;

  return (
    <>
      <PageHeader
        title="Revenue"
        description={`Your consultation fees and plans bought from your recommendations · ${current.label} so far`}
      />
      <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiTile
          label="Consultation fees this month"
          value={formatINR(current.consultPaise)}
          delta={delta(current.consultPaise, previous.consultPaise, 'money')}
          definition="₹ fees of paid consultations (booked, completed or no-show), by consultation date (IST). Refunds are not deducted in the demo."
        />
        <KpiTile
          label="Plan revenue this month"
          value={formatINR(current.planPaise)}
          delta={delta(current.planPaise, previous.planPaise, 'money')}
          definition="Amount paid for plan orders created from your recommendations, after the consultation credit, by payment date (IST). Includes GST."
        />
        <KpiTile
          label="Plans bought this month"
          value={String(current.planCount)}
          delta={
            avgPlan
              ? `Average ${formatINR(avgPlan)} per plan`
              : delta(current.planCount, previous.planCount, 'count')
          }
          definition="Number of paid plan orders from your recommendations this month."
        />
        <KpiTile
          label="Recommendations paid"
          value={`${recsPaid} of ${recsSent}`}
          delta={
            recsSent
              ? `${Math.round((recsPaid / recsSent) * 100)}% of plans sent were bought`
              : 'No plans sent yet'
          }
          definition="All time: recommendations with a paid plan ÷ recommendations sent."
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <section
          aria-labelledby="by-month"
          className="rounded-xl bg-card p-4 shadow-card ring-1 ring-line/80 md:p-5"
        >
          <h2 id="by-month" className="text-base font-semibold text-ink">
            Last 6 months
          </h2>
          <ul className="mt-2 flex flex-wrap gap-4 text-[13px] text-body" aria-label="Legend">
            <li className="flex items-center gap-1.5">
              <span className="size-3 rounded-[3px] bg-obsidian" aria-hidden /> Plan revenue
            </li>
            <li className="flex items-center gap-1.5">
              <span className="size-3 rounded-[3px] bg-platinum" aria-hidden /> Consultation fees
            </li>
          </ul>
          {series.every((s) => s.consultPaise + s.planPaise === 0) ? (
            <EmptyState
              className="mt-4"
              title="No revenue yet"
              body="Paid consultations and plans appear here."
            />
          ) : (
            <ul className="mt-4 space-y-3">
              {series.map((s) => {
                const total = s.consultPaise + s.planPaise;
                return (
                  <li
                    key={s.month}
                    className="grid grid-cols-[72px_1fr] items-center gap-3 sm:grid-cols-[80px_1fr_120px]"
                  >
                    <span className="text-[13px] text-body">{s.label}</span>
                    <div
                      className="flex h-6 overflow-hidden rounded-[4px] bg-mist/60"
                      role="img"
                      aria-label={`${s.label}: plans ${formatINR(s.planPaise)}, consultations ${formatINR(s.consultPaise)}`}
                    >
                      <span
                        className="h-full bg-obsidian"
                        style={{ width: `${(s.planPaise / max) * 100}%` }}
                      />
                      <span
                        className="h-full bg-platinum"
                        style={{ width: `${(s.consultPaise / max) * 100}%` }}
                      />
                    </div>
                    <span className="price col-start-2 text-[13px] text-ink sm:col-start-auto sm:text-right">
                      {formatINR(total)}
                      <span className="block text-[12px] text-muted-foreground">
                        {s.planCount} plan{s.planCount === 1 ? '' : 's'} · {s.consultCount} consult
                        {s.consultCount === 1 ? '' : 's'}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section
          aria-labelledby="by-plan"
          className="rounded-xl bg-card p-4 shadow-card ring-1 ring-line/80 md:p-5"
        >
          <h2 id="by-plan" className="text-base font-semibold text-ink">
            Plans by duration · all time
          </h2>
          <ul className="mt-4 space-y-4">
            {byPlan.map((b) => (
              <li key={b.plan.id}>
                <div className="mb-1 flex items-baseline justify-between gap-2 text-sm">
                  <span className="text-ink">
                    {b.plan.name}
                    {b.plan.isRecommended ? (
                      <span className="ml-1.5 text-[12px] text-brand">Doctor-recommended duration</span>
                    ) : null}
                  </span>
                  <span className="price text-ink">{formatINR(b.paise)}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-mist" aria-hidden>
                  <div
                    className="h-full rounded-full bg-brand"
                    style={{ width: `${(b.paise / planMax) * 100}%` }}
                  />
                </div>
                <p className="mt-1 text-[12px] text-muted-foreground">
                  {b.count} plan{b.count === 1 ? '' : 's'} bought
                </p>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[12px] text-muted-foreground">Demo figures from the in-memory store.</p>
        </section>
      </div>
    </>
  );
}
