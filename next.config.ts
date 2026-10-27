import type { NextConfig } from 'next';
import { legacyConcernRedirects } from './src/lib/concern-path';

/*
 * Security headers (audit SEC-04). The CSP allows inline scripts/styles because Next.js App Router
 * inlines its bootstrap data without nonces; everything else is same-origin, plus the hosts the site
 * actually uses (Supabase; GA4 + Meta Pixel only load after cookie consent — BIZ-01).
 */
const isDev = process.env.NODE_ENV !== 'production';

// Public content pages may be framed by the AI Agentix portfolio; booking, cart,
// checkout, orders, accounts, the doctor/sales/admin portals and the API stay unframeable.
const PORTFOLIO_FRAME_ANCESTORS =
  process.env.PORTFOLIO_FRAME_ANCESTORS ?? 'https://agentix-portfolio.vercel.app https://ai-agentix.com https://*.ai-agentix.com';
const PUBLIC_PAGES =
  'about|assessment|blog|concerns|contact|doctor-tyagi|faqs|guarantee|how-it-works|legal|plans|privacy-policy|products|refund-policy|results|science|start|stories|terms-and-conditions';

const cspDirectives = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''} https://www.googletagmanager.com https://connect.facebook.net`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://www.google-analytics.com https://www.googletagmanager.com https://www.facebook.com",
  "media-src 'self' blob:",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://www.google-analytics.com https://*.analytics.google.com https://*.google-analytics.com https://connect.facebook.net https://www.facebook.com",
  "frame-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
];

const lockedHeaders = [
  { key: 'Content-Security-Policy', value: [...cspDirectives, "frame-ancestors 'none'"].join('; ') },
  { key: 'X-Frame-Options', value: 'DENY' },
];
const publicHeaders = [
  { key: 'Content-Security-Policy', value: [...cspDirectives, `frame-ancestors 'self' ${PORTFOLIO_FRAME_ANCESTORS}`].join('; ') },
];

const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Camera for the guided scalp scan, camera + microphone for the video consultation.
  { key: 'Permissions-Policy', value: 'camera=(self), microphone=(self), geolocation=(), payment=(self), usb=(), interest-cohort=()' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      { source: '/', headers: [...securityHeaders, ...publicHeaders] },
      { source: `/:page(${PUBLIC_PAGES})/:rest*`, headers: publicHeaders },
      { source: `/((?!(?:${PUBLIC_PAGES})(?:/|$)).+)`, headers: lockedHeaders },
    ];
  },
  // SEO-05: concern URLs moved from /concerns/hair_fall to /concerns/hair-fall.
  async redirects() {
    return [
      ...legacyConcernRedirects(),
      // FUN-03: the standalone quiz was a second entry funnel; its questions live inside /start now.
      { source: '/assessment', destination: '/start', permanent: true },
      // ADR-34: the powder is no longer sold; its old page moves to the range.
      { source: '/products/hair-regrowth-powder', destination: '/products', permanent: true },
    ];
  },
};

export default nextConfig;
