import type { MetadataRoute } from 'next';
import { clientEnv } from '@/lib/env';

export default function robots(): MetadataRoute.Robots {
  const base = clientEnv.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/account', '/doctor', '/sales', '/admin', '/demo', '/api', '/r/', '/consult', '/auth'],
    },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
