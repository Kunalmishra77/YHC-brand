import 'server-only';

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';
import { clientEnv } from '@/lib/env';
import { serverEnv } from '@/lib/env.server';
import { AppError } from '@/lib/errors';

/**
 * Service-role client — bypasses RLS. Only import from src/server/** and src/app/api/**
 * (enforced by ESLint no-restricted-imports).
 */
export function createSupabaseAdminClient() {
  const url = clientEnv.NEXT_PUBLIC_SUPABASE_URL;
  const key = serverEnv.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new AppError('supabase_unconfigured', 'Supabase is not configured.', 500);
  return createClient<Database>(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export type AdminClient = ReturnType<typeof createSupabaseAdminClient>;
