'use server';

import { revalidatePath } from 'next/cache';
import type { z } from 'zod';
import type { CartQuote } from '@/components/checkout/types';
import { AppError } from '@/lib/errors';
import { requireRole } from '@/lib/rbac';
import type { Result } from '@/lib/result';
import { cartSchema, checkoutSchema, formatAddress } from '@/lib/validation/checkout';
import { PRODUCTS } from '@/server/demo/fixtures';
import { buyProducts, db } from '@/server/demo/store';
import { guard } from '../book/action-utils';

/*
 * Shop checkout (FR-M2-3..5). Prices come only from the catalog on the server — the client sends ids
 * and quantities. Payment: demo "Razorpay" sheet → this action plays webhook → mark_order_paid.
 */

function price(items: z.infer<typeof cartSchema>): CartQuote {
  const lines: CartQuote['lines'] = [];
  const unavailable: string[] = [];
  for (const item of items) {
    const p = PRODUCTS.find((x) => x.id === item.productId);
    if (!p || p.requiresConsultation || p.pricePaise === null) {
      unavailable.push(p?.name ?? 'An item');
      continue;
    }
    lines.push({
      productId: p.id,
      name: p.name,
      qty: item.qty,
      unitPaise: p.pricePaise,
      amountPaise: p.pricePaise * item.qty,
    });
  }
  const subtotal = lines.reduce((s, l) => s + l.amountPaise, 0);
  return { lines, unavailable, subtotalPaise: subtotal, deliveryPaise: 0, totalPaise: subtotal };
}

export async function quoteCartAction(raw: z.input<typeof cartSchema>): Promise<Result<CartQuote>> {
  return guard(() => price(cartSchema.parse(raw)));
}

export async function payCartAction(
  raw: z.input<typeof checkoutSchema>,
): Promise<Result<{ code: string; totalPaise: number }>> {
  return guard(async () => {
    const input = checkoutSchema.parse(raw);
    const user = await requireRole(['customer']);
    if (!user.customerId || !db().customers.some((c) => c.id === user.customerId))
      throw new AppError('unauthenticated', 'Please verify your mobile number again.', 401);
    const quote = price(input.items);
    if (quote.unavailable.length > 0 || quote.lines.length === 0)
      throw new AppError(
        'not_buyable',
        'Some items need a consultation first. Please review your cart.',
        422,
      );
    // Demo: buyProducts creates the pending order and marks it paid (webhook role). Prepaid only.
    // TODO(phase-04): Razorpay order + verified webhook instead.
    const order = buyProducts({
      customerId: user.customerId,
      items: quote.lines.map((l) => ({ productId: l.productId, qty: l.qty })),
      address: formatAddress(input.address),
    });
    revalidatePath('/account');
    return { code: order.code, totalPaise: order.totalPaise };
  });
}
