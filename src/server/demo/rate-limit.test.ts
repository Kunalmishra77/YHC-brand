import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
const { rateLimit } = await import('./rate-limit');

describe('rateLimit', () => {
  it('allows `limit` calls per window, then blocks until the window resets', () => {
    const t0 = 1_000_000;
    for (let i = 0; i < 3; i++) expect(rateLimit('k', 3, 1000, t0 + i)).toBe(true);
    expect(rateLimit('k', 3, 1000, t0 + 10)).toBe(false);
    expect(rateLimit('k', 3, 1000, t0 + 1001)).toBe(true);
  });

  it('keeps keys separate', () => {
    expect(rateLimit('a', 1, 1000, 5)).toBe(true);
    expect(rateLimit('a', 1, 1000, 6)).toBe(false);
    expect(rateLimit('b', 1, 1000, 6)).toBe(true);
  });
});
