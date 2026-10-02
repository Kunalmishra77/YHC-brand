import { CheckCircle2, Clock, ShieldCheck, XCircle } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ClaimChip } from '@/components/account/chips';
import { ClaimForm } from '@/components/account/claim-form';
import { formatDay, formatIstDay } from '@/components/account/format';
import { ACCOUNT_LINKS } from '@/components/account/links';
import { GuaranteeTerms } from '@/components/shared/pricing';
import { StatusChip, type ChipTone } from '@/components/shared/status-chip';
import { EmptyState } from '@/components/shared/states';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { t } from '@/i18n/en';
import { formatINR } from '@/lib/money';
import { cn } from '@/lib/utils';
import { customerClaims } from '@/server/account/queries';
import { getGuarantee } from '@/server/catalog';
import type { RuleState } from '@/server/guarantee/eligibility';
import { guaranteeStatus } from '@/server/guarantee/status';
import { getCurrentCustomer } from '@/server/session';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Guarantee' };

const STATE: Record<
  RuleState,
  { tone: ChipTone; words: string; icon: typeof CheckCircle2; iconClass: string }
> = {
  met: { tone: 'success', words: 'Met', icon: CheckCircle2, iconClass: 'text-success' },
  pending: { tone: 'pending', words: 'In progress', icon: Clock, iconClass: 'text-steel' },
  not_met: { tone: 'danger', words: 'Not met', icon: XCircle, iconClass: 'text-danger' },
};

const OPEN_CLAIM = ['submitted', 'under_review', 'approved'];

