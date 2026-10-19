import 'server-only';

import { DEMO_DEFAULT_CUSTOMER_ID } from '@/lib/demo-session';
import { activePlan } from '@/server/account/queries';
import { db } from '@/server/demo/store';

/**
 * FUN-10: the /demo role card for the customer reads the same seeded plan order and `planProgress()`
 * as the customer portal, so "day N" always matches /account (no hard-coded day count).
 */
export function demoCustomerSummary(now = new Date()): string {
  const customer = db().customers.find((c) => c.id === DEMO_DEFAULT_CUSTOMER_ID);
  if (!customer) return 'Sample customer';
  const active = activePlan(customer.id, now);
  if (!active) return customer.name;
  return `${customer.name} · day ${active.progress.day} of a ${active.plan.months}-month plan`;
}
