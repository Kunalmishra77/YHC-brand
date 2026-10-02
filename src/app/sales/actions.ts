'use server';

import { addHours } from 'date-fns';
import { fromZonedTime } from 'date-fns-tz';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { LEAD_STAGES } from '@/lib/domain/types';
import { AppError } from '@/lib/errors';
import { err, ok, type Result } from '@/lib/result';
import { IST, formatIst } from '@/lib/time';
import {
  completeTask,
  createManualLead,
  db,
  getSlots,
  holdSlot,
  logLeadActivity,
  sendConsultLink,
  setLeadStage,
} from '@/server/demo/store';
import {
  createSalesTask,
  reassignLead,
  requireSales,
  setNextAction,
  touchLead,
} from '@/server/sales/mutations';
import { alertsSince, safeTaskTitle, salesHoldMinutes, type SalesAlert } from '@/server/sales/views';

/* Sales CRM server actions (FR-M7). Every action re-checks the role; the store enforces stage rules. */

async function run<T>(fn: (actor: { id: string; name: string }) => T | Promise<T>): Promise<Result<T>> {
  try {
    const user = await requireSales();
    const data = await fn({ id: user.id, name: user.name });
    revalidatePath('/sales', 'layout');
    return ok(data);
  } catch (e) {
    if (e instanceof AppError) return err(e.code, e.message);
    if (e instanceof z.ZodError)
      return err('invalid_input', e.issues[0]?.message ?? 'Please check the form.');
    return err('internal', 'Something went wrong. Please try again.');
  }
}

const leadId = z.string().min(1).max(64);

// ---------------------------------------------------------------------------------------------

const stageSchema = z.object({
  leadId,
  stage: z.enum(LEAD_STAGES),
  reason: z.string().trim().max(200).optional(),
});

export async function moveLeadStageAction(input: z.input<typeof stageSchema>) {
  return run((actor) => {
    const v = stageSchema.parse(input);
    if (v.stage === 'lost' && !v.reason)
      throw new AppError('reason_required', 'Add a reason for marking this lead lost.', 422);
    const lead = setLeadStage(v.leadId, v.stage, actor.name, v.stage === 'lost' ? v.reason : undefined);
    return { stage: lead.stage };
  });
}

const phoneSchema = z
  .string()
  .trim()
  .transform((p) => p.replace(/[\s-]/g, ''))
  .transform((p) =>
    p.startsWith('+91') ? p.slice(3) : p.startsWith('91') && p.length === 12 ? p.slice(2) : p,
  )
  .pipe(z.string().regex(/^[6-9]\d{9}$/, 'Enter a 10-digit Indian mobile number.'))
  .transform((p) => `+91${p}`);

const newLeadSchema = z.object({
  name: z.string().trim().min(2, 'Enter the customer’s name.').max(80),
  phone: phoneSchema,
  source: z.enum(['meta_ads', 'whatsapp', 'website', 'sales', 'referral', 'google']),
});

export async function createLeadAction(input: z.input<typeof newLeadSchema>) {
  return run((actor) => {
    const v = newLeadSchema.parse(input);
    const existed = db().leads.some((l) => l.phone === v.phone);
    const lead = createManualLead({ ...v, actor: actor.name });
    return { leadId: lead.id, existed };
  });
}

export async function sendConsultLinkAction(id: string) {
  return run((actor) => {
    const lid = leadId.parse(id);
    sendConsultLink(lid, actor.name);
    setNextAction(lid, 'Follow up on booking', addHours(new Date(), 4));
    touchLead(lid);
    return null;
  });
}

const bookSchema = z.object({ leadId, startsAt: z.iso.datetime() });

