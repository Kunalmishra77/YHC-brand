import 'server-only';

import { cookies } from 'next/headers';
import { z } from 'zod';
import { DEMO_COOKIE, DEMO_CUSTOMER_COOKIE } from '@/lib/demo-session';
import { AppError } from '@/lib/errors';
import { err, ok, type Result } from '@/lib/result';

/** Runs an action body and maps failures to `{ ok: false, error }` — never leaks stack traces. */
export async function guard<T>(fn: () => T | Promise<T>): Promise<Result<T>> {
  try {
    return ok(await fn());
  } catch (e) {
    if (e instanceof AppError) return err(e.code, e.message);
    if (e instanceof z.ZodError)
      return err('invalid_input', e.issues[0]?.message ?? 'Please check the form.');
    // Rethrow Next.js control-flow errors (redirect / notFound) untouched.
    if (e instanceof Error && 'digest' in e && typeof e.digest === 'string' && e.digest.startsWith('NEXT_'))
      throw e;
    return err('internal', 'Something went wrong. Please try again.');
  }
}

/**
 * Demo sign-in after phone OTP (ADR-23). Phase 03: Supabase phone-OTP session instead.
 * httpOnly + sameSite=lax; 12 h like the demo role switcher.
 */
export async function setCustomerSession(customerId: string): Promise<void> {
  const jar = await cookies();
  const opts = { httpOnly: true, sameSite: 'lax' as const, path: '/', maxAge: 60 * 60 * 12 };
  jar.set(DEMO_COOKIE, 'customer', opts);
  jar.set(DEMO_CUSTOMER_COOKIE, customerId, opts);
}
