import 'server-only';

import { cache } from 'react';
import type { AppRole } from '@/lib/domain/types';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export interface LiveSessionUser {
  id: string;
  name: string;
  email: string | null;
  role: AppRole;
  aal: 'aal1' | 'aal2';
  customerId: string | null;
}

/**
 * The signed-in Supabase user with their role (profiles) and customer id (ADR-36). Cached per request.
 * `getUser()` asks Supabase Auth to validate the token — never trust the cookie alone.
 */
export const getLiveSessionUser = cache(async (): Promise<LiveSessionUser | null> => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = createSupabaseAdminClient();
  const { data: profile } = await admin
    .from('profiles')
    .select('role, is_active, full_name, email')
    .eq('id', user.id)
    .maybeSingle();
  if (!profile?.is_active) return null;

  let customerId: string | null = null;
  if (profile.role === 'customer') {
    const { data: customer } = await admin
      .from('customers')
      .select('id')
      .eq('profile_id', user.id)
      .is('deleted_at', null)
      .maybeSingle();
    customerId = customer?.id ?? null;
  }
  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  return {
    id: user.id,
    name: profile.full_name ?? profile.email ?? user.email ?? '',
    email: profile.email ?? user.email ?? null,
    role: profile.role,
    aal: aal?.currentLevel === 'aal2' ? 'aal2' : 'aal1',
    customerId,
  };
});
