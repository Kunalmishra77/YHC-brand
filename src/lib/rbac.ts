import 'server-only';

import type { AppRole } from '@/lib/domain/types';
import { AppError } from '@/lib/errors';
import { serverEnv } from '@/lib/env.server';
import { demoUserFor } from '@/lib/demo-session';
import { ensureDemoState } from '@/server/demo/persist';
import { readDemoSession } from '@/server/demo/session';

export interface SessionUser {
  id: string;
  name: string;
  role: AppRole;
  aal: 'aal1' | 'aal2';
  /** set for customers */
  customerId: string | null;
}

/** Route group → roles allowed (TRD §5.3). Shared with the proxy. */
export const ROUTE_ROLES: { prefix: string; roles: AppRole[]; aal2For: AppRole[] }[] = [
  { prefix: '/account', roles: ['customer'], aal2For: [] },
  { prefix: '/doctor', roles: ['doctor', 'admin'], aal2For: ['doctor', 'admin'] },
  { prefix: '/sales', roles: ['sales', 'admin'], aal2For: ['admin'] },
  { prefix: '/admin', roles: ['admin', 'ops'], aal2For: ['admin'] },
];

export async function getSessionUser(): Promise<SessionUser | null> {
  if (serverEnv.DEMO_MODE) {
    await ensureDemoState(); // shared demo snapshot on serverless hosts (ADR-29)
    // Signed cookies; staff roles also need the demo access code (ADR-33).
    const session = await readDemoSession();
    return session ? demoUserFor(session.role, session.customerId) : null;
  }
  // TODO(phase-01): Supabase session via @/lib/supabase/server + profiles.role + JWT aal.
  return null;
}

/** Call at the top of every server action / handler — never trust the proxy alone. */
export async function requireRole(roles: AppRole[], opts: { aal2?: boolean } = {}): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new AppError('unauthenticated', 'Please sign in.', 401);
  if (!roles.includes(user.role)) throw new AppError('forbidden', 'You do not have access to this.', 403);
  if (opts.aal2 && user.aal !== 'aal2')
    throw new AppError('mfa_required', 'Two-factor verification required.', 403);
  return user;
}
