import { describe, expect, it } from 'vitest';
import { formatINR, paise, rupeesToPaise } from './money';

describe('money', () => {
  it('formats with Indian grouping and no decimals for whole rupees', () => {
    expect(formatINR(1499900)).toBe('₹14,999');
    expect(formatINR(50000)).toBe('₹500');
    expect(formatINR(1234567800)).toBe('₹1,23,45,678');
  });

  it('keeps paise when present', () => {
    expect(formatINR(1050)).toBe('₹10.50');
  });

  it('converts rupees to paise without float drift', () => {
    expect(rupeesToPaise(5999)).toBe(599900);
    expect(rupeesToPaise(0.1 + 0.2)).toBe(30);
  });

  it('rejects fractional paise', () => {
    expect(() => paise(10.5)).toThrow(RangeError);
    expect(paise(100)).toBe(100);
  });
});
