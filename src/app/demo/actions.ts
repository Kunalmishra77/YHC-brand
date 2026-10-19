'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { DEMO_DEFAULT_CUSTOMER_ID } from '@/lib/demo-session';
import { checkAccessCode } from '@/lib/demo-gate';
import { AppError } from '@/lib/errors';
import { serverEnv } from '@/lib/env.server';
import { rateLimit } from '@/server/demo/rate-limit';
import { resetSharedDemo } from '@/server/demo/persist';
import { clearDemoSession, grantDemoAccess, requireDemoAccess, setDemoSession } from '@/server/demo/session';

const HOME: Record<string, string> = {
  customer: '/account',
  doctor: '/doctor',
  sales: '/sales',
  ops: '/admin/orders',
  admin: '/admin',
};

const schema = z.object({
  role: z.enum(['customer', 'doctor', 'sales', 'ops', 'admin']),
  next: z.string().startsWith('/').optional(),
});

function assertDemo() {
  if (!serverEnv.DEMO_MODE) throw new AppError('not_found', 'Not found', 404);
}

const safeNext = (next: string | undefined) => (next && next.startsWith('/') && !next.startsWith('//') ? next : '');

/** Access-code form on /demo (ADR-33). Wrong codes are rate limited per client address. */
export async function unlockDemo(formData: FormData) {
  assertDemo();
  const next = safeNext(String(formData.get('next') ?? ''));
  const ip = (await headers()).get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'local';
  if (!rateLimit(`demo-unlock:${ip}`, 8, 15 * 60 * 1000)) {
    redirect(`/demo?error=limit${next ? `&next=${encodeURIComponent(next)}` : ''}`);
  }
  if (!(await checkAccessCode(String(formData.get('code') ?? '')))) {
    redirect(`/demo?error=code${next ? `&next=${encodeURIComponent(next)}` : ''}`);
  }
  await grantDemoAccess();
  redirect(next ? `/demo?next=${encodeURIComponent(next)}` : '/demo');
}

export async function switchDemoRole(formData: FormData) {
  assertDemo();
  await requireDemoAccess();
  const { role, next } = schema.parse({
    role: formData.get('role'),
    next: formData.get('next') || undefined,
  });
  await setDemoSession(role, role === 'customer' ? DEMO_DEFAULT_CUSTOMER_ID : null);
  redirect(safeNext(next) || (HOME[role] ?? '/'));
}

export async function signOutDemo() {
  assertDemo();
  await clearDemoSession();
  redirect('/demo');
}

export async function resetDemoData() {
  assertDemo();
  await requireDemoAccess();
  await resetSharedDemo();
  redirect('/demo?reset=1');
}
