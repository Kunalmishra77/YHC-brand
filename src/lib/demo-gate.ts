import type { AppRole } from '@/lib/domain/types';

/*
 * Demo access control (ADR-33, audit SEC-01/03). Until real auth ships (kit Phase 01):
 *  - the demo session cookies (role + customer id) are signed with HMAC-SHA256, so a visitor cannot
 *    set `yhc_demo_role=admin` by hand;
 *  - staff portals, the /demo role picker and "Reset sample data" need a shared access code
 *    (env DEMO_ACCESS_CODE), remembered in an httpOnly cookie;
 *  - patients reach /account only through their own journey sign-in.
 * Web Crypto only, so it runs in the proxy and in server code alike.
 */

export const DEMO_SIG_COOKIE = 'yhc_demo_sig';
export const DEMO_ACCESS_COOKIE = 'yhc_demo_access';

const STAFF: readonly AppRole[] = ['doctor', 'sales', 'ops', 'admin'];
const LOCAL_DEV_SECRET = 'yhc-local-dev-demo-secret';

export function isStaffRole(role: AppRole): boolean {
  return STAFF.includes(role);
}

const env = (key: string) => process.env[key]?.trim() || undefined;
const isLocal = () => (env('APP_ENV') ?? 'local') === 'local';

/** Signing secret; a fixed dev secret only on local machines — hosted demos must set one. */
function sessionSecret(): string | null {
  return env('DEMO_SESSION_SECRET') ?? (isLocal() ? LOCAL_DEV_SECRET : null);
}

/** Access code, or null. Local machines without a code are open (developer convenience). */
function accessCode(): string | null {
  return env('DEMO_ACCESS_CODE') ?? null;
}

export function accessGateEnabled(): boolean {
  return accessCode() !== null || !isLocal();
}

async function hmac(secret: string, data: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
  ]);
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', key, enc.encode(data)));
  let bin = '';
  for (const b of sig) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** Constant-time string comparison. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

const sessionPayload = (role: string, customerId: string | null) => `session:v1:${role}:${customerId ?? '-'}`;

export async function signSession(role: AppRole, customerId: string | null): Promise<string | null> {
  const secret = sessionSecret();
  return secret ? hmac(secret, sessionPayload(role, customerId)) : null;
}

export async function verifySession(
  role: string,
  customerId: string | null,
  signature: string | undefined,
): Promise<boolean> {
  const secret = sessionSecret();
  if (!secret || !signature) return false;
  return safeEqual(await hmac(secret, sessionPayload(role, customerId)), signature);
}

/** Cookie value proving the access code was entered (never the code itself). */
export async function accessToken(): Promise<string | null> {
  const secret = sessionSecret();
  const code = accessCode();
  return secret && code ? hmac(secret, `access:v1:${code}`) : null;
}

export async function hasDemoAccess(cookieValue: string | undefined): Promise<boolean> {
  if (!accessGateEnabled()) return true;
  const expected = await accessToken();
  return expected !== null && cookieValue !== undefined && safeEqual(expected, cookieValue);
}

export async function checkAccessCode(submitted: string): Promise<boolean> {
  const code = accessCode();
  const secret = sessionSecret();
  if (!code || !secret) return false;
  // Compare HMACs so timing never depends on the code's characters.
  return safeEqual(await hmac(secret, `code:${submitted.trim()}`), await hmac(secret, `code:${code}`));
}
