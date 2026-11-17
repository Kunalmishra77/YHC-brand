import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { DEMO_ACCESS_COOKIE, DEMO_SIG_COOKIE, hasDemoAccess, isStaffRole, verifySession } from '@/lib/demo-gate';
import { DEMO_COOKIE, DEMO_CUSTOMER_COOKIE, isAppRole } from '@/lib/demo-session';
import type { AppRole } from '@/lib/domain/types';

/*
 * Next 16 "proxy" (formerly middleware): first layer of the route gates (TRD §5.3). Pages, actions and
 * handlers re-check with requireRole() — never trust this alone.
 * Real mode (ADR-36): refreshes the Supabase session here on our server (browsers never call
 * *.supabase.co) and only checks that someone is signed in; the role is checked by the page.
 * Hidden for now (ADR-36): doctor + admin portals, consultations, booking, cart/checkout, plan links.
 * Every app route is sent with X-Robots-Tag: noindex (audit SEC-08).
 */

const GATES: { prefix: string; roles: AppRole[] }[] = [
  { prefix: '/account', roles: ['customer'] },
  { prefix: '/sales', roles: ['sales', 'admin'] },
];

/** Routes switched off with the doctor flow and the shop (ADR-36) — the code stays for later. */
const HIDDEN = ['/doctor', '/admin', '/consult', '/book', '/cart', '/checkout', '/r', '/order', '/assessment'];

const demoMode = process.env.DEMO_MODE?.trim() === 'true';

function noindex(res: NextResponse): NextResponse {
  res.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return res;
}

const matches = (pathname: string, prefix: string) => pathname === prefix || pathname.startsWith(`${prefix}/`);

async function demoRole(request: NextRequest): Promise<AppRole | null> {
  const role = request.cookies.get(DEMO_COOKIE)?.value;
  if (!role || !isAppRole(role)) return null;
  const customerId = role === 'customer' ? (request.cookies.get(DEMO_CUSTOMER_COOKIE)?.value ?? null) : null;
  if (role === 'customer' && !customerId) return null;
  if (!(await verifySession(role, customerId, request.cookies.get(DEMO_SIG_COOKIE)?.value))) return null;
  if (isStaffRole(role) && !(await hasDemoAccess(request.cookies.get(DEMO_ACCESS_COOKIE)?.value))) return null;
  return role;
}

/** Refreshes the Supabase session cookies; returns whether a user is signed in. */
async function refreshSupabase(request: NextRequest, response: { current: NextResponse }): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return false;
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (toSet) => {
        for (const { name, value } of toSet) request.cookies.set(name, value);
        response.current = NextResponse.next({ request });
        for (const { name, value, options } of toSet) response.current.cookies.set(name, value, options);
      },
    },
  });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return Boolean(user);
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (HIDDEN.some((p) => matches(pathname, p)) || (!demoMode && matches(pathname, '/demo'))) {
    return noindex(NextResponse.redirect(new URL(pathname.startsWith('/doctor') ? '/doctor-tyagi' : '/start', request.url)));
  }

  const gate = GATES.find((g) => matches(pathname, g.prefix));

  if (demoMode) {
    if (!gate) return noindex(NextResponse.next());
    const role = await demoRole(request);
    if (!role) {
      const login = new URL(gate.prefix === '/account' ? '/start' : '/demo', request.url);
      if (gate.prefix !== '/account') login.searchParams.set('next', `${pathname}${search}`);
      return noindex(NextResponse.redirect(login));
    }
    if (!gate.roles.includes(role)) return noindex(NextResponse.rewrite(new URL('/forbidden', request.url), { status: 403 }));
    return noindex(NextResponse.next());
  }

  const response = { current: NextResponse.next({ request }) };
  const signedIn = await refreshSupabase(request, response);
  if (gate && !signedIn) {
    const login = new URL(gate.prefix === '/account' ? '/start?signin=1' : '/auth/login', request.url);
    if (gate.prefix !== '/account') login.searchParams.set('next', `${pathname}${search}`);
    return noindex(NextResponse.redirect(login));
  }
  return noindex(response.current);
}

export const config = {
  matcher: [
    '/account/:path*',
    '/doctor/:path*',
    '/sales/:path*',
    '/admin/:path*',
    '/demo/:path*',
    '/consult/:path*',
    '/book/:path*',
    '/r/:path*',
    '/order/:path*',
    '/cart',
    '/checkout/:path*',
    '/assessment/:path*',
    '/start/:path*',
    '/auth/:path*',
    '/forbidden',
  ],
};
