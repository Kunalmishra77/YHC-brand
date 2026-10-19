/*
 * Concern URLs (SEO-05). Concern keys (`hair_fall`, `receding_hairline`, …) stay snake_case everywhere
 * in data, enums and validation; only the public URL is hyphenated (`/concerns/hair-fall`).
 * This module has no imports so `next.config.ts` can use it for the legacy redirects.
 */

/** Old underscore concern URLs that must 301 to their hyphenated form. Kept in sync with the catalog by a test. */
export const LEGACY_CONCERN_KEYS = ['hair_fall', 'receding_hairline', 'crown_thinning', 'dandruff_scalp'] as const;

/** URL segment for a concern key (or an already-hyphenated slug): `hair_fall` → `hair-fall`. */
export function concernUrlSlug(keyOrSlug: string): string {
  return keyOrSlug.replaceAll('_', '-');
}

/** Public path of a concern page: `concernPath('hair_fall')` → `/concerns/hair-fall`. */
export function concernPath(keyOrSlug: string): string {
  return `/concerns/${concernUrlSlug(keyOrSlug)}`;
}

/**
 * Concern key for a route param. Only the canonical hyphenated form resolves; an underscore param
 * returns null so the old URL never renders a duplicate page (it is redirected instead).
 */
export function concernKeyFromParam(param: string): string | null {
  if (!param || param.includes('_')) return null;
  return param.replaceAll('-', '_');
}

/** Permanent redirects from the old underscore URLs (used by `next.config.ts`). */
export function legacyConcernRedirects(): { source: string; destination: string; permanent: true }[] {
  return LEGACY_CONCERN_KEYS.map((key) => ({
    source: `/concerns/${key}`,
    destination: concernPath(key),
    permanent: true,
  }));
}
