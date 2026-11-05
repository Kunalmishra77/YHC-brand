'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { AppError } from '@/lib/errors';
import { err, ok, type Result } from '@/lib/result';
import {
  MEMBER_COOKIE,
  addNote,
  claimLead,
  currentMember,
  getTeam,
  requireSalesUser,
  saveTeam,
  setStage,
} from '@/server/live/sales';

/* Sales portal actions on the real database (ADR-36). Every action re-checks the sales role. */

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
    revalidatePath('/sales', 'layout');
    return null;
  });
}

export async function claimLeadAction(raw: { id: string; release?: boolean }): Promise<Result<null>> {
  return run(async () => {
    await claimLead(leadId.parse(raw.id), await currentMember(), raw.release === true);
    revalidatePath('/sales', 'layout');
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
    revalidatePath('/sales', 'layout');
    return null;
  });
}

const noteSchema = z.object({
  id: leadId,
  kind: z.enum(['note', 'call']),
  body: z.string().trim().min(1, 'Write a short note').max(1000),
});

export async function addNoteAction(raw: z.input<typeof noteSchema>): Promise<Result<null>> {
  return run(async () => {
    const input = noteSchema.parse(raw);
    await addNote(input.id, input.kind, input.body, await currentMember());
    revalidatePath(`/sales/leads/${input.id}`);
    return null;
  });
}

export async function saveTeamAction(names: string[]): Promise<Result<null>> {
  return run(async () => {
    await saveTeam(z.array(z.string().max(60)).max(20).parse(names));
    revalidatePath('/sales', 'layout');
    return null;
  });
}
