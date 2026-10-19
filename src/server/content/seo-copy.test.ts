import { describe, expect, it } from 'vitest';
import { CONCERNS, PRODUCTS } from '@/server/demo/fixtures';
import { getArticles } from './articles';
import {
  CONCERN_SEO_DESCRIPTION,
  LEGAL_SEO_DESCRIPTION,
  PRODUCT_SEO_DESCRIPTION,
  SEO_DESCRIPTION_MAX,
  SEO_DESCRIPTION_MIN,
  SEO_TITLE_MAX,
  clampDescription,
} from './seo-copy';

const inRange = (s: string) => s.length >= SEO_DESCRIPTION_MIN && s.length <= SEO_DESCRIPTION_MAX;
const BANNED = /\b(cure[sd]?|100%|guaranteed regrowth|permanent|miracle|no side effects)\b/i;

describe('SEO copy (SEO-04)', () => {
  it('has a 140–155 char description for every concern and product', () => {
    for (const c of CONCERNS) {
      const d = CONCERN_SEO_DESCRIPTION[c.slug];
      expect(d, c.slug).toBeDefined();
      expect(inRange(d ?? ''), `${c.slug}: ${d?.length}`).toBe(true);
    }
    for (const p of PRODUCTS) {
      const d = PRODUCT_SEO_DESCRIPTION[p.slug];
      expect(d, p.slug).toBeDefined();
      expect(inRange(d ?? ''), `${p.slug}: ${d?.length}`).toBe(true);
    }
  });

  it('keeps legal descriptions in range', () => {
    for (const [slug, d] of Object.entries(LEGAL_SEO_DESCRIPTION)) {
      expect(inRange(d), `${slug}: ${d.length}`).toBe(true);
    }
  });

  it('gives every article a short title and an in-range description', () => {
    for (const a of getArticles()) {
      const title = a.seoTitle ?? a.title;
      expect(title.length, a.slug).toBeLessThanOrEqual(SEO_TITLE_MAX);
      const d = a.seoDescription ?? a.dek;
      expect(inRange(d), `${a.slug}: ${d.length}`).toBe(true);
    }
  });

  it('never uses banned claim words', () => {
    const all = [
      ...Object.values(CONCERN_SEO_DESCRIPTION),
      ...Object.values(PRODUCT_SEO_DESCRIPTION),
      ...Object.values(LEGAL_SEO_DESCRIPTION),
      ...getArticles().flatMap((a) => [a.seoTitle ?? '', a.seoDescription ?? '']),
    ];
    for (const s of all) expect(s).not.toMatch(BANNED);
  });

  it('clamps long text at a word boundary', () => {
    const long = 'word '.repeat(60);
    const out = clampDescription(long);
    expect(out.length).toBeLessThanOrEqual(SEO_DESCRIPTION_MAX);
    expect(out.endsWith('word…')).toBe(true);
    expect(clampDescription('Short text.')).toBe('Short text.');
  });
});
