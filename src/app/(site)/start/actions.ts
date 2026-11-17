'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { AppError } from '@/lib/errors';
import { requireRole } from '@/lib/rbac';
import { err, ok, type Result } from '@/lib/result';
import type { ScanOutcome } from '@/lib/scan/rules';
import {
  type StartScanFormInput,
  beginScanSchema,
  startScanFormSchema,
  submitScanIdSchema,
  verifyScanFormSchema,
} from '@/lib/validation/scan';
import {
  beginScan,
  sendEmailCode,
  sendSignInCode,
  submitScan,
  verifyEmailCode,
  verifySignInCode,
} from '@/server/live/journey';

/*
 * Real patient journey actions (ADR-36): email OTP → scan → result. Every action re-checks the
 * session and role; the server decides the outcome. Clinical answers never go to logs.
 */

async function run<T>(fn: () => Promise<T>): Promise<Result<T>> {
  try {
    return ok(await fn());
  } catch (e) {
    if (e instanceof AppError) return err(e.code, e.message);
    if (e instanceof z.ZodError) return err('invalid_input', e.issues[0]?.message ?? 'Please check the form.');
    // Next.js control flow (redirect / notFound) must pass through untouched.
    if (e instanceof Error && 'digest' in e && typeof e.digest === 'string' && e.digest.startsWith('NEXT_')) throw e;
    return err('internal', 'Something went wrong. Please try again.');
  }
}

async function requestContext() {
  const h = await headers();
  const ip = h.get('x-forwarded-for')?.split(',')[0]?.trim() || null;
  return { ip: ip && /^[0-9a-f.:]+$/i.test(ip) ? ip : null, userAgent: h.get('user-agent')?.slice(0, 300) ?? null };
}

async function journeyCustomer() {
  const user = await requireRole(['customer']);
  if (!user.customerId) throw new AppError('unauthenticated', 'Please start again with your details.', 401);
  return user;
}

/** Step 1a — validate the details and email the 6-digit code. */
export async function sendCodeAction(raw: StartScanFormInput): Promise<Result<{ sentTo: string }>> {
  return run(async () => sendEmailCode(startScanFormSchema.parse(raw)));
}

/** Step 1b — check the code, create the customer + lead, sign in, go to the scan. */
export async function verifyCodeAction(
  raw: StartScanFormInput & { code: string; utm?: Record<string, string> },
): Promise<Result<never>> {
  return run(async () => {
    const input = verifyScanFormSchema.parse(raw);
    const utm = Object.fromEntries(
      Object.entries(raw.utm ?? {})
        .filter(([k, v]) => /^utm_[a-z]{3,8}$/.test(k) && typeof v === 'string')
        .map(([k, v]) => [k, v.slice(0, 100)]),
    );
    await verifyEmailCode(input, { ...(await requestContext()), utm });
    redirect('/start/scan');
  });
}

/** Step 2a — save the answers and open a scan. */
export async function beginScanAction(raw: z.input<typeof beginScanSchema>): Promise<Result<{ scanId: string }>> {
  return run(async () => {
    const user = await journeyCustomer();
    // customerId is checked in journeyCustomer()
    return beginScan(user.customerId as string, beginScanSchema.parse(raw), await requestContext());
  });
}

/** Step 2c — all photos uploaded: decide the outcome and pass it to the sales team. */
export async function submitScanAction(raw: { scanId: string }): Promise<Result<{ outcome: ScanOutcome }>> {
  return run(async () => {
    const user = await journeyCustomer();
    const { scanId } = submitScanIdSchema.parse(raw);
    const res = await submitScan(user.customerId as string, scanId);
    revalidatePath('/account');
    revalidatePath('/start/result');
    return res;
  });
}

const signInSchema = z.object({ email: z.string().trim().toLowerCase().email('Enter a valid email address').max(120) });
const signInVerifySchema = signInSchema.extend({ code: z.string().regex(/^\d{6}$/, 'Enter the 6-digit code') });

/** Returning customer — email a sign-in code (no new account is made). */
export async function signInSendAction(raw: { email: string }): Promise<Result<{ sentTo: string }>> {
  return run(async () => sendSignInCode(signInSchema.parse(raw).email));
}

/** Returning customer — check the code and open their account. */
export async function signInVerifyAction(raw: { email: string; code: string }): Promise<Result<never>> {
  return run(async () => {
    const input = signInVerifySchema.parse(raw);
    await verifySignInCode(input.email, input.code);
    redirect('/account');
  });
}
