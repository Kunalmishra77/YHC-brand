import 'server-only';

import { addDays, differenceInCalendarDays, format } from 'date-fns';
import type { GuaranteePolicy } from '@/lib/domain/types';
import type { Paise } from '@/lib/money';

/*
 * Guarantee eligibility engine (TRD §6.6, FR-M11-4). PURE: no store, no clock — `today` is passed in.
 * Dates are IST business dates (`YYYY-MM-DD`); instants are UTC ISO strings converted by the caller.
 *
 * Interpretation notes (see final report / docs/15):
 * - Rules that are measured over the coverage period report `pending` while the plan is still running
 *   and the customer is on track. Only `met` counts as passed.
 * - `claim_window` opens on the coverage end date (terms: "within N days of finishing the plan").
 * - Month windows are counted from the first delivery: month 1 = delivery day … day 30, month 2 =
 *   day 31 … 60, and so on.
 */

export type RuleId =
  'min_plan_months' | 'checkin_response' | 'monthly_photos' | 'followup_consult' | 'claim_window';
export type RuleState = 'met' | 'pending' | 'not_met';

export interface EligibilityRule {
  id: RuleId;
  label: string;
  passed: boolean;
  state: RuleState;
  detail: string;
}

export interface DeliveredPlanOrder {
  id: string;
  deliveredOn: string; // IST date
  planEndOn: string; // IST date
  months: number;
  paidPaise: Paise;
}

export interface EligibilityInput {
  deliveredOrders: DeliveredPlanOrder[];
  /** `sentOn` = IST date the check-in went out; `replied` = any answer received. */
  checkins: { sentOn: string; replied: boolean }[];
  /** IST dates of progress photo sets. */
  photos: { takenOn: string }[];
  consults: { kind: 'first' | 'follow_up'; status: string; on: string }[];
  today: string; // IST date
}

export interface EligibilityResult {
  eligible: boolean;
  enrolled: boolean;
  enrolledOn: string | null;
  coverageStart: string | null;
  coverageEnd: string | null;
  claimClosesOn: string | null;
  coverageMonths: number;
  refundPaise: Paise;
  rules: EligibilityRule[];
}

/** Max gap between one plan's end and the next delivery to still count as continuous. */
export const MAX_GAP_DAYS = 7;
const MONTH_DAYS = 30;

const d = (date: string) => new Date(`${date}T00:00:00Z`);
const ymd = (date: Date) => date.toISOString().slice(0, 10);
/** `12 Oct 2026` — readable, timezone-free (inputs are already IST business dates). */
export const readable = (date: string) => format(new Date(`${date}T12:00:00Z`), 'd MMM yyyy');
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

function rule(id: RuleId, label: string, state: RuleState, detail: string): EligibilityRule {
  return { id, label, state, passed: state === 'met', detail };
}

/** The most recent run of plan orders with no gap longer than MAX_GAP_DAYS. */
export function latestContinuousChain(orders: DeliveredPlanOrder[]): DeliveredPlanOrder[] {
  const sorted = [...orders].sort((a, b) => a.deliveredOn.localeCompare(b.deliveredOn));
  let chain: DeliveredPlanOrder[] = [];
  let chainEnd = '';
  for (const order of sorted) {
    const continues =
      chain.length > 0 && differenceInCalendarDays(d(order.deliveredOn), d(chainEnd)) <= MAX_GAP_DAYS;
    if (continues) {
      chain.push(order);
      if (order.planEndOn > chainEnd) chainEnd = order.planEndOn;
    } else {
      chain = [order];
      chainEnd = order.planEndOn;
    }
  }
  return chain;
}

