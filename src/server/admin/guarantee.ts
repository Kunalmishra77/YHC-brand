import 'server-only';

import type { GuaranteePolicy } from '@/lib/domain/types';
import { AppError } from '@/lib/errors';
import { GUARANTEE_POLICY } from '@/server/demo/fixtures';
import { recordAudit } from '@/server/demo/store';
import { adminState } from './state';

/*
 * Guarantee policy versions (FR-M11-1, FR-M12-7): draft → activate, one active policy.
 * Demo: activation edits the shared GUARANTEE_POLICY in place so every surface shows the same
 * words; terms stay marked DRAFT until the client approves them (docs/15 D-P1).
 */

export type PolicyRules = Pick<
  GuaranteePolicy,
  | 'name'
  | 'refundPercent'
  | 'minPlanMonths'
  | 'claimWindowDays'
  | 'minCheckinResponsePct'
  | 'requireMonthlyPhotos'
  | 'requireFollowupConsult'
  | 'termsMd'
>;

export const activePolicy = (): GuaranteePolicy => GUARANTEE_POLICY;

export function saveDraft(rules: PolicyRules, actor: string): GuaranteePolicy {
  const s = adminState();
  const latest = Math.max(GUARANTEE_POLICY.version, ...s.policyHistory.map((p) => p.version));
  const draft: GuaranteePolicy = {
    ...rules,
    version: s.policyDraft?.version ?? latest + 1,
    isActive: false,
    isDraft: true,
  };
  s.policyDraft = draft;
  recordAudit(actor, 'guarantee.draft_save', `v${draft.version} · ${draft.name}`);
  return draft;
}

export function discardDraft(actor: string): void {
  const s = adminState();
  if (!s.policyDraft) throw new AppError('not_found', 'There is no draft to discard.', 404);
  recordAudit(actor, 'guarantee.draft_discard', `v${s.policyDraft.version}`);
  s.policyDraft = null;
}

export function activateDraft(actor: string): GuaranteePolicy {
  const s = adminState();
  const draft = s.policyDraft;
  if (!draft) throw new AppError('not_found', 'Save a draft before activating.', 404);
  s.policyHistory.unshift({ ...GUARANTEE_POLICY, isActive: false });
  Object.assign(GUARANTEE_POLICY, { ...draft, isActive: true, isDraft: true });
  s.policyDraft = null;
  recordAudit(
    actor,
    'guarantee.activate',
    `v${draft.version} active (terms changed) · previous v${s.policyHistory[0]?.version ?? '?'} retired`,
  );
  return GUARANTEE_POLICY;
}
