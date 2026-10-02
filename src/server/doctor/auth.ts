import 'server-only';

import { redirect } from 'next/navigation';
import { AppError } from '@/lib/errors';
import { requireRole, type SessionUser } from '@/lib/rbac';

/** Page/layout guard: doctor or admin with an aal2 session; otherwise back to the demo role picker. */
export async function requireDoctorPage(next = '/doctor'): Promise<SessionUser> {
  let user: SessionUser | null = null;
  try {
    user = await requireRole(['doctor', 'admin'], { aal2: true });
  } catch (error) {
    if (!(error instanceof AppError)) throw error;
  }
  if (!user) redirect(`/demo?next=${encodeURIComponent(next)}`);
  return user;
}

/** Server-action guard (throws AppError; the action turns it into a Result). */
export function requireDoctorAction(): Promise<SessionUser> {
  return requireRole(['doctor', 'admin'], { aal2: true });
}
