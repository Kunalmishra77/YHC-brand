import type { MetadataRoute } from 'next';
import { clientEnv } from '@/lib/env';

export default function robots(): MetadataRoute.Robots {
  const base = clientEnv.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Private routes are protected by auth and X-Robots-Tag (proxy); this only saves crawl budget.
      disallow: ['/account', '/doctor', '/sales', '/admin', '/demo', '/api', '/r/', '/consult/', '/cart', '/checkout', '/order/'],
    },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
