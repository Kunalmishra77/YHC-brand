import { describe, expect, it } from 'vitest';
import { getArticle, getArticles } from './articles';

// 2026-11-17: the doctor consultation is hidden (ADR-36), so its article must not be listed or served.
describe('hidden articles', () => {
  it('keeps the consultation article out of the list and its URL', () => {
    expect(getArticles().some((a) => a.slug === 'what-happens-in-a-video-consultation')).toBe(false);
    expect(getArticle('what-happens-in-a-video-consultation')).toBeNull();
  });
  it('still serves the other articles', () => {
    expect(getArticles().length).toBeGreaterThan(0);
    expect(getArticle('how-to-take-scalp-photos')).not.toBeNull();
  });
});
