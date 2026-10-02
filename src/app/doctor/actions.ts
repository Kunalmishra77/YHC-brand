'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import {
  availabilitySchema,
  claimDecisionSchema,
  notesSchema,
  recommendationSchema,
  type AvailabilityForm,
  type NotesForm,
  type RecommendationForm,
} from '@/components/doctor/validation';
import type { LeadStage } from '@/lib/domain/types';
import { AppError } from '@/lib/errors';
import { err, ok, type Result } from '@/lib/result';
import { PLANS, PRODUCTS } from '@/server/demo/fixtures';
import {
  completeConsultation,
  createRecommendation,
  db,
  getAvailabilityConfig,
  markNoShow,
  saveNotes,
  updateAvailability,
} from '@/server/demo/store';
import { requireDoctorAction } from '@/server/doctor/auth';
import { decideClaim } from '@/server/doctor/claims';

/*
 * Doctor-portal server actions. Every action re-checks the role (aal2) — never trust the proxy.
 * Demo: the in-memory store (ADR-23). Phase 05: SQL functions + emitEvent() handlers.
 */

function fail(error: unknown): { ok: false; error: { code: string; message: string } } {
  if (error instanceof AppError) return err(error.code, error.message);
  if (error instanceof z.ZodError) return err('invalid_input', error.issues[0]?.message ?? 'Check the form.');
  return err('internal', 'Something went wrong. Please try again.');
}

function assertAppointment(id: string) {
  const appt = db().appointments.find((a) => a.id === id);
  if (!appt) throw new AppError('not_found', 'Appointment not found', 404);
  return appt;
}

const refreshConsult = (id: string) => {
  revalidatePath(`/doctor/consult/${id}`);
  revalidatePath('/doctor');
};

/** Autosave (FR-M5-5). Returns the server time of the save. */
export async function saveNotesAction(input: NotesForm): Promise<Result<{ savedAt: string }>> {
  try {
    await requireDoctorAction();
    const notes = notesSchema.parse(input);
    const appt = assertAppointment(notes.appointmentId);
    if (appt.status === 'held') throw new AppError('invalid_state', 'This slot is not paid yet.', 409);
    saveNotes(notes);
    return ok({ savedAt: new Date().toISOString() });
  } catch (error) {
    return fail(error);
  }
}

/** FR-M5-9 + FR-M14-3: saves notes, then completes (identity + consent required, checked again in the store). */
export async function completeConsultAction(input: NotesForm): Promise<Result<{ completed: true }>> {
  try {
    const user = await requireDoctorAction();
    const notes = notesSchema.parse(input);
    const appt = assertAppointment(notes.appointmentId);
    if (appt.status !== 'booked' && appt.status !== 'completed')
      throw new AppError('invalid_state', `This consultation is ${appt.status.replace('_', ' ')}.`, 409);
    if (!notes.identityVerified || !notes.consentRecorded)
      throw new AppError('consent_required', 'Confirm patient identity and consent before completing.', 422);
    saveNotes(notes);
    completeConsultation(appt.id, user.name);
    refreshConsult(appt.id);
    return ok({ completed: true });
  } catch (error) {
    return fail(error);
  }
}

export async function markNoShowAction(appointmentId: string): Promise<Result<{ noShow: true }>> {
  try {
    const user = await requireDoctorAction();
    const id = z.string().min(1).parse(appointmentId);
    const appt = assertAppointment(id);
    if (appt.status !== 'booked')
      throw new AppError('invalid_state', 'Only a booked consultation can be marked as no-show.', 409);
    markNoShow(appt.id, user.name);
    refreshConsult(appt.id);
    return ok({ noShow: true });
  } catch (error) {
    return fail(error);
  }
}

/** FR-M6-1/2: one click — notes saved, consult completed, recommendation sent, CRM moves. */
export async function createRecommendationAction(
  input: RecommendationForm,
): Promise<Result<{ token: string; expiresAt: string; stage: LeadStage | null }>> {
  try {
    const user = await requireDoctorAction();
    const data = recommendationSchema.parse(input);
    if (data.notes.appointmentId !== data.appointmentId)
      throw new AppError('invalid_input', 'Notes belong to a different appointment.', 422);
    const appt = assertAppointment(data.appointmentId);
    if (appt.status !== 'booked' && appt.status !== 'completed')
      throw new AppError('invalid_state', `This consultation is ${appt.status.replace('_', ' ')}.`, 409);
    if (!PLANS.some((p) => p.id === data.planId)) throw new AppError('not_found', 'Plan not found', 404);
    const unknown = data.productIds.find((id) => !PRODUCTS.some((p) => p.id === id));
    if (unknown) throw new AppError('not_found', 'Unknown product in the plan.', 404);
    const existing = db().recommendations.find(
      (r) => r.appointmentId === appt.id && r.customerId === appt.customerId && r.status !== 'cancelled',
    );
    if (existing) throw new AppError('already_sent', 'A plan was already sent for this consultation.', 409);
    if (!data.notes.identityVerified || !data.notes.consentRecorded)
      throw new AppError('consent_required', 'Confirm patient identity and consent before completing.', 422);

    saveNotes({ ...data.notes, followUpInWeeks: data.followUpInWeeks });
    // Price is recomputed on the server (quotePlan / pricePlan) — nothing here comes from the client.
    const rec = createRecommendation({
      appointmentId: appt.id,
      planId: data.planId,
      productIds: [...new Set(data.productIds)],
      items: data.items,
      note: data.note,
      actor: user.name,
    });
    refreshConsult(appt.id);
    revalidatePath('/doctor/follow-ups');
    const stage = db().leads.find((l) => l.customerId === appt.customerId)?.stage ?? null;
    return ok({ token: rec.token, expiresAt: rec.expiresAt, stage });
  } catch (error) {
    return fail(error);
  }
}

/** FR-M5-4: weekly rules + exceptions. Google Calendar busy blocks are kept as they are. */
export async function updateAvailabilityAction(
  input: AvailabilityForm,
): Promise<Result<{ savedAt: string }>> {
  try {
    const user = await requireDoctorAction();
    const data = availabilitySchema.parse(input);
    const weeklyRules: Record<number, { start: string; end: string }[]> = {};
    for (const [day, ranges] of Object.entries(data.weeklyRules)) {
      if (ranges.length)
        weeklyRules[Number(day)] = [...ranges].sort((a, b) => a.start.localeCompare(b.start));
    }
    const current = getAvailabilityConfig();
    updateAvailability(
      {
        weeklyRules,
        exceptions: [...data.exceptions].sort((a, b) => a.date.localeCompare(b.date)),
        busyBlocks: current.busyBlocks,
      },
      user.name,
    );
    revalidatePath('/doctor/availability');
    revalidatePath('/doctor/calendar');
    return ok({ savedAt: new Date().toISOString() });
  } catch (error) {
    return fail(error);
  }
}

/** FR-M5-11: approve / reject a guarantee claim with notes (audited 'guarantee.decision'). */
export async function decideClaimAction(input: {
  claimId: string;
  decision: 'approved' | 'rejected';
  notes: string;
}): Promise<Result<{ status: string }>> {
  try {
    const user = await requireDoctorAction();
    const data = claimDecisionSchema.parse(input);
    const claim = decideClaim({ ...data, actor: user.name });
    revalidatePath('/doctor/guarantee');
    return ok({ status: claim.status });
  } catch (error) {
    return fail(error);
  }
}
