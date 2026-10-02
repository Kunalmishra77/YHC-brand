import { z } from 'zod';
import type { HairConcern } from '@/lib/domain/types';

/*
 * Booking schemas (FR-M3-3, FR-M3-4, FR-M3-10). Shared by the /book forms and the server actions.
 */

export const CONCERN_OPTIONS: { value: HairConcern; label: string; hint: string }[] = [
  { value: 'hair_fall', label: 'Hair fall', hint: 'More hair on the pillow, comb or shower drain' },
  { value: 'thinning', label: 'Overall thinning', hint: 'Hair looks less dense than before' },
  { value: 'receding_hairline', label: 'Receding hairline', hint: 'Temples or front moving back' },
  { value: 'crown_thinning', label: 'Thinning at the crown', hint: 'Scalp more visible on top' },
  { value: 'dandruff_scalp', label: 'Dandruff or scalp issues', hint: 'Flaking, itching or oiliness' },
  { value: 'other', label: 'Something else', hint: 'Tell Dr. Tyagi during the consultation' },
];

export const concernSchema = z.enum([
  'hair_fall',
  'thinning',
  'receding_hairline',
  'crown_thinning',
  'dandruff_scalp',
  'other',
]);

/** 10-digit Indian mobile (starts 6–9). The +91 prefix is fixed in the UI. */
export const mobileSchema = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s-]/g, '').replace(/^(\+91|91|0)(?=\d{10}$)/, ''))
  .pipe(z.string().regex(/^[6-9]\d{9}$/, 'Enter a 10-digit mobile number'));

export const otpSchema = z.string().regex(/^\d{6}$/, 'Enter the 6-digit code');

export const sendOtpSchema = z.object({
  mobile: mobileSchema,
  channel: z.enum(['whatsapp', 'sms']).default('whatsapp'),
});

export const verifyOtpSchema = z.object({
  mobile: mobileSchema,
  code: otpSchema,
});

export const MIN_AGE = 18;

/** FR-M3-4 short form. Consents for telemedicine and privacy are required; WhatsApp updates optional. */
export const bookingDetailsSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your full name').max(80, 'Please keep it under 80 characters'),
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
          'Our consultations are for adults aged 18 and over. If you are younger, please speak with a parent and your family doctor — we would be glad to help when you are 18.',
        )
        .max(100, 'Please check your age'),
    ),
  concern: concernSchema,
  consentTelemedicine: z.boolean().refine((v) => v, 'Please agree to a video consultation to continue'),
  consentPrivacy: z.boolean().refine((v) => v, 'Please accept the privacy policy and terms to continue'),
  consentWhatsapp: z.boolean(),
});
export type BookingDetailsInput = z.input<typeof bookingDetailsSchema>;
export type BookingDetails = z.output<typeof bookingDetailsSchema>;

export const holdRequestSchema = bookingDetailsSchema.extend({
  startsAt: z.iso.datetime(),
});

export const appointmentIdSchema = z.string().min(1).max(64);

const longText = (max = 600) => z.string().trim().max(max, `Please keep it under ${max} characters`);

/** FR-M3-10 detailed intake. Only duration and pattern are required — the rest can be "none". */
export const intakeSchema = z.object({
  duration: z.string().trim().min(1, 'How long has this been going on?').max(80),
  pattern: z.string().trim().min(1, 'Where do you notice it most?').max(120),
  previousTreatments: longText(),
  currentProducts: longText(),
  medicalHistory: longText(),
  medications: longText(),
  allergies: longText(300),
  familyHistory: longText(300),
});
export type IntakeInput = z.infer<typeof intakeSchema>;

export const saveIntakeSchema = intakeSchema.extend({
  appointmentId: appointmentIdSchema,
  photos: z.number().int().min(0).max(3),
});

export const DURATION_OPTIONS = [
  'Less than 3 months',
  '3–6 months',
  '6–12 months',
  '1–2 years',
  'More than 2 years',
] as const;

export const PATTERN_OPTIONS = [
  'All over (diffuse)',
  'Front hairline / temples',
  'Crown (top of head)',
  'Parting widening',
  'Patches',
  'Not sure',
] as const;
