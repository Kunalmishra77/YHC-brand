'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { DEMO_COOKIE, DEMO_CUSTOMER_COOKIE, DEMO_DEFAULT_CUSTOMER_ID } from '@/lib/demo-session';
import { AppError } from '@/lib/errors';
import { serverEnv } from '@/lib/env.server';
import { resetDemo } from '@/server/demo/store';

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

export async function switchDemoRole(formData: FormData) {
  assertDemo();
  const { role, next } = schema.parse({
    role: formData.get('role'),
    next: formData.get('next') || undefined,
  });
  const jar = await cookies();
  const opts = { httpOnly: true, sameSite: 'lax' as const, path: '/', maxAge: 60 * 60 * 12 };
  jar.set(DEMO_COOKIE, role, opts);
  if (role === 'customer' && !jar.get(DEMO_CUSTOMER_COOKIE))
    jar.set(DEMO_CUSTOMER_COOKIE, DEMO_DEFAULT_CUSTOMER_ID, opts);
  const target = next && !next.startsWith('//') ? next : HOME[role];
  redirect(target ?? '/');
}

export async function signOutDemo() {
  assertDemo();
  const jar = await cookies();
  jar.delete(DEMO_COOKIE);
  jar.delete(DEMO_CUSTOMER_COOKIE);
  redirect('/demo');
}

export async function resetDemoData() {
  assertDemo();
  resetDemo();
  redirect('/demo?reset=1');
}
