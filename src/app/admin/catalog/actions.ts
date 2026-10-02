'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { rupeesToPaise } from '@/lib/money';
import { updatePlan, updateProduct } from '@/server/admin/catalog';
import { runAdminAction, type ActionResult } from '@/server/admin/guard';

const rupees = z.number().positive('Price must be more than ₹0.').max(1_000_000);

const productSchema = z.object({
  priceRupees: rupees.nullable(),
  requiresConsultation: z.boolean(),
  hsn: z
    .string()
    .trim()
    .regex(/^\d{4,8}$/, 'HSN is 4–8 digits.'),
  gstRate: z.union([z.literal(0), z.literal(5), z.literal(12), z.literal(18), z.literal(28)], {
    error: 'GST must be 0, 5, 12, 18 or 28%.',
  }),
  daysOfSupply: z.number().int().min(1).max(365),
});

export async function updateProductAction(
  productId: string,
  input: z.infer<typeof productSchema>,
): Promise<ActionResult> {
  return runAdminAction(['admin'], productSchema, input, (data, user) => {
    const p = updateProduct(
      productId,
      {
        pricePaise: data.priceRupees === null ? null : rupeesToPaise(data.priceRupees),
        requiresConsultation: data.requiresConsultation,
        hsn: data.hsn,
        gstRate: data.gstRate,
        daysOfSupply: data.daysOfSupply,
      },
      user.name,
    );
    revalidatePath('/', 'layout');
    return `${p.name} saved · audited`;
  });
}

const planSchema = z.object({
  priceRupees: rupees,
  compareAtRupees: rupees.nullable(),
  isRecommended: z.boolean(),
});

export async function updatePlanAction(
  planId: string,
  input: z.infer<typeof planSchema>,
): Promise<ActionResult> {
  return runAdminAction(['admin'], planSchema, input, (data, user) => {
    const plan = updatePlan(
      planId,
      {
        pricePaise: rupeesToPaise(data.priceRupees),
        compareAtPaise: data.compareAtRupees === null ? null : rupeesToPaise(data.compareAtRupees),
        isRecommended: data.isRecommended,
      },
      user.name,
    );
    revalidatePath('/', 'layout');
    return `${plan.name} saved · audited`;
  });
}
