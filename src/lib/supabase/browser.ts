import { createBrowserClient } from '@supabase/ssr';
import { clientEnv } from '@/lib/env';

/** Anon client for client components (RLS applies). */
export function createSupabaseBrowserClient() {
  const url = clientEnv.NEXT_PUBLIC_SUPABASE_URL;
  const key = clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Supabase is not configured (NEXT_PUBLIC_SUPABASE_URL / ANON_KEY).');
  return createBrowserClient(url, key);
}
