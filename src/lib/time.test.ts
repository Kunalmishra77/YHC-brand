import { describe, expect, it } from 'vitest';
import { formatIst, istDate, startOfIstDay, toIST } from './time';

describe('time', () => {
  // 2026-10-13 20:00 UTC = 2026-10-14 01:30 IST
  const lateNightUtc = new Date('2026-10-13T20:00:00Z');

  it('computes the business date in IST, not UTC', () => {
    expect(istDate(lateNightUtc)).toBe('2026-10-14');
  });

  it('finds the UTC instant of IST midnight', () => {
    expect(startOfIstDay(lateNightUtc).toISOString()).toBe('2026-10-13T18:30:00.000Z');
  });

  it('formats for display in IST', () => {
    expect(formatIst(new Date('2026-10-14T05:50:00Z'))).toBe('Wed 14 Oct, 11:20 am IST');
  });

  it('shifts wall-clock fields to IST', () => {
    expect(toIST(lateNightUtc).getHours()).toBe(1);
  });
});
