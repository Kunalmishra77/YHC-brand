import { describe, expect, it } from 'vitest';
import sitemap from './sitemap';

describe('sitemap (SEO-01, SEO-05)', () => {
  const paths = sitemap().map((e) => new URL(e.url).pathname);

  it('lists every public marketing page', () => {
    for (const p of ['/', '/start', '/science', '/results', '/concerns', '/products', '/blog', '/legal']) {
      expect(paths, p).toContain(p);
    }
  });

  it('uses hyphenated concern URLs only', () => {
    expect(paths).toContain('/concerns/hair-fall');
    expect(paths.filter((p) => p.startsWith('/concerns/') && p.includes('_'))).toEqual([]);
  });

  it('excludes portals, journey sub-steps and transactional pages', () => {
    const banned = /^\/(account|doctor\/|sales|admin|demo|api|r\/|consult|cart|checkout|order|auth|start\/|book|assessment)/;
    expect(paths.filter((p) => banned.test(p))).toEqual([]);
  });

  it('has no duplicate URLs', () => {
    expect(new Set(paths).size).toBe(paths.length);
  });
});
