import 'server-only';

import { db } from '@/server/demo/store';

/**
 * The customer's most recent delivery address (from their latest order). Demo: customers have no
 * address book yet. TODO(store): `addresses` table / `getSavedAddress(customerId)`.
 */
export function savedAddressFor(customerId: string): string | null {
  const latest = db()
    .orders.filter((o) => o.customerId === customerId && o.address.trim().length > 0)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  return latest?.address ?? null;
}
