import 'server-only';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/lib/database.types';
import { clientEnv } from '@/lib/env';
import { AppError } from '@/lib/errors';

/**
 * User-scoped client for server components, actions and handlers (RLS applies). Auth calls (OTP,
 * password, sign-out) always run here on our server: browsers never call *.supabase.co, which Indian
 * ISPs block (ADR-36). The session lives in cookies on our own domain.
 */
export async function createSupabaseServerClient() {
  const url = clientEnv.NEXT_PUBLIC_SUPABASE_URL;
  const key = clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new AppError('supabase_unconfigured', 'Supabase is not configured.', 500);
  const jar = await cookies();
  return createServerClient<Database>(url, key, {
    cookies: {
      getAll: () => jar.getAll(),
      setAll: (toSet) => {
        try {
          for (const { name, value, options } of toSet) jar.set(name, value, options);
        } catch {
          // Called from a server component: cookies are read-only there; the proxy refreshes the session.
        }
      },
    },
  });
}
