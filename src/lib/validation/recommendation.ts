import { z } from 'zod';

/*
 * FUN-07: a plan can be recommended without a 3D scan on file only with a short written reason
 * (shared by the doctor's outcome pane and the server action).
 */

export const SCAN_OVERRIDE_MIN = 10;

export const scanOverrideReasonSchema = z
  .string()
  .trim()
  .min(SCAN_OVERRIDE_MIN, `Add a short reason for recommending without a scan (at least ${SCAN_OVERRIDE_MIN} characters)`)
  .max(500, 'Keep the reason under 500 characters');

/**
 * The reason to store with the recommendation: `null` when a scan is on file (nothing to override),
 * otherwise the validated reason. Throws a ZodError when the scan is missing and the reason is too short.
 */
export function resolveScanOverride(hasScan: boolean, reason: string | null | undefined): string | null {
  if (hasScan) return null;
  return scanOverrideReasonSchema.parse(reason ?? '');
}
