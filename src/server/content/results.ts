import 'server-only';

/**
 * Consented before/after results (ADR-27). Only real patient photos with written consent are ever added
 * here — never stock or AI-generated images. Files go in `public/media/results/` (faces cropped or
 * blurred unless the consent form covers identifiable use).
 * TODO(client): consented before/after photos + consent references — see docs/12 C, ADR-27.
 */
export interface ResultPhoto {
  src: string;
  width: number;
  height: number;
  alt: string;
}

export interface ResultEntry {
  id: string;
  /** Plain-language concern, e.g. "Crown thinning". No diagnosis wording. */
  concern: string;
  /** Time between the two photos, e.g. "5 months on plan". Shown with every result. */
  durationLabel: string;
  /** What the plan included, in general terms (no doses). */
  planSummary: string;
  before: ResultPhoto;
  after: ResultPhoto;
  /** Internal reference to the signed consent form; never displayed. */
  consentRef: string;
  /** ISO date the consent was recorded. */
  consentDate: string;
}

export const RESULTS: ResultEntry[] = [];

/** Results safe to publish: both photos present and a consent reference recorded. */
export function getPublishedResults(): ResultEntry[] {
  return RESULTS.filter((r) => r.consentRef.trim() !== '' && r.before.src !== '' && r.after.src !== '');
}
