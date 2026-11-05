import { CAPTURE_ZONES, type CaptureZone } from '@/lib/journey/types';

/*
 * Scan outcome (ADR-36). The client's rule (2026-11-05): NOT eligible when the scalp is shiny and
 * smooth with no hair left and the person is older — regrowth is then unlikely. Eligible when hair or
 * roots are still visible. Thresholds live in the `scan.rules` setting so they can be tuned without a
 * deploy. Pure functions: the server runs them; the result page only explains them.
 */

export type ScanOutcome = 'eligible' | 'not_eligible' | 'unclear';

export type ZoneIssue = 'blurry' | 'too_dark' | 'too_bright' | 'glare' | 'not_scalp';

/** What the in-browser analysis reports for one zone photo. */
export interface ZoneAnalysis {
  /** photo good enough to judge */
  ok: boolean;
  issue: ZoneIssue | null;
  /** share of hair vs visible scalp in the centre of the photo, 0–1 (null when not judged) */
  cover: number | null;
  /** share of very bright, shiny scalp among the visible scalp, 0–1 */
  shine: number | null;
}

export interface ScanRules {
  olderAge: number;
  /** a zone counts as "no hair" at or below this cover */
  baldCoverMax: number;
  /** …and as "shiny" at or above this shine */
  shineMin: number;
  /** zones the customer must capture */
  minZones: number;
  /** zones where pattern hair loss shows (hairline, top, crown) */
  patternZones: CaptureZone[];
}

export const DEFAULT_SCAN_RULES: ScanRules = {
  olderAge: 55,
  baldCoverMax: 0.12,
  shineMin: 0.18,
  minZones: 4,
  patternZones: ['forehead_left', 'forehead_centre', 'forehead_right', 'top', 'crown'],
};

/** Reads the `scan.rules` setting, falling back field by field to the defaults. */
export function parseScanRules(raw: unknown): ScanRules {
  const v = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const num = (x: unknown, d: number, min: number, max: number) =>
    typeof x === 'number' && Number.isFinite(x) && x >= min && x <= max ? x : d;
  const zones = Array.isArray(v.pattern_zones)
    ? v.pattern_zones.filter((z): z is CaptureZone => (CAPTURE_ZONES as readonly unknown[]).includes(z))
    : [];
  return {
    olderAge: num(v.older_age, DEFAULT_SCAN_RULES.olderAge, 18, 100),
    baldCoverMax: num(v.bald_cover_max, DEFAULT_SCAN_RULES.baldCoverMax, 0, 0.5),
    shineMin: num(v.shine_min, DEFAULT_SCAN_RULES.shineMin, 0, 1),
    minZones: num(v.min_zones, DEFAULT_SCAN_RULES.minZones, 1, CAPTURE_ZONES.length),
    patternZones: zones.length ? zones : DEFAULT_SCAN_RULES.patternZones,
  };
}

/** Reason codes, explained in plain words on the result page and in the sales portal. */
export type OutcomeReason =
  | 'hair_visible'
  | 'no_hair_shiny_scalp'
  | 'older_age'
  | 'long_bald_area'
  | 'photos_unclear'
  | 'no_hair_younger';

export interface OutcomeInput {
  age: number;
  /** "Is any area completely bald for 5 years or more?" */
  longBald: 'no' | 'small' | 'large';
  zones: Partial<Record<CaptureZone, ZoneAnalysis>>;
  rules: ScanRules;
}

export function decideOutcome({ age, longBald, zones, rules }: OutcomeInput): {
  outcome: ScanOutcome;
  reasons: OutcomeReason[];
} {
  const judged = Object.entries(zones).filter(
    (e): e is [CaptureZone, ZoneAnalysis & { cover: number }] => Boolean(e[1]?.ok && e[1].cover !== null),
  );
  const pattern = judged.filter(([z]) => rules.patternZones.includes(z));

  // Not enough clear photos of the areas that matter: a person looks at it (the team calls).
  if (judged.length < 2 || pattern.length === 0) return { outcome: 'unclear', reasons: ['photos_unclear'] };

  const bald = pattern.filter(([, a]) => a.cover <= rules.baldCoverMax && (a.shine ?? 0) >= rules.shineMin);
  const mostlyBald = bald.length / pattern.length >= 0.6;
  const older = age >= rules.olderAge;

  if (mostlyBald && older) {
    const reasons: OutcomeReason[] = ['no_hair_shiny_scalp', 'older_age'];
    if (longBald === 'large') reasons.push('long_bald_area');
    return { outcome: 'not_eligible', reasons };
  }
  // A long-bald answer only tips an older person with at least one bare, shiny pattern zone.
  if (older && longBald === 'large' && bald.length > 0)
    return { outcome: 'not_eligible', reasons: ['long_bald_area', 'no_hair_shiny_scalp', 'older_age'] };
  // Bare and shiny but younger: not the client's "not eligible" case — the team talks it through.
  if (mostlyBald) return { outcome: 'unclear', reasons: ['no_hair_younger'] };
  return { outcome: 'eligible', reasons: ['hair_visible'] };
}
