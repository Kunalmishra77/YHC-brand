import 'server-only';

import type { Order } from '@/lib/domain/types';
import { db } from '@/server/demo/store';
import { getCurrentCustomer } from '@/server/session';

/**
 * An order is visible to its signed-in customer, or to whoever holds the plan link (`?t=` token) the
 * order was paid from (ADR-14 — the token already grants access to that plan).
 */
export async function findVisibleOrder(
  code: string,
  token: string | undefined,
): Promise<{ order: Order | null; signedIn: boolean }> {
  const customer = await getCurrentCustomer();
  const order = db().orders.find((o) => o.code === code) ?? null;
  if (!order) return { order: null, signedIn: Boolean(customer) };
  if (customer?.id === order.customerId) return { order, signedIn: true };
  if (token && order.recommendationId) {
    const rec = db().recommendations.find((r) => r.id === order.recommendationId);
    if (rec && rec.token === token) return { order, signedIn: Boolean(customer) };
  }
  return { order: null, signedIn: Boolean(customer) };
}
