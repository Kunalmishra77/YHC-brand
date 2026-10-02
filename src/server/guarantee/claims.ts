import 'server-only';

import type { GuaranteeClaim } from '@/lib/domain/types';
import { AppError } from '@/lib/errors';
import { getGuarantee } from '@/server/catalog';
import { db, recordAudit } from '@/server/demo/store';
import { guaranteeStatus } from './status';

/*
 * FR-M11-5: customer submits a claim → status `submitted` → doctor review queue.
 * Eligibility is re-evaluated on the server; the browser's view is never trusted.
 */
export function submitGuaranteeClaim(input: {
  customerId: string;
  statement: string;
  actor: string;
}): GuaranteeClaim {
  const policy = getGuarantee();
  if (!policy) throw new AppError('not_available', 'The guarantee is not available right now.', 404);
  const s = db();
  const open = s.claims.find(
    (c) => c.customerId === input.customerId && ['submitted', 'under_review', 'approved'].includes(c.status),
  );
  if (open) throw new AppError('claim_open', `You already have a claim in progress (${open.code}).`, 409);
  const status = guaranteeStatus(policy, input.customerId);
  if (!status.eligible) {
    const missing = status.rules.filter((r) => !r.passed).map((r) => r.label.toLowerCase());
    throw new AppError('not_eligible', `Not eligible yet: ${missing.join('; ')}.`, 422);
  }
  s.seq += 1;
  const claim: GuaranteeClaim = {
    id: `clm-${s.seq}`,
    code: `GC-${1000 + s.claims.length + 1}`,
    customerId: input.customerId,
    status: 'submitted',
    statement: input.statement,
    submittedAt: new Date().toISOString(),
    decisionNotes: null,
    refundPaise: status.refundPaise,
  };
  s.claims.unshift(claim);
  recordAudit(input.actor, 'guarantee.claim_submit', claim.code);
  // TODO(phase-11): emit('guarantee.claim_submitted') + store eligibility snapshot + notify doctor queue.
  return claim;
}
