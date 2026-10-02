'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { AppError } from '@/lib/errors';
import { runAdminAction, type ActionResult } from '@/server/admin/guard';
import { adminState } from '@/server/admin/state';
import { db, recordAudit } from '@/server/demo/store';

const mergeSchema = z.object({ duplicateId: z.string().min(1).max(64) });

/** Demo merge (FR-M12-5): recorded + audited; the real merge (Phase 07) re-points orders, leads and consents. */
export async function mergeCustomerAction(
  keepId: string,
  input: z.infer<typeof mergeSchema>,
): Promise<ActionResult> {
  return runAdminAction(['admin'], mergeSchema, input, (data, user) => {
    const s = db();
    const keep = s.customers.find((c) => c.id === keepId);
    const dup = s.customers.find((c) => c.id === data.duplicateId);
    if (!keep || !dup) throw new AppError('not_found', 'Customer not found', 404);
    if (keep.id === dup.id) throw new AppError('invalid_input', 'Pick a different customer to merge.', 422);
    adminState().merged.push({ fromId: dup.id, intoId: keep.id, at: new Date().toISOString() });
    recordAudit(user.name, 'customer.merge', `${dup.name} (${dup.id}) → ${keep.name} (${keep.id})`);
    revalidatePath(`/admin/customers/${keep.id}`);
    return `Merge of ${dup.name} into ${keep.name} recorded (demo — records are not moved)`;
  });
}

const requestSchema = z.object({ requestId: z.string().min(1).max(64) });

/** Data request workflow (FR-M14-5): open → in progress → closed. */
export async function advanceDataRequestAction(input: z.infer<typeof requestSchema>): Promise<ActionResult> {
  return runAdminAction(['admin'], requestSchema, input, (data, user) => {
    const req = adminState().dataRequests.find((r) => r.id === data.requestId);
    if (!req) throw new AppError('not_found', 'Request not found', 404);
    if (req.status === 'closed') throw new AppError('invalid_state', 'This request is already closed.', 409);
    req.status = req.status === 'open' ? 'in_progress' : 'closed';
    recordAudit(
      user.name,
      'data_request.update',
      `${req.id} (${req.kind}) → ${req.status.replace('_', ' ')}`,
    );
    revalidatePath('/admin/customers', 'layout');
    return `Request marked ${req.status.replace('_', ' ')}`;
  });
}
