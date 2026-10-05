import 'server-only';

import { z } from 'zod';

const optional = z.preprocess((v) => (v === '' ? undefined : v), z.string().optional());

/**
 * Server-only variables. Integration keys stay optional until their phase (see .env.example);
 * each adapter checks its own keys and falls back to the `log` provider in dev.
 */
const serverSchema = z
  .object({
    APP_ENV: z.enum(['local', 'staging', 'production']).default('local'),
    DEMO_MODE: z.preprocess((v) => v === 'true', z.boolean()).default(false),
    LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),
    SUPABASE_SERVICE_ROLE_KEY: optional, // required from Phase 01
    CRON_SECRET: optional, // phase 01
    LINK_SIGNING_SECRET: optional, // phase 04
    ENCRYPTION_KEY: optional, // phase 05
    RAZORPAY_KEY_SECRET: optional, // TODO(client): Razorpay test keys — docs/12
    RAZORPAY_WEBHOOK_SECRET: optional,
    WHATSAPP_PROVIDER: z.enum(['log', 'generic-http', 'meta-cloud']).default('log'),
    SENTRY_DSN: optional,
  })
  .refine((env) => !(env.DEMO_MODE && env.APP_ENV === 'production'), {
    message: 'DEMO_MODE must never be enabled in production',
    path: ['DEMO_MODE'],
  });

// Trim every value: dashboards and shells sometimes store a trailing newline ("staging\n").
const trimmed = Object.fromEntries(
  Object.entries(process.env).map(([k, v]) => [k, typeof v === 'string' ? v.trim() : v]),
);

export const serverEnv = serverSchema.parse(trimmed);
