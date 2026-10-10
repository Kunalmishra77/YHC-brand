import 'server-only';

import type { Appointment } from '@/lib/domain/types';
import { AppError } from '@/lib/errors';
import type {
  CaptureZone,
  JourneyStep,
  JourneyTrackerStep,
  ScanAnswers,
  ScanResult,
} from '@/lib/journey/types';
import { JOURNEY_STEPS } from '@/lib/journey/types';
import { orderZones } from '@/lib/journey/zones';
import { formatINR } from '@/lib/money';
import { formatIst } from '@/lib/time';
import type { JourneyDetails } from '@/lib/validation/journey';
import { db } from '@/server/demo/store';
import { assessScan } from './assessment';

/*
 * In-memory journey state (ADR-23 demo, ADR-26 flow). One journey per customer; lives next to the
 * demo store on globalThis so it survives hot reloads. Phase 03+: a `journeys` table + `scans`
 * table (clinical — RLS like intake) replace this module; the getters keep their signatures.
 */

export interface JourneyAddress {
  line: string;
  pincode: string;
}

export interface Journey {
  id: string;
  customerId: string;
  address: JourneyAddress;
  step: JourneyStep;
  scan?: ScanResult;
  /** the detailed health form, kept until a booking exists (then also saved as the intake) */
  details?: JourneyDetails;
  intakeDone: boolean;
  appointmentId?: string;
  createdAt: string;
  updatedAt: string;
  detailsAt?: string;
  bookedAt?: string;
}

interface JourneyState {
  journeys: Map<string, Journey>;
  seq: number;
}

const g = globalThis as unknown as { __yhcJourneys?: JourneyState };

function state(): JourneyState {
  g.__yhcJourneys ??= { journeys: new Map(), seq: 0 };
  return g.__yhcJourneys;
}

function nextId(prefix: string): string {
  const s = state();
  s.seq += 1;
  return `${prefix}-${s.seq}`;
}

const nowIso = () => new Date().toISOString();

// ---------------------------------------------------------------------------------------------
// getters (used by /start, /account and the doctor portal)

export function getJourneyForCustomer(customerId: string): Journey | null {
  return state().journeys.get(customerId) ?? null;
}

/** Clinical data — callers in staff portals must `recordAudit(..., 'clinical.view', ...)`. */
export function getScanForCustomer(customerId: string): ScanResult | null {
  return state().journeys.get(customerId)?.scan ?? null;
}

/** The booked appointment linked to the journey, if it still exists. */
export function journeyAppointment(journey: Journey): Appointment | null {
  if (!journey.appointmentId) return null;
  return db().appointments.find((a) => a.id === journey.appointmentId) ?? null;
}

// ---------------------------------------------------------------------------------------------
// mutations

