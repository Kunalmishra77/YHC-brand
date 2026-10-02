import 'server-only';

import { getSessionUser } from '@/lib/rbac';
import { db } from '@/server/demo/store';

/** The signed-in customer's record, or null. Demo: cookie; Phase 03: Supabase phone-OTP session. */
export async function getCurrentCustomer() {
  const user = await getSessionUser();
  if (!user?.customerId) return null;
  return db().customers.find((c) => c.id === user.customerId) ?? null;
}
