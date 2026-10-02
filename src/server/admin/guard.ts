import 'server-only';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import type { AppRole } from '@/lib/domain/types';
import { AppError } from '@/lib/errors';
import { getSessionUser, requireRole, type SessionUser } from '@/lib/rbac';
import { err, ok, type Result } from '@/lib/result';

export type ActionResult = Result<{ message: string }>;

/**
 * Page guard. Admin sees every page; ops is sent to Orders from anything else (FR-M12, role scope).
 * The proxy already blocks other roles — this is the second layer.
 */
export async function requireAdminPage(opts: { allowOps?: boolean } = {}): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect('/demo?next=/admin');
  if (user.role === 'ops') {
    if (!opts.allowOps) redirect('/admin/orders');
    return user;
  }
  if (user.role !== 'admin') redirect('/forbidden');
  if (user.aal !== 'aal2') redirect('/demo?next=/admin'); // TODO(phase-01): MFA challenge
  return user;
}

/** Server-action wrapper: role + aal2 check, zod parse, AppError → Result. */
export async function runAdminAction<S extends z.ZodType>(
  roles: AppRole[],
  schema: S,
  input: unknown,
  fn: (data: z.infer<S>, user: SessionUser) => string | Promise<string>,
): Promise<ActionResult> {
  try {
    // Admin rights need an aal2 (TOTP) session; ops does not (rbac ROUTE_ROLES).
    const user = await requireRole(roles, { aal2: !roles.includes('ops') });
    if (user.role === 'admin' && user.aal !== 'aal2') {
      throw new AppError('mfa_required', 'Two-factor verification required.', 403);
    }
    const parsed = schema.safeParse(input);
    if (!parsed.success) {
      return err('invalid_input', parsed.error.issues[0]?.message ?? 'Please check the form.');
    }
    const message = await fn(parsed.data, user);
    return ok({ message });
  } catch (e) {
    if (e instanceof AppError) return err(e.code, e.message);
    return err('internal', 'Something went wrong. Please try again.');
  }
}
