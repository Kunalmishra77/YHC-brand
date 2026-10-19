import 'server-only';

import type { HairConcern } from '@/lib/domain/types';
import type { LegalSlug } from './legal';

/*
 * Meta descriptions for catalog-driven pages (SEO-04): 140–155 characters each, so search results
 * show the whole sentence. On-page copy is unchanged; these only feed <meta name="description">.
 * Copy rules: PRD §15 — no outcome promises, no fixed timelines.
 */

export const SEO_DESCRIPTION_MIN = 140;
export const SEO_DESCRIPTION_MAX = 155;
/** The root layout's title template appends " · Your Hair Company" (20 chars); keep the total under 60. */
export const SEO_TITLE_MAX = 39;

export const CONCERN_SEO_DESCRIPTION: Partial<Record<HairConcern, string>> = {
  hair_fall:
    'More hair on the pillow, comb or shower drain than usual? What hair fall can mean, common causes, and how a consultation with Dr. Tyagi helps.',
  thinning:
    'Hair feels less dense, or your scalp shows more than before? What overall thinning can mean, its common causes, and how a consultation helps.',
  receding_hairline:
    'Is the hairline at your temples or front moving back? What a receding hairline can mean, its common causes, and how a consultation can help.',
  crown_thinning:
    'A thinner patch at the top or back of the head? What crown thinning can mean, its common causes, and how a consultation with Dr. Tyagi helps.',
  dandruff_scalp:
    'Flaking, itching or an irritated scalp? What dandruff and scalp issues can mean, common causes, and how a consultation with Dr. Tyagi can help.',
};

export const PRODUCT_SEO_DESCRIPTION: Record<string, string> = {
  'hair-regrowth-solution':
    'YHC Hair Regrowth Solution, a 60 ml topical scalp solution. Its label lists finasteride, so it is supplied only when Dr. Tyagi prescribes it.',
  'hair-nourishing-tablets':
    'YHC Hair Nourishing Tablets: a once-a-day tablet of three botanicals with vitamins and minerals, included when Dr. Tyagi finds a nutritional gap.',
  'hair-regrowth-capsules':
    'YHC Hair Regrowth Capsules: an Ayurvedic blend of six plant ingredients led by amla and bhringraj. Dr. Tyagi decides if they belong in your plan.',
  'hair-regrowth-powder':
    'YHC Hair Regrowth Powder: the six-ingredient Ayurvedic blend of the capsules as a powder mixed with water. The doctor recommends one or the other.',
};

export const LEGAL_SEO_DESCRIPTION: Record<LegalSlug, string> = {
  privacy:
    'What we collect — including your scalp scan and health information — why, who can see it, where it is stored, how long it is kept, and your rights.',
  terms:
    'The terms for using Your Hair Company: the guided 3D scalp scan, telemedicine consultations with a doctor, prescriptions, orders and payments.',
  'refund-cancellation':
    'Your Hair Company refund policy: rescheduling and cancelling consultations, cancelling orders, returning damaged or wrong items, and how refunds are paid.',
  shipping:
    'Your Hair Company shipping policy: where we deliver, delivery charges, order tracking on WhatsApp and what to do if a parcel is damaged or goes wrong.',
  guarantee:
    'Your Hair Company money-back guarantee terms: the conditions that apply and how a claim is reviewed by a doctor, whenever a guarantee is being offered.',
  'medical-disclaimer':
    'Medical disclaimer for Your Hair Company: what the information on this site is, and is not, and how telemedicine consultations with a doctor work.',
  grievance:
    'Contact the Your Hair Company grievance officer if an issue with a booking, order or consultation has not been resolved, and see how quickly we respond.',
};

/**
 * Fallback for catalog items without hand-written copy: trims at a word boundary to at most
 * `SEO_DESCRIPTION_MAX` characters (ellipsis included).
 */
export function clampDescription(text: string, max = SEO_DESCRIPTION_MAX): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).replace(/[\s,;:·—-]+$/, '')}…`;
}
