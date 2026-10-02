import { describe, expect, it } from 'vitest';
import { checkReorder } from './reorder-guard';

const now = new Date('2026-10-02T06:00:00Z');

describe('checkReorder (FR-M10-5)', () => {
  it('allows reorder within 180 days of the last completed consultation', () => {
    const r = checkReorder({ completedConsultsAt: ['2026-08-25T05:00:00Z'], now });
    expect(r.allowed).toBe(true);
  });

  it('allows reorder on exactly day 180', () => {
    const r = checkReorder({ completedConsultsAt: ['2026-04-05T05:00:00Z'], now });
    expect(r.allowed).toBe(true);
  });

  it('blocks reorder after 180 days and offers a follow-up', () => {
    const r = checkReorder({ completedConsultsAt: ['2026-04-01T05:00:00Z'], now });
    expect(r.allowed).toBe(false);
    if (!r.allowed) {
      expect(r.reason).toBe('consult_expired');
      expect(r.message).toContain('follow-up consultation');
    }
  });

  it('uses the most recent consultation', () => {
    const r = checkReorder({
      completedConsultsAt: ['2025-12-01T05:00:00Z', '2026-09-01T05:00:00Z'],
      now,
    });
    expect(r.allowed).toBe(true);
  });

  it('blocks when there is no completed consultation', () => {
    const r = checkReorder({ completedConsultsAt: [], now });
    expect(r).toMatchObject({ allowed: false, reason: 'no_consult' });
  });

  it('respects a custom validity window', () => {
    const r = checkReorder({ completedConsultsAt: ['2026-08-25T05:00:00Z'], now, validityDays: 30 });
    expect(r.allowed).toBe(false);
  });
});
