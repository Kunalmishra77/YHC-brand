import { describe, expect, it } from 'vitest';
import { pricePlan } from './pricing';

const now = new Date('2026-10-14T06:00:00Z');
const credit = { amountPaise: 50000, expiresAt: '2026-10-20T00:00:00Z', usedOrderId: null };

describe('pricePlan', () => {
  it('applies the ₹500 consult credit to a plan', () => {
    expect(pricePlan({ planPricePaise: 1499900, credits: [credit], creditEnabled: true, now })).toEqual({
      subtotalPaise: 1499900,
      creditPaise: 50000,
      totalPaise: 1449900,
    });
  });

  it('ignores expired, used or disabled credit', () => {
    const expired = { ...credit, expiresAt: '2026-10-01T00:00:00Z' };
    const used = { ...credit, usedOrderId: 'o1' };
    expect(
      pricePlan({ planPricePaise: 599900, credits: [expired, used], creditEnabled: true, now }).creditPaise,
    ).toBe(0);
    expect(
      pricePlan({ planPricePaise: 599900, credits: [credit], creditEnabled: false, now }).creditPaise,
    ).toBe(0);
  });

  it('never makes the total negative', () => {
    expect(pricePlan({ planPricePaise: 30000, credits: [credit], creditEnabled: true, now }).totalPaise).toBe(
      0,
    );
  });
});
