import 'server-only';

import type { GuaranteePolicy } from '@/lib/domain/types';
import { CONCERNS, DOCTOR, FAQS, GUARANTEE_POLICY, PLANS, PRODUCTS } from '@/server/demo/fixtures';
import { getSetting } from '@/server/demo/store';

/*
 * Public catalog reads. Demo: fixtures. Phase 02/03: Supabase anon client (RLS public policies).
 */

export const getDoctor = () => DOCTOR;
export const getPlans = () => PLANS;
export const getPlan = (id: string) => PLANS.find((p) => p.id === id || p.slug === id) ?? null;
export const getProducts = () => PRODUCTS;
export const getProduct = (slug: string) => PRODUCTS.find((p) => p.slug === slug || p.id === slug) ?? null;
export const getConcerns = () => CONCERNS;
export const getConcern = (slug: string) => CONCERNS.find((c) => c.slug === slug) ?? null;
export const getFaqs = () => FAQS;

/** Active guarantee policy, or null while `guarantee.enabled = false` (everything guarantee-related is hidden). */
export function getGuarantee(): GuaranteePolicy | null {
  if (getSetting('guarantee.enabled') !== 'true') return null;
  return GUARANTEE_POLICY.isActive ? GUARANTEE_POLICY : null;
}
