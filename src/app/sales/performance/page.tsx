import type { Metadata } from 'next';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/states';
import { KpiTile } from '@/components/shared/kpi-tile';
import { requireSales } from '@/server/sales/mutations';
import { getPerformance } from '@/server/sales/views';

export const metadata: Metadata = { title: 'Performance · Sales CRM' };

const pct = (n: number, d: number) => (d === 0 ? '—' : `${Math.round((n / d) * 100)}%`);
const mins = (m: number | null) =>
  m === null ? '—' : m < 60 ? `${m} min` : `${Math.floor(m / 60)} h ${m % 60} min`;

export default async function PerformancePage() {
  const user = await requireSales();
  const { reps, slaMinutes } = getPerformance();
  const total = reps.reduce(
    (a, r) => ({
      leads: a.leads + r.leads,
      contacted: a.contacted + r.contacted,
      withinSla: a.withinSla + r.withinSla,
      paid: a.paid + r.consultPaid,
      plans: a.plans + r.plans,
    }),
    { leads: 0, contacted: 0, withinSla: 0, paid: 0, plans: 0 },
  );

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Performance"
        description={`All-time demo data. First contact = first logged call after the lead was created; target ${slaMinutes} min.`}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiTile
          label="Leads handled"
          value={String(total.leads)}
          delta={`${total.contacted} contacted so far`}
        />
        <KpiTile
          label="First contact in SLA"
          value={pct(total.withinSla, total.contacted)}
          delta={`${total.withinSla} of ${total.contacted} within ${slaMinutes} min`}
          definition="Share of contacted leads whose first logged call came within the first-contact target (sales.first_contact_sla_minutes)."
        />
        <KpiTile
          label="Lead to ₹500 paid"
          value={pct(total.paid, total.leads)}
          delta={`${total.paid} paid consultations`}
          definition="Leads whose first consultation payment was captured, divided by all leads."
        />
        <KpiTile
          label="Plans purchased"
          value={String(total.plans)}
          delta={`${pct(total.plans, total.paid)} of paid consultations`}
          definition="Paid plan orders (not refunded or cancelled) for customers owned by the team."
        />
      </div>

      <section aria-labelledby="reps-h" className="mt-8">
        <h2 id="reps-h" className="mb-3 font-semibold text-ink">
          By rep
        </h2>
        {reps.length === 0 ? (
          <EmptyState title="No active sales reps" className="bg-card" />
        ) : (
          <>
            <ul className="space-y-2 md:hidden">
              {reps.map((r) => (
                <li key={r.id} className="rounded-xl bg-card p-3 shadow-card ring-1 ring-line/80">
                  <p className="font-medium text-ink">
                    {r.name}
                    {r.id === user.id ? (
                      <span className="ml-1.5 text-[13px] text-muted-foreground">(you)</span>
                    ) : null}
                  </p>
                  <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[13px]">
                    <dt className="text-muted-foreground">Leads</dt>
                    <dd className="price text-ink">{r.leads}</dd>
                    <dt className="text-muted-foreground">Median first contact</dt>
                    <dd className="price text-ink">{mins(r.medianFirstContactMin)}</dd>
                    <dt className="text-muted-foreground">To ₹500 paid</dt>
                    <dd className="price text-ink">
                      {pct(r.consultPaid, r.leads)} ({r.consultPaid})
                    </dd>
                    <dt className="text-muted-foreground">Plans purchased</dt>
                    <dd className="price text-ink">{r.plans}</dd>
                    <dt className="text-muted-foreground">Lost</dt>
                    <dd className="price text-ink">{r.lost}</dd>
                  </dl>
                </li>
              ))}
            </ul>
            <div className="hidden overflow-x-auto rounded-xl bg-card shadow-card ring-1 ring-line/80 md:block">
              <table className="w-full text-sm">
                <thead className="bg-mist text-left text-[13px] text-ink">
                  <tr>
                    <th className="px-3 py-2.5 font-medium">Rep</th>
                    <th className="px-3 py-2.5 text-right font-medium">Leads</th>
                    <th className="px-3 py-2.5 text-right font-medium">Contacted</th>
                    <th className="px-3 py-2.5 text-right font-medium">Median first contact</th>
                    <th className="px-3 py-2.5 text-right font-medium">Within SLA</th>
                    <th className="px-3 py-2.5 text-right font-medium">To ₹500 paid</th>
                    <th className="px-3 py-2.5 text-right font-medium">Plans</th>
                    <th className="px-3 py-2.5 text-right font-medium">Lost</th>
                  </tr>
                </thead>
                <tbody className="price">
                  {reps.map((r) => (
                    <tr key={r.id} className="border-t border-line">
                      <td className="px-3 py-2.5 font-sans font-medium text-ink">
                        {r.name}
                        {r.id === user.id ? (
                          <span className="ml-1.5 font-normal text-muted-foreground">(you)</span>
                        ) : null}
                      </td>
                      <td className="px-3 py-2.5 text-right text-body">{r.leads}</td>
                      <td className="px-3 py-2.5 text-right text-body">{r.contacted}</td>
                      <td className="px-3 py-2.5 text-right text-body">{mins(r.medianFirstContactMin)}</td>
                      <td className="px-3 py-2.5 text-right text-body">{pct(r.withinSla, r.contacted)}</td>
                      <td className="px-3 py-2.5 text-right text-body">
                        {pct(r.consultPaid, r.leads)}{' '}
                        <span className="text-muted-foreground">({r.consultPaid})</span>
                      </td>
                      <td className="px-3 py-2.5 text-right text-body">{r.plans}</td>
                      <td className="px-3 py-2.5 text-right text-body">{r.lost}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