export function evaluateEligibility(policy: GuaranteePolicy, input: EligibilityInput): EligibilityResult {
  const { today } = input;
  const chain = latestContinuousChain(input.deliveredOrders);
  const first = [...input.deliveredOrders].sort((a, b) => a.deliveredOn.localeCompare(b.deliveredOn))[0];

  if (chain.length === 0 || !first) {
    const waiting = `Starts on the day your first plan of ${policy.minPlanMonths}+ months is delivered.`;
    const rules: EligibilityRule[] = [
      rule('min_plan_months', minPlanLabel(policy), 'not_met', `No delivered plan yet. ${waiting}`),
      rule(
        'checkin_response',
        checkinLabel(policy),
        'pending',
        'Check-ins begin after your plan is delivered.',
      ),
    ];
    if (policy.requireMonthlyPhotos)
      rules.push(
        rule(
          'monthly_photos',
          'Progress photos every month',
          'pending',
          'Photos are counted once your plan starts.',
        ),
      );
    if (policy.requireFollowupConsult)
      rules.push(
        rule(
          'followup_consult',
          'Follow-up consultation',
          'pending',
          'Book your follow-up once your plan starts.',
        ),
      );
    rules.push(
      rule('claim_window', claimLabel(policy), 'pending', 'The claim window opens when your plan finishes.'),
    );
    return {
      eligible: false,
      enrolled: false,
      enrolledOn: null,
      coverageStart: null,
      coverageEnd: null,
      claimClosesOn: null,
      coverageMonths: 0,
      refundPaise: 0,
      rules,
    };
  }

  const coverageStart = chain[0]?.deliveredOn ?? first.deliveredOn;
  const coverageEnd = chain.reduce(
    (max, o) => (o.planEndOn > max ? o.planEndOn : max),
    chain[0]?.planEndOn ?? '',
  );
  const claimClosesOn = ymd(addDays(d(coverageEnd), policy.claimWindowDays));
  const coverageMonths = chain.reduce((sum, o) => sum + o.months, 0);
  const finished = today >= coverageEnd;
  const totalDays = Math.max(1, differenceInCalendarDays(d(coverageEnd), d(coverageStart)));
  const dayOf = Math.min(totalDays, Math.max(1, differenceInCalendarDays(d(today), d(coverageStart)) + 1));
  const inCoverage = (date: string) => date >= coverageStart && date <= coverageEnd;

  const rules: EligibilityRule[] = [];

  // 1. min_plan_months
  if (coverageMonths < policy.minPlanMonths) {
    rules.push(
      rule(
        'min_plan_months',
        minPlanLabel(policy),
        'not_met',
        `Your continuous plan covers ${plural(coverageMonths, 'month')}. The guarantee needs at least ${policy.minPlanMonths} continuous months — continue your plan before ${readable(ymd(addDays(d(coverageEnd), MAX_GAP_DAYS)))} to keep it continuous.`,
      ),
    );
  } else if (!finished) {
    rules.push(
      rule(
        'min_plan_months',
        minPlanLabel(policy),
        'pending',
        `${plural(coverageMonths, 'month')} of continuous plan coverage, ${readable(coverageStart)} to ${readable(coverageEnd)}. You are on day ${dayOf} of ${totalDays}.`,
      ),
    );
  } else {
    rules.push(
      rule(
        'min_plan_months',
        minPlanLabel(policy),
        'met',
        `You completed ${plural(coverageMonths, 'month')} of continuous plan coverage, ${readable(coverageStart)} to ${readable(coverageEnd)}.`,
      ),
    );
  }

  // 2. checkin_response
  const sent = input.checkins.filter((c) => inCoverage(c.sentOn) && c.sentOn <= today);
  const replied = sent.filter((c) => c.replied).length;
  const pct = sent.length ? Math.round((replied / sent.length) * 100) : 0;
  const onTarget = sent.length > 0 && pct >= policy.minCheckinResponsePct;
  const replyDetail = !sent.length
    ? 'No check-ins have been sent yet.'
    : replied === sent.length
      ? `You replied to all ${plural(sent.length, 'check-in')}. The guarantee needs at least ${policy.minCheckinResponsePct}%.`
      : `You replied to ${replied} of ${plural(sent.length, 'check-in')} (${pct}%). The guarantee needs at least ${policy.minCheckinResponsePct}%.`;
  rules.push(
    rule(
      'checkin_response',
      checkinLabel(policy),
      finished ? (onTarget ? 'met' : 'not_met') : sent.length === 0 || onTarget ? 'pending' : 'not_met',
      !finished && sent.length > 0 && !onTarget
        ? `${replyDetail} Reply to the next check-ins to get back on track.`
        : replyDetail,
    ),
  );

  // 3. monthly_photos
  if (policy.requireMonthlyPhotos) {
    const windows = Math.max(1, Math.ceil(totalDays / MONTH_DAYS));
    const offsets = input.photos.map((p) => differenceInCalendarDays(d(p.takenOn), d(coverageStart)));
    const windowOf = (offset: number) => (offset <= MONTH_DAYS ? 0 : Math.ceil(offset / MONTH_DAYS) - 1);
    const covered = new Set(offsets.filter((o) => o >= 0 && o <= totalDays).map(windowOf));
    const todayOffset = differenceInCalendarDays(d(today), d(coverageStart));
    // windows whose last day has passed
    const elapsed = finished
      ? windows
      : Math.min(windows, Math.max(0, Math.floor((todayOffset - 1) / MONTH_DAYS)));
    const missing: number[] = [];
    for (let w = 0; w < elapsed; w++) if (!covered.has(w)) missing.push(w + 1);
    const currentWindow = Math.min(windows - 1, windowOf(Math.max(0, todayOffset)));
    const dueBy = readable(ymd(addDays(d(coverageStart), (currentWindow + 1) * MONTH_DAYS)));
    const done = Array.from({ length: windows }, (_, w) => w).filter((w) => covered.has(w)).length;
    if (missing.length > 0) {
      rules.push(
        rule(
          'monthly_photos',
          'Progress photos every month',
          'not_met',
          `Photos are missing for month ${missing.join(', ')}. You have shared photos in ${done} of ${plural(windows, 'month')}.`,
        ),
      );
    } else if (finished) {
      rules.push(
        rule(
          'monthly_photos',
          'Progress photos every month',
          'met',
          `You shared photos in all ${plural(windows, 'month')} of your plan.`,
        ),
      );
    } else {
      rules.push(
        rule(
          'monthly_photos',
          'Progress photos every month',
          'pending',
          covered.has(currentWindow)
            ? `Photos shared for month ${currentWindow + 1} of ${windows}. On track.`
            : `Photos shared in ${done} of ${plural(windows, 'month')} so far. Month ${currentWindow + 1} photos are due by ${dueBy}.`,
        ),
      );
    }
  }

  // 4. followup_consult
  if (policy.requireFollowupConsult) {
    const followUp = input.consults.find(
      (c) => c.kind === 'follow_up' && c.status === 'completed' && inCoverage(c.on),
    );
    rules.push(
      followUp
        ? rule(
            'followup_consult',
            'Follow-up consultation',
            'met',
            `You attended your follow-up consultation on ${readable(followUp.on)}.`,
          )
        : rule(
            'followup_consult',
            'Follow-up consultation',
            finished ? 'not_met' : 'pending',
            finished
              ? 'No follow-up consultation was attended during your plan.'
              : `Not attended yet. Book and attend one follow-up consultation before ${readable(coverageEnd)}.`,
          ),
    );
  }

  // 5. claim_window
  if (!finished) {
    rules.push(
      rule(
        'claim_window',
        claimLabel(policy),
        'pending',
        `Claims open when your plan finishes on ${readable(coverageEnd)} and close on ${readable(claimClosesOn)}.`,
      ),
    );
  } else if (today <= claimClosesOn) {
    const left = differenceInCalendarDays(d(claimClosesOn), d(today));
    rules.push(
      rule(
        'claim_window',
        claimLabel(policy),
        'met',
        `The claim window is open until ${readable(claimClosesOn)} (${plural(left, 'day')} left).`,
      ),
    );
  } else {
    rules.push(
      rule(
        'claim_window',
        claimLabel(policy),
        'not_met',
        `The claim window closed on ${readable(claimClosesOn)}.`,
      ),
    );
  }

  const paid = chain.reduce((sum, o) => sum + o.paidPaise, 0);
  return {
    eligible: rules.every((r) => r.passed),
    enrolled: true,
    enrolledOn: first.deliveredOn,
    coverageStart,
    coverageEnd,
    claimClosesOn,
    coverageMonths,
    refundPaise: Math.round((paid * policy.refundPercent) / 100),
    rules,
  };
}

const minPlanLabel = (p: GuaranteePolicy) => `At least ${p.minPlanMonths} months of continuous plan`;
const checkinLabel = (p: GuaranteePolicy) => `Reply to at least ${p.minCheckinResponsePct}% of check-ins`;
const claimLabel = (p: GuaranteePolicy) => `Claim within ${p.claimWindowDays} days of finishing`;
