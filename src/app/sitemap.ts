import type { MetadataRoute } from 'next';
import { concernPath } from '@/lib/concern-path';
import { clientEnv } from '@/lib/env';
import { LEGAL_PAGES } from '@/lib/site';
import { getConcerns, getGuarantee, getProducts } from '@/server/catalog';
import { getArticles } from '@/server/content/articles';

// Guarantee visibility is a live setting, so the list is built per request.
export const dynamic = 'force-dynamic';

/**
 * XML sitemap of public marketing pages (FR-M1-7, SEO-01). Excluded: portals, auth, demo, API,
 * /r, /consult, cart/checkout/order, journey sub-steps (/start/*, /book/intake), /book and /assessment (they
 * redirect new visitors to /start, ADR-33) and the /privacy-policy-style aliases that only redirect.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = clientEnv.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');
  const now = new Date();
  const entry = (
    path: string,
    priority: number,
    changeFrequency: 'weekly' | 'monthly' | 'yearly' = 'monthly',
  ) => ({ url: `${base}${path}`, lastModified: now, changeFrequency, priority });

  return [
    entry('/', 1, 'weekly'),
    entry('/start', 0.9),
    entry('/plans', 0.9),
    entry('/doctor-tyagi', 0.8),
    entry('/how-it-works', 0.8),
    entry('/science', 0.8),
    entry('/concerns', 0.7),
    ...getConcerns().map((c) => entry(concernPath(c.slug), 0.7)),
    entry('/products', 0.7),
    ...getProducts().map((p) => entry(`/products/${p.slug}`, 0.6)),
    entry('/results', 0.6),
    // Everything guarantee-related is hidden while guarantee.enabled = false.
    ...(getGuarantee() ? [entry('/guarantee', 0.5)] : []),
    entry('/about', 0.5),
    entry('/faqs', 0.6),
    entry('/stories', 0.4),
    entry('/blog', 0.4, 'weekly'),
    ...getArticles().map((a) => entry(`/blog/${a.slug}`, 0.4)),
    entry('/contact', 0.4),
    entry('/legal', 0.2, 'yearly'),
    ...LEGAL_PAGES.map((p) => entry(`/legal/${p.slug}`, 0.2, 'yearly')),
  ];
}
