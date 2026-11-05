'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { AppError } from '@/lib/errors';
import { err, ok, type Result } from '@/lib/result';
import { CALL_RESULT_IDS, WHATSAPP_TEMPLATE_IDS } from '@/lib/sales/playbook';
import {
  MEMBER_COOKIE,
  addNote,
  assignLead,
  currentMember,
  getTeam,
  logCall,
  logWhatsApp,
  requireSalesUser,
  saveTeam,
  setFollowUp,
  setStage,
} from '@/server/live/sales';

/* Sales portal actions on the real database (ADR-36, ADR-37). Every action re-checks the sales role. */

async function run<T>(fn: () => Promise<T>): Promise<Result<T>> {
  try {
    return ok(await fn());
  } catch (e) {
    if (e instanceof AppError) return err(e.code, e.message);
    if (e instanceof z.ZodError) return err('invalid_input', e.issues[0]?.message ?? 'Please check the form.');
    return err('internal', 'Something went wrong. Please try again.');
  }
}

const leadId = z.uuid();

function refresh(id?: string) {
  revalidatePath('/sales', 'layout');
  if (id) revalidatePath(`/sales/leads/${id}`);
}

export async function chooseMemberAction(name: string): Promise<Result<null>> {
  return run(async () => {
    await requireSalesUser();
    const team = await getTeam();
    if (!team.includes(name)) throw new AppError('unknown_member', 'Pick a name from the team list.', 422);
    (await cookies()).set(MEMBER_COOKIE, encodeURIComponent(name), {
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      path: '/sales',
      maxAge: 60 * 60 * 24 * 365,
    });
    refresh();
    return null;
  });
}

async function me(): Promise<string> {
  const member = await currentMember();
  if (!member) throw new AppError('who_are_you', 'Choose your name first (top of the page).', 409);
  return member;
}

/** Take the lead for yourself. */
export async function claimLeadAction(raw: { id: string }): Promise<Result<null>> {
  return run(async () => {
    const id = leadId.parse(raw.id);
    const member = await me();
    await assignLead(id, member, member);
    refresh(id);
    return null;
  });
}

/** Give the lead to a team member, or release it (`to` = null). */
export async function assignLeadAction(raw: { id: string; to: string | null }): Promise<Result<null>> {
  return run(async () => {
    const id = leadId.parse(raw.id);
    const to = raw.to === null ? null : z.string().trim().min(2).max(60).parse(raw.to);
    await assignLead(id, to, await currentMember());
    refresh(id);
    return null;
  });
}

const stageSchema = z.object({
  id: leadId,
  stage: z.enum(['contacted', 'interested', 'product_purchased', 'lost']),
  reason: z.string().trim().max(300).optional(),
});

export async function setStageAction(raw: z.input<typeof stageSchema>): Promise<Result<null>> {
  return run(async () => {
    const input = stageSchema.parse(raw);
    await setStage(input.id, input.stage, input.reason || null, await currentMember());
    refresh(input.id);
    return null;
  });
}

const callSchema = z.object({
  id: leadId,
  result: z.enum(CALL_RESULT_IDS),
  note: z.string().trim().max(500).optional(),
});

export async function logCallAction(raw: z.input<typeof callSchema>): Promise<Result<{ nextTry: string | null }>> {
  return run(async () => {
    const input = callSchema.parse(raw);
    const res = await logCall(input.id, input.result, input.note || null, await currentMember());
    refresh(input.id);
    return res;
  });
}

const followUpSchema = z.object({
  id: leadId,
  at: z.iso.datetime({ offset: true }).nullable(),
  note: z.string().trim().max(300).optional(),
});

export async function setFollowUpAction(raw: z.input<typeof followUpSchema>): Promise<Result<null>> {
  return run(async () => {
    const input = followUpSchema.parse(raw);
    const at = input.at ? new Date(input.at) : null;
    if (at && at.getTime() < Date.now() - 60_000) throw new AppError('past_time', 'Pick a time in the future.', 422);
    await setFollowUp(input.id, at, input.note || null, await currentMember());
    refresh(input.id);
    return null;
  });
}

export async function logWhatsAppAction(raw: { id: string; template: string }): Promise<Result<null>> {
  return run(async () => {
    const id = leadId.parse(raw.id);
    await logWhatsApp(id, z.enum(WHATSAPP_TEMPLATE_IDS).parse(raw.template), await currentMember());
    refresh(id);
    return null;
  });
}

const noteSchema = z.object({
  id: leadId,
  body: z.string().trim().min(1, 'Write a short note').max(1000),
});

export async function addNoteAction(raw: z.input<typeof noteSchema>): Promise<Result<null>> {
  return run(async () => {
    const input = noteSchema.parse(raw);
    await addNote(input.id, input.body, await currentMember());
    refresh(input.id);
    return null;
  });
}

export async function saveTeamAction(names: string[]): Promise<Result<null>> {
  return run(async () => {
    await saveTeam(z.array(z.string().max(60)).max(20).parse(names));
    refresh();
    return null;
  });
}
