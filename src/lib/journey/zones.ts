import { CAPTURE_ZONES, type CaptureZone, MIN_CAPTURED_ZONES, REQUIRED_ZONES } from './types';

/*
 * Capture-zone rules for the guided scan, shared by the scan UI and the server-side validation so
 * both always agree on when the analysis may run.
 */

export function isRequiredZone(zone: CaptureZone): boolean {
  return REQUIRED_ZONES.includes(zone);
}

export type ZoneSelectionIssue =
  | { code: 'duplicate' }
  | { code: 'overlap'; zones: CaptureZone[] }
  | { code: 'required_missing'; zones: CaptureZone[] }
  | { code: 'too_few'; missing: number };

/** Why the selection cannot be analysed yet, or `null` when it is ready. */
export function zoneSelectionIssue(
  captured: readonly CaptureZone[],
  skipped: readonly CaptureZone[] = [],
): ZoneSelectionIssue | null {
  if (new Set(captured).size !== captured.length || new Set(skipped).size !== skipped.length)
    return { code: 'duplicate' };
  const overlap = skipped.filter((z) => captured.includes(z));
  if (overlap.length > 0) return { code: 'overlap', zones: overlap };
  const missing = REQUIRED_ZONES.filter((z) => !captured.includes(z));
  if (missing.length > 0) return { code: 'required_missing', zones: missing };
  if (captured.length < MIN_CAPTURED_ZONES)
    return { code: 'too_few', missing: MIN_CAPTURED_ZONES - captured.length };
  return null;
}

/** Captured zones in capture order (stable output whatever order they were taken in). */
export function orderZones(zones: Iterable<CaptureZone>): CaptureZone[] {
  const set = new Set(zones);
  return CAPTURE_ZONES.filter((z) => set.has(z));
}

/** The first zone the patient should go back to so the selection becomes valid. */
export function nextZoneToFix(
  captured: readonly CaptureZone[],
  skipped: readonly CaptureZone[] = [],
): CaptureZone | null {
  const missingRequired = REQUIRED_ZONES.find((z) => !captured.includes(z));
  if (missingRequired) return missingRequired;
  if (captured.length >= MIN_CAPTURED_ZONES) return null;
  return (
    CAPTURE_ZONES.find((z) => skipped.includes(z)) ?? CAPTURE_ZONES.find((z) => !captured.includes(z)) ?? null
  );
}
