import 'server-only';

import type { GuaranteePolicy } from '@/lib/domain/types';
import { istDate } from '@/lib/time';
import { getPlan } from '@/server/catalog';
import { db } from '@/server/demo/store';
import { evaluateEligibility, type EligibilityResult } from './eligibility';

/** Collects the customer's adherence data and runs the pure eligibility engine (FR-M11-4). */
export function guaranteeStatus(
  policy: GuaranteePolicy,
  customerId: string,
  now = new Date(),
): EligibilityResult {
  const s = db();
  const deliveredOrders = s.orders
    .filter(
      (o) =>
        o.customerId === customerId && o.planId && o.deliveredOn && o.planEndOn && o.status === 'delivered',
    )
    .map((o) => ({
      id: o.id,
      deliveredOn: o.deliveredOn ?? '',
      planEndOn: o.planEndOn ?? '',
      months: (o.planId ? getPlan(o.planId)?.months : undefined) ?? 0,
      paidPaise: o.totalPaise,
    }));
  return evaluateEligibility(policy, {
    deliveredOrders,
    checkins: s.checkins
      .filter((c) => c.customerId === customerId)
      .map((c) => ({ sentOn: istDate(new Date(c.sentAt)), replied: c.reply !== null })),
    photos: s.photos.filter((p) => p.customerId === customerId).map((p) => ({ takenOn: p.takenOn })),
    consults: s.appointments
      .filter((a) => a.customerId === customerId)
      .map((a) => ({ kind: a.kind, status: a.status, on: istDate(new Date(a.startsAt)) })),
    today: istDate(now),
  });
}
