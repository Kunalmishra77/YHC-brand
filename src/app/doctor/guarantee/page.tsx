import { CheckCircle2, ShieldCheck, ShieldOff, XCircle } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ClaimDecision } from '@/components/doctor/claim-decision';
import { PhotoPanel } from '@/components/doctor/photo-panel';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/states';
import { StatusChip, type ChipTone } from '@/components/shared/status-chip';
import type { GuaranteeClaim } from '@/lib/domain/types';
import { formatINR } from '@/lib/money';
import { formatIst } from '@/lib/time';
import { cn } from '@/lib/utils';
import { recordAudit } from '@/server/demo/store';
import { requireDoctorPage } from '@/server/doctor/auth';
import { listClaimReviews } from '@/server/doctor/claims';

export const metadata: Metadata = { title: 'Guarantee reviews · Doctor Portal' };

const STATUS: Record<GuaranteeClaim['status'], { tone: ChipTone; label: string }> = {
  submitted: { tone: 'pending', label: 'Submitted · to review' },
  under_review: { tone: 'warning', label: 'Under review' },
  approved: { tone: 'success', label: 'Approved · refund pending' },
  rejected: { tone: 'danger', label: 'Rejected' },
  refunded: { tone: 'success', label: 'Refunded' },
  withdrawn: { tone: 'neutral', label: 'Withdrawn' },
};

export default async function GuaranteeReviewsPage() {
  const user = await requireDoctorPage('/doctor/guarantee');
  const data = listClaimReviews();

  if (!data) {
    return (
      <>
        <PageHeader title="Guarantee reviews" />
        <EmptyState
          icon={ShieldOff}
          title="The guarantee is switched off"
          body="Claims appear here once the guarantee is enabled with approved terms."
        />
      </>
    );
  }
  const { policy, reviews } = data;
  // Claims show photos and plan history — a clinical view (FR-M14-4).
  if (reviews.length)
    recordAudit(
      user.name,
      'clinical.view',
      `Guarantee reviews · ${reviews.map((r) => r.claim.code).join(', ')}`,
    );
  const open = reviews.filter(
    (r) => r.claim.status === 'submitted' || r.claim.status === 'under_review',
  ).length;

  return (
    <>
      <PageHeader
        title="Guarantee reviews"
        description={`${open} open claim${open === 1 ? '' : 's'} · ${policy.name}`}
      />
      <div className="mb-6 flex gap-2 rounded-xl bg-card p-4 text-sm text-body shadow-card ring-1 ring-line/80">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
        <p>
          {policy.termsMd}
          {policy.isDraft ? <span className="text-warning"> · Draft terms — pending approval</span> : null}
        </p>
      </div>

      {reviews.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="No claims"
          body="Guarantee claims submitted by patients appear here for your review."
        />
      ) : (
        <ul className="space-y-5">
          {reviews.map((r) => {
            const status = STATUS[r.claim.status];
            const decided = r.claim.status !== 'submitted' && r.claim.status !== 'under_review';
            const sets = r.photos.map((p) => ({
              id: p.id,
              label: p.label,
              takenOn: formatIst(new Date(`${p.takenOn}T06:30:00Z`), 'd MMM yyyy'),
            }));
            return (
              <li key={r.claim.id} className="rounded-xl bg-card shadow-card ring-1 ring-line/80">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3 md:px-5">
                  <div>
                    <p className="font-semibold text-ink">
                      {r.claim.code} ·{' '}
                      <Link href={`/doctor/patients/${r.customer.id}`} className="hover:underline">
                        {r.customer.name}
                      </Link>
                    </p>
                    <p className="text-[13px] text-muted-foreground">
                      Submitted {formatIst(new Date(r.claim.submittedAt))}
                    </p>
                  </div>
                  <StatusChip tone={status.tone}>{status.label}</StatusChip>
                </div>
                <div className="grid gap-5 p-4 md:p-5 lg:grid-cols-3">
                  <div>
                    <h3 className="mb-2 text-[13px] font-semibold tracking-[0.1em] text-brand uppercase">
                      Statement
                    </h3>
                    <p className="text-sm text-body">“{r.claim.statement}”</p>
                    <dl className="mt-3 space-y-1 text-sm">
                      <div className="flex justify-between gap-2">
                        <dt className="text-muted-foreground">Plan payments</dt>
                        <dd className="price text-ink">{formatINR(r.planPaymentsPaise)}</dd>
                      </div>
                      <div className="flex justify-between gap-2">
                        <dt className="text-muted-foreground">Refund at {policy.refundPercent}%</dt>
                        <dd className="price text-ink">{formatINR(r.proposedRefundPaise)}</dd>
                      </div>
                    </dl>
                  </div>
                  <div>
                    <h3 className="mb-2 text-[13px] font-semibold tracking-[0.1em] text-brand uppercase">
                      Eligibility snapshot
                    </h3>
                    <ul className="space-y-2">
                      {r.rules.map((rule) => (
                        <li key={rule.id} className="flex gap-2 text-sm">
                          {rule.passed ? (
                            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
                          ) : (
                            <XCircle className="mt-0.5 size-4 shrink-0 text-danger" aria-hidden />
                          )}
                          <span>
                            <span className={cn('font-medium', rule.passed ? 'text-ink' : 'text-danger')}>
                              {rule.passed ? 'Met' : 'Not met'} · {rule.label}
                            </span>
                            <span className="block text-[13px] text-muted-foreground">{rule.detail}</span>
                          </span>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-3">
                      <StatusChip tone={r.eligible ? 'success' : 'warning'}>
                        {r.eligible ? 'All conditions met' : 'Conditions not met'}
                      </StatusChip>
                    </p>
                    <p className="mt-2 text-[12px] text-muted-foreground">
                      Snapshot (demo). Full eligibility engine arrives with the guarantee phase.
                    </p>
                  </div>
                  <div>
                    <h3 className="mb-2 text-[13px] font-semibold tracking-[0.1em] text-brand uppercase">
                      Photo comparison
                    </h3>
                    <PhotoPanel
                      current={sets.at(-1) ?? null}
                      previous={sets.slice(0, -1)}
                      patientName={r.customer.name}
                    />
                  </div>
                </div>
                <div className="border-t border-line px-4 py-4 md:px-5">
                  {decided ? (
                    <div className="text-sm">
                      <p className="font-medium text-ink">
                        Decision: {status.label}
                        {r.claim.refundPaise ? ` · ${formatINR(r.claim.refundPaise)}` : ''}
                      </p>
                      {r.claim.decisionNotes ? (
                        <p className="mt-1 text-body">{r.claim.decisionNotes}</p>
                      ) : null}
                    </div>
                  ) : (
                    <ClaimDecision
                      claimId={r.claim.id}
                      eligible={r.eligible}
                      refundLabel={formatINR(r.proposedRefundPaise)}
                    />
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
