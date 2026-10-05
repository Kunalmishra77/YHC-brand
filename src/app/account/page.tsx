import { CalendarClock, MessageSquareText, Package } from 'lucide-react';
import Link from 'next/link';
import { AppointmentChip } from '@/components/account/chips';
import { formatDay, formatWhen } from '@/components/account/format';
import { JourneyProgress } from '@/components/account/journey-progress';
import { ACCOUNT_LINKS } from '@/components/account/links';
import { PlanProgress } from '@/components/account/plan-progress';
import { JoinConsultButton } from '@/components/journey/join-consult-button';
import { StatusChip, type ChipTone } from '@/components/shared/status-chip';
import { EmptyState } from '@/components/shared/states';
import { Button } from '@/components/ui/button';
import type { CareCheckin } from '@/lib/domain/types';
import { istDate } from '@/lib/time';
import { deriveNextStep } from '@/server/account/next-step';
import {
  CONCERN_LABEL,
  activePlan,
  customerAppointments,
  customerCheckins,
  customerPhotos,
  followUpDueOn,
  reorderWindowDays,
} from '@/server/account/queries';
import { getDoctor } from '@/server/catalog';
import { getJourneyForCustomer, journeyTracker } from '@/server/journey/store';
import { getCurrentCustomer } from '@/server/session';

export const dynamic = 'force-dynamic';

// No setting exists for the join window yet; matches the /consult waiting room default.
const JOIN_WINDOW_MINUTES = 15;

const REPLY: Record<NonNullable<CareCheckin['reply']>, { tone: ChipTone; words: string }> = {
  going_well: { tone: 'success', words: 'Going well' },
  have_questions: { tone: 'info', words: 'Had a question' },
  side_effect: { tone: 'warning', words: 'Reported a side effect' },
};

