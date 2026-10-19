import { describe, expect, it } from 'vitest';
import type { Appointment, Order, Recommendation } from '@/lib/domain/types';
import { formatINRWhole } from '@/lib/money';
import { computeRevenue } from './queries';

const NOW = new Date('2026-10-19T06:00:00Z');

function order(id: string, patch: Partial<Order>): Order {
  return {
    id,
    code: `YHC-${id}`,
    customerId: 'cus-1',
    source: 'recommendation',
    status: 'paid',
    planId: 'plan-3',
    recommendationId: null,
    lines: [],
    subtotalPaise: 0,
    creditPaise: 0,
    totalPaise: 0,
    paymentId: 'pay_x',
    createdAt: '2026-10-05T06:00:00Z',
    paidAt: '2026-10-05T06:00:00Z',
    deliveredOn: null,
    planEndOn: null,
    courier: null,
    awb: null,
    address: '',
    ...patch,
  };
}

function rec(id: string, status: Recommendation['status']): Recommendation {
  return {
    id,
    token: `tok-${id}`,
    appointmentId: `apt-${id}`,
    customerId: 'cus-1',
    status,
    planId: 'plan-3',
    productIds: [],
    note: '',
    items: [],
    createdAt: '2026-09-01T06:00:00Z',
    expiresAt: '2026-09-04T06:00:00Z',
  };
}

function appt(id: string, patch: Partial<Appointment>): Appointment {
  return {
    id,
    code: `A-${id}`,
    customerId: 'cus-1',
    doctorId: 'doc-1',
    kind: 'first',
    status: 'completed',
    startsAt: '2026-10-10T05:00:00Z',
    endsAt: '2026-10-10T05:30:00Z',
    holdExpiresAt: null,
    feePaise: 50000,
    concern: 'hair_fall',
    intakeDone: true,
    photosDone: true,
    paymentId: 'pay_a',
    joinUrl: '',
    ...patch,
  };
}

/** Fixed fixture: 3 plan orders paid in Oct 2026 (one from a plan link, one without, one reorder). */
const FIXTURE = {
  appointments: [
    appt('a1', {}),
    appt('a2', { status: 'held', paymentId: null }),
    appt('a3', { kind: 'follow_up', feePaise: 0 }),
  ],
  orders: [
    order('A', { recommendationId: 'rec-1', totalPaise: 1449900 }),
    order('B', { totalPaise: 1499900 }),
    order('C', { source: 'shop', planId: 'plan-1', totalPaise: 599900 }),
    order('D', { recommendationId: 'rec-4', totalPaise: 1499900, paidAt: '2026-09-20T06:00:00Z' }),
    order('E', { recommendationId: 'rec-2', status: 'pending_payment', paidAt: null, totalPaise: 1449900 }),
    order('F', { status: 'cancelled', totalPaise: 999900 }),
    order('G', { planId: null, source: 'shop', totalPaise: 129800 }),
  ],
  recommendations: [rec('rec-1', 'sent'), rec('rec-2', 'sent'), rec('rec-3', 'draft'), rec('rec-4', 'paid')],
};

describe('computeRevenue (FUN-08)', () => {
  const r = computeRevenue(FIXTURE, NOW);

  it('counts every paid plan order in the month, matching plan revenue', () => {
    expect(r.current.planCount).toBe(3);
    expect(r.current.planPaise).toBe(1449900 + 1499900 + 599900);
    expect(r.previous.planCount).toBe(1);
  });

  it('averages plan revenue per plan and shows it in whole rupees', () => {
    expect(r.avgPlanPaise).toBe(1183233);
    expect(formatINRWhole(r.avgPlanPaise)).toBe('₹11,832');
  });

  it('counts plan links paid as sent recommendations that have a paid plan order', () => {
    expect(r.recsSent).toBe(3); // draft excluded
    expect(r.recsPaid).toBe(2); // rec-1 (paid order) + rec-4 (status paid)
    expect(r.planOrdersAllTime).toBe(4);
    expect(r.planOrdersWithoutLink).toBe(2);
  });

  it('counts paid consultation fees only', () => {
    expect(r.current.consultCount).toBe(1);
    expect(r.current.consultPaise).toBe(50000);
  });
});
