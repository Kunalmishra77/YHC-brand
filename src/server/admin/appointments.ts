import 'server-only';

import type { Appointment } from '@/lib/domain/types';
import { AppError } from '@/lib/errors';
import { formatIst } from '@/lib/time';
import { db, getSlots, recordAudit } from '@/server/demo/store';
import { nextAdminId } from './state';

/*
 * Reschedule / cancel on behalf (FR-M12-4). Demo stand-ins: the real flow goes through
 * `hold_slot` + calendar sync (Phase 04). Only logistics change — no clinical fields are read.
 */

function find(id: string): Appointment {
  const appt = db().appointments.find((a) => a.id === id);
  if (!appt) throw new AppError('not_found', 'Appointment not found', 404);
  return appt;
}

function notify(appt: Appointment, template: string, preview: string) {
  const s = db();
  s.messages.unshift({
    id: nextAdminId('msg-admin'),
    customerId: appt.customerId,
    leadId: s.leads.find((l) => l.customerId === appt.customerId)?.id ?? null,
    channel: 'whatsapp',
    direction: 'outbound',
    template,
    category: 'utility',
    preview,
    status: 'sent',
    at: new Date().toISOString(),
  });
}

/** Open slots offered in the reschedule dialog (the real availability engine). */
export function rescheduleOptions(limit = 24): { value: string; label: string }[] {
  return getSlots()
    .flatMap((d) => d.slots)
    .slice(0, limit)
    .map((s) => ({ value: s.startsAt.toISOString(), label: formatIst(s.startsAt) }));
}

export function rescheduleAppointment(id: string, startsAt: string, actor: string): Appointment {
  const appt = find(id);
  if (appt.status !== 'booked' && appt.status !== 'held') {
    throw new AppError(
      'invalid_state',
      `A ${appt.status.replaceAll('_', ' ')} appointment cannot be moved.`,
      409,
    );
  }
  const open = getSlots().some((d) => d.slots.some((s) => s.startsAt.toISOString() === startsAt));
  if (!open) throw new AppError('slot_taken', 'That time is no longer free. Please pick another slot.', 409);
  const length = new Date(appt.endsAt).getTime() - new Date(appt.startsAt).getTime();
  const from = formatIst(new Date(appt.startsAt));
  appt.startsAt = startsAt;
  appt.endsAt = new Date(new Date(startsAt).getTime() + length).toISOString();
  notify(
    appt,
    'appointment_rescheduled',
    `Your consultation is now on ${formatIst(new Date(startsAt))}. Appointment ID ${appt.code}.`,
  );
  recordAudit(actor, 'appointment.reschedule', `${appt.code}: ${from} → ${formatIst(new Date(startsAt))}`);
  return appt;
}

export function cancelAppointment(id: string, reason: string, actor: string): Appointment {
  const appt = find(id);
  if (appt.status !== 'booked' && appt.status !== 'held') {
    throw new AppError(
      'invalid_state',
      `A ${appt.status.replaceAll('_', ' ')} appointment cannot be cancelled.`,
      409,
    );
  }
  appt.status = 'cancelled';
  appt.holdExpiresAt = null;
  notify(appt, 'appointment_cancelled', `Your consultation ${appt.code} has been cancelled.`);
  recordAudit(actor, 'appointment.cancel', `${appt.code} · ${reason}`);
  return appt;
}
