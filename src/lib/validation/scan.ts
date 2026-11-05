import { z } from 'zod';
import { CAPTURE_ZONES } from '@/lib/journey/types';
import { MIN_AGE, mobileSchema, otpSchema } from './booking';
import { scanAnswersSchema } from './journey';

/*
 * Real journey v1 (ADR-36): start form → email OTP → scan (answers + 7 photos) → submit.
 * Shared by the forms and the server actions / photo route.
 */

export const startScanFormSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your full name').max(80, 'Please keep it under 80 characters'),
  mobile: mobileSchema,
  email: z.string().trim().toLowerCase().email('Enter a valid email address').max(120),
  age: z.coerce
    .number({ error: 'Enter your age' })
    .int('Enter your age in years')
    .min(MIN_AGE, `You need to be ${MIN_AGE} or older`)
    .max(100, 'Please check your age'),
  consent: z.boolean().refine((v) => v, 'Please agree to continue'),
});
export type StartScanFormInput = z.input<typeof startScanFormSchema>;
export type StartScanForm = z.output<typeof startScanFormSchema>;

export const verifyScanFormSchema = startScanFormSchema.extend({ code: otpSchema });

export const beginScanSchema = z.object({
  answers: scanAnswersSchema,
  photoConsent: z.boolean().refine((v) => v, 'Please agree so we can store your scan photos'),
});

export const zoneSchema = z.enum(CAPTURE_ZONES);

const unit = z.number().min(0).max(1);
export const zoneAnalysisSchema = z.object({
  ok: z.boolean(),
  issue: z.enum(['blurry', 'too_dark', 'too_bright', 'glare', 'not_scalp']).nullable(),
  cover: unit.nullable(),
  shine: unit.nullable(),
  quality: z.object({
    blur: z.number().min(0).max(1e7),
    brightness: z.number().min(0).max(255),
    glare: unit,
  }),
});

/** Fields sent with each photo upload (multipart form, the photo is `file`). */
export const photoMetaSchema = z.object({
  scanId: z.uuid(),
  zone: zoneSchema,
  analysis: z.string().max(2000).transform((s, ctx) => {
    try {
      return zoneAnalysisSchema.parse(JSON.parse(s));
    } catch {
      ctx.addIssue({ code: 'custom', message: 'Bad analysis data' });
      return z.NEVER;
    }
  }),
});

export const submitScanIdSchema = z.object({ scanId: z.uuid() });

export const MAX_PHOTO_BYTES = 3 * 1024 * 1024;
