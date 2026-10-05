import { ArrowUpRight, CalendarDays, Clock, Video } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { AppointmentChips, readiness } from '@/components/doctor/appointment-chips';
import { concernLabel, genderLabel } from '@/components/doctor/format';
import { KpiTile } from '@/components/shared/kpi-tile';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/states';
import { Button } from '@/components/ui/button';
import { formatIst } from '@/lib/time';
import { cn } from '@/lib/utils';
import { requireDoctorPage } from '@/server/doctor/auth';
import { getToday } from '@/server/doctor/queries';

export const metadata: Metadata = { title: 'Today · Doctor Portal' };

function greeting(now: Date) {
  const hour = Number(formatIst(now, 'H'));
  return hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
}

export default async function DoctorTodayPage() {
  const user = await requireDoctorPage('/doctor');
  const now = new Date();
  const { rows, next, kpis } = getToday(now);

  return (
    <>
      <PageHeader
        title={`${greeting(now)}, ${user.name}`}
        description={`${formatIst(now, 'EEEE d MMMM')} · ${kpis.consultsToday} consultation${kpis.consultsToday === 1 ? '' : 's'} today, ${kpis.completedToday} completed`}
        actions={
          <Button variant="outline" asChild>
            <Link href="/doctor/calendar">
              <CalendarDays aria-hidden />
              Week view
            </Link>
          </Button>
        }
      />

      {next ? (
        <section
          aria-label="Next consultation"
          className="mb-6 flex flex-col gap-4 rounded-lg bg-obsidian p-5 text-on-dark shadow-raised sm:flex-row sm:items-center sm:justify-between md:p-6"
          style={{ backgroundImage: 'var(--yhc-hero-dark)' }}
        >
          <div className="min-w-0">
            <p className="text-[13px] font-semibold tracking-[0.12em] text-brand-on-dark uppercase">
              Next up
            </p>
            <p className="mt-1.5 text-lg font-medium text-on-dark md:text-xl">
              Next: {next.customer.name} at {formatIst(new Date(next.appt.startsAt), 'h:mm aaa')} —{' '}
              {readiness(next.appt)}
            </p>
            <p className="mt-1 text-sm text-on-dark-muted">
              {next.customer.age} · {genderLabel(next.customer.gender)} · {concernLabel(next.appt.concern)} ·{' '}
              {next.appt.code}
              {new Date(next.appt.startsAt) <= now ? ' · in progress' : ''}
            </p>
          </div>
          <Button
            asChild
            size="lg"
            className="h-11 shrink-0 text-obsidian hover:opacity-90"
            style={{ backgroundImage: 'var(--yhc-silver)' }}
          >
            <Link href={`/doctor/consult/${next.appt.id}`}>
              <Video aria-hidden />
              Open workspace
            </Link>
          </Button>
        </section>
      ) : (
        <section className="mb-6 rounded-xl bg-card p-5 text-sm text-body shadow-card ring-1 ring-line/80">
          No more consultations today. Follow-ups and flagged replies are in{' '}
          <Link href="/doctor/follow-ups" className="text-brand underline underline-offset-2">
            Follow-ups
          </Link>
          .
        </section>
      )}

      <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiTile
          label="Consultations today"
          value={String(kpis.consultsToday)}
          delta={`${kpis.completedToday} completed · ${kpis.consultsToday - kpis.completedToday} to go`}
          definition="Paid consultations scheduled today (IST), including completed and no-show. Held slots awaiting payment are not counted."
        />
        <KpiTile
          label="Intake pending"
          value={String(kpis.intakePending)}
          delta={
            kpis.photosPending ? `${kpis.photosPending} more with photos missing` : 'All photos received'
          }
          definition="Booked consultations today whose patient has not completed the hair profile yet."
        />
        <KpiTile
          label="Plans sent today"
          value={String(kpis.plansSentToday)}
          delta={
            kpis.awaitingPlan
              ? `${kpis.awaitingPlan} completed consult awaiting a plan`
              : 'No completed consult waiting'
          }
          definition="Recommendations sent to patients today (IST) with a personal payment link."
        />
        <KpiTile
          label="Follow-ups due"
          value={String(kpis.followUpsDue)}
          delta="Reviews in 14 days, flagged replies, missing photos"
          definition="Follow-up consults due within 14 days and not yet booked, plus flagged check-in replies and patients without this month's progress photos."
        />
      </div>

      <section aria-labelledby="today-list">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 id="today-list" className="text-base font-semibold text-ink">
            Today&apos;s consultations
          </h2>
          <p className="text-[13px] text-muted-foreground">All times IST</p>
        </div>
        {rows.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="No consultations today"
            body="New bookings appear here as soon as the ₹500 payment is confirmed."
          />
        ) : (
          <ol className="divide-y divide-line overflow-hidden rounded-xl bg-card shadow-card ring-1 ring-line/80">
            {rows.map(({ appt, customer }) => {
              const isNext = next?.appt.id === appt.id;
              const past = appt.status === 'completed' || appt.status === 'no_show';
              return (
                <li
                  key={appt.id}
                  className={cn(
                    'grid grid-cols-[64px_1fr] items-center gap-x-4 gap-y-2 px-4 py-3.5 md:grid-cols-[80px_minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1.4fr)_auto] md:px-5',
                    isNext && 'bg-mist/50',
                  )}
                >
                  <div className="row-span-2 md:row-span-1">
                    <p
                      className={cn(
                        'price text-[15px] font-semibold',
                        past ? 'text-muted-foreground' : 'text-ink',
                      )}
                    >
                      {formatIst(new Date(appt.startsAt), 'h:mm')}
                    </p>
                    <p className="text-[13px] text-muted-foreground">
                      {formatIst(new Date(appt.startsAt), 'aaa')}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink">
                      {customer.name}
                      {isNext ? (
                        <span className="ml-2 text-[13px] font-normal text-brand">· Next</span>
                      ) : null}
                    </p>
                    <p className="text-[13px] text-muted-foreground">
                      {customer.age} · {genderLabel(customer.gender)} · {appt.code}
                    </p>
                  </div>
                  <p className="hidden text-sm text-body md:block">{concernLabel(appt.concern)}</p>
                  <div className="col-start-2 flex flex-wrap items-center gap-2 md:col-start-auto">
                    <span className="text-[13px] text-body md:hidden">{concernLabel(appt.concern)} ·</span>
                    <AppointmentChips appt={appt} />
                  </div>
                  <div className="col-start-2 md:col-start-auto md:justify-self-end">
                    {appt.status === 'held' ? (
                      <span className="text-[13px] text-muted-foreground">Awaiting payment</span>
                    ) : (
                      <Button
                        variant={isNext ? 'default' : 'outline'}
                        size="sm"
                        className="h-9 min-w-20"
                        asChild
                      >
                        <Link
                          href={`/doctor/consult/${appt.id}`}
                          aria-label={`Open ${customer.name}'s workspace`}
                        >
                          Open
                          <ArrowUpRight aria-hidden className="size-3.5" />
                        </Link>
                      </Button>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </>
  );
}
