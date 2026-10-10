import type {
  CaptureZone,
  FamilyHistory,
  LongBaldAreas,
  Miniaturisation,
  ScalpHealth,
  ScalpZone,
  ScanAngle,
  Suitability,
  ThinningDuration,
  ThinningPattern,
} from './types';

/** Plain-language labels for the journey (shared by patient, doctor and scan UIs). */

/** Capture zones (current scan) plus the legacy angle ids of older stored scans. */
export const ANGLE_LABEL: Record<ScanAngle, string> = {
  forehead_left: 'Forehead – Left',
  forehead_centre: 'Forehead – Centre',
  forehead_right: 'Forehead – Right',
  top: 'Top of head',
  crown: 'Crown',
  parting: 'Parting',
  back: 'Back of head',
  front: 'Front hairline',
  closeup: 'Scalp close-up',
};

/** Short helper text under each zone title. */
export const ZONE_HINT: Record<CaptureZone, string> = {
  forehead_left: 'Left temple and the left side of your hairline',
  forehead_centre: 'The middle of your front hairline',
  forehead_right: 'Right temple and the right side of your hairline',
  top: 'Mid-scalp, between the hairline and the crown',
  crown: 'The swirl at the top-back of your head',
  parting: 'Along your usual parting line',
  back: 'Lower back of the head, above the neck',
};

export const ZONE_LABEL: Record<ScalpZone, string> = {
  hairline: 'Front hairline',
  temples: 'Temples',
  mid_scalp: 'Mid-scalp',
  crown: 'Crown',
  parting: 'Parting line',
};

export const MINIATURISATION_LABEL: Record<Miniaturisation, string> = {
  low: 'Low',
  moderate: 'Moderate',
  high: 'High',
};

export const SCALP_HEALTH_LABEL: Record<ScalpHealth, string> = {
  healthy: 'Healthy',
  mild_irritation: 'Mild irritation',
  needs_attention: 'Needs attention',
};

export const SUITABILITY_LABEL: Record<Suitability, string> = {
  suitable: 'Suitable for a doctor-led plan',
  doctor_review: 'Doctor review needed',
  not_suitable: 'Treatment unlikely to help',
};

/** Short chip text, e.g. for the doctor's Today list. */
export const SUITABILITY_SHORT: Record<Suitability, string> = {
  suitable: 'Scan: suitable',
  doctor_review: 'Scan: review',
  not_suitable: 'Scan: not suitable',
};

export const DURATION_ANSWERS: { value: ThinningDuration; label: string }[] = [
  { value: 'lt_1y', label: 'Less than a year' },
  { value: '1_3y', label: '1 to 3 years' },
  { value: '3_5y', label: '3 to 5 years' },
  { value: 'gt_5y', label: 'More than 5 years' },
];

export const PATTERN_ANSWERS: { value: ThinningPattern; label: string; hint: string }[] = [
  { value: 'hairline', label: 'Front hairline / temples', hint: 'Forehead looks taller, temples receding' },
  { value: 'crown', label: 'Crown', hint: 'Scalp more visible at the top-back' },
  { value: 'diffuse', label: 'All over', hint: 'Hair looks less dense everywhere' },
  { value: 'parting', label: 'Widening parting', hint: 'The parting line looks wider' },
  { value: 'patches', label: 'Round patches', hint: 'Smooth, coin-sized bald spots' },
  { value: 'not_sure', label: 'Not sure', hint: 'The scan will help map it' },
];

export const LONG_BALD_ANSWERS: { value: LongBaldAreas; label: string; hint: string }[] = [
  { value: 'no', label: 'No', hint: 'There is still some hair in every area' },
  { value: 'small', label: 'Yes, a small area', hint: 'Smaller than a palm' },
  { value: 'large', label: 'Yes, a large area', hint: 'About a palm or larger' },
];

export const FAMILY_ANSWERS: { value: FamilyHistory; label: string }[] = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'not_sure', label: 'Not sure' },
];

export function answerLabel<T extends string>(options: { value: T; label: string }[], value: T): string {
  return options.find((o) => o.value === value)?.label ?? value;
}
