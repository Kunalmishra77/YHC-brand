import { z } from 'zod';
import { CAPTURE_ZONES, MIN_CAPTURED_ZONES } from '@/lib/journey/types';
import { zoneSelectionIssue } from '@/lib/journey/zones';
import { MIN_AGE, concernSchema, intakeSchema, mobileSchema, otpSchema } from './booking';

/*
 * Patient journey schemas (ADR-26). Shared by the /start forms and the server actions in
 * src/app/(site)/start/actions.ts.
 */

/** Step 1 — basic details from the hero glass panel. */
export const startJourneySchema = z.object({
  name: z.string().trim().min(2, 'Please enter your full name').max(80, 'Please keep it under 80 characters'),
  mobile: mobileSchema,
  address: z
    .string()
    .trim()
    .min(6, 'Please enter your address (house, street, city)')
    .max(200, 'Please keep it under 200 characters'),
  pincode: z
    .string()
    .trim()
    .regex(/^[1-9]\d{5}$/, 'Enter a 6-digit PIN code'),
  consent: z.boolean().refine((v) => v, 'Please agree to continue'),
});
export type StartJourneyInput = z.input<typeof startJourneySchema>;
export type StartJourney = z.output<typeof startJourneySchema>;

/** Same form + the 6-digit code from the demo OTP step. */
export const verifyJourneySchema = startJourneySchema.extend({ code: otpSchema });

/** Pre-scan questions. */
export const scanAnswersSchema = z.object({
  duration: z.enum(['lt_1y', '1_3y', '3_5y', 'gt_5y']),
  pattern: z.enum(['hairline', 'crown', 'diffuse', 'parting', 'patches', 'not_sure']),
  longBald: z.enum(['no', 'small', 'large']),
  familyHistory: z.enum(['yes', 'no', 'not_sure']),
});

const captureZoneSchema = z.enum(CAPTURE_ZONES);

/** Demo: only which zones were captured or skipped is sent — the photos never leave the device. */
export const submitScanSchema = z
  .object({
    answers: scanAnswersSchema,
    capturedZones: z.array(captureZoneSchema).max(CAPTURE_ZONES.length),
    skippedZones: z.array(captureZoneSchema).max(CAPTURE_ZONES.length).default([]),
  })
  .superRefine((v, ctx) => {
    const issue = zoneSelectionIssue(v.capturedZones, v.skippedZones);
    if (!issue) return;
    const message =
      issue.code === 'required_missing'
        ? 'Please scan your front hairline and crown.'
        : issue.code === 'too_few'
          ? `Please scan at least ${MIN_CAPTURED_ZONES} zones.`
          : 'Each zone once, please.';
    ctx.addIssue({ code: 'custom', path: ['capturedZones'], message });
  });

export const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other / prefer to self-describe' },
] as const;

/** Step 4 — the detailed health form (age 18+, gender, concern, intake history, consents). */
export const journeyDetailsSchema = intakeSchema.extend({
  age: z
    .string()
    .trim()
    .regex(/^\d{1,3}$/, 'Please enter your age in years')
    .transform(Number)
    .pipe(
      z
        .number()
        .min(
          MIN_AGE,
          'Our consultations are for adults aged 18 and over. If you are younger, please speak with a parent and your family doctor.',
        )
        .max(100, 'Please check your age'),
    ),
  gender: z.enum(['male', 'female', 'other'], 'Please choose one'),
  concern: concernSchema,
  consentTelemedicine: z.boolean().refine((v) => v, 'Please agree to a video consultation to continue'),
  consentPrivacy: z.boolean().refine((v) => v, 'Please accept the privacy policy and terms to continue'),
});
export type JourneyDetailsInput = z.input<typeof journeyDetailsSchema>;
export type JourneyDetails = z.output<typeof journeyDetailsSchema>;

export const journeyHoldSchema = z.object({ startsAt: z.iso.datetime() });
