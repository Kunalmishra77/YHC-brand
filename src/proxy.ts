import { NextResponse, type NextRequest } from 'next/server';
import { DEMO_ACCESS_COOKIE, DEMO_SIG_COOKIE, hasDemoAccess, isStaffRole, verifySession } from '@/lib/demo-gate';
import { DEMO_COOKIE, DEMO_CUSTOMER_COOKIE, isAppRole } from '@/lib/demo-session';
import type { AppRole } from '@/lib/domain/types';

/*
 * Next 16 "proxy" (formerly middleware): role gates per route group (TRD §5.3).
 * Server actions and handlers re-check with requireRole() — this is only the first layer.
 * Demo (ADR-33): the session cookies must carry a valid signature and staff portals need the demo
 * access code; every app route is sent with X-Robots-Tag: noindex (audit SEC-08).
 */

const GATES: { prefix: string; roles: AppRole[] }[] = [
  { prefix: '/account', roles: ['customer'] },
  { prefix: '/doctor', roles: ['doctor', 'admin'] },
  { prefix: '/sales', roles: ['sales', 'admin'] },
  { prefix: '/admin', roles: ['admin', 'ops'] },
];

const demoMode = process.env.DEMO_MODE?.trim() === 'true';

function noindex(res: NextResponse): NextResponse {
  res.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return res;
}

async function sessionRole(request: NextRequest): Promise<AppRole | null> {
  // TODO(phase-01): refresh the Supabase session here (@supabase/ssr) and read role + aal from it;
  // aal1 doctor/admin sessions go to the MFA challenge.
  if (!demoMode) return null;
  const role = request.cookies.get(DEMO_COOKIE)?.value;
  if (!role || !isAppRole(role)) return null;
  const customerId = role === 'customer' ? (request.cookies.get(DEMO_CUSTOMER_COOKIE)?.value ?? null) : null;
  if (role === 'customer' && !customerId) return null;
  if (!(await verifySession(role, customerId, request.cookies.get(DEMO_SIG_COOKIE)?.value))) return null;
  if (isStaffRole(role) && !(await hasDemoAccess(request.cookies.get(DEMO_ACCESS_COOKIE)?.value))) return null;
  return role;
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const gate = GATES.find((g) => pathname === g.prefix || pathname.startsWith(`${g.prefix}/`));
  if (!gate) return noindex(NextResponse.next());

  const role = await sessionRole(request);
  if (!role) {
    // Patients sign in through the journey; staff through the demo access code.
    const login = new URL(demoMode ? (gate.prefix === '/account' ? '/start' : '/demo') : '/auth/login', request.url);
    if (gate.prefix !== '/account') login.searchParams.set('next', `${pathname}${search}`);
    return noindex(NextResponse.redirect(login));
  }
  if (!gate.roles.includes(role)) {
    return noindex(NextResponse.rewrite(new URL('/forbidden', request.url), { status: 403 }));
  }
  // Ops is limited to orders/shipments inside /admin (TRD §5.3).
  if (role === 'ops' && gate.prefix === '/admin' && !pathname.startsWith('/admin/orders')) {
    return noindex(NextResponse.redirect(new URL('/admin/orders', request.url)));
  }
  return noindex(NextResponse.next());
}

export const config = {
  matcher: [
    '/account/:path*',
    '/doctor/:path*',
    '/sales/:path*',
    '/admin/:path*',
    '/demo/:path*',
    '/consult/:path*',
    '/r/:path*',
    '/order/:path*',
    '/cart',
    '/checkout/:path*',
    '/forbidden',
  ],
};
