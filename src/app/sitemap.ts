import type { MetadataRoute } from 'next';
import { clientEnv } from '@/lib/env';
import { LEGAL_PAGES } from '@/lib/site';
import { getConcerns, getProducts } from '@/server/catalog';
import { getArticles } from '@/server/content/articles';

/** XML sitemap of public marketing pages (FR-M1-7). Portals, auth and demo routes are excluded. */
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
    entry('/book', 0.9, 'weekly'),
    entry('/plans', 0.9),
    entry('/doctor-tyagi', 0.8),
    entry('/how-it-works', 0.8),
    entry('/assessment', 0.8),
    entry('/concerns', 0.7),
    ...getConcerns().map((c) => entry(`/concerns/${c.slug}`, 0.7)),
    entry('/products', 0.7),
    ...getProducts().map((p) => entry(`/products/${p.slug}`, 0.6)),
    entry('/about', 0.5),
    entry('/faqs', 0.6),
    entry('/stories', 0.4),
    entry('/blog', 0.4, 'weekly'),
    ...getArticles().map((a) => entry(`/blog/${a.slug}`, 0.4)),
    entry('/contact', 0.4),
    ...LEGAL_PAGES.map((p) => entry(`/legal/${p.slug}`, 0.2, 'yearly')),
  ];
}
