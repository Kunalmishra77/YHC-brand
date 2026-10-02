'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { AppError } from '@/lib/errors';
import { runAdminAction, type ActionResult } from '@/server/admin/guard';
import { retryMessage } from '@/server/admin/jobs';
import { adminState } from '@/server/admin/state';
import { db, recordAudit, updateSetting } from '@/server/demo/store';

const journeySchema = z.object({ key: z.string().min(1).max(64), enabled: z.boolean() });

/** FR-M8-8 enable/disable journeys. Demo: in memory (no `messaging.journeys` setting yet). */
export async function toggleJourneyAction(input: z.infer<typeof journeySchema>): Promise<ActionResult> {
  return runAdminAction(['admin'], journeySchema, input, (data, user) => {
    const j = adminState().journeys.find((x) => x.key === data.key);
    if (!j) throw new AppError('not_found', 'Journey not found', 404);
    j.enabled = data.enabled;
    recordAudit(user.name, 'settings.update', `journey ${j.key} = ${data.enabled ? 'on' : 'off'}`);
    revalidatePath('/admin/messaging');
    return `${j.label} ${data.enabled ? 'turned on' : 'paused'}`;
  });
}

const hhmm = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use 24-hour HH:MM.');
const quietSchema = z
  .object({ start: hhmm, end: hhmm })
  .refine((v) => v.start !== v.end, 'Start and end must differ.');

export async function updateQuietHoursAction(input: z.infer<typeof quietSchema>): Promise<ActionResult> {
  return runAdminAction(['admin'], quietSchema, input, (data, user) => {
    updateSetting('messaging.quiet_hours', JSON.stringify({ start: data.start, end: data.end }), user.name);
    revalidatePath('/admin/messaging');
    revalidatePath('/admin/settings');
    return `Quiet hours set to ${data.start}–${data.end} IST`;
  });
}

const idSchema = z.string().min(1).max(64);

export async function retryMessageAction(messageId: string): Promise<ActionResult> {
  return runAdminAction(['admin'], idSchema, messageId, (id) => {
    retryMessage(id);
    const m = db().messages.find((x) => x.id === id);
    revalidatePath('/admin/messaging');
    return `${m?.template ?? 'Message'} re-sent (demo log adapter)`;
  });
}
