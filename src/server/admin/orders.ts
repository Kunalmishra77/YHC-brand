import 'server-only';

import type { Order } from '@/lib/domain/types';
import { AppError } from '@/lib/errors';
import { formatINR } from '@/lib/money';
import { db, recordAudit } from '@/server/demo/store';
import { adminState, nextAdminId, type RefundRecord } from './state';

/*
 * Admin order/appointment mutations the shared store does not have yet. Demo only: no money
 * moves — Phase 06/08 replace these with Razorpay refunds + `mark_order_*` SQL functions.
 */

export const OVERRIDE_STATUSES = ['rto', 'cancelled'] as const satisfies readonly Order['status'][];

/** FR-M9-4 manual status override with reason (audited). */
export function overrideOrderStatus(
  orderId: string,
  status: (typeof OVERRIDE_STATUSES)[number],
  reason: string,
  actor: string,
): Order {
  const order = db().orders.find((o) => o.id === orderId);
  if (!order) throw new AppError('not_found', 'Order not found', 404);
  if (order.status === 'pending_payment' || order.status === status) {
    throw new AppError('invalid_state', `Order is ${order.status.replaceAll('_', ' ')}`, 409);
  }
  const from = order.status;
  order.status = status;
  recordAudit(actor, 'order.status_override', `${order.code}: ${from} → ${status} · ${reason}`);
  return order;
}

export function refundedSoFar(target: string): number {
  return adminState()
    .refunds.filter((r) => r.target === target)
    .reduce((s, r) => s + r.amountPaise, 0);
}

/** Records a demo refund (full or partial, with reason) and audits it (FR-M12-3, FR-M12-4). */
export function recordRefund(input: {
  kind: RefundRecord['kind'];
  target: string;
  paidPaise: number;
  amountPaise: number;
  full: boolean;
  reason: string;
  actor: string;
}): RefundRecord {
  const remaining = input.paidPaise - refundedSoFar(input.target);
  const amount = input.full ? remaining : input.amountPaise;
  if (remaining <= 0) throw new AppError('already_refunded', 'This payment is already fully refunded.', 409);
  if (!Number.isInteger(amount) || amount <= 0 || amount > remaining) {
    throw new AppError('invalid_amount', `Refund must be between ₹1 and ${formatINR(remaining)}.`, 422);
  }
  const record: RefundRecord = {
    id: nextAdminId('rfd'),
    target: input.target,
    kind: input.kind,
    amountPaise: amount,
    full: amount === remaining && refundedSoFar(input.target) === 0,
    reason: input.reason,
    actor: input.actor,
    at: new Date().toISOString(),
  };
  adminState().refunds.unshift(record);
  recordAudit(
    input.actor,
    input.kind === 'order' ? 'order.refund' : 'appointment.refund',
    `${input.target} · ${formatINR(amount)} · ${input.reason} (demo, no money moved)`,
  );
  return record;
}
