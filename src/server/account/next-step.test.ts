import { describe, expect, it } from 'vitest';
import { deriveNextStep, type NextStepInput } from './next-step';

const base: NextStepInput = {
  now: new Date('2026-10-02T06:00:00Z'),
  today: '2026-10-02',
  upcoming: [],
  plan: { orderId: 'o1', orderCode: 'YHC-10001', deliveredOn: '2026-08-30', planEndOn: '2026-11-28' },
  hasNewerPlanOrder: false,
  photoDates: ['2026-08-25', '2026-09-29'],
  followUpDueOn: null,
  hasAnyConsult: true,
  joinWindowMinutes: 15,
  reorderWindowDays: 7,
  readableDate: (s) => s,
  links: {
    intake: (id) => `/intake/${id}`,
    join: (id) => `/consult/${id}`,
    photos: '/account/progress',
    order: (code) => `/account/orders/${code}`,
    book: '/book',
  },
};

const appt = (startsAt: string, intakeDone: boolean) => ({
  id: 'a1',
  startsAt,
  endsAt: new Date(new Date(startsAt).getTime() + 30 * 60_000).toISOString(),
  intakeDone,
  whenLabel: 'soon',
});

describe('deriveNextStep', () => {
  it('puts a pending intake first', () => {
    const step = deriveNextStep({ ...base, upcoming: [appt('2026-10-02T06:05:00Z', false)] });
    expect(step.kind).toBe('intake');
  });

  it('offers join inside the join window', () => {
    const step = deriveNextStep({ ...base, upcoming: [appt('2026-10-02T06:10:00Z', true)] });
    expect(step.kind).toBe('join');
    expect(step.cta?.href).toBe('/consult/a1');
  });

  it('asks for this month photos when none in the current month', () => {
    // day 33 of plan → month 2 window; only month-1 photo exists
    expect(deriveNextStep(base).kind).toBe('photos');
  });

  it('offers reorder within 7 days of plan end', () => {
    const step = deriveNextStep({ ...base, today: '2026-11-23', photoDates: ['2026-11-20'] });
    expect(step.kind).toBe('reorder');
  });

  it('does not offer reorder when a newer plan order exists', () => {
    const step = deriveNextStep({
      ...base,
      today: '2026-11-23',
      photoDates: ['2026-11-20'],
      hasNewerPlanOrder: true,
    });
    expect(step.kind).toBe('on_track');
  });

  it('flags a follow-up due within 14 days', () => {
    const step = deriveNextStep({ ...base, photoDates: ['2026-10-01'], followUpDueOn: '2026-10-10' });
    expect(step.kind).toBe('followup');
  });

  it('suggests booking when there is nothing yet', () => {
    const step = deriveNextStep({ ...base, plan: null, hasAnyConsult: false });
    expect(step.kind).toBe('book');
  });
});
