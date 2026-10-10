import 'server-only';

/**
 * Consented before/after results (ADR-27). Only real patient photos with written consent are ever added
 * here — never stock or AI-generated images. The client confirmed written consent for these photos on the
 * condition that faces are never shown, so every file in `public/media/results/` is cropped to the scalp
 * (crop boxes are reproducible: `scripts/results-crops.mjs`). Crops and resizing only — no retouching.
 * TODO(client): time between each pair of photos (months) and the consent-form references — see docs/12 C.
 */
export interface ResultPhoto {
  src: string;
  width: number;
  height: number;
  alt: string;
}

export type ResultView = 'Top-front' | 'Side' | 'Crown';

export interface ResultConsent {
  /** Patient agreed in writing to marketing use of these photos. */
  photoMarketing: boolean;
  /** Whether the face is visible. Must stay false: consent was given on that condition. */
  faceShown: boolean;
  /** Who recorded the consent (internal; never displayed). */
  recordedBy: string;
}

export interface ResultEntry {
  id: string;
  /** Anonymous label, e.g. "Patient A". Never a name or initials. */
  patientLabel: string;
  /** Plain-language concern, e.g. "Crown thinning". No diagnosis wording. */
  concern: string;
  view: ResultView;
  before: ResultPhoto;
  after: ResultPhoto;
  /** Months between the two photos; null until the clinic confirms it ("Duration: to be confirmed"). */
  months: number | null;
  consent: ResultConsent;
  /** Short neutral note about the photos (no product named as the cause, no promises). */
  note: string;
}

const W = 1000;
const H = 1250;
const CONSENT: ResultConsent = {
  photoMarketing: true,
  faceShown: false,
  recordedBy: 'clinic — written consent on file',
};

function photo(file: string, alt: string): ResultPhoto {
  return { src: `/media/results/${file}`, width: W, height: H, alt };
}

export const RESULTS: ResultEntry[] = [
  {
    id: 'patient-a-top',
    patientLabel: 'Patient A',
    concern: 'Diffuse thinning',
    view: 'Top-front',
    before: photo(
      'patient-a-1-before.webp',
      'Patient A, top of the scalp before starting a plan: the scalp shows through thin hair along the parting. Face not shown.',
    ),
    after: photo(
      'patient-a-1-after.webp',
      'Patient A, top of the scalp at a later visit, after a plan prescribed by the doctor. Face not shown.',
    ),
    months: null,
    consent: CONSENT,
    note: 'Top of the scalp, before and at a later visit, after a plan prescribed by the doctor.',
  },
  {
    id: 'patient-a-parting',
    patientLabel: 'Patient A',
    concern: 'Diffuse thinning',
    view: 'Top-front',
    before: photo(
      'patient-a-2-before.webp',
      'Patient A, front of the scalp and parting before starting a plan. Face not shown.',
    ),
    after: photo(
      'patient-a-2-after.webp',
      'Patient A, front of the scalp and parting at a later visit, after a plan prescribed by the doctor. Face not shown.',
    ),
    months: null,
    consent: CONSENT,
    note: 'Front of the scalp and parting, before and at a later visit, after a plan prescribed by the doctor.',
  },
  {
    id: 'patient-b-top',
    patientLabel: 'Patient B',
    concern: 'Receding hairline',
    view: 'Top-front',
    before: photo(
      'patient-b-1-before.webp',
      'Patient B, front and top of the scalp before starting a plan: thinning behind the hairline. Face not shown.',
    ),
    after: photo(
      'patient-b-1-after.webp',
      'Patient B, front and top of the scalp at a later visit, after a plan prescribed by the doctor. Face not shown.',
    ),
    months: null,
    consent: CONSENT,
    note: 'Front and top of the scalp, before and at a later visit, after a plan prescribed by the doctor.',
  },
  {
    id: 'patient-b-side',
    patientLabel: 'Patient B',
    concern: 'Receding hairline',
    view: 'Side',
    before: photo(
      'patient-b-2-before.webp',
      'Patient B, side of the head and temple before starting a plan. Face not shown.',
    ),
    after: photo(
      'patient-b-2-after.webp',
      'Patient B, side of the head at a later visit, after a plan prescribed by the doctor. Face not shown.',
    ),
    months: null,
    consent: CONSENT,
    note: 'Side view. The two photos show opposite sides of the head.',
  },
  {
    id: 'patient-c-crown',
    patientLabel: 'Patient C',
    concern: 'Crown thinning',
    view: 'Crown',
    before: photo(
      'patient-c-1-before.webp',
      'Patient C, crown seen from behind before starting a plan: the scalp is visible through thin hair. Face not shown.',
    ),
    after: photo(
      'patient-c-1-after.webp',
      'Patient C, crown seen from behind at a later visit, after a plan prescribed by the doctor. Face not shown.',
    ),
    months: null,
    consent: CONSENT,
    note: 'Crown seen from behind, before and at a later visit, after a plan prescribed by the doctor.',
  },
];

/** Results safe to publish: marketing consent recorded, face hidden, both photos present. */
export function getPublishedResults(results: ResultEntry[] = RESULTS): ResultEntry[] {
  return results.filter(
    (r) => r.consent.photoMarketing && !r.consent.faceShown && r.before.src !== '' && r.after.src !== '',
  );
}
