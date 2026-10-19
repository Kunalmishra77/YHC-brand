import 'server-only';

import type { PrescriptionItem, Recommendation } from '@/lib/domain/types';
import { AppError } from '@/lib/errors';
import { resolveScanOverride, scanOverrideReasonSchema } from '@/lib/validation/recommendation';
import { createRecommendation, db } from '@/server/demo/store';
import { getScanForCustomer } from '@/server/journey/store';

/**
 * FUN-07: sends the recommendation, but only with a 3D scan on file or a written override reason
 * (min 10 chars). The reason is stored on the recommendation and audited (`recommendation.scan_override`).
 */
export function sendRecommendation(input: {
  appointmentId: string;
  planId: string;
  productIds: string[];
  items: PrescriptionItem[];
  note: string;
  actor: string;
  scanOverrideReason?: string | null;
}): Recommendation {
  const appt = db().appointments.find((a) => a.id === input.appointmentId);
  if (!appt) throw new AppError('not_found', 'Appointment not found', 404);
  const hasScan = getScanForCustomer(appt.customerId) !== null;
  const parsed = hasScan
    ? null
    : scanOverrideReasonSchema.safeParse(input.scanOverrideReason ?? '');
  if (parsed && !parsed.success)
    throw new AppError(
      'scan_override_required',
      parsed.error.issues[0]?.message ?? 'Add a reason for recommending without a scan.',
      422,
    );
  return createRecommendation({
    appointmentId: input.appointmentId,
    planId: input.planId,
    productIds: input.productIds,
    items: input.items,
    note: input.note,
    actor: input.actor,
    scanOverrideReason: resolveScanOverride(hasScan, input.scanOverrideReason),
  });
}