/** FR-M3-13 — hold a slot for the lead's customer and send the WhatsApp pay link. */
export async function bookOnBehalfAction(input: z.input<typeof bookSchema>) {
  return run((actor) => {
    const v = bookSchema.parse(input);
    const lead = db().leads.find((l) => l.id === v.leadId);
    if (!lead) throw new AppError('not_found', 'Lead not found', 404);
    if (!lead.customerId) throw new AppError('no_customer', 'This lead has no customer record yet.', 422);
    const startsAt = new Date(v.startsAt);
    const offered = getSlots().some((d) => d.slots.some((s) => s.startsAt.getTime() === startsAt.getTime()));
    if (!offered)
      throw new AppError('slot_taken', 'That time is no longer available. Pick another slot.', 409);
    // Concern is captured by the customer on the pay page, never by sales.
    const appt = holdSlot({ customerId: lead.customerId, startsAt, concern: 'other', by: 'sales' });
    const holdUntil = appt.holdExpiresAt ? formatIst(new Date(appt.holdExpiresAt), 'h:mm aaa') : '';
    // TODO(client): real consult_pay_link template + signed /l/ link (docs/05 bookOnBehalf, ADR-20).
    logLeadActivity(
      lead.id,
      'whatsapp',
      `WhatsApp: consult_pay_link · ${appt.code} · ${formatIst(startsAt)} · hold until ${holdUntil}`,
      actor.name,
    );
    setNextAction(lead.id, 'Check ₹500 payment', new Date(appt.holdExpiresAt ?? appt.startsAt));
    return { code: appt.code, holdUntil, holdMinutes: salesHoldMinutes() };
  });
}

const callSchema = z.object({
  leadId,
  outcome: z.string().trim().min(1, 'Pick a call outcome.').max(40),
  note: z.string().trim().max(500).optional(),
});

export async function logCallAction(input: z.input<typeof callSchema>) {
  return run((actor) => {
    const v = callSchema.parse(input);
    logLeadActivity(
      v.leadId,
      'call',
      `Call · ${v.outcome.toLowerCase()}${v.note ? ` · ${v.note}` : ''}`,
      actor.name,
    );
    touchLead(v.leadId);
    return null;
  });
}

const noteSchema = z.object({ leadId, note: z.string().trim().min(1, 'Write a note first.').max(1000) });

export async function addNoteAction(input: z.input<typeof noteSchema>) {
  return run((actor) => {
    const v = noteSchema.parse(input);
    logLeadActivity(v.leadId, 'note', v.note, actor.name);
    touchLead(v.leadId);
    return null;
  });
}

const taskSchema = z.object({
  leadId,
  title: z.string().trim().min(2, 'Describe the task.').max(140),
  /** `YYYY-MM-DDTHH:mm` from a datetime-local input, read as IST */
  dueAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, 'Pick a due date and time.'),
});

export async function createTaskAction(input: z.input<typeof taskSchema>) {
  return run((actor) => {
    const v = taskSchema.parse(input);
    const dueAt = fromZonedTime(`${v.dueAt}:00`, IST);
    createSalesTask({ leadId: v.leadId, title: v.title, dueAt, ownerId: actor.id, actor: actor.name });
    setNextAction(v.leadId, v.title, dueAt);
    return null;
  });
}

const reassignSchema = z.object({ leadId, ownerId: z.string().min(1).max(64) });

export async function reassignLeadAction(input: z.input<typeof reassignSchema>) {
  return run((actor) => {
    const v = reassignSchema.parse(input);
    reassignLead(v.leadId, v.ownerId, actor.name);
    return null;
  });
}

export async function completeTaskAction(taskId: string) {
  return run((actor) => {
    const id = z.string().min(1).max(64).parse(taskId);
    const task = db().tasks.find((x) => x.id === id);
    if (!task) throw new AppError('not_found', 'Task not found', 404);
    if (task.status !== 'open') return null;
    completeTask(id);
    logLeadActivity(task.leadId, 'note', `Task done: ${safeTaskTitle(id) ?? 'task'}`, actor.name);
    return null;
  });
}

const reorderSchema = z.object({ leadId, orderCode: z.string().min(1).max(32) });

export async function sendReorderLinkAction(input: z.input<typeof reorderSchema>) {
  return run((actor) => {
    const v = reorderSchema.parse(input);
    // TODO(client): reorder link template (docs/08 refill_reminder) + signed /l/ reorder link.
    logLeadActivity(
      v.leadId,
      'whatsapp',
      `WhatsApp: refill_reminder · reorder link for ${v.orderCode}`,
      actor.name,
    );
    touchLead(v.leadId);
    return null;
  });
}

/** Demo stand-in for the Supabase Realtime channel (FR-M7-6). Read-only, so no revalidate. */
export async function pollAlertsAction(
  afterId: number,
): Promise<Result<{ lastId: number; alerts: SalesAlert[] }>> {
  try {
    await requireSales();
    return ok(alertsSince(z.number().int().min(0).parse(afterId)));
  } catch (e) {
    if (e instanceof AppError) return err(e.code, e.message);
    return err('internal', 'Could not load alerts.');
  }
}
