import 'server-only';

import { cookies } from 'next/headers';
import { DEMO_COOKIE, DEMO_CUSTOMER_COOKIE, isAppRole } from '@/lib/demo-session';
import {
  DEMO_ACCESS_COOKIE,
  DEMO_SIG_COOKIE,
  accessToken,
  hasDemoAccess,
  isStaffRole,
  signSession,
  verifySession,
} from '@/lib/demo-gate';
import type { AppRole } from '@/lib/domain/types';
import { AppError } from '@/lib/errors';

/** Signed demo session cookies (ADR-33). Replaced by Supabase Auth in kit Phase 01/03. */
const OPTS = { httpOnly: true, sameSite: 'lax' as const, path: '/', secure: process.env.NODE_ENV === 'production' };
const SESSION_MAX_AGE = 60 * 60 * 12;

export async function setDemoSession(role: AppRole, customerId: string | null): Promise<void> {
  const jar = await cookies();
  const sig = await signSession(role, customerId);
  if (!sig) throw new AppError('not_configured', 'Demo sign-in is not configured on this server.', 503);
  jar.set(DEMO_COOKIE, role, { ...OPTS, maxAge: SESSION_MAX_AGE });
  if (customerId) jar.set(DEMO_CUSTOMER_COOKIE, customerId, { ...OPTS, maxAge: SESSION_MAX_AGE });
  else jar.delete(DEMO_CUSTOMER_COOKIE);
  jar.set(DEMO_SIG_COOKIE, sig, { ...OPTS, maxAge: SESSION_MAX_AGE });
}

export async function clearDemoSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(DEMO_COOKIE);
  jar.delete(DEMO_CUSTOMER_COOKIE);
  jar.delete(DEMO_SIG_COOKIE);
}

/**
 * The verified demo session, or null when the cookies are missing, unsigned or tampered with.
 * Staff roles also need the access-code cookie.
 */
export async function readDemoSession(): Promise<{ role: AppRole; customerId: string | null } | null> {
  const jar = await cookies();
  const role = jar.get(DEMO_COOKIE)?.value;
  if (!role || !isAppRole(role)) return null;
  const customerId = role === 'customer' ? (jar.get(DEMO_CUSTOMER_COOKIE)?.value ?? null) : null;
  if (role === 'customer' && !customerId) return null;
  if (!(await verifySession(role, customerId, jar.get(DEMO_SIG_COOKIE)?.value))) return null;
  if (isStaffRole(role) && !(await hasDemoAccess(jar.get(DEMO_ACCESS_COOKIE)?.value))) return null;
  return { role, customerId };
}

export async function hasDemoAccessCookie(): Promise<boolean> {
  const jar = await cookies();
  return hasDemoAccess(jar.get(DEMO_ACCESS_COOKIE)?.value);
}

/** Throws unless the visitor entered the access code (role picker, reset, staff tools). */
export async function requireDemoAccess(): Promise<void> {
  if (!(await hasDemoAccessCookie())) throw new AppError('forbidden', 'Enter the demo access code first.', 403);
}

export async function grantDemoAccess(): Promise<void> {
  const token = await accessToken();
  if (!token) return;
  const jar = await cookies();
  jar.set(DEMO_ACCESS_COOKIE, token, { ...OPTS, maxAge: SESSION_MAX_AGE });
}
