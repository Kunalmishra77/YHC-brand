import 'server-only';

import type { PrescriptionItem } from '@/lib/domain/types';

/*
 * Protocol templates (FR-M5-8): starting points the doctor edits per patient.
 * Demo presets — TODO(client): Dr. Tyagi to supply/approve real protocols (generic names, strengths) — see docs/12.
 * Copy follows PRD §15: no outcome promises, no fixed timelines for results.
 */

export interface ProtocolTemplate {
  id: string;
  name: string;
  summary: string;
  productIds: string[];
  items: PrescriptionItem[];
  planId: 'plan-1' | 'plan-2' | 'plan-3';
  followUpInWeeks: number;
  note: string;
}

export const PROTOCOLS: ProtocolTemplate[] = [
  {
    id: 'crown-standard',
    name: 'Crown thinning — standard',
    summary: 'Topical solution, scalp serum and nutrition tablets. 3-month plan, review at 8 weeks.',
    productIds: ['prod-topical', 'prod-serum', 'prod-tablets'],
    planId: 'plan-3',
    followUpInWeeks: 8,
    items: [
      {
        genericName: 'Topical solution (as discussed)',
        strength: 'As prescribed',
        dosage: '1 ml',
        frequency: 'Once daily, night',
        duration: '12 weeks',
        instructions: 'Apply to dry scalp over the crown; wash hands after use',
      },
      {
        genericName: 'Scalp serum',
        strength: '—',
        dosage: '4–5 drops',
        frequency: 'Once daily, morning',
        duration: '12 weeks',
        instructions: 'Massage gently into the scalp',
      },
      {
        genericName: 'Nutrition tablets',
        strength: '—',
        dosage: '1 tablet',
        frequency: 'Once daily after breakfast',
        duration: '12 weeks',
        instructions: 'Take with water',
      },
    ],
    note: 'Consistency matters most. Use the routine every day and share progress photos each month so we can review how you are doing at your follow-up.',
  },
  {
    id: 'hairline-early',
    name: 'Hairline — early',
    summary:
      'Topical solution for the hairline, scalp serum and a gentle shampoo. 3-month plan, review at 8 weeks.',
    productIds: ['prod-topical', 'prod-serum', 'prod-shampoo'],
    planId: 'plan-3',
    followUpInWeeks: 8,
    items: [
      {
        genericName: 'Topical solution (as discussed)',
        strength: 'As prescribed',
        dosage: '1 ml',
        frequency: 'Once daily, night',
        duration: '12 weeks',
        instructions: 'Apply to the front hairline and temples on a dry scalp; wash hands after use',
      },
      {
        genericName: 'Scalp serum',
        strength: '—',
        dosage: '4–5 drops',
        frequency: 'Once daily, morning',
        duration: '12 weeks',
        instructions: 'Massage gently along the hairline',
      },
      {
        genericName: 'Gentle strengthening shampoo',
        strength: '—',
        dosage: 'Small amount',
        frequency: '3–4 times a week',
        duration: 'Ongoing',
        instructions: 'Use on wet hair, rinse well',
      },
    ],
    note: 'Starting early gives you more options. Follow the routine daily and send photos of your hairline each month; we will review together at your follow-up.',
  },
  {
    id: 'shedding-nutrition',
    name: 'Shedding — nutrition support',
    summary: 'Nutrition tablets, scalp serum and a gentle shampoo. 2-month plan, review at 6 weeks.',
    productIds: ['prod-tablets', 'prod-serum', 'prod-shampoo'],
    planId: 'plan-2',
    followUpInWeeks: 6,
    items: [
      {
        genericName: 'Nutrition tablets',
        strength: '—',
        dosage: '1 tablet',
        frequency: 'Once daily after breakfast',
        duration: '8 weeks',
        instructions: 'Take with water; tell us if you start any new medicine',
      },
      {
        genericName: 'Scalp serum',
        strength: '—',
        dosage: '4–5 drops',
        frequency: 'Once daily, night',
        duration: '8 weeks',
        instructions: 'Massage gently into the scalp',
      },
      {
        genericName: 'Gentle strengthening shampoo',
        strength: '—',
        dosage: 'Small amount',
        frequency: '3–4 times a week',
        duration: 'Ongoing',
        instructions: 'Use on wet hair, rinse well',
      },
    ],
    note: 'Shedding often settles once the cause is addressed. Eat regular, balanced meals, follow the routine daily and reply to our weekly check-ins.',
  },
];
