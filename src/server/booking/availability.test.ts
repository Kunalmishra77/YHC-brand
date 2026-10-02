import { describe, expect, it } from 'vitest';
import { computeAvailability, type AvailabilityInput } from './availability';

// Wed 14 Oct 2026, 08:00 IST
const now = new Date('2026-10-14T02:30:00Z');

const base: AvailabilityInput = {
  weeklyRules: { 3: [{ start: '10:00', end: '12:00' }], 4: [{ start: '10:00', end: '11:00' }] },
  exceptions: [],
  busyBlocks: [],
  taken: [],
  slotMinutes: 30,
  bufferMinutes: 10,
  minNoticeMinutes: 60,
  maxPerDay: 8,
  windowDays: 2,
  now,
};

const times = (input: AvailabilityInput, day = 0) =>
  computeAvailability(input)[day]?.slots.map((s) => s.startsAt.toISOString().slice(11, 16));

describe('computeAvailability', () => {
  it('steps slot + buffer inside working ranges (IST)', () => {
    // 10:00, 10:40, 11:20 IST = 04:30, 05:10, 05:50 UTC
    expect(times(base)).toEqual(['04:30', '05:10', '05:50']);
  });

  it('removes taken and busy time', () => {
    const taken = [{ startsAt: new Date('2026-10-14T05:10:00Z'), endsAt: new Date('2026-10-14T05:40:00Z') }];
    const busyBlocks = [
      { startsAt: new Date('2026-10-14T05:50:00Z'), endsAt: new Date('2026-10-14T06:30:00Z') },
    ];
    expect(times({ ...base, taken, busyBlocks })).toEqual(['04:30']);
  });

  it('respects minimum notice', () => {
    expect(times({ ...base, now: new Date('2026-10-14T04:20:00Z') })).toEqual(['05:50']);
  });

  it('caps at max per day including taken', () => {
    const taken = [{ startsAt: new Date('2026-10-14T08:00:00Z'), endsAt: new Date('2026-10-14T08:30:00Z') }];
    expect(times({ ...base, taken, maxPerDay: 2 })).toEqual(['04:30']);
  });

  it('applies whole-day leave', () => {
    const exceptions = [{ date: '2026-10-14', kind: 'unavailable' as const, range: null }];
    expect(times({ ...base, exceptions })).toEqual([]);
    expect(times({ ...base, exceptions }, 1)).toEqual(['04:30']);
  });
});
