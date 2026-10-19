import { beforeEach, describe, expect, it } from 'vitest';
import type { Appointment, Customer, PrescriptionItem } from '@/lib/domain/types';
import { AppError } from '@/lib/errors';
import { db, resetDemo } from '@/server/demo/store';
import { getJourneyForCustomer, getScanForCustomer } from '@/server/journey/store';
import { sendRecommendation } from './recommend';

const ITEM: PrescriptionItem = {
  genericName: 'Test solution',
  strength: '5%',
  dosage: '1 ml',
  frequency: 'Night',
  duration: '3 months',
  instructions: '',
};

/** A customer created during the demo (not seeded) with a booked consult and no scan. */
function walkIn(): Appointment {
  const s = db();
  const customer: Customer = {
    id: 'cus-walkin-1',
    name: 'Walk In',
    phone: '+919999999990',
    email: null,
    age: 30,
    gender: 'male',
    city: 'Pune',
    createdAt: new Date().toISOString(),
  };
  s.customers.push(customer);
  const template = s.appointments.find((a) => a.status === 'booked');
  if (!template) throw new Error('seed has no booked appointment');
  // completed: consent was recorded at the consult, so createRecommendation does not re-complete it
  const appt: Appointment = {
    ...template,
    id: 'apt-walkin-1',
    code: 'YHC-A-9999',
    customerId: customer.id,
    status: 'completed',
  };
  s.appointments.push(appt);
  return appt;
}

const base = (appointmentId: string) => ({
  appointmentId,
  planId: 'plan-3',
  productIds: ['prod-topical'],
  items: [ITEM],
  note: '',
  actor: 'Dr. Test',
});

describe('demo seed scans (FUN-07)', () => {
  beforeEach(() => resetDemo());

  it('gives every seeded customer with a consultation or plan a completed scan', () => {
    const s = db();
    const withConsultOrPlan = s.customers.filter(
      (c) =>
        s.appointments.some(
          (a) => a.customerId === c.id && ['booked', 'completed', 'no_show'].includes(a.status),
        ) || s.orders.some((o) => o.customerId === c.id && o.planId && o.paidAt),
    );
    expect(withConsultOrPlan.length).toBeGreaterThan(0);
    for (const c of withConsultOrPlan) expect(getScanForCustomer(c.id), c.name).not.toBeNull();
    // the demo customer (Rahul) on his plan sees his scan in the portal
    expect(getJourneyForCustomer('cus-s0')?.scan?.capturedAt).toBeTruthy();
  });
});

describe('sendRecommendation without a scan (FUN-07)', () => {
  beforeEach(() => resetDemo());

  it('refuses without an override reason of at least 10 characters', () => {
    const appt = walkIn();
    expect(getScanForCustomer(appt.customerId)).toBeNull();
    expect(() => sendRecommendation(base(appt.id))).toThrow(AppError);
    expect(() => sendRecommendation({ ...base(appt.id), scanOverrideReason: 'too short' })).toThrow(
      /at least 10 characters/,
    );
    expect(db().recommendations.some((r) => r.appointmentId === appt.id)).toBe(false);
  });

  it('records the reason on the recommendation and in the audit log', () => {
    const appt = walkIn();
    const rec = sendRecommendation({
      ...base(appt.id),
      scanOverrideReason: '  Examined on video; phone scan failed.  ',
    });
    expect(rec.scanOverrideReason).toBe('Examined on video; phone scan failed.');
    const log = JSON.stringify(db());
    expect(log).toContain('recommendation.scan_override');
  });

  it('needs no reason when a scan is on file', () => {
    const s = db();
    const appt = s.appointments.find(
      (a) =>
        a.status === 'completed' &&
        !s.recommendations.some((r) => r.appointmentId === a.id) &&
        getScanForCustomer(a.customerId) !== null,
    );
    if (!appt) throw new Error('seed has no completed appointment with a scan');
    const rec = sendRecommendation(base(appt.id));
    expect(rec.scanOverrideReason).toBeNull();
  });
});
