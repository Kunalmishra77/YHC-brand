import 'server-only';

import { createClient } from '@supabase/supabase-js';
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
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
