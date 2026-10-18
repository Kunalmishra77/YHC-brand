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
    summary: 'Hair regrowth solution, Ayurvedic capsules and nourishing tablets. 3-month plan, review at 8 weeks.',
    productIds: ['prod-topical', 'prod-serum', 'prod-tablets'],
    planId: 'plan-3',
    followUpInWeeks: 8,
    items: [
      {
        genericName: 'YHC Hair Regrowth Solution',
        strength: 'As prescribed',
        dosage: '1 ml',
        frequency: 'Once daily, night',
        duration: '12 weeks',
        instructions: 'Apply to dry scalp over the crown; wash hands after use',
      },
      {
        genericName: 'YHC Hair Regrowth Capsules',
        strength: '—',
        dosage: 'As directed',
        frequency: 'As directed',
        duration: '12 weeks',
        instructions: 'Take with water after a meal',
      },
      {
        genericName: 'YHC Hair Nourishing Tablets',
        strength: '—',
        dosage: '1 tablet',
        frequency: 'Once daily after dinner',
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
      'Hair regrowth solution for the hairline with nourishing tablets. 3-month plan, review at 8 weeks.',
    productIds: ['prod-topical', 'prod-tablets'],
    planId: 'plan-3',
    followUpInWeeks: 8,
    items: [
      {
        genericName: 'YHC Hair Regrowth Solution',
        strength: 'As prescribed',
        dosage: '1 ml',
        frequency: 'Once daily, night',
        duration: '12 weeks',
        instructions: 'Apply to the front hairline and temples on a dry scalp; wash hands after use',
      },
      {
        genericName: 'YHC Hair Nourishing Tablets',
        strength: '—',
        dosage: '1 tablet',
        frequency: 'Once daily after dinner',
        duration: '12 weeks',
        instructions: 'Take after dinner with water',
      },
    ],
    note: 'Starting early gives you more options. Follow the routine daily and send photos of your hairline each month; we will review together at your follow-up.',
  },
  {
    id: 'shedding-nutrition',
    name: 'Shedding — nutrition support',
    summary: 'Nourishing tablets and the Ayurvedic powder. 2-month plan, review at 6 weeks.',
    productIds: ['prod-tablets', 'prod-shampoo'],
    planId: 'plan-2',
    followUpInWeeks: 6,
    items: [
      {
        genericName: 'YHC Hair Nourishing Tablets',
        strength: '—',
        dosage: '1 tablet',
        frequency: 'Once daily after dinner',
        duration: '8 weeks',
        instructions: 'Take with water; tell us if you start any new medicine',
      },
      {
        genericName: 'YHC Hair Regrowth Powder',
        strength: '—',
        dosage: 'One-third spoon in water',
        frequency: 'Twice daily',
        duration: '8 weeks',
        instructions: 'Mix in water; take after meals',
      },
    ],
    note: 'Shedding often settles once the cause is addressed. Eat regular, balanced meals, follow the routine daily and reply to our weekly check-ins.',
  },
];
