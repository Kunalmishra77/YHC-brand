import { redirect } from 'next/navigation';
import { serverEnv } from '@/lib/env.server';

export const metadata = { title: 'Staff sign in', robots: { index: false } };

// TODO(phase-01): staff email + password + TOTP; customers sign in by OTP (phase 03).
export default async function LoginPage(props: PageProps<'/auth/login'>) {
  const sp = await props.searchParams;
  if (serverEnv.DEMO_MODE)
    redirect(`/demo${typeof sp.next === 'string' ? `?next=${encodeURIComponent(sp.next)}` : ''}`);
  return (
    <main className="flex min-h-dvh items-center justify-center bg-pearl px-4">
      <p className="text-body">Staff sign-in arrives in Phase 01.</p>
    </main>
  );
}
