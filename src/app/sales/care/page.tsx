import { HeartHandshake, Phone } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ReorderLinkButton } from '@/components/sales/reorder-link-button';
import { TaskItem } from '@/components/sales/task-item';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/states';
import { StatusChip, type ChipTone } from '@/components/shared/status-chip';
import type { CareCheckin } from '@/lib/domain/types';
import { requireSales } from '@/server/sales/mutations';
import { getCareView, type CareCheckinRow } from '@/server/sales/views';

export const metadata: Metadata = { title: 'Care · Sales CRM' };

const replyTone = (r: CareCheckin['reply']): ChipTone =>
  r === 'going_well'
    ? 'success'
    : r === 'have_questions'
      ? 'warning'
      : r === 'side_effect'
        ? 'danger'
        : 'pending';

export default async function CarePage() {
  await requireSales();
  const care = getCareView();

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Care"
        description="Weekly check-ins, customers who need a call, and plans ending soon. Reply text stays with the doctor."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="flag-h" className="space-y-3">
          <h2 id="flag-h" className="font-semibold text-ink">
            Needs a call
          </h2>
          {care.urgentTasks.length === 0 && care.flagged.length === 0 ? (
            <EmptyState
              icon={HeartHandshake}
              title="No flagged replies"
              body="Customers who ask a question or report an issue appear here."
              className="bg-card"
            />
          ) : (
            <ul className="space-y-2">
              {care.urgentTasks.map((task) => (
                <TaskItem key={task.id} task={task} showOwner />
              ))}
              {care.flagged.map((c) => (
                <CheckinCard key={c.id} row={c} />
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="refill-h" className="space-y-3">
          <h2 id="refill-h" className="font-semibold text-ink">
            Refill due · next 7 days
          </h2>
          {care.refills.length === 0 ? (
            <EmptyState
              title="No plans ending this week"
              body="Plans ending within 7 days (or already ended) show here."
              className="bg-card"
            />
          ) : (
            <ul className="space-y-2">
              {care.refills.map((r) => (
                <li key={r.orderCode} className="rounded-xl bg-card p-4 shadow-card ring-1 ring-line/80">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      {r.leadId ? (
                        <Link
                          href={`/sales/leads/${r.leadId}`}
                          className="font-medium text-ink hover:underline"
                        >
                          {r.customerName}
                        </Link>
                      ) : (
                        <p className="font-medium text-ink">{r.customerName}</p>
                      )}
                      <p className="text-[13px] text-muted-foreground">
                        {r.planName} · {r.orderCode}
                      </p>
                    </div>
                    <StatusChip tone={r.daysLeft < 0 ? 'danger' : r.daysLeft <= 3 ? 'warning' : 'pending'}>
                      {r.daysLeft < 0
                        ? `Ended ${r.endLabel}`
                        : r.daysLeft === 0
                          ? 'Ends today'
                          : `Ends ${r.endLabel} · ${r.daysLeft} ${r.daysLeft === 1 ? 'day' : 'days'}`}
                    </StatusChip>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <a
                      href={`tel:${r.phone}`}
                      className="inline-flex h-11 items-center gap-2 rounded-md bg-obsidian px-4 text-sm font-medium text-on-dark hover:bg-obsidian/90"
                    >
                      <Phone className="size-4" aria-hidden />
                      Call
                    </a>
                    {r.leadId ? (
                      <ReorderLinkButton leadId={r.leadId} orderCode={r.orderCode} name={r.customerName} />
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section aria-labelledby="chk-h" className="mt-8">
        <h2 id="chk-h" className="mb-3 font-semibold text-ink">
          Check-in replies
        </h2>
        {care.checkins.length === 0 ? (
          <EmptyState
            title="No check-ins sent yet"
            body="Weekly check-ins start after a plan is delivered."
            className="bg-card"
          />
        ) : (
          <>
            <ul className="divide-y divide-line overflow-hidden rounded-xl bg-card shadow-card ring-1 ring-line/80 md:hidden">
              {care.checkins.map((c) => (
                <li key={c.id} className="px-4 py-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      {c.leadId ? (
                        <Link
                          href={`/sales/leads/${c.leadId}`}
                          className="block truncate font-medium text-ink hover:underline"
                        >
                          {c.customerName}
                        </Link>
                      ) : (
                        <p className="truncate font-medium text-ink">{c.customerName}</p>
                      )}
                      <p className="text-[13px] text-muted-foreground">
                        <span className="price">Week {c.week}</span> · sent {c.sentLabel}
                      </p>
                    </div>
                    <StatusChip tone={replyTone(c.reply)}>{c.replyLabel}</StatusChip>
                  </div>
                  {c.hasReplyText ? (
                    <p className="mt-1.5 text-[12px] text-muted-foreground">
                      Reply text visible to the doctor only
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
            <div className="hidden overflow-x-auto rounded-xl bg-card shadow-card ring-1 ring-line/80 md:block">
              <table className="w-full text-sm">
                <thead className="bg-mist text-left text-[13px] text-ink">
                  <tr>
                    <th className="px-3 py-2.5 font-medium">Customer</th>
                    <th className="px-3 py-2.5 font-medium">Week</th>
                    <th className="px-3 py-2.5 font-medium">Sent</th>
                    <th className="px-3 py-2.5 font-medium">Reply</th>
                  </tr>
                </thead>
                <tbody>
                  {care.checkins.map((c) => (
                    <tr key={c.id} className="border-t border-line">
                      <td className="px-3 py-2.5">
                        {c.leadId ? (
                          <Link
                            href={`/sales/leads/${c.leadId}`}
                            className="font-medium text-ink hover:underline"
                          >
                            {c.customerName}
                          </Link>
                        ) : (
                          c.customerName
                        )}
                      </td>
                      <td className="price px-3 py-2.5 text-body">Week {c.week}</td>
                      <td className="px-3 py-2.5 whitespace-nowrap text-body">{c.sentLabel}</td>
                      <td className="px-3 py-2.5">
                        <StatusChip tone={replyTone(c.reply)}>{c.replyLabel}</StatusChip>
                        {c.hasReplyText ? (
                          <p className="mt-1 text-[12px] text-muted-foreground">
                            Reply text visible to the doctor only
                          </p>
                        ) : null}
                      </td>
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

function CheckinCard({ row }: { row: CareCheckinRow }) {
  return (
    <li className="rounded-xl bg-card p-4 shadow-card ring-1 ring-line/80">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {row.leadId ? (
          <Link href={`/sales/leads/${row.leadId}`} className="font-medium text-ink hover:underline">
            {row.customerName}
          </Link>
        ) : (
          <p className="font-medium text-ink">{row.customerName}</p>
        )}
        <StatusChip tone={replyTone(row.reply)}>
          Week {row.week} · {row.replyLabel}
        </StatusChip>
      </div>
      {row.hasReplyText ? (
        <p className="mt-1.5 text-[13px] text-muted-foreground">Reply text visible to the doctor only.</p>
      ) : null}
      <a
        href={`tel:${row.phone}`}
        className="mt-3 inline-flex h-11 items-center gap-2 rounded-md bg-obsidian px-4 text-sm font-medium text-on-dark hover:bg-obsidian/90"
      >
        <Phone className="size-4" aria-hidden />
        Call {row.customerName.split(' ')[0]}
      </a>
    </li>
  );
}
