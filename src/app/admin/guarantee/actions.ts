'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { runAdminAction, type ActionResult } from '@/server/admin/guard';
import { activateDraft, discardDraft, saveDraft } from '@/server/admin/guarantee';

const rulesSchema = z.object({
  name: z.string().trim().min(3).max(120),
  refundPercent: z.number().int().min(1, 'Refund % must be 1–100.').max(100, 'Refund % must be 1–100.'),
  minPlanMonths: z.number().int().min(1).max(12),
  claimWindowDays: z.number().int().min(1).max(180),
  minCheckinResponsePct: z.number().int().min(0).max(100),
  requireMonthlyPhotos: z.boolean(),
  requireFollowupConsult: z.boolean(),
  termsMd: z.string().trim().min(40, 'Terms must state the conditions in full.').max(4000),
});

export type PolicyRulesInput = z.infer<typeof rulesSchema>;

export async function saveDraftAction(input: PolicyRulesInput): Promise<ActionResult> {
  return runAdminAction(['admin'], rulesSchema, input, (data, user) => {
    const d = saveDraft(data, user.name);
    revalidatePath('/admin/guarantee');
    return `Draft v${d.version} saved · not live until activated`;
  });
}

export async function discardDraftAction(): Promise<ActionResult> {
  return runAdminAction(['admin'], z.undefined(), undefined, (_d, user) => {
    discardDraft(user.name);
    revalidatePath('/admin/guarantee');
    return 'Draft discarded';
  });
}

export async function activateDraftAction(): Promise<ActionResult> {
  return runAdminAction(['admin'], z.undefined(), undefined, (_d, user) => {
    const p = activateDraft(user.name);
    revalidatePath('/', 'layout');
    return `Policy v${p.version} is now active (demo) · audited`;
  });
}
