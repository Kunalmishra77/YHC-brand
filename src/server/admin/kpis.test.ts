import { describe, expect, it } from 'vitest';
import type { Appointment, Lead, Order, Plan } from '@/lib/domain/types';
import {
  availableSlotMinutes,
  computePeriod,
  deltaWords,
  parseRange,
  previousWindow,
  ratio,
  slotMinutesInRange,
  stepConversion,
  windowFor,
  type KpiOptions,
  type KpiSource,
} from './kpis';

const NOW = new Date('2026-10-02T06:30:00Z'); // Fri 2 Oct 2026, 12:00 IST

const PLANS: Plan[] = [
  {
    id: 'plan-1',
    slug: 'p1',
    name: '1-month plan',
    months: 1,
    pricePaise: 599900,
    compareAtPaise: null,
    isRecommended: false,
    description: '',
  },
  {
    id: 'plan-3',
    slug: 'p3',
    name: '3-month plan',
    months: 3,
    pricePaise: 1499900,
    compareAtPaise: null,
    isRecommended: true,
    description: '',
  },
];

const opts: KpiOptions = { slotMinutes: 30, bufferMinutes: 10, plans: PLANS, staff: [], now: NOW };

function lead(id: string, customerId: string, createdAt: string): Lead {
  return {
    id,
    name: id,
    phone: '+910000000000',
    customerId,
    source: 'meta_ads',
    campaign: 'c1',
    stage: 'new',
    ownerId: null,
    lostReason: null,
    nextAction: null,
    nextActionAt: null,
    createdAt,
    updatedAt: createdAt,
  };
}

function appt(id: string, customerId: string, startsAt: string, status: Appointment['status'], paid = true) {
  const start = new Date(startsAt);
  return {
    id,
    code: id,
    customerId,
    doctorId: 'doc',
    kind: 'first',
    status,
    startsAt,
    endsAt: new Date(start.getTime() + 30 * 60_000).toISOString(),
    holdExpiresAt: null,
    feePaise: 50000,
    concern: 'hair_fall',
    intakeDone: true,
    photosDone: true,
    paymentId: paid ? `pay_${id}` : null,
    joinUrl: '',
  } satisfies Appointment;
}

function order(id: string, customerId: string, paidAt: string, extra: Partial<Order> = {}): Order {
  return {
    id,
    code: id,
    customerId,
    source: 'recommendation',
    status: 'paid',
    planId: 'plan-3',
    recommendationId: null,
    lines: [],
    subtotalPaise: 1499900,
    creditPaise: 50000,
    totalPaise: 1449900,
    paymentId: 'pay',
    createdAt: paidAt,
    paidAt,
    deliveredOn: null,
    planEndOn: null,
    courier: null,
    awb: null,
    address: '',
    ...extra,
  };
}

const empty = (): KpiSource => ({
  leads: [],
  appointments: [],
  orders: [],
  claims: [],
  events: [],
  availability: { weeklyRules: {}, exceptions: [] },
});

describe('rates', () => {
  it('ratio is null (not 0) when the denominator is zero', () => {
    expect(ratio(0, 0).value).toBeNull();
    expect(ratio(1, 4).value).toBe(0.25);
  });

  it('funnel step conversion divides by the previous step', () => {
    expect(stepConversion([10, 5, 4, 0, 0])).toEqual([null, 0.5, 0.8, 0, null]);
  });

  it('parses the range and falls back to 30 days', () => {
    expect(parseRange('7')).toBe(7);
    expect(parseRange(['90'])).toBe(90);
    expect(parseRange('14')).toBe(30);
    expect(parseRange(undefined)).toBe(30);
  });
});

describe('deltaWords', () => {
  it('uses percentages for counts and points for rates', () => {
    expect(deltaWords(12, 10, 'count', 7)).toBe('Up 20% vs previous 7 days');
    expect(deltaWords(8, 10, 'money', 30)).toBe('Down 20% vs previous 30 days');
    expect(deltaWords(0.5, 0.42, 'rate', 7)).toBe('Up 8 pts vs previous 7 days');
    expect(deltaWords(5, 5, 'count', 7)).toBe('No change vs previous 7 days');
  });

  it('never invents a percentage from zero', () => {
    expect(deltaWords(3, 0, 'count', 7)).toBe('None in previous 7 days');
    expect(deltaWords(0.4, null, 'rate', 7)).toBe('No comparable data in previous 7 days');
    expect(deltaWords(null, 0.4, 'rate', 7)).toBe('Not enough data in this period');
  });
});

describe('windows', () => {
  it('covers the last N IST days including today', () => {
    const w = windowFor(7, NOW);
    expect(w.firstDate).toBe('2026-09-26');
    expect(w.lastDate).toBe('2026-10-02');
    expect(w.start.toISOString()).toBe('2026-09-25T18:30:00.000Z');
    const p = previousWindow(w);
    expect(p.lastDate).toBe('2026-09-25');
    expect(p.firstDate).toBe('2026-09-19');
    expect(p.end.getTime()).toBe(w.start.getTime());
  });
});

