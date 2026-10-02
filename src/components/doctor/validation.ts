import { z } from 'zod';

/*
 * Doctor-portal zod schemas shared by forms and server actions.
 * TODO(phase-05): move to src/lib/validation/doctor.ts (owned by another surface during the demo build).
 */

const hhmm = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use HH:MM (24-hour)');

export const timeRangeSchema = z
  .object({ start: hhmm, end: hhmm })
  .refine((r) => r.end > r.start, { message: 'End time must be after start time', path: ['end'] });

const dayRanges = z
  .array(timeRangeSchema)
  .max(6)
  .refine(
    (ranges) => {
      const sorted = [...ranges].sort((a, b) => a.start.localeCompare(b.start));
      return sorted.every((r, i) => i === 0 || (sorted[i - 1]?.end ?? '') <= r.start);
    },
    { message: 'Time ranges on the same day must not overlap' },
  );

export const availabilitySchema = z.object({
  weeklyRules: z.record(z.string().regex(/^[0-6]$/), dayRanges),
  exceptions: z
    .array(
      z.object({
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Pick a date'),
        kind: z.enum(['extra', 'unavailable']),
        range: timeRangeSchema.nullable(),
      }),
    )
    .max(60)
    .refine((list) => list.every((e) => e.kind === 'unavailable' || e.range !== null), {
      message: 'Extra hours need a time range',
    }),
});
export type AvailabilityForm = z.infer<typeof availabilitySchema>;

const text = (max: number) => z.string().trim().max(max);

export const notesSchema = z.object({
  appointmentId: z.string().min(1),
  chiefComplaint: text(4000),
  observations: text(4000),
  assessment: text(4000),
  treatmentPlan: text(4000),
  followUpInstructions: text(4000),
  privateNotes: text(4000),
  identityVerified: z.boolean(),
  consentRecorded: z.boolean(),
  followUpInWeeks: z.number().int().min(1).max(52).nullable(),
});
export type NotesForm = z.infer<typeof notesSchema>;

export const prescriptionItemSchema = z.object({
  genericName: z.string().trim().min(1, 'Name is required').max(200),
  strength: text(100),
  dosage: text(100),
  frequency: text(200),
  duration: text(100),
  instructions: text(500),
});

export const recommendationSchema = z.object({
  appointmentId: z.string().min(1),
  planId: z.string().min(1).max(40),
  productIds: z.array(z.string().min(1)).min(1, 'Pick at least one product').max(10),
  items: z.array(prescriptionItemSchema).min(1, 'Add at least one prescription item').max(12),
  note: text(1500),
  followUpInWeeks: z.number().int().min(1).max(52),
  notes: notesSchema,
});
export type RecommendationForm = z.infer<typeof recommendationSchema>;

export const claimDecisionSchema = z.object({
  claimId: z.string().min(1),
  decision: z.enum(['approved', 'rejected']),
  notes: z.string().trim().min(10, 'Add a short reason (at least 10 characters)').max(2000),
});
