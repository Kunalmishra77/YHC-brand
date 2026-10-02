import { describe, expect, it } from 'vitest';
import type { GuaranteePolicy } from '@/lib/domain/types';
import { evaluateEligibility, latestContinuousChain, type EligibilityInput } from './eligibility';

const POLICY: GuaranteePolicy = {
  version: 1,
  name: 'Test policy',
  refundPercent: 100, // full refund of plan payments
  minPlanMonths: 3,
  claimWindowDays: 30,
  minCheckinResponsePct: 75,
  requireMonthlyPhotos: true,
  requireFollowupConsult: true,
  termsMd: 'terms',
  isActive: true,
  isDraft: true,
};

const threeMonth = {
  id: 'o1',
  deliveredOn: '2026-01-01',
  planEndOn: '2026-04-01',
  months: 3,
  paidPaise: 1449900,
};

/** Everything done right: 4 of 4 check-ins, a photo set each month, follow-up attended. */
function happy(today: string): EligibilityInput {
  return {
    deliveredOrders: [threeMonth],
    checkins: ['2026-01-08', '2026-01-15', '2026-01-22', '2026-01-29'].map((sentOn) => ({
      sentOn,
      replied: true,
    })),
    photos: [{ takenOn: '2026-01-30' }, { takenOn: '2026-03-01' }, { takenOn: '2026-03-30' }],
    consults: [
      { kind: 'first', status: 'completed', on: '2025-12-28' },
      { kind: 'follow_up', status: 'completed', on: '2026-02-26' },
    ],
    today,
  };
}

const byId = (r: ReturnType<typeof evaluateEligibility>, id: string) => r.rules.find((x) => x.id === id);

describe('evaluateEligibility', () => {
  it('is eligible when every rule is met inside the claim window', () => {
    const r = evaluateEligibility(POLICY, happy('2026-04-10'));
    expect(r.eligible).toBe(true);
    expect(r.rules.every((x) => x.passed)).toBe(true);
    expect(r.refundPaise).toBe(1449900);
    expect(r.coverageEnd).toBe('2026-04-01');
    expect(r.claimClosesOn).toBe('2026-05-01');
    expect(byId(r, 'checkin_response')?.detail).toBe(
      'You replied to all 4 check-ins. The guarantee needs at least 75%.',
    );
  });

  it('applies refund percent to plan payments', () => {
    const r = evaluateEligibility({ ...POLICY, refundPercent: 50 }, happy('2026-04-10'));
    expect(r.refundPaise).toBe(724950);
  });

  it('reports pending (not failed) while the plan is still running', () => {
    const input = happy('2026-02-03');
    input.photos = [{ takenOn: '2026-01-30' }];
    input.consults = [];
    const r = evaluateEligibility(POLICY, input);
    expect(r.eligible).toBe(false);
    expect(byId(r, 'min_plan_months')?.state).toBe('pending');
    expect(byId(r, 'monthly_photos')?.state).toBe('pending');
    expect(byId(r, 'monthly_photos')?.detail).toContain('Month 2 photos are due by 2 Mar 2026');
    expect(byId(r, 'followup_consult')?.state).toBe('pending');
    expect(byId(r, 'claim_window')?.state).toBe('pending');
  });

  it('fails check-in response below the minimum, with plain words', () => {
    const input = happy('2026-04-10');
    input.checkins = input.checkins.map((c, i) => ({ ...c, replied: i < 2 }));
    const r = evaluateEligibility(POLICY, input);
    expect(r.eligible).toBe(false);
    const rule = byId(r, 'checkin_response');
    expect(rule?.passed).toBe(false);
    expect(rule?.detail).toBe('You replied to 2 of 4 check-ins (50%). The guarantee needs at least 75%.');
  });

  it('counts 3 of 4 replies as exactly 75% (met)', () => {
    const input = happy('2026-04-10');
    input.checkins = input.checkins.map((c, i) => ({ ...c, replied: i !== 2 }));
    expect(byId(evaluateEligibility(POLICY, input), 'checkin_response')?.passed).toBe(true);
  });

  it('fails monthly photos when a month is missed', () => {
    const input = happy('2026-04-10');
    input.photos = [{ takenOn: '2026-01-30' }, { takenOn: '2026-03-30' }];
    const rule = byId(evaluateEligibility(POLICY, input), 'monthly_photos');
    expect(rule?.state).toBe('not_met');
    expect(rule?.detail).toContain('month 2');
  });

  it('fails the follow-up rule after the plan ends without one', () => {
    const input = happy('2026-04-10');
    input.consults = [{ kind: 'first', status: 'completed', on: '2025-12-28' }];
    expect(byId(evaluateEligibility(POLICY, input), 'followup_consult')?.state).toBe('not_met');
  });

  it('fails a plan shorter than the minimum months', () => {
    const input = happy('2026-02-10');
    input.deliveredOrders = [{ ...threeMonth, planEndOn: '2026-01-31', months: 1 }];
    const r = evaluateEligibility(POLICY, input);
    expect(byId(r, 'min_plan_months')?.state).toBe('not_met');
    expect(r.eligible).toBe(false);
  });

  it('closes the claim window after claim_window_days', () => {
    const r = evaluateEligibility(POLICY, happy('2026-05-02'));
    expect(byId(r, 'claim_window')?.state).toBe('not_met');
    expect(byId(r, 'claim_window')?.detail).toBe('The claim window closed on 1 May 2026.');
    expect(r.eligible).toBe(false);
  });

  it('skips optional rules the policy does not require', () => {
    const r = evaluateEligibility(
      { ...POLICY, requireMonthlyPhotos: false, requireFollowupConsult: false },
      { ...happy('2026-04-10'), photos: [], consults: [] },
    );
    expect(r.rules.map((x) => x.id)).toEqual(['min_plan_months', 'checkin_response', 'claim_window']);
    expect(r.eligible).toBe(true);
  });

  it('is not enrolled without a delivered plan', () => {
    const r = evaluateEligibility(POLICY, { ...happy('2026-04-10'), deliveredOrders: [] });
    expect(r.enrolled).toBe(false);
    expect(r.eligible).toBe(false);
    expect(r.refundPaise).toBe(0);
  });
});

describe('latestContinuousChain', () => {
  const one = (id: string, deliveredOn: string, planEndOn: string) => ({
    id,
    deliveredOn,
    planEndOn,
    months: 1,
    paidPaise: 599900,
  });

  it('joins plans with a gap of up to 7 days', () => {
    const chain = latestContinuousChain([
      one('a', '2026-01-01', '2026-01-31'),
      one('b', '2026-02-07', '2026-03-09'),
      one('c', '2026-03-10', '2026-04-09'),
    ]);
    expect(chain.map((o) => o.id)).toEqual(['a', 'b', 'c']);
  });

  it('starts a new chain after a longer gap', () => {
    const chain = latestContinuousChain([
      one('a', '2026-01-01', '2026-01-31'),
      one('b', '2026-02-09', '2026-03-11'),
    ]);
    expect(chain.map((o) => o.id)).toEqual(['b']);
  });
});
