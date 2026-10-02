import { beforeEach, describe, expect, it, vi } from 'vitest';

/*
 * End-to-end through the booking / checkout / plan server actions against the in-memory demo store.
 * next/headers cookies and next/cache are stubbed; everything else is the real code path.
 */

const jar = vi.hoisted(() => {
  process.env.DEMO_MODE = 'true';
  return new Map<string, string>();
});

vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: (name: string) => (jar.has(name) ? { name, value: jar.get(name) } : undefined),
    set: (name: string, value: string) => void jar.set(name, value),
    delete: (name: string) => void jar.delete(name),
  }),
}));
vi.mock('next/cache', () => ({ revalidatePath: () => undefined }));

const { db, resetDemo } = await import('@/server/demo/store');
const book = await import('./actions');
const checkout = await import('../checkout/actions');
const plan = await import('../../r/[token]/actions');

const details = {
  name: 'Asha Verma',
  age: '29',
  concern: 'hair_fall' as const,
  consentTelemedicine: true,
  consentPrivacy: true,
  consentWhatsapp: false,
};

async function signIn(mobile = '9812345678') {
  const sent = await book.sendOtpAction({ mobile, channel: 'whatsapp' });
  expect(sent.ok).toBe(true);
  const res = await book.verifyOtpAction({ mobile, code: '123456' });
  if (!res.ok) throw new Error(res.error.message);
  return res.data;
}

async function firstSlot() {
  const res = await book.refreshSlotsAction();
  if (!res.ok) throw new Error('no slots');
  const slot = res.data.flatMap((d) => d.slots)[0];
  if (!slot) throw new Error('no open slot');
  return slot.startsAt;
}

beforeEach(() => {
  jar.clear();
  resetDemo();
});

describe('booking actions', () => {
  it('rejects a wrong OTP and signs in with the demo code', async () => {
    const bad = await book.verifyOtpAction({ mobile: '9812345678', code: '000000' });
    expect(bad.ok).toBe(false);
    const view = await signIn();
    expect(view.maskedPhone).toBe('+91 ••••• 45678');
    expect(jar.get('yhc_demo_role')).toBe('customer');
    expect(jar.get('yhc_demo_customer')).toBe(view.customerId);
  });

  it('blocks under-18s in the short form', async () => {
    await signIn();
    const res = await book.holdSlotAction({ ...details, age: '17', startsAt: await firstSlot() });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error.code).toBe('invalid_input');
  });

  it('holds, pays (server-side) and confirms a slot; a second customer gets slot_taken', async () => {
    const me = await signIn();
    const startsAt = await firstSlot();
    const hold = await book.holdSlotAction({ ...details, startsAt });
    if (!hold.ok) throw new Error(hold.error.message);
    expect(hold.data.holdSecondsLeft).toBeGreaterThan(500);
    expect(db().customers.find((c) => c.id === me.customerId)?.name).toBe('Asha Verma');

    // Same customer, same time → same hold (idempotent)
    const again = await book.holdSlotAction({ ...details, startsAt });
    expect(again.ok && again.data.appointmentId).toBe(hold.data.appointmentId);

    const paid = await book.payConsultationAction({ appointmentId: hold.data.appointmentId });
    expect(paid.ok && paid.data.status).toBe('booked');
    const status = await book.appointmentStatusAction({ appointmentId: hold.data.appointmentId });
    expect(status.ok && status.data.confirmed?.code).toBe(hold.data.code);

    jar.clear();
    await signIn('9898989898');
    const clash = await book.holdSlotAction({ ...details, name: 'Other Person', startsAt });
    expect(clash.ok).toBe(false);
    if (!clash.ok) expect(clash.error.code).toBe('slot_taken');
  });

  it('keeps the payment when the hold expired and the slot was taken (FR-M3-8)', async () => {
    await signIn();
    const startsAt = await firstSlot();
    const hold = await book.holdSlotAction({ ...details, startsAt });
    if (!hold.ok) throw new Error(hold.error.message);
    const appt = db().appointments.find((a) => a.id === hold.data.appointmentId);
    if (!appt) throw new Error('missing');
    appt.holdExpiresAt = new Date(Date.now() - 1000).toISOString();
    // someone else books the same time meanwhile
    db().appointments.push({
      ...appt,
      id: 'apt-other',
      customerId: 'cus-x',
      status: 'booked',
      holdExpiresAt: null,
    });

    const res = await book.payConsultationAction({ appointmentId: appt.id });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error.code).toBe('slot_lost');
    const kept = await book.hasKeptPaymentAction();
    expect(kept.ok && kept.data).toBe(true);
  });

  it('saves the intake only for the owner', async () => {
    await signIn();
    const hold = await book.holdSlotAction({ ...details, startsAt: await firstSlot() });
    if (!hold.ok) throw new Error(hold.error.message);
    await book.payConsultationAction({ appointmentId: hold.data.appointmentId });
    const form = {
      appointmentId: hold.data.appointmentId,
      duration: '6–12 months',
      pattern: 'Crown (top of head)',
      previousTreatments: 'None',
      currentProducts: '',
      medicalHistory: '',
      medications: 'None',
      allergies: '',
      familyHistory: 'Father',
      photos: 3,
    };
    jar.clear();
    await signIn('9898989898');
    expect((await book.saveIntakeAction(form)).ok).toBe(false);
    jar.clear();
    await signIn();
    expect((await book.saveIntakeAction(form)).ok).toBe(true);
    const appt = db().appointments.find((a) => a.id === hold.data.appointmentId);
    expect(appt?.intakeDone && appt.photosDone).toBe(true);
  });
});

