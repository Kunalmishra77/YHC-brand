import 'server-only';

import type {
  Miniaturisation,
  ScalpHealth,
  ScalpZone,
  ScanAnswers,
  ScanMetrics,
  Suitability,
  ThinningPattern,
} from '@/lib/journey/types';

/*
 * SIMULATED scan analysis (ADR-26 demo). There is no real image analysis yet — the result is a
 * deterministic function of the pre-scan answers so demos are repeatable. The UI always labels it
 * "Demo analysis — your doctor makes the final assessment".
 * TODO(client): real 3D scan engine / device — see docs/12 (scan provider row).
 */

export interface SimulatedAssessment {
  metrics: ScanMetrics;
  suitability: Suitability;
  headline: string;
  explanation: string;
  reasons: string[];
}

const DURATION_PENALTY: Record<ScanAnswers['duration'], number> = {
  lt_1y: 0,
  '1_3y': 10,
  '3_5y': 20,
  gt_5y: 30,
};

const LONG_BALD_PENALTY: Record<ScanAnswers['longBald'], number> = { no: 0, small: 15, large: 40 };
/** extra drop in viable follicles for areas bald 5+ years (follicles there are often no longer active) */
const LONG_BALD_VIABLE_DROP: Record<ScanAnswers['longBald'], number> = { no: 0, small: 8, large: 30 };
const FAMILY_PENALTY: Record<ScanAnswers['familyHistory'], number> = { yes: 6, not_sure: 3, no: 0 };
const PATTERN_PENALTY: Record<ThinningPattern, number> = {
  hairline: 0,
  crown: 0,
  parting: 2,
  diffuse: 4,
  patches: 8,
  not_sure: 0,
};

const ZONES: Record<ThinningPattern, ScalpZone[]> = {
  hairline: ['hairline', 'temples'],
  crown: ['crown'],
  diffuse: ['mid_scalp', 'crown', 'parting'],
  parting: ['parting', 'mid_scalp'],
  patches: ['mid_scalp'],
  not_sure: ['mid_scalp'],
};

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, Math.round(n)));

export function assessScan(answers: ScanAnswers): SimulatedAssessment {
  const rootDensity = clamp(
    78 -
      DURATION_PENALTY[answers.duration] -
      LONG_BALD_PENALTY[answers.longBald] -
      FAMILY_PENALTY[answers.familyHistory] -
      PATTERN_PENALTY[answers.pattern],
    5,
    95,
  );
  const viableFollicles = clamp(rootDensity * 0.9 + 12 - LONG_BALD_VIABLE_DROP[answers.longBald], 0, 97);
  const miniaturisation: Miniaturisation =
    rootDensity >= 60 ? 'low' : rootDensity >= 35 ? 'moderate' : 'high';
  const scalpHealth: ScalpHealth =
    answers.pattern === 'patches'
      ? 'needs_attention'
      : answers.pattern === 'diffuse'
        ? 'mild_irritation'
        : 'healthy';
  const thinningAreas = [...ZONES[answers.pattern]];
  if (answers.longBald !== 'no' && !thinningAreas.includes('crown')) thinningAreas.push('crown');

  const metrics: ScanMetrics = { rootDensity, viableFollicles, miniaturisation, scalpHealth, thinningAreas };

  if (answers.longBald === 'large' && viableFollicles < 30) {
    return {
      metrics,
      suitability: 'not_suitable',
      headline: 'Treatment is unlikely to help the scanned areas',
      explanation:
        'The scan found very few visible, active hair roots in the areas that have been bald for a long time. Hair-care treatments work through existing roots, so a plan is unlikely to help there. You can still speak with a doctor about other options.',
      reasons: [
        'An area has been completely bald for more than 5 years.',
        `Viable follicles in the scanned areas look very low (${viableFollicles} out of 100).`,
        'Without visible active roots, a treatment plan is unlikely to change these areas.',
      ],
    };
  }

  const reviewReasons: string[] = [];
  if (answers.longBald === 'small')
    reviewReasons.push(
      'A small area has been bald for more than 5 years — the doctor should check those roots.',
    );
  if (answers.pattern === 'patches')
    reviewReasons.push('Round patches can have different causes that a doctor needs to identify first.');
  if (rootDensity < 40) reviewReasons.push(`Root density looks low (${rootDensity} out of 100).`);

  if (reviewReasons.length > 0) {
    return {
      metrics,
      suitability: 'doctor_review',
      headline: 'A doctor should look at this first',
      explanation:
        'Some signs in your scan need a doctor’s eye before any plan is suggested. This is common and does not mean treatment will not help — it means the doctor will confirm what is going on during your consultation.',
      reasons: reviewReasons,
    };
  }

  const reasons = [
    `Root density is ${rootDensity >= 60 ? 'in a good range' : 'reduced but present'} (${rootDensity} out of 100).`,
    `Many follicles still look active (${viableFollicles} out of 100).`,
    `Miniaturisation looks ${miniaturisation} — thinner hairs can often be supported while roots are active.`,
  ];
  if (scalpHealth === 'mild_irritation')
    reasons.push('Mild scalp irritation — the doctor may suggest scalp care too.');
  return {
    metrics,
    suitability: 'suitable',
    headline: 'Your hair roots show potential',
    explanation:
      'Your hair roots show potential: with a doctor-prescribed plan, root concentration and hair condition can potentially be improved. Individual results vary.',
    reasons,
  };
}
