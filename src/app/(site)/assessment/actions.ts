'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { AppError } from '@/lib/errors';
import { err, ok, type Result } from '@/lib/result';
import { findOrCreateCustomer } from '@/server/demo/store';

// Demo OTP (ADR-23). TODO(phase-03): MSG91/WhatsApp OTP via the auth adapter — see docs/06.
const DEMO_OTP = '123456';

const schema = z.object({
  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, 'Enter a 10-digit Indian mobile number.'),
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'Enter the 6-digit code.'),
});

/**
 * FR-M1-5: verify the phone and create/attach a CRM lead (source: website).
 * Assessment answers are clinical data and are deliberately NOT sent or stored here, so sales
 * can never see them. Phase 03 stores them in the clinical schema behind RLS.
 */
export async function saveAssessmentResult(input: {
  phone: string;
  code: string;
}): Promise<Result<{ saved: true }>> {
  try {
    const parsed = schema.safeParse(input);
    if (!parsed.success) {
      return err('invalid_input', parsed.error.issues[0]?.message ?? 'Please check your details.');
    }
    if (parsed.data.code !== DEMO_OTP) {
      return err('otp_invalid', 'That code is not right. Please check it and try again.');
    }
    findOrCreateCustomer({ phone: `+91${parsed.data.phone}`, source: 'website' });
    revalidatePath('/sales', 'layout');
    return ok({ saved: true });
  } catch (error) {
    if (error instanceof AppError) return err(error.code, error.message);
    return err('internal', 'Something went wrong. Please try again.');
  }
}
