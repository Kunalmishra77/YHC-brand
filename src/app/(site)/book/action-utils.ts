import 'server-only';

import { z } from 'zod';
import { setDemoSession } from '@/server/demo/session';
import { AppError } from '@/lib/errors';
import { err, ok, type Result } from '@/lib/result';
import { ensureDemoState } from '@/server/demo/persist';

/** Runs an action body and maps failures to `{ ok: false, error }` — never leaks stack traces. */
export async function guard<T>(fn: () => T | Promise<T>): Promise<Result<T>> {
  await ensureDemoState();
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
 * Demo sign-in after phone OTP (ADR-23). Signed cookies (ADR-33); Phase 03: Supabase phone-OTP session.
 */
export async function setCustomerSession(customerId: string): Promise<void> {
  await setDemoSession('customer', customerId);
}
