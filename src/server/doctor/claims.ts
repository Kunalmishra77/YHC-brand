import 'server-only';

import { differenceInCalendarDays } from 'date-fns';
import type { Customer, GuaranteeClaim, GuaranteePolicy, Order, ProgressPhotoSet } from '@/lib/domain/types';
import { AppError } from '@/lib/errors';
import type { Paise } from '@/lib/money';
import { istDate } from '@/lib/time';
import { getGuarantee } from '@/server/catalog';
import { PLANS } from '@/server/demo/fixtures';
import { db, recordAudit } from '@/server/demo/store';

/*
 * Guarantee review (FR-M5-11). The eligibility snapshot below is a light demo version of
 * TRD §6.6 — TODO(phase-10): replace with server/guarantee/eligibility.ts (pure, tested) and a
 * SQL decision function that also emits `guarantee.decided` and queues the refund job.
 */

export interface EligibilityRule {
  id: string;
  label: string;
  passed: boolean;
  detail: string;
}

export interface ClaimReview {
  claim: GuaranteeClaim;
  customer: Customer;
  rules: EligibilityRule[];
  eligible: boolean;
  planPaymentsPaise: Paise;
  proposedRefundPaise: Paise;
  photos: ProgressPhotoSet[];
  planOrders: Order[];
}

function snapshot(policy: GuaranteePolicy, claim: GuaranteeClaim, now: Date) {
  const s = db();
  const planOrders = s.orders
    .filter((o) => o.customerId === claim.customerId && o.planId && o.paidAt && o.status !== 'cancelled')
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const months = planOrders.reduce((sum, o) => sum + (PLANS.find((p) => p.id === o.planId)?.months ?? 0), 0);
  const checkins = s.checkins.filter((c) => c.customerId === claim.customerId);
  const answered = checkins.filter((c) => c.reply !== null).length;
  const pct = checkins.length ? Math.round((answered / checkins.length) * 100) : 0;
  const photos = s.photos
    .filter((p) => p.customerId === claim.customerId)
    .sort((a, b) => a.takenOn.localeCompare(b.takenOn));
  const followUps = s.appointments.filter(
    (a) => a.customerId === claim.customerId && a.kind === 'follow_up' && a.status === 'completed',
  ).length;
  const lastEnd = planOrders
    .map((o) => o.planEndOn)
    .filter((d): d is string => d !== null)
    .sort()
    .at(-1);
  const daysSinceEnd = lastEnd ? differenceInCalendarDays(new Date(istDate(now)), new Date(lastEnd)) : null;

  const rules: EligibilityRule[] = [
    {
      id: 'min_plan_months',
      label: `Plan followed for ${policy.minPlanMonths}+ months`,
      passed: months >= policy.minPlanMonths,
      detail: months ? `${months} month${months === 1 ? '' : 's'} of paid plan cover` : 'No paid plan found',
    },
    {
      id: 'checkin_response',
      label: `Replied to ${policy.minCheckinResponsePct}%+ of check-ins`,
      passed: checkins.length > 0 && pct >= policy.minCheckinResponsePct,
      detail: checkins.length
        ? `${answered} of ${checkins.length} answered (${pct}%)`
        : 'No check-ins sent yet',
    },
  ];
  if (policy.requireMonthlyPhotos)
    rules.push({
      id: 'monthly_photos',
      label: 'Progress photos every month',
      passed: months > 0 && photos.length >= months,
      detail: `${photos.length} photo set${photos.length === 1 ? '' : 's'} for ${months || 0} month${months === 1 ? '' : 's'}`,
    });
  if (policy.requireFollowupConsult)
    rules.push({
      id: 'followup_consult',
      label: 'Attended a follow-up consultation',
      passed: followUps > 0,
      detail: followUps ? `${followUps} completed` : 'None completed',
    });
  rules.push({
    id: 'claim_window',
    label: `Claimed within ${policy.claimWindowDays} days of finishing`,
    passed: daysSinceEnd !== null && daysSinceEnd >= 0 && daysSinceEnd <= policy.claimWindowDays,
    detail:
      daysSinceEnd === null
        ? 'Plan end date not known yet'
        : daysSinceEnd < 0
          ? `Plan still running (${-daysSinceEnd} days left)`
          : `${daysSinceEnd} days after plan end`,
  });

  const planPaymentsPaise = planOrders.reduce((sum, o) => sum + o.totalPaise, 0);
  return {
    rules,
    eligible: rules.every((r) => r.passed),
    planPaymentsPaise,
    proposedRefundPaise: Math.round((planPaymentsPaise * policy.refundPercent) / 100),
    photos,
    planOrders,
  };
}

export function listClaimReviews(
  now = new Date(),
): { policy: GuaranteePolicy; reviews: ClaimReview[] } | null {
  const policy = getGuarantee();
  if (!policy) return null;
  const order: Record<GuaranteeClaim['status'], number> = {
    submitted: 0,
    under_review: 0,
    approved: 1,
    rejected: 1,
    refunded: 2,
    withdrawn: 2,
  };
  const reviews = db()
    .claims.slice()
    .sort((a, b) => order[a.status] - order[b.status] || b.submittedAt.localeCompare(a.submittedAt))
    .flatMap((claim) => {
      const customer = db().customers.find((c) => c.id === claim.customerId);
      return customer ? [{ claim, customer, ...snapshot(policy, claim, now) }] : [];
    });
  return { policy, reviews };
}

export function decideClaim(input: {
  claimId: string;
  decision: 'approved' | 'rejected';
  notes: string;
  actor: string;
}): GuaranteeClaim {
  const policy = getGuarantee();
  if (!policy) throw new AppError('guarantee_disabled', 'The guarantee is switched off.', 409);
  const claim = db().claims.find((c) => c.id === input.claimId);
  if (!claim) throw new AppError('not_found', 'Claim not found', 404);
  if (claim.status !== 'submitted' && claim.status !== 'under_review') {
    throw new AppError('invalid_state', `This claim is already ${claim.status.replace('_', ' ')}.`, 409);
  }
  const { proposedRefundPaise } = snapshot(policy, claim, new Date());
  claim.status = input.decision;
  claim.decisionNotes = input.notes;
  claim.refundPaise = input.decision === 'approved' ? proposedRefundPaise : 0;
  // Audit target carries the claim code and decision only — never clinical detail (CLAUDE.md).
  recordAudit(input.actor, 'guarantee.decision', `${claim.code} · ${input.decision}`);
  return claim;
}
