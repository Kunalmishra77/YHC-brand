import 'server-only';

import type { Customer } from '@/lib/domain/types';
import { AppError } from '@/lib/errors';
import { db } from '@/server/demo/store';

/** FR-M4-7 profile edit. Phone is the login identity and is not editable here. */
export function updateCustomerProfile(
  customerId: string,
  input: { name: string; email: string | null },
): Customer {
  const customer = db().customers.find((c) => c.id === customerId);
  if (!customer) throw new AppError('not_found', 'Account not found', 404);
  customer.name = input.name;
  customer.email = input.email;
  const lead = db().leads.find((l) => l.customerId === customerId);
  if (lead) lead.name = input.name;
  return customer;
}