export default async function GuaranteePage() {
  const policy = getGuarantee();
  if (!policy) notFound(); // everything guarantee-related is hidden while guarantee.enabled = false
  const customer = await getCurrentCustomer();
  if (!customer) return null;
  const status = guaranteeStatus(policy, customer.id);
  const claims = customerClaims(customer.id);
  const openClaim = claims.find((c) => OPEN_CLAIM.includes(c.status));
  const outstanding = status.rules.filter((r) => !r.passed);
  const met = status.rules.filter((r) => r.passed).length;

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink md:text-2xl">Money-back guarantee</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            If you follow your plan for {policy.minPlanMonths}+ months, reply to check-ins, share monthly
            photos and attend your follow-up, and see no visible improvement, you can claim a refund. A doctor
            reviews every claim.
          </p>
        </div>
        {policy.isDraft ? (
          <Badge variant="outline" className="shrink-0 border-warning text-warning">
            {t('common.draftTerms')}
          </Badge>
        ) : null}
      </header>

      {/* Status card */}
      <section
        aria-labelledby="g-status"
        className="grid gap-6 rounded-xl border border-line bg-card p-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] md:p-6"
      >
        <div>
          <ShieldCheck className="size-6 text-brand" aria-hidden />
          <h2 id="g-status" className="mt-3 text-lg font-semibold text-ink">
            {status.enrolled ? 'You are enrolled' : 'Not enrolled yet'}
          </h2>
          <p className="mt-1 text-sm text-body">
            {status.enrolled && status.enrolledOn
              ? `Since ${formatDay(status.enrolledOn)}, the day your first plan was delivered.`
              : `Enrolment starts automatically when your first plan of ${policy.minPlanMonths}+ months is delivered.`}
          </p>
          {status.coverageStart && status.coverageEnd ? (
            <dl className="mt-5 space-y-3 text-sm">
              <div>
                <dt className="text-muted-foreground">Plan coverage</dt>
                <dd className="font-medium text-ink">
                  {formatDay(status.coverageStart, 'd MMM yyyy')} –{' '}
                  {formatDay(status.coverageEnd, 'd MMM yyyy')}
                </dd>
              </div>
              {status.claimClosesOn ? (
                <div>
                  <dt className="text-muted-foreground">Claim window</dt>
                  <dd className="font-medium text-ink">
                    {formatDay(status.coverageEnd, 'd MMM')} – {formatDay(status.claimClosesOn, 'd MMM yyyy')}
                  </dd>
                </div>
              ) : null}
              <div>
                <dt className="text-muted-foreground">Refund if approved</dt>
                <dd className="price text-ink">
                  {formatINR(status.refundPaise)}{' '}
                  <span className="font-sans text-[13px] font-normal text-muted-foreground">
                    ({refundBasis(policy.refundPercent)})
                  </span>
                </dd>
              </div>
            </dl>
          ) : null}
        </div>

        <div>
          <p className="text-sm font-medium text-ink">
            {met} of {status.rules.length} conditions met
          </p>
          <ul className="mt-3 divide-y divide-line">
            {status.rules.map((r) => {
              const s = STATE[r.state];
              const Icon = s.icon;
              return (
                <li key={r.id} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                  <Icon className={cn('mt-0.5 size-5 shrink-0', s.iconClass)} aria-hidden />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                      <p className="text-sm font-medium text-ink">{r.label}</p>
                      <StatusChip tone={s.tone}>{s.words}</StatusChip>
                    </div>
                    <p className="mt-1 text-sm text-body">{r.detail}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Claim */}
      <section aria-labelledby="g-claim" className="rounded-xl border border-line bg-card p-5 md:p-6">
        <h2 id="g-claim" className="text-base font-semibold text-ink">
          Make a claim
        </h2>
        {openClaim ? (
          <p className="mt-2 text-sm text-body">
            Your claim {openClaim.code} is in progress — see its status below. We will message you on WhatsApp
            at each step.
          </p>
        ) : status.eligible ? (
          <div className="mt-3">
            <ClaimForm refundLabel={formatINR(status.refundPaise)} />
          </div>
        ) : (
          <div className="mt-2 text-sm text-body">
            <p>The claim button appears once every condition is met. Still to do:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {outstanding.map((r) => (
                <li key={r.id}>
                  <span className="font-medium text-ink">{r.label}</span> — {r.detail}
                </li>
              ))}
            </ul>
            {outstanding.some((r) => r.id === 'monthly_photos') ||
            outstanding.some((r) => r.id === 'followup_consult') ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {outstanding.some((r) => r.id === 'monthly_photos') ? (
                  <Button asChild variant="outline" className="h-11 px-5">
                    <Link href={ACCOUNT_LINKS.photos}>Upload photos</Link>
                  </Button>
                ) : null}
                {outstanding.some((r) => r.id === 'followup_consult') ? (
                  <Button asChild variant="outline" className="h-11 px-5">
                    <Link href={ACCOUNT_LINKS.bookFollowUp}>Book follow-up</Link>
                  </Button>
                ) : null}
              </div>
            ) : null}
          </div>
        )}
      </section>

      {/* Claims */}
      <section aria-labelledby="g-claims">
        <h2 id="g-claims" className="eyebrow">
          Your claims
        </h2>
        {claims.length === 0 ? (
          <EmptyState
            className="mt-3"
            title="No claims"
            body="If you make a claim, its status and the doctor's decision show here."
          />
        ) : (
          <ul className="mt-3 divide-y divide-line rounded-xl border border-line bg-card">
            {claims.map((c) => (
              <li key={c.id} className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-ink">
                    {c.code} ·{' '}
                    <span className="font-normal text-muted-foreground">
                      submitted {formatIstDay(c.submittedAt)}
                    </span>
                  </p>
                  <ClaimChip status={c.status} />
                </div>
                <p className="mt-2 line-clamp-3 text-sm text-body">{c.statement}</p>
                {c.decisionNotes ? (
                  <p className="mt-2 rounded-md bg-mist p-3 text-sm text-ink">
                    Doctor’s note: {c.decisionNotes}
                  </p>
                ) : null}
                {c.refundPaise > 0 ? (
                  <p className="mt-2 text-[13px] text-muted-foreground">
                    Refund amount: {formatINR(c.refundPaise)}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <GuaranteeTerms policy={policy} />
      <p className="text-[13px] text-muted-foreground">
        {t('common.resultsVary')} Read the{' '}
        <Link href={ACCOUNT_LINKS.guaranteeTerms} className="underline underline-offset-2">
          full guarantee terms
        </Link>
        .
      </p>
    </div>
  );
}

/** Full refunds are worded in plain language rather than as a bare percentage (PRD §15). */
function refundBasis(percent: number) {
  return percent >= 100 ? 'your full plan payments' : `${percent}% of your plan payments`;
}
