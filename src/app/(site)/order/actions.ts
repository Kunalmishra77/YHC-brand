'use server';

import type { OrderStatus } from '@/lib/domain/types';
import { AppError } from '@/lib/errors';
import type { Result } from '@/lib/result';
import { orderLookupSchema } from '@/lib/validation/checkout';
import { guard } from '../book/action-utils';
import { findVisibleOrder } from './order-access';

/** Polled by the order confirmation page (FR-M2-6). */
export async function orderStatusAction(raw: {
  code: string;
  token?: string;
}): Promise<Result<{ status: OrderStatus }>> {
  return guard(async () => {
    const { code, token } = orderLookupSchema.parse(raw);
    const { order } = await findVisibleOrder(code, token);
    if (!order) throw new AppError('not_found', 'We could not find this order.', 404);
    return { status: order.status };
  });
}