describe('checkout actions', () => {
  const address = {
    fullName: 'Asha Verma',
    line1: '12 MG Road',
    line2: '',
    city: 'Pune',
    state: 'Maharashtra' as const,
    pincode: '411001',
  };

  it('prices on the server and refuses prescription-only products', async () => {
    const q = await checkout.quoteCartAction([
      { productId: 'prod-shampoo', qty: 2 },
      { productId: 'prod-topical', qty: 1 },
    ]);
    if (!q.ok) throw new Error(q.error.message);
    expect(q.data.totalPaise).toBe(2 * 69900);
    expect(q.data.unavailable).toEqual(['Topical Hair Solution']);
  });

  it('requires sign-in, then creates a paid order', async () => {
    const items = [{ productId: 'prod-shampoo', qty: 1 }];
    const anon = await checkout.payCartAction({ items, address, consent: true });
    expect(anon.ok).toBe(false);
    await signIn();
    const res = await checkout.payCartAction({ items, address, consent: true });
    if (!res.ok) throw new Error(res.error.message);
    expect(res.data.totalPaise).toBe(69900);
    expect(db().orders.find((o) => o.code === res.data.code)?.status).toBe('paid');
  });
});

describe('plan payment', () => {
  const token = 'demo-karan-plan-token-00000000000000';
  const address = {
    fullName: 'Karan Malhotra',
    line1: '4 Park Street',
    line2: '',
    city: 'Kolkata',
    state: 'West Bengal' as const,
    pincode: '700016',
  };

  it('pays the seeded plan with a typed address and is idempotent on retry', async () => {
    const first = await plan.payPlanAction({ token, planId: 'plan-3', address });
    if (!first.ok) throw new Error(first.error.message);
    const order = db().orders.find((o) => o.code === first.data.code);
    expect(order?.status).toBe('paid');
    expect(order?.creditPaise).toBe(50000); // Karan's ₹500 consult credit (seed)
    expect(order?.totalPaise).toBe(1449900);
    const retry = await plan.payPlanAction({ token, planId: 'plan-3', address });
    expect(retry.ok && retry.data.code).toBe(first.data.code);
  });

  it('refuses the saved address without the customer session', async () => {
    const res = await plan.payPlanAction({ token, planId: 'plan-3', address: null });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error.code).toBe('address_required');
  });
});
