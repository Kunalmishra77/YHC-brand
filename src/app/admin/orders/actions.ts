'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { t } from '@/i18n/en';
import { AppError } from '@/lib/errors';
import { formatINR } from '@/lib/money';
import { runAdminAction, type ActionResult } from '@/server/admin/guard';
import { OVERRIDE_STATUSES, overrideOrderStatus, recordRefund } from '@/server/admin/orders';
import { advanceOrder, db } from '@/server/demo/store';

const ORDER_ROLES = ['admin', 'ops'] as const;
const id = z.string().min(1).max(64);

function revalidateOrders(code?: string) {
  revalidatePath('/admin', 'layout');
  if (code) revalidatePath(`/admin/orders/${code}`);
}

/** paid → processing → shipped → delivered (FR-M9). */
export async function advanceOrderAction(orderId: string): Promise<ActionResult> {
  return runAdminAction([...ORDER_ROLES], id, orderId, (oid, user) => {
    const order = advanceOrder(oid, user.name);
    revalidateOrders(order.code);
    return `${order.code} → ${t(`status.order.${order.status}`)}`;
  });
}

const overrideSchema = z.object({
  status: z.enum(OVERRIDE_STATUSES),
  reason: z.string().trim().min(3, 'Add a reason (at least 3 characters).').max(200),
});

export async function overrideOrderAction(
  orderId: string,
  input: z.infer<typeof overrideSchema>,
): Promise<ActionResult> {
  return runAdminAction([...ORDER_ROLES], overrideSchema, input, (data, user) => {
    const order = overrideOrderStatus(orderId, data.status, data.reason, user.name);
    revalidateOrders(order.code);
    return `${order.code} marked ${t(`status.order.${order.status}`)} · audited`;
  });
}

const refundSchema = z
  .object({
    full: z.boolean(),
    amountRupees: z.number().positive().max(1_000_000).optional(),
    reason: z.string().trim().min(3, 'Add a reason (at least 3 characters).').max(200),
  })
  .refine((v) => v.full || v.amountRupees !== undefined, 'Enter the partial refund amount.');

export type RefundInput = z.infer<typeof refundSchema>;

export async function refundOrderAction(orderId: string, input: RefundInput): Promise<ActionResult> {
  return runAdminAction([...ORDER_ROLES], refundSchema, input, (data, user) => {
    const order = db().orders.find((o) => o.id === orderId);
    if (!order?.paymentId) throw new AppError('not_paid', 'Only paid orders can be refunded.', 409);
    const r = recordRefund({
      kind: 'order',
      target: order.code,
      paidPaise: order.totalPaise,
      amountPaise: Math.round((data.amountRupees ?? 0) * 100),
      full: data.full,
      reason: data.reason,
      actor: user.name,
    });
    revalidateOrders(order.code);
    return `Refund of ${formatINR(r.amountPaise)} recorded for ${order.code} (demo — no money moved)`;
  });
}

export async function regenerateInvoiceAction(orderId: string): Promise<ActionResult> {
  return runAdminAction([...ORDER_ROLES], id, orderId, (oid) => {
    const order = db().orders.find((o) => o.id === oid);
    // TODO(client): GST invoice format, GSTIN and seller address — see docs/12 (invoice row)
    return `Invoice for ${order?.code ?? 'order'} regenerated (demo — PDF arrives with Phase 06)`;
  });
}
