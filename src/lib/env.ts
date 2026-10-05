import { z } from 'zod';

/** Public variables — safe in the browser bundle. Next inlines `process.env.NEXT_PUBLIC_*` at build time. */
const clientSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.url().default('http://localhost:3000'),
  // Required from Phase 01; optional while the demo runs on in-memory data (ADR-23).
  NEXT_PUBLIC_SUPABASE_URL: z.url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  // TODO(client): Razorpay test key — see docs/12 (phase 03)
  NEXT_PUBLIC_RAZORPAY_KEY_ID: z.string().optional(),
  NEXT_PUBLIC_GA_ID: z.string().optional(),
  NEXT_PUBLIC_META_PIXEL_ID: z.string().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
});

const emptyToUndefined = (v: string | undefined) => {
  const t = v?.trim();
  return t ? t : undefined;
};

export const clientEnv = clientSchema.parse({
  NEXT_PUBLIC_SITE_URL: emptyToUndefined(process.env.NEXT_PUBLIC_SITE_URL),
  NEXT_PUBLIC_SUPABASE_URL: emptyToUndefined(process.env.NEXT_PUBLIC_SUPABASE_URL),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: emptyToUndefined(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  NEXT_PUBLIC_RAZORPAY_KEY_ID: emptyToUndefined(process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID),
  NEXT_PUBLIC_GA_ID: emptyToUndefined(process.env.NEXT_PUBLIC_GA_ID),
  NEXT_PUBLIC_META_PIXEL_ID: emptyToUndefined(process.env.NEXT_PUBLIC_META_PIXEL_ID),
  NEXT_PUBLIC_SENTRY_DSN: emptyToUndefined(process.env.NEXT_PUBLIC_SENTRY_DSN),
});
