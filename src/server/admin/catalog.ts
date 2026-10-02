import 'server-only';

import type { Plan, Product } from '@/lib/domain/types';
import { AppError } from '@/lib/errors';
import { formatINR } from '@/lib/money';
import { PLANS, PRODUCTS } from '@/server/demo/fixtures';
import { recordAudit } from '@/server/demo/store';

/*
 * In-memory catalog edits (FR-M12-2). Demo: fixture objects are edited in place so the site and
 * checkout see the change; "Reset demo data" restores them. Every price change is audited
 * (FR-M14-4). Phase 02 moves this to `products` / `plans` tables.
 */

export interface ProductPatch {
  pricePaise: number | null;
  requiresConsultation: boolean;
  hsn: string;
  gstRate: number;
  daysOfSupply: number;
}

export function updateProduct(id: string, patch: ProductPatch, actor: string): Product {
  const p = PRODUCTS.find((x) => x.id === id);
  if (!p) throw new AppError('not_found', 'Product not found', 404);
  if (!patch.requiresConsultation && patch.pricePaise === null) {
    throw new AppError('invalid_input', 'Products sold without a consultation need a price.', 422);
  }
  const changes: string[] = [];
  if (p.pricePaise !== patch.pricePaise) {
    recordAudit(
      actor,
      'price.change',
      `${p.name}: ${p.pricePaise === null ? 'no price' : formatINR(p.pricePaise)} → ${patch.pricePaise === null ? 'no price' : formatINR(patch.pricePaise)}`,
    );
  }
  if (p.requiresConsultation !== patch.requiresConsultation)
    changes.push(`requires consultation ${patch.requiresConsultation ? 'on' : 'off'}`);
  if (p.hsn !== patch.hsn) changes.push(`HSN ${patch.hsn}`);
  if (p.gstRate !== patch.gstRate) changes.push(`GST ${patch.gstRate}%`);
  if (p.daysOfSupply !== patch.daysOfSupply) changes.push(`supply ${patch.daysOfSupply} days`);
  Object.assign(p, patch);
  if (changes.length) recordAudit(actor, 'catalog.update', `${p.name}: ${changes.join(', ')}`);
  return p;
}

export interface PlanPatch {
  pricePaise: number;
  compareAtPaise: number | null;
  isRecommended: boolean;
}

export function updatePlan(id: string, patch: PlanPatch, actor: string): Plan {
  const plan = PLANS.find((x) => x.id === id);
  if (!plan) throw new AppError('not_found', 'Plan not found', 404);
  if (patch.compareAtPaise !== null && patch.compareAtPaise <= patch.pricePaise) {
    throw new AppError('invalid_input', 'Compare-at price must be higher than the price.', 422);
  }
  if (plan.pricePaise !== patch.pricePaise || plan.compareAtPaise !== patch.compareAtPaise) {
    recordAudit(
      actor,
      'price.change',
      `${plan.name}: ${formatINR(plan.pricePaise)} → ${formatINR(patch.pricePaise)}` +
        (plan.compareAtPaise !== patch.compareAtPaise
          ? ` · compare-at ${patch.compareAtPaise === null ? 'removed' : formatINR(patch.compareAtPaise)}`
          : ''),
    );
  }
  if (plan.isRecommended !== patch.isRecommended) {
    recordAudit(actor, 'catalog.update', `${plan.name}: recommended ${patch.isRecommended ? 'on' : 'off'}`);
    if (patch.isRecommended) for (const other of PLANS) if (other.id !== id) other.isRecommended = false;
  }
  Object.assign(plan, patch);
  return plan;
}
