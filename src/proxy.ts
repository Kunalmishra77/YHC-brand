import { NextResponse, type NextRequest } from 'next/server';
import { DEMO_COOKIE, isAppRole } from '@/lib/demo-session';
import type { AppRole } from '@/lib/domain/types';

/*
 * Next 16 "proxy" (formerly middleware): role gates per route group (TRD §5.3).
 * Server actions and handlers re-check with requireRole() — this is only the first layer.
 */

const GATES: { prefix: string; roles: AppRole[] }[] = [
  { prefix: '/account', roles: ['customer'] },
  { prefix: '/doctor', roles: ['doctor', 'admin'] },
  { prefix: '/sales', roles: ['sales', 'admin'] },
  { prefix: '/admin', roles: ['admin', 'ops'] },
];

const demoMode = process.env.DEMO_MODE?.trim() === 'true';

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const gate = GATES.find((g) => pathname === g.prefix || pathname.startsWith(`${g.prefix}/`));
  if (!gate) return NextResponse.next();

  // TODO(phase-01): refresh the Supabase session here (@supabase/ssr) and read role + aal from it;
  // aal1 doctor/admin sessions go to the MFA challenge.
  const role = demoMode ? request.cookies.get(DEMO_COOKIE)?.value : undefined;

  if (!role || !isAppRole(role)) {
    const login = new URL(demoMode ? '/demo' : '/auth/login', request.url);
    login.searchParams.set('next', `${pathname}${search}`);
    return NextResponse.redirect(login);
  }
  if (!gate.roles.includes(role)) {
    return NextResponse.rewrite(new URL('/forbidden', request.url), { status: 403 });
  }
  // Ops is limited to orders/shipments inside /admin (TRD §5.3).
  if (role === 'ops' && gate.prefix === '/admin' && !pathname.startsWith('/admin/orders')) {
    return NextResponse.redirect(new URL('/admin/orders', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/account/:path*', '/doctor/:path*', '/sales/:path*', '/admin/:path*'],
};
