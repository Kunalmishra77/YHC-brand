import { beforeEach, describe, expect, it } from 'vitest';
import { db, resetDemo } from '@/server/demo/store';
import { decideClaim, listClaimReviews } from './claims';
import { PROTOCOLS } from './protocols';
import { getCalendarWeek, getFollowUps, getToday, getWorkspace, mondayOf, searchPatients } from './queries';

const BANNED = [/\bcure/i, /100%/, /guaranteed regrowth/i, /permanent/i, /miracle/i, /no side effects/i];

beforeEach(() => resetDemo());

describe('protocol templates (FR-M5-8)', () => {
  it('has three presets with products, Rx items and a plan', () => {
    expect(PROTOCOLS).toHaveLength(3);
    for (const p of PROTOCOLS) {
      expect(p.productIds.length).toBeGreaterThan(0);
      expect(p.items.length).toBeGreaterThan(0);
      expect(['plan-1', 'plan-2', 'plan-3']).toContain(p.planId);
    }
  });

  it('uses no banned claims (PRD §15)', () => {
    const text = JSON.stringify(PROTOCOLS);
    for (const re of BANNED) expect(text).not.toMatch(re);
  });
});

describe('doctor read models', () => {
  it('lists today in time order with KPIs', () => {
    const { rows, kpis } = getToday();
    expect(rows.length).toBeGreaterThanOrEqual(6);
    const times = rows.map((r) => r.appt.startsAt);
    expect([...times].sort()).toEqual(times);
    expect(kpis.intakePending).toBe(1); // apt-s4
  });

  it('never shows another patient’s recommendation in the workspace', () => {
    // seed: Karan's recommendation points at apt-s0 (Meera) — the guard must ignore it
    const ws = getWorkspace('apt-s0');
    expect(ws?.customer.name).toBe('Meera Joshi');
    expect(ws?.recommendation).toBeNull();
    expect(ws?.quotes.find((q) => q.planId === 'plan-3')?.creditPaise).toBe(50000);
  });

  it('projects the consult credit before completion', () => {
    const ws = getWorkspace('apt-s1');
    expect(ws?.credit?.projected).toBe(true);
    expect(ws?.quotes.find((q) => q.planId === 'plan-3')?.totalPaise).toBe(1499900 - 50000);
  });

  it('finds patients by appointment code and phone digits', () => {
    const code = db().appointments.find((a) => a.id === 'apt-s1')?.code ?? '';
    expect(searchPatients(code).map((r) => r.customer.name)).toEqual(['Ankit Sharma']);
    expect(searchPatients('0002').map((r) => r.customer.name)).toContain('Ankit Sharma');
  });

  it('flags Rahul’s check-in question in follow-ups', () => {
    const { flagged } = getFollowUps();
    expect(flagged.some((f) => f.customer.name === 'Rahul Mehra')).toBe(true);
  });

  it('builds a Monday-first week with availability windows', () => {
    const week = getCalendarWeek(mondayOf('2026-10-02'));
    expect(week[0]?.date).toBe('2026-09-28');
    expect(week).toHaveLength(7);
    expect(week[0]?.background.some((b) => b.kind === 'available')).toBe(true);
    expect(week[6]?.background.some((b) => b.kind === 'available')).toBe(false); // Sunday off
  });
});

describe('guarantee decisions (FR-M5-11)', () => {
  it('records a decision once and audits it', () => {
    const before = listClaimReviews();
    const claim = before?.reviews[0]?.claim;
    expect(claim).toBeDefined();
    if (!claim) return;
    decideClaim({
      claimId: claim.id,
      decision: 'rejected',
      notes: 'Plan shorter than the minimum.',
      actor: 'Dr. Tyagi',
    });
    expect(db().claims.find((c) => c.id === claim.id)?.status).toBe('rejected');
    expect(db().audit[0]?.action).toBe('guarantee.decision');
    expect(() =>
      decideClaim({
        claimId: claim.id,
        decision: 'approved',
        notes: 'Second attempt here.',
        actor: 'Dr. Tyagi',
      }),
    ).toThrow();
  });
});
