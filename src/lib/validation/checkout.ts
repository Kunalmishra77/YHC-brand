import { z } from 'zod';

/*
 * Checkout schemas (FR-M2-4, FR-M6-3). Shared by the cart/checkout/plan forms and the server actions.
 * Prices are never part of these — the server recomputes every amount from ids (CLAUDE.md).
 */

export const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
] as const;

export const addressSchema = z.object({
  fullName: z.string().trim().min(2, 'Who should we deliver to?').max(80),
  line1: z.string().trim().min(4, 'House / flat number and street').max(120),
  line2: z.string().trim().max(120),
  city: z.string().trim().min(2, 'Enter your city').max(60),
  state: z.enum(INDIAN_STATES, { error: 'Choose your state' }),
  pincode: z
    .string()
    .trim()
    .regex(/^[1-9]\d{5}$/, 'Pincode is 6 digits'),
});
export type AddressInput = z.infer<typeof addressSchema>;

export const EMPTY_ADDRESS: AddressInput = {
  fullName: '',
  line1: '',
  line2: '',
  city: '',
  state: 'Delhi',
  pincode: '',
};

/** One-line address stored on the order (demo store keeps a string). */
export function formatAddress(a: AddressInput): string {
  return [a.fullName, a.line1, a.line2, a.city, `${a.state} ${a.pincode}`]
    .map((x) => x.trim())
    .filter(Boolean)
    .join(', ');
}

export const MAX_QTY = 5;

export const cartItemSchema = z.object({
  productId: z.string().min(1).max(64),
  qty: z.number().int().min(1).max(MAX_QTY),
});
export type CartItem = z.infer<typeof cartItemSchema>;

export const cartSchema = z.array(cartItemSchema).min(1, 'Your cart is empty').max(20);

export const checkoutSchema = z.object({
  items: cartSchema,
  address: addressSchema,
  consent: z.boolean().refine((v) => v, 'Please accept the terms and refund policy to continue'),
});

/** `address: null` → use the saved address (only allowed when signed in as the plan's customer). */
export const planPaymentSchema = z.object({
  token: z.string().min(16).max(80),
  planId: z.string().min(1).max(32),
  address: addressSchema.nullable(),
});

export const orderLookupSchema = z.object({
  code: z.string().regex(/^YHC-\d{4,8}$/),
  token: z.string().max(80).optional(),
});
