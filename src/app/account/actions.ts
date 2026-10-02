'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { AppError } from '@/lib/errors';
import { requireRole, type SessionUser } from '@/lib/rbac';
import { err, ok, type Result } from '@/lib/result';
import { addProgressPhotoSet } from '@/server/account/photos';
import { updateCustomerProfile } from '@/server/account/profile';
import { completedConsultStarts, findCustomerOrder } from '@/server/account/queries';
import { checkReorder } from '@/server/account/reorder-guard';
import { recordAudit, reorder } from '@/server/demo/store';
import { submitGuaranteeClaim } from '@/server/guarantee/claims';

/*
 * /account server actions: zod → requireRole(['customer']) → ownership check → store → revalidate.
 */

async function customer(): Promise<SessionUser & { customerId: string }> {
  const user = await requireRole(['customer']);
  if (!user.customerId) throw new AppError('unauthenticated', 'Please sign in.', 401);
  return { ...user, customerId: user.customerId };
}

function fail(error: unknown) {
  if (error instanceof AppError) return err(error.code, error.message);
  if (error instanceof z.ZodError)
    return err('invalid_input', error.issues[0]?.message ?? 'Please check the form.');
  return err('internal', 'Something went wrong. Please try again.');
}

// ---------------------------------------------------------------------------------------------

const reorderSchema = z.object({ orderCode: z.string().min(1).max(40) });

export type ReorderResult = Result<
  { code: string },
  { code: string; message: string; needsFollowUp?: boolean }
>;

/** FR-M10-4 one-tap reorder; FR-M10-5 blocked when the last consultation is too old. */
export async function reorderAction(input: z.input<typeof reorderSchema>): Promise<ReorderResult> {
  try {
    const { orderCode } = reorderSchema.parse(input);
    const user = await customer();
    const order = findCustomerOrder(user.customerId, orderCode);
    if (!order?.planId) throw new AppError('not_found', 'Order not found.', 404);
    if (['pending_payment', 'cancelled', 'refunded', 'rto'].includes(order.status))
      throw new AppError('invalid_state', 'This order cannot be reordered.', 409);
    const guard = checkReorder({
      completedConsultsAt: completedConsultStarts(user.customerId),
      now: new Date(),
    });
    if (!guard.allowed)
      return { ok: false, error: { code: guard.reason, message: guard.message, needsFollowUp: true } };
    // Demo: reorder() stands in for checkout → capture_payment → mark_order_paid.
    const next = reorder(order.id);
    revalidatePath('/account', 'layout');
    return ok({ code: next.code });
  } catch (error) {
    return fail(error);
  }
}

// ---------------------------------------------------------------------------------------------

const photosSchema = z.object({
  angles: z.array(z.enum(['front', 'crown', 'parting'])).length(3, 'Please add all 3 angles.'),
});

export async function uploadProgressPhotosAction(
  input: z.input<typeof photosSchema>,
): Promise<Result<{ id: string; label: string }>> {
  try {
    const { angles } = photosSchema.parse(input);
    if (new Set(angles).size !== 3) throw new AppError('invalid_input', 'Please add all 3 angles.', 422);
    const user = await customer();
    const set = addProgressPhotoSet(user.customerId);
    recordAudit(user.name, 'progress_photos.upload', set.id);
    revalidatePath('/account', 'layout');
    return ok({ id: set.id, label: set.label });
  } catch (error) {
    return fail(error);
  }
}

// ---------------------------------------------------------------------------------------------

const claimSchema = z.object({
  statement: z
    .string()
    .trim()
    .min(30, 'Please tell us a little more — at least 30 characters.')
    .max(2000, 'Please keep it under 2,000 characters.'),
  confirm: z.literal(true, { error: 'Please confirm you followed the plan as prescribed.' }),
});

export async function submitClaimAction(
  input: z.input<typeof claimSchema>,
): Promise<Result<{ code: string }>> {
  try {
    const { statement } = claimSchema.parse(input);
    const user = await customer();
    const claim = submitGuaranteeClaim({ customerId: user.customerId, statement, actor: user.name });
    revalidatePath('/account/guarantee');
    return ok({ code: claim.code });
  } catch (error) {
    return fail(error);
  }
}

// ---------------------------------------------------------------------------------------------

const profileSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your name.').max(80),
  email: z.union([z.literal(''), z.email('Please enter a valid email address.')]),
});

export async function updateProfileAction(
  input: z.input<typeof profileSchema>,
): Promise<Result<{ name: string }>> {
  try {
    const { name, email } = profileSchema.parse(input);
    const user = await customer();
    const updated = updateCustomerProfile(user.customerId, { name, email: email || null });
    recordAudit(user.name, 'profile.update', user.customerId);
    revalidatePath('/account', 'layout');
    return ok({ name: updated.name });
  } catch (error) {
    return fail(error);
  }
}

const consentSchema = z.object({
  key: z.enum([
    'whatsapp_utility',
    'whatsapp_marketing',
    'clinical_photo_use',
    'marketing_photo_use',
    'review_publication',
  ]),
});

/** FR-M14-1 withdrawal. Demo: audited only; Phase 12 writes `consents.withdrawn_at`. */
export async function withdrawConsentAction(
  input: z.input<typeof consentSchema>,
): Promise<Result<{ key: string }>> {
  try {
    const { key } = consentSchema.parse(input);
    const user = await customer();
    recordAudit(user.name, 'consent.withdraw', `${key} · ${user.customerId}`);
    return ok({ key });
  } catch (error) {
    return fail(error);
  }
}

const dataRequestSchema = z.object({
  kind: z.enum(['access', 'correction', 'erasure', 'grievance']),
  details: z.string().trim().min(10, 'Please describe your request in a sentence or two.').max(2000),
});

/** FR-M14-5. Demo: audited and acknowledged; Phase 12 writes `data_requests` with an SLA timer. */
export async function submitDataRequestAction(
  input: z.input<typeof dataRequestSchema>,
): Promise<Result<{ reference: string }>> {
  try {
    const { kind } = dataRequestSchema.parse(input);
    const user = await customer();
    const reference = `DR-${Date.now().toString(36).toUpperCase().slice(-6)}`;
    recordAudit(user.name, `data_request.${kind}`, reference);
    return ok({ reference });
  } catch (error) {
    return fail(error);
  }
}

const contactSchema = z.object({
  topic: z.enum(['order', 'consultation', 'routine', 'payment', 'other']),
  message: z.string().trim().min(10, 'Please write a little more so we can help.').max(2000),
});

/** FR-M4-8 contact form. Demo: acknowledged only; Phase 09 creates a support task for the care team. */
export async function contactSupportAction(
  input: z.input<typeof contactSchema>,
): Promise<Result<{ reference: string }>> {
  try {
    const { topic } = contactSchema.parse(input);
    const user = await customer();
    const reference = `SR-${Date.now().toString(36).toUpperCase().slice(-6)}`;
    recordAudit(user.name, `support.${topic}`, reference);
    return ok({ reference });
  } catch (error) {
    return fail(error);
  }
}