/** Step 1. Restarting keeps earlier progress (scan, form) so a returning patient is not sent back. */
export function startJourney(input: { customerId: string; address: JourneyAddress }): Journey {
  const s = state();
  const existing = s.journeys.get(input.customerId);
  if (existing) {
    existing.address = input.address;
    existing.updatedAt = nowIso();
    return existing;
  }
  const journey: Journey = {
    id: nextId('jrn'),
    customerId: input.customerId,
    address: input.address,
    step: 'scan',
    intakeDone: false,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  s.journeys.set(input.customerId, journey);
  return journey;
}

/**
 * Step 2 → 3. The server computes the (simulated) result; the client only sends the answers and
 * which zones were captured or skipped.
 */
export function saveScan(
  customerId: string,
  input: { answers: ScanAnswers; capturedZones: CaptureZone[]; skippedZones?: CaptureZone[] },
): ScanResult {
  const journey = state().journeys.get(customerId);
  if (!journey) throw new AppError('journey_missing', 'Please start with your basic details.', 409);
  const result = assessScan(input.answers);
  const scan: ScanResult = {
    id: nextId('scan'),
    capturedAt: nowIso(),
    angles: orderZones(input.capturedZones),
    skippedZones: orderZones(input.skippedZones ?? []),
    answers: { ...input.answers },
    ...result,
  };
  journey.scan = scan;
  if (journey.step === 'scan') journey.step = 'assessment';
  journey.updatedAt = nowIso();
  return scan;
}

/** Marks the assessment as read (the patient moved on to the health form). */
export function markAssessmentSeen(customerId: string): void {
  const journey = state().journeys.get(customerId);
  if (journey && journey.step === 'assessment') {
    journey.step = 'health_form';
    journey.updatedAt = nowIso();
  }
}

export function saveDetails(customerId: string, details: JourneyDetails): Journey {
  const journey = state().journeys.get(customerId);
  if (!journey) throw new AppError('journey_missing', 'Please start with your basic details.', 409);
  journey.details = details;
  journey.detailsAt = nowIso();
  if (journey.step === 'assessment' || journey.step === 'health_form') journey.step = 'book';
  journey.updatedAt = nowIso();
  return journey;
}

export function linkAppointment(customerId: string, appointmentId: string, intakeSaved: boolean): Journey {
  const journey = state().journeys.get(customerId);
  if (!journey) throw new AppError('journey_missing', 'Please start with your basic details.', 409);
  journey.appointmentId = appointmentId;
  journey.intakeDone = intakeSaved;
  journey.bookedAt = nowIso();
  journey.step = 'consultation';
  journey.updatedAt = nowIso();
  return journey;
}

// ---------------------------------------------------------------------------------------------
// views

const when = (iso: string | undefined) => (iso ? formatIst(new Date(iso), "d MMM, h:mm aaa 'IST'") : null);

/** Steps for the portal's "My journey" tracker, with status and dates. */
export function journeyTracker(journey: Journey, now = new Date()): JourneyTrackerStep[] {
  const appt = journeyAppointment(journey);
  const consultDone = appt?.status === 'completed';
  const booked = appt !== null && (appt.status === 'booked' || appt.status === 'completed');

  const done: Record<JourneyStep, boolean> = {
    details: true,
    scan: Boolean(journey.scan),
    assessment: Boolean(journey.scan) && journey.step !== 'assessment',
    health_form: Boolean(journey.details),
    book: booked,
    consultation: consultDone,
  };
  const at: Record<JourneyStep, string | null> = {
    details: when(journey.createdAt),
    scan: when(journey.scan?.capturedAt),
    assessment: when(journey.scan?.capturedAt),
    health_form: when(journey.detailsAt),
    book: when(journey.bookedAt),
    consultation: appt ? formatIst(new Date(appt.startsAt)) : null,
  };
  const href: Record<JourneyStep, string | null> = {
    details: null,
    scan: '/start/scan',
    assessment: journey.scan ? '/account/scan' : null,
    health_form: '/start/details',
    book: '/start/book',
    consultation: appt ? `/consult/${appt.id}` : null,
  };
  const live = appt && appt.status === 'booked' && new Date(appt.endsAt) > now;
  const note: Record<JourneyStep, string | null> = {
    details: 'Name, mobile and address',
    scan: journey.scan
      ? `${journey.scan.angles.length} ${journey.scan.skippedZones ? 'zones' : 'angles'} captured`
      : 'Guided phone-camera scan',
    assessment: journey.scan ? 'Demo analysis — final assessment by your doctor' : null,
    health_form: journey.details ? 'Sent to your doctor' : 'History, medicines and consents',
    book: booked && appt ? `${appt.code} · ${formatINR(appt.feePaise)} paid` : 'Pick a time with the doctor',
    consultation: consultDone ? 'Completed' : live ? 'Join from your portal at the scheduled time' : null,
  };

  let currentSet = false;
  return JOURNEY_STEPS.map(({ id, label }) => {
    let status: JourneyTrackerStep['status'] = 'upcoming';
    if (done[id]) status = 'done';
    else if (!currentSet) {
      status = 'current';
      currentSet = true;
    }
    return {
      id,
      label,
      status,
      at: done[id] || id === 'consultation' ? at[id] : null,
      note: note[id],
      href: href[id],
    };
  });
}

/** Where a returning patient should continue. */
export function resumeHref(journey: Journey): string {
  if (!journey.scan) return '/start/scan';
  if (!journey.details) return journey.step === 'assessment' ? '/start/assessment' : '/start/details';
  if (!journey.appointmentId) return '/start/book';
  return '/account';
}
