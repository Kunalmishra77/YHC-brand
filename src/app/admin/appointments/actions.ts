'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { AppError } from '@/lib/errors';
import { formatINR } from '@/lib/money';
import { formatIst } from '@/lib/time';
import { cancelAppointment, rescheduleAppointment } from '@/server/admin/appointments';
import { runAdminAction, type ActionResult } from '@/server/admin/guard';
import { recordRefund } from '@/server/admin/orders';
import { db } from '@/server/demo/store';

const rescheduleSchema = z.object({ startsAt: z.iso.datetime() });

export async function rescheduleAction(
  appointmentId: string,
  input: z.infer<typeof rescheduleSchema>,
): Promise<ActionResult> {
  return runAdminAction(['admin'], rescheduleSchema, input, (data, user) => {
    const appt = rescheduleAppointment(appointmentId, data.startsAt, user.name);
    revalidatePath('/admin/appointments');
    return `${appt.code} moved to ${formatIst(new Date(appt.startsAt))} · customer notified (demo)`;
  });
}

const cancelSchema = z.object({
  reason: z.string().trim().min(3, 'Add a reason (at least 3 characters).').max(200),
});

export async function cancelAppointmentAction(
  appointmentId: string,
  input: z.infer<typeof cancelSchema>,
): Promise<ActionResult> {
  return runAdminAction(['admin'], cancelSchema, input, (data, user) => {
    const appt = cancelAppointment(appointmentId, data.reason, user.name);
    revalidatePath('/admin/appointments');
    return `${appt.code} cancelled · audited`;
  });
}

const refundSchema = z
  .object({
    full: z.boolean(),
    amountRupees: z.number().positive().max(100_000).optional(),
    reason: z.string().trim().min(3, 'Add a reason (at least 3 characters).').max(200),
  })
  .refine((v) => v.full || v.amountRupees !== undefined, 'Enter the partial refund amount.');

/** Consult-fee refund (FR-M12-4). Demo: audited record, no money moves. */
export async function refundConsultAction(
  appointmentId: string,
  input: z.infer<typeof refundSchema>,
): Promise<ActionResult> {
  return runAdminAction(['admin'], refundSchema, input, (data, user) => {
    const appt = db().appointments.find((a) => a.id === appointmentId);
    if (!appt?.paymentId || appt.feePaise <= 0) {
      throw new AppError('not_paid', 'This appointment has no captured fee to refund.', 409);
    }
    const r = recordRefund({
      kind: 'consult',
      target: appt.code,
      paidPaise: appt.feePaise,
      amountPaise: Math.round((data.amountRupees ?? 0) * 100),
      full: data.full,
      reason: data.reason,
      actor: user.name,
    });
    revalidatePath('/admin/appointments');
    return `Consult fee refund of ${formatINR(r.amountPaise)} recorded for ${appt.code} (demo — no money moved)`;
  });
}
