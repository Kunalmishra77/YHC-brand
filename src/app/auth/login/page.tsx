import { redirect } from 'next/navigation';
import { Logo } from '@/components/shared/logo';
import { StaffLoginForm } from '@/components/shared/staff-login-form';
import { serverEnv } from '@/lib/env.server';
import { getSessionUser } from '@/lib/rbac';

export const metadata = { title: 'Staff sign in', robots: { index: false } };

export const dynamic = 'force-dynamic';

/** Staff sign-in (ADR-36): the sales team's shared login. Customers sign in by email code on /start. */
export default async function LoginPage(props: PageProps<'/auth/login'>) {
  const sp = await props.searchParams;
  const next = typeof sp.next === 'string' ? sp.next : undefined;
  if (serverEnv.DEMO_MODE) redirect(`/demo${next ? `?next=${encodeURIComponent(next)}` : ''}`);
  const user = await getSessionUser();
  if (user?.role === 'sales' || user?.role === 'admin') redirect('/sales');

  return (
    <main className="flex min-h-dvh items-center justify-center bg-pearl px-4 py-12">
      <div className="w-full max-w-sm rounded-[28px] bg-white p-7 shadow-raised ring-1 ring-line">
        <Logo className="h-10" />
        <h1 className="mt-6 font-display text-[30px] leading-tight font-medium text-ink">Team sign in</h1>
        <p className="mt-1 mb-6 text-sm text-muted-foreground">For the Your Hair Company sales team.</p>
        <StaffLoginForm next={next} />
      </div>
    </main>
  );
}
