'use server';

import { revalidatePath } from 'next/cache';
import type { z } from 'zod';
import { AppError } from '@/lib/errors';
import type { Result } from '@/lib/result';
import { formatAddress, planPaymentSchema } from '@/lib/validation/checkout';
import { db, payRecommendation } from '@/server/demo/store';
import { getCurrentCustomer } from '@/server/session';
import { guard } from '../../(site)/book/action-utils';
import { savedAddressFor } from '../saved-address';

/*
 * One-tap plan payment from /r/{token} (FR-M6-3, ADR-14). The token is the credential; the server
 * re-prices the chosen plan via quotePlan() inside payRecommendation() and never reads a client amount.
 * Retrying returns the same paid order (idempotent in the store).
 */
export async function payPlanAction(
  raw: z.input<typeof planPaymentSchema>,
): Promise<Result<{ code: string }>> {
  return guard(async () => {
    const input = planPaymentSchema.parse(raw);
    const rec = db().recommendations.find((r) => r.token === input.token);
    if (!rec || rec.status === 'draft') throw new AppError('not_found', 'This link is not valid.', 404);
    if (rec.status === 'cancelled' || rec.status === 'declined')
      throw new AppError('expired', 'This plan is no longer active. Message us on WhatsApp for help.', 410);

    let address: string;
    if (input.address) address = formatAddress(input.address);
    else {
      // The saved address is only usable from a session that belongs to this plan's customer.
      const customer = await getCurrentCustomer();
      const saved = customer?.id === rec.customerId ? savedAddressFor(rec.customerId) : null;
      if (!saved) throw new AppError('address_required', 'Please enter a delivery address.', 422);
      address = saved;
    }

    // TODO(phase-04): Razorpay order + verified webhook → capture_payment() → mark_order_paid.
    const order = payRecommendation({ token: input.token, planId: input.planId, address });
    revalidatePath(`/r/${input.token}`);
    revalidatePath('/account');
    return { code: order.code };
  });
}
