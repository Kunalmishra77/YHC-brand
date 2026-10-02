import 'server-only';

import { addDays, differenceInCalendarDays } from 'date-fns';

/*
 * FR-M10-5: reorder is blocked (and a follow-up consultation offered) when the last completed
 * consultation is older than the doctor's validity window. PURE — the caller passes `now`.
 */

// TODO(client): reorder validity window — confirm with Dr. Tyagi, see docs/12 D-P6 (default 6 months).
export const DEFAULT_CONSULT_VALIDITY_DAYS = 180;

export type ReorderCheck =
  | { allowed: true; validUntil: Date }
  | { allowed: false; reason: 'no_consult' | 'consult_expired'; message: string; lastConsultAt: Date | null };

export function checkReorder(input: {
  /** startsAt (UTC ISO) of completed consultations, any kind */
  completedConsultsAt: string[];
  now: Date;
  validityDays?: number;
}): ReorderCheck {
  const validityDays = input.validityDays ?? DEFAULT_CONSULT_VALIDITY_DAYS;
  const last = input.completedConsultsAt
    .map((s) => new Date(s))
    .filter((dt) => !Number.isNaN(dt.getTime()))
    .sort((a, b) => b.getTime() - a.getTime())[0];
  if (!last) {
    return {
      allowed: false,
      reason: 'no_consult',
      message: 'A consultation with Dr. Tyagi is needed before this plan can be ordered.',
      lastConsultAt: null,
    };
  }
  if (differenceInCalendarDays(input.now, last) > validityDays) {
    return {
      allowed: false,
      reason: 'consult_expired',
      message: `Your last consultation was more than ${Math.round(validityDays / 30)} months ago. Dr. Tyagi needs to review your progress before you continue — please book a follow-up consultation.`,
      lastConsultAt: last,
    };
  }
  return { allowed: true, validUntil: addDays(last, validityDays) };
}