export default async function AccountOverviewPage() {
  const customer = await getCurrentCustomer();
  if (!customer) return null;
  const now = new Date();
  const { upcoming, past } = customerAppointments(customer.id, now);
  const plan = activePlan(customer.id, now);
  const checkins = customerCheckins(customer.id).filter((c) => new Date(c.sentAt) <= now);
  const doctor = getDoctor();

  const step = deriveNextStep({
    now,
    today: istDate(now),
    upcoming: upcoming.map((a) => ({
      id: a.id,
      startsAt: a.startsAt,
      endsAt: a.endsAt,
      intakeDone: a.intakeDone,
      whenLabel: formatWhen(a.startsAt),
    })),
    plan: plan
      ? {
          orderId: plan.order.id,
          orderCode: plan.order.code,
          deliveredOn: plan.deliveredOn,
          planEndOn: plan.planEndOn,
        }
      : null,
    hasNewerPlanOrder: plan?.hasNewerPlanOrder ?? false,
    photoDates: customerPhotos(customer.id).map((p) => p.takenOn),
    followUpDueOn: followUpDueOn(customer.id, now),
    hasAnyConsult: past.some((a) => a.status === 'completed') || upcoming.length > 0,
    joinWindowMinutes: JOIN_WINDOW_MINUTES,
    reorderWindowDays: reorderWindowDays(),
    readableDate: (d) => formatDay(d, 'EEE d MMM'),
    links: {
      intake: ACCOUNT_LINKS.intake,
      join: ACCOUNT_LINKS.join,
      photos: ACCOUNT_LINKS.photos,
      order: ACCOUNT_LINKS.order,
      book: bookHref(followUpDueOn(customer.id, now)),
    },
  });

  const next = upcoming[0];
  const journey = getJourneyForCustomer(customer.id);
  const journeySteps = journey ? journeyTracker(journey, now) : null;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-8">
      <div className="space-y-6">
        {/* Next step — the one thing to do now */}
        <section
          aria-labelledby="next-step"
          className="bg-hero-dark relative overflow-hidden rounded-3xl p-6 text-on-dark shadow-raised md:p-8"
        >
          <p className="text-[13px] font-semibold tracking-[0.12em] text-brand-on-dark uppercase">
            Next step
          </p>
          <h2 id="next-step" className="display mt-3 text-[28px] text-balance text-on-dark md:text-[34px]">
            {step.title}
          </h2>
          <p className="mt-3 max-w-prose text-on-dark-muted">{step.body}</p>
          {step.cta ? (
            <Button
              asChild
              className="bg-silver mt-6 h-12 w-full px-6 text-obsidian hover:opacity-95 sm:w-auto"
            >
              <Link href={step.cta.href}>{step.cta.label}</Link>
            </Button>
          ) : null}
        </section>

        {/* My journey (ADR-26) */}
        {journeySteps ? <JourneyProgress steps={journeySteps} /> : null}

        {/* Current plan */}
        <section
          aria-labelledby="plan-heading"
          className="rounded-2xl bg-card p-5 shadow-card ring-1 ring-line/80 md:p-6"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="eyebrow">Your plan</p>
              <h2 id="plan-heading" className="mt-1.5 text-lg font-semibold text-ink">
                {plan ? plan.plan.name : 'No active plan'}
              </h2>
            </div>
            <Package className="mt-1 size-5 text-steel" aria-hidden />
          </div>
          {plan ? (
            <>
              <PlanProgress day={plan.progress.day} total={plan.progress.total} className="mt-5" />
              <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-muted-foreground">Started</dt>
                  <dd className="mt-0.5 font-medium text-ink">{formatDay(plan.deliveredOn)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Plan ends</dt>
                  <dd className="mt-0.5 font-medium text-ink">{formatDay(plan.planEndOn)}</dd>
                </div>
              </dl>
              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t border-line pt-4 text-sm">
                <Link
                  href={ACCOUNT_LINKS.order(plan.order.code)}
                  className="font-medium text-brand underline-offset-4 hover:underline"
                >
                  Order {plan.order.code}
                </Link>
                <Link
                  href="/account/progress"
                  className="font-medium text-brand underline-offset-4 hover:underline"
                >
                  Progress photos
                </Link>
              </div>
            </>
          ) : (
            <p className="mt-3 text-sm text-body">
              Your plan appears here once Dr. Tyagi has recommended one and it has been delivered.
            </p>
          )}
        </section>
      </div>

      <div className="space-y-6">
        {/* Upcoming consultation */}
        <section
          aria-labelledby="upcoming-heading"
          className="rounded-2xl bg-card p-5 shadow-card ring-1 ring-line/80 md:p-6"
        >
          <div className="flex items-center gap-2">
            <CalendarClock className="size-4 text-steel" aria-hidden />
            <h2 id="upcoming-heading" className="text-base font-semibold text-ink">
              Upcoming consultation
            </h2>
          </div>
          {next ? (
            <div className="mt-4">
              <p className="price text-lg text-ink">{formatWhen(next.startsAt)}</p>
              <p className="mt-1 text-sm text-body">
                {next.kind === 'follow_up' ? 'Follow-up' : 'First consultation'} with {doctor.name} ·{' '}
                {CONCERN_LABEL[next.concern]}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <AppointmentChip status={next.status} />
                <StatusChip tone={next.intakeDone ? 'success' : 'warning'}>
                  {next.intakeDone ? 'Hair profile done' : 'Hair profile pending'}
                </StatusChip>
              </div>
              <JoinConsultButton
                className="mt-5"
                href={ACCOUNT_LINKS.join(next.id)}
                startsAt={next.startsAt}
                endsAt={next.endsAt}
                windowMinutes={JOIN_WINDOW_MINUTES}
                initialOpen={
                  now.getTime() >= Date.parse(next.startsAt) - JOIN_WINDOW_MINUTES * 60_000 &&
                  now.getTime() < Date.parse(next.endsAt)
                }
              />
              <Link
                href="/account/consultations"
                className="mt-3 inline-flex min-h-11 items-center text-sm font-medium text-brand underline-offset-4 hover:underline"
              >
                Manage consultation
              </Link>
            </div>
          ) : (
            <p className="mt-3 text-sm text-body">
              Nothing booked.{' '}
              {past.length
                ? 'Your past consultations and prescriptions are in '
                : 'Book when you are ready — '}
              <Link
                href={past.length ? '/account/consultations' : ACCOUNT_LINKS.book}
                className="font-medium text-brand underline-offset-4 hover:underline"
              >
                {past.length ? 'Consultations' : 'pick a time'}
              </Link>
              .
            </p>
          )}
        </section>

        {/* Check-ins */}
        <section
          aria-labelledby="checkins-heading"
          className="rounded-2xl bg-card p-5 shadow-card ring-1 ring-line/80 md:p-6"
        >
          <div className="flex items-center gap-2">
            <MessageSquareText className="size-4 text-steel" aria-hidden />
            <h2 id="checkins-heading" className="text-base font-semibold text-ink">
              Your weekly check-ins
            </h2>
          </div>
          {checkins.length === 0 ? (
            <EmptyState
              className="mt-4 py-6"
              title="No check-ins yet"
              body="Once your plan is delivered, we check in on WhatsApp each week. Your replies show here."
            />
          ) : (
            <ol className="mt-4 divide-y divide-line">
              {checkins.slice(0, 4).map((c) => (
                <li key={c.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-medium text-ink">
                      Week {c.week} ·{' '}
                      <span className="font-normal text-muted-foreground">
                        {formatWhen(c.sentAt, 'd MMM')}
                      </span>
                    </p>
                    {c.reply ? (
                      <StatusChip tone={REPLY[c.reply].tone}>{REPLY[c.reply].words}</StatusChip>
                    ) : (
                      <StatusChip tone="neutral">No reply yet</StatusChip>
                    )}
                  </div>
                  {c.replyText ? <p className="mt-1.5 text-sm text-body">“{c.replyText}”</p> : null}
                </li>
              ))}
            </ol>
          )}
          <p className="mt-4 text-[13px] text-muted-foreground">
            Replying to check-ins helps Dr. Tyagi adjust your routine
            {checkins.some((c) => !c.reply) ? ' — you can still reply to the open one on WhatsApp.' : '.'}
          </p>
        </section>
      </div>
    </div>
  );
}

function bookHref(followUp: string | null) {
  return followUp ? ACCOUNT_LINKS.bookFollowUp : ACCOUNT_LINKS.book;
}
