import { subHours } from 'date-fns';
import { CalendarDays, FileText, Video } from 'lucide-react';
import Link from 'next/link';
import { AppointmentChip } from '@/components/account/chips';
import { formatWhen } from '@/components/account/format';
import { ACCOUNT_LINKS } from '@/components/account/links';
import { RescheduleDialog } from '@/components/account/reschedule-dialog';
import { PageHeader } from '@/components/shared/page-header';
import { StatusChip } from '@/components/shared/status-chip';
import { EmptyState } from '@/components/shared/states';
import { Button } from '@/components/ui/button';
import { formatINR } from '@/lib/money';
import { SITE } from '@/lib/site';
import {
  CONCERN_LABEL,
  customerAppointments,
  freeRescheduleHours,
  hasPatientSummary,
  hasPrescription,
} from '@/server/account/queries';
import { getDoctor } from '@/server/catalog';
import { getCurrentCustomer } from '@/server/session';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Consultations' };

const JOIN_WINDOW_MINUTES = 15;

export default async function ConsultationsPage() {
  const customer = await getCurrentCustomer();
  if (!customer) return null;
  const now = new Date();
  const { upcoming, past } = customerAppointments(customer.id, now);
  const doctor = getDoctor();
  const freeHours = freeRescheduleHours();

  return (
    <div className="space-y-10">
      <PageHeader
        title="Consultations"
        description={`Your video consultations with ${doctor.name}, summaries and prescriptions.`}
      />

      <section aria-labelledby="upcoming" className="space-y-3">
        <h2 id="upcoming" className="eyebrow">
          Upcoming
        </h2>
        {upcoming.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="No consultation booked"
            body="When you book a consultation or follow-up, it shows here with your join link."
            action={
              <Button asChild className="h-11 px-5">
                <Link href={past.length ? ACCOUNT_LINKS.bookFollowUp : ACCOUNT_LINKS.book}>
                  {past.length ? 'Book follow-up' : 'Book consultation'}
                </Link>
              </Button>
            }
          />
        ) : (
          upcoming.map((a) => {
            const start = new Date(a.startsAt);
            const freeUntil = subHours(start, freeHours);
            const canJoin = now.getTime() >= start.getTime() - JOIN_WINDOW_MINUTES * 60_000;
            return (
              <article key={a.id} className="rounded-xl border border-line bg-card p-5 md:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="price text-xl text-ink">{formatWhen(a.startsAt)}</p>
                    <p className="mt-1 text-sm text-body">
                      {a.kind === 'follow_up' ? 'Follow-up' : 'First consultation'} with {doctor.name} ·{' '}
                      {CONCERN_LABEL[a.concern]} · {a.code}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <AppointmentChip status={a.status} />
                      <StatusChip tone={a.intakeDone ? 'success' : 'warning'}>
                        {a.intakeDone ? 'Hair profile done' : 'Hair profile pending'}
                      </StatusChip>
                      <StatusChip tone="neutral">
                        {a.feePaise > 0 ? `${formatINR(a.feePaise)} paid` : 'Included in your plan'}
                      </StatusChip>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row md:flex-col lg:flex-row">
                    {!a.intakeDone ? (
                      <Button asChild className="h-11 px-5">
                        <Link href={ACCOUNT_LINKS.intake(a.id)}>Complete hair profile</Link>
                      </Button>
                    ) : null}
                    <Button asChild variant={a.intakeDone ? 'default' : 'outline'} className="h-11 px-5">
                      <Link href={ACCOUNT_LINKS.join(a.id)}>
                        <Video className="size-4" aria-hidden />
                        {canJoin ? 'Join now' : 'Open waiting room'}
                      </Link>
                    </Button>
                    <RescheduleDialog
                      whenLabel={formatWhen(a.startsAt)}
                      freeUntilLabel={formatWhen(freeUntil.toISOString())}
                      isFree={now < freeUntil}
                      freeHours={freeHours}
                      whatsappUrl={SITE.whatsappUrl}
                    />
                  </div>
                </div>
                <p className="mt-4 border-t border-line pt-3 text-[13px] text-muted-foreground">
                  Joining opens {JOIN_WINDOW_MINUTES} minutes before the start. Free reschedule until{' '}
                  {formatWhen(freeUntil.toISOString())}.
                </p>
              </article>
            );
          })
        )}
      </section>

      <section aria-labelledby="past" className="space-y-3">
        <h2 id="past" className="eyebrow">
          Past consultations
        </h2>
        {past.length === 0 ? (
          <EmptyState
            title="No past consultations"
            body="After your first consultation, the doctor's summary and prescription appear here."
          />
        ) : (
          <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-card">
            {past.map((a) => {
              const summary = a.status === 'completed' && hasPatientSummary(a.id);
              const rx = a.status === 'completed' && hasPrescription(customer.id, a.id);
              return (
                <li
                  key={a.id}
                  className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium text-ink">{formatWhen(a.startsAt, 'EEE d MMM yyyy')}</p>
                    <p className="mt-0.5 text-sm text-body">
                      {a.kind === 'follow_up' ? 'Follow-up' : 'First consultation'} ·{' '}
                      {CONCERN_LABEL[a.concern]} · {a.code}
                    </p>
                    <div className="mt-2">
                      <AppointmentChip status={a.status} />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {summary ? (
                      <Button asChild variant="outline" className="h-11 px-4">
                        <Link href={`/account/consultations/${a.id}`}>View summary</Link>
                      </Button>
                    ) : null}
                    {rx ? (
                      <Button asChild variant="outline" className="h-11 px-4">
                        <Link href={`/account/consultations/${a.id}/prescription`}>
                          <FileText className="size-4" aria-hidden />
                          Prescription
                        </Link>
                      </Button>
                    ) : null}
                    {a.status === 'no_show' ? (
                      <Button asChild className="h-11 px-4">
                        <Link href={ACCOUNT_LINKS.book}>Pick a new time</Link>
                      </Button>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