describe('doctor utilisation', () => {
  it('counts whole slots with buffers between them', () => {
    // 10:00–13:00 = 180 min → slots of 30 + 10 buffer: floor(190 / 40) = 4 slots = 120 min
    expect(slotMinutesInRange({ start: '10:00', end: '13:00' }, 30, 10)).toBe(120);
    expect(slotMinutesInRange({ start: '10:00', end: '10:20' }, 30, 10)).toBe(0);
  });

  it('applies weekly rules and day-off exceptions', () => {
    const w = windowFor(7, NOW); // Sat 26 Sep … Fri 2 Oct
    const rules = { 1: [{ start: '10:00', end: '13:00' }], 5: [{ start: '10:00', end: '13:00' }] };
    expect(availableSlotMinutes(w, { weeklyRules: rules, exceptions: [] }, 30, 10)).toBe(240);
    expect(
      availableSlotMinutes(
        w,
        { weeklyRules: rules, exceptions: [{ date: '2026-10-02', kind: 'unavailable', range: null }] },
        30,
        10,
      ),
    ).toBe(120);
  });
});

describe('computePeriod', () => {
  const src = empty();
  src.leads = [
    lead('l1', 'c1', '2026-09-28T04:00:00Z'),
    lead('l2', 'c2', '2026-09-29T04:00:00Z'),
    lead('l3', 'c3', '2026-09-30T04:00:00Z'),
    lead('l4', 'c4', '2026-10-01T04:00:00Z'),
  ];
  src.appointments = [
    appt('a1', 'c1', '2026-09-29T05:00:00Z', 'completed'),
    appt('a2', 'c2', '2026-09-30T05:00:00Z', 'no_show'),
    appt('a3', 'c3', '2026-10-01T05:00:00Z', 'expired', false),
  ];
  src.orders = [
    order('o1', 'c1', '2026-09-30T05:00:00Z'),
    order('o2', 'c9', '2026-09-30T06:00:00Z', {
      planId: null,
      source: 'shop',
      totalPaise: 129800,
    }),
    order('o3', 'c8', '2026-09-30T06:00:00Z', { status: 'pending_payment', paidAt: null }),
  ];
  const m = computePeriod(src, opts, windowFor(7, NOW));

  it('builds a monotone lead funnel with step conversion', () => {
    expect(m.funnel.map((s) => s.count)).toEqual([4, 3, 2, 1, 1, 0]);
    expect(m.funnel.map((s) => s.conversion)).toEqual([null, 0.75, 2 / 3, 0.5, 1, 0]);
  });

  it('computes §17 rates', () => {
    expect(m.newLeads).toBe(4);
    expect(m.leadToPaid.value).toBe(0.5);
    expect(m.bookingConversion).toMatchObject({ num: 2, den: 3 });
    expect(m.showUp.value).toBe(0.5);
    expect(m.noShow.value).toBe(0.5);
    expect(m.consultToPlan.value).toBe(1);
  });

  it('computes AOV over paid orders only and splits revenue', () => {
    expect(m.aov.orders).toBe(2);
    expect(m.aov.valuePaise).toBe((1449900 + 129800) / 2);
    expect(m.revenue).toEqual({
      consultPaise: 100000,
      planPaise: 1449900 + 129800,
      reorderPaise: 0,
      totalPaise: 100000 + 1449900 + 129800,
    });
    expect(m.planRevenuePaise).toBe(1449900);
    expect(m.guaranteeCost.value).toBe(0);
  });

  it('reorder rate counts reorders within 30 days after plan end', () => {
    const s = empty();
    s.orders = [
      order('p1', 'c1', '2026-07-01T05:00:00Z', { planEndOn: '2026-09-28', deliveredOn: '2026-06-30' }),
      order('r1', 'c1', '2026-09-25T05:00:00Z', { source: 'reorder' }),
      order('p2', 'c2', '2026-07-01T05:00:00Z', { planEndOn: '2026-09-29', deliveredOn: '2026-06-30' }),
    ];
    const r = computePeriod(s, opts, windowFor(7, NOW));
    expect(r.reorderRate).toMatchObject({ num: 1, den: 2, value: 0.5 });
    expect(r.revenue.reorderPaise).toBe(0); // the reorder was paid before this window
  });

  it('90-day retention uses plan end ≥ day 90 after first delivery', () => {
    const s = empty();
    s.orders = [
      order('p1', 'c1', '2026-09-27T05:00:00Z', { deliveredOn: '2026-09-28', planEndOn: '2026-12-27' }),
      order('p2', 'c2', '2026-09-27T05:00:00Z', { deliveredOn: '2026-09-28', planEndOn: '2026-10-28' }),
    ];
    expect(computePeriod(s, opts, windowFor(7, NOW)).retention90.value).toBe(0.5);
  });

  it('returns null rates for an empty period', () => {
    const e = computePeriod(empty(), opts, windowFor(7, NOW));
    expect(e.showUp.value).toBeNull();
    expect(e.aov.valuePaise).toBeNull();
    expect(e.funnel[1]?.conversion).toBeNull();
  });
});
