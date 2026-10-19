import { describe, expect, it } from 'vitest';
import { CONCERNS } from '@/server/demo/fixtures';
import {
  LEGACY_CONCERN_KEYS,
  concernKeyFromParam,
  concernPath,
  concernUrlSlug,
  legacyConcernRedirects,
} from './concern-path';

describe('concern paths (SEO-05)', () => {
  it('hyphenates concern keys for URLs', () => {
    expect(concernUrlSlug('hair_fall')).toBe('hair-fall');
    expect(concernUrlSlug('dandruff_scalp')).toBe('dandruff-scalp');
    expect(concernUrlSlug('thinning')).toBe('thinning');
    expect(concernPath('receding_hairline')).toBe('/concerns/receding-hairline');
    expect(concernPath('crown-thinning')).toBe('/concerns/crown-thinning');
  });

  it('resolves a hyphenated param back to the key and rejects underscore params', () => {
    expect(concernKeyFromParam('hair-fall')).toBe('hair_fall');
    expect(concernKeyFromParam('thinning')).toBe('thinning');
    expect(concernKeyFromParam('hair_fall')).toBeNull();
    expect(concernKeyFromParam('')).toBeNull();
  });

  it('round-trips every catalog concern', () => {
    for (const c of CONCERNS) {
      expect(concernKeyFromParam(concernUrlSlug(c.slug))).toBe(c.slug);
    }
  });

  it('has a legacy redirect for every catalog concern key with an underscore', () => {
    const withUnderscore = CONCERNS.map((c) => c.slug).filter((s) => s.includes('_'));
    expect([...LEGACY_CONCERN_KEYS].sort()).toEqual([...withUnderscore].sort());
    expect(legacyConcernRedirects()).toContainEqual({
      source: '/concerns/hair_fall',
      destination: '/concerns/hair-fall',
      permanent: true,
    });
    for (const r of legacyConcernRedirects()) expect(r.destination).not.toContain('_');
  });
});
