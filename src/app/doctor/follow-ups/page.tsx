import { CalendarClock, Camera, MessageCircleWarning } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/states';
import { StatusChip, type ChipTone } from '@/components/shared/status-chip';
import { KpiTile } from '@/components/shared/kpi-tile';
import { formatIst } from '@/lib/time';
import { PLANS } from '@/server/demo/fixtures';
import { requireDoctorPage } from '@/server/doctor/auth';
import { getFollowUps, replyLabel } from '@/server/doctor/queries';

export const metadata: Metadata = { title: 'Follow-ups · Doctor Portal' };

function dueChip(daysLeft: number, booked: boolean): { tone: ChipTone; label: string } {
  if (booked) return { tone: 'success', label: 'Follow-up booked' };
  if (daysLeft < 0)
    return { tone: 'danger', label: `Overdue by ${-daysLeft} day${daysLeft === -1 ? '' : 's'}` };
  if (daysLeft === 0) return { tone: 'warning', label: 'Due today' };
  if (daysLeft <= 14) return { tone: 'warning', label: `Due in ${daysLeft} days` };
  return { tone: 'neutral', label: `Due in ${daysLeft} days` };
}

const dateLabel = (d: string) => formatIst(new Date(`${d}T06:30:00Z`), 'EEE d MMM');

function Section({
  id,
  title,
  icon,
  count,
  children,
}: {
  id: string;
  title: string;
  icon: React.ReactNode;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="rounded-lg border border-line bg-card">
      <div className="flex items-center gap-2 border-b border-line px-4 py-3 md:px-5">
        <span className="text-steel [&_svg]:size-4" aria-hidden>
          {icon}
        </span>
        <h2 id={id} className="flex-1 text-base font-semibold text-ink">
          {title}
        </h2>
        <span className="price rounded-full bg-mist px-2 py-0.5 text-[13px] text-ink">{count}</span>
      </div>
      <div className="p-2 md:p-3">{children}</div>
    </section>
  );
}

export default async function FollowUpsPage() {
  await requireDoctorPage('/doctor/follow-ups');
  const { consultsDue, flagged, missingPhotos, dueSoon } = getFollowUps();

  return (
    <>
      <PageHeader
        title="Follow-ups"
        description="Reviews coming due, check-in replies that need a doctor, and patients without this month's photos."
      />
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <KpiTile
          label="Follow-up consults due in 14 days"
          value={String(dueSoon)}
          delta={`${consultsDue.length} patients on a follow-up schedule`}
          definition="Latest completed consultation + the follow-up weeks set in the notes, where no follow-up is booked yet."
        />
        <KpiTile
          label="Flagged check-in replies"
          value={String(flagged.length)}
          delta="Replies marked “have questions” or “side effect”"
        />
        <KpiTile
          label="Missing progress photos"
          value={String(missingPhotos.length)}
          delta="Active plan, no photo set in 30 days"
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Section
          id="flagged"
          title="Flagged check-in replies"
          icon={<MessageCircleWarning />}
          count={flagged.length}
        >
          {flagged.length === 0 ? (
            <EmptyState
              className="border-none"
              title="No flagged replies"
              body="Replies that mention questions or side effects land here."
            />
          ) : (
            <ul className="divide-y divide-line">
              {flagged.map(({ customer, checkin }) => {
                const chip = replyLabel(checkin.reply ?? 'have_questions');
                return (
                  <li key={checkin.id} className="px-2 py-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <Link
                        href={`/doctor/patients/${customer.id}`}
                        className="font-medium text-ink hover:underline"
                      >
                        {customer.name}
                      </Link>
                      <StatusChip tone={chip.tone}>{chip.label}</StatusChip>
                    </div>
                    <p className="mt-1 text-sm text-body">“{checkin.replyText ?? 'No text'}”</p>
                    <p className="mt-1 text-[12px] text-muted-foreground">
                      Week {checkin.week} check-in · sent {formatIst(new Date(checkin.sentAt), 'd MMM')}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </Section>

        <Section id="due" title="Follow-up consultations" icon={<CalendarClock />} count={consultsDue.length}>
          {consultsDue.length === 0 ? (
            <EmptyState
              className="border-none"
              title="No follow-ups scheduled"
              body="Set “Follow-up in N weeks” when you recommend a plan."
            />
          ) : (
            <ul className="divide-y divide-line">
              {consultsDue.map((f) => {
                const chip = dueChip(f.daysLeft, f.booked !== null);
                return (
                  <li key={f.appt.id} className="flex flex-wrap items-center justify-between gap-2 px-2 py-3">
                    <div className="min-w-0">
                      <Link
                        href={`/doctor/patients/${f.customer.id}`}
                        className="font-medium text-ink hover:underline"
                      >
                        {f.customer.name}
                      </Link>
                      <p className="text-[13px] text-muted-foreground">
                        Due {dateLabel(f.dueOn)} · {f.weeks} weeks after{' '}
                        {formatIst(new Date(f.appt.startsAt), 'd MMM')} ({f.appt.code})
                      </p>
                    </div>
                    <StatusChip tone={chip.tone}>{chip.label}</StatusChip>
                  </li>
                );
              })}
            </ul>
          )}
        </Section>

        <Section
          id="photos"
          title="Without this month's progress photos"
          icon={<Camera />}
          count={missingPhotos.length}
        >
          {missingPhotos.length === 0 ? (
            <EmptyState
              className="border-none"
              title="Everyone is up to date"
              body="Patients on an active plan with no photo set in 30 days appear here."
            />
          ) : (
            <ul className="divide-y divide-line">
              {missingPhotos.map((m) => (
                <li
                  key={m.customer.id}
                  className="flex flex-wrap items-center justify-between gap-2 px-2 py-3"
                >
                  <div className="min-w-0">
                    <Link
                      href={`/doctor/patients/${m.customer.id}`}
                      className="font-medium text-ink hover:underline"
                    >
                      {m.customer.name}
                    </Link>
                    <p className="text-[13px] text-muted-foreground">
                      {PLANS.find((p) => p.id === m.order.planId)?.name ?? 'Plan'} · day{' '}
                      {m.daysSinceDelivery + 1} ·{' '}
                      {m.lastPhotoOn ? `last photos ${dateLabel(m.lastPhotoOn)}` : 'no photos since delivery'}
                    </p>
                  </div>
                  <StatusChip tone="warning">Photos missing</StatusChip>
                </li>
              ))}
            </ul>
          )}
          <p className="px-2 pt-1 pb-2 text-[12px] text-muted-foreground">
            The monthly photo request goes out on WhatsApp automatically.
          </p>
        </Section>
      </div>
    </>
  );
}
