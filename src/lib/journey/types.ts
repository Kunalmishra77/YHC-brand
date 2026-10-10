/*
 * Patient journey (ADR-26): basic details → 3D scan → assessment → health form → book → consultation.
 * Shared, serialisable types — used by the server journey module and the client components.
 */

/** The seven guided capture zones of the scan, in capture order. */
export const CAPTURE_ZONES = [
  'forehead_left',
  'forehead_centre',
  'forehead_right',
  'top',
  'crown',
  'parting',
  'back',
] as const;

export type CaptureZone = (typeof CAPTURE_ZONES)[number];

/** Zones that cannot be skipped (the doctor needs the hairline and the crown). */
export const REQUIRED_ZONES: readonly CaptureZone[] = ['forehead_centre', 'crown'];

/** Fewest zones a patient must capture before the analysis runs. */
export const MIN_CAPTURED_ZONES = 4;

/** Angle ids from the earlier four-angle scan — kept so stored scans still render. */
export type LegacyScanAngle = 'front' | 'crown' | 'parting' | 'closeup';

/** Anything that may appear in a stored scan's `angles` list. */
export type ScanAngle = CaptureZone | LegacyScanAngle;

export type ScalpZone = 'hairline' | 'temples' | 'mid_scalp' | 'crown' | 'parting';

export type Miniaturisation = 'low' | 'moderate' | 'high';
export type ScalpHealth = 'healthy' | 'mild_irritation' | 'needs_attention';
export type Suitability = 'suitable' | 'doctor_review' | 'not_suitable';

export interface ScanMetrics {
  /** 0–100 (simulated) */
  rootDensity: number;
  /** 0–100 (simulated) */
  viableFollicles: number;
  miniaturisation: Miniaturisation;
  scalpHealth: ScalpHealth;
  thinningAreas: ScalpZone[];
}

export type ThinningDuration = 'lt_1y' | '1_3y' | '3_5y' | 'gt_5y';
export type ThinningPattern = 'hairline' | 'crown' | 'diffuse' | 'parting' | 'patches' | 'not_sure';
export type LongBaldAreas = 'no' | 'small' | 'large';
export type FamilyHistory = 'yes' | 'no' | 'not_sure';

/** The short pre-scan questions. */
export interface ScanAnswers {
  duration: ThinningDuration;
  pattern: ThinningPattern;
  /** any area completely bald for 5+ years */
  longBald: LongBaldAreas;
  familyHistory: FamilyHistory;
}

export interface ScanResult {
  id: string;
  capturedAt: string;
  /** captured zones (older scans: the four legacy angles) */
  angles: ScanAngle[];
  /** zones the patient chose to skip (absent on older scans) */
  skippedZones?: CaptureZone[];
  answers: ScanAnswers;
  metrics: ScanMetrics;
  suitability: Suitability;
  headline: string;
  explanation: string;
  reasons: string[];
}

export type JourneyStep = 'details' | 'scan' | 'assessment' | 'health_form' | 'book' | 'consultation';

export const JOURNEY_STEPS: readonly { id: JourneyStep; label: string }[] = [
  { id: 'details', label: 'Details' },
  { id: 'scan', label: '3D scan' },
  { id: 'assessment', label: 'Assessment' },
  { id: 'health_form', label: 'Health form' },
  { id: 'book', label: 'Book slot' },
  { id: 'consultation', label: 'Consultation' },
];

/** One row of the "My journey" tracker in the patient portal. */
export interface JourneyTrackerStep {
  id: JourneyStep;
  label: string;
  status: 'done' | 'current' | 'upcoming';
  /** human-readable IST date/time, when known */
  at: string | null;
  note: string | null;
  href: string | null;
}
