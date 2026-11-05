'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { err, type Result } from '@/lib/result';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getLiveSessionUser } from '@/server/live/session';

/* Staff sign-in (ADR-36): email + password on our server; the shared sales login is care@… */

const staffLoginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter your work email'),
  password: z.string().min(8, 'Enter your password').max(200),
  next: z.string().optional(),
});

export async function staffSignInAction(raw: z.input<typeof staffLoginSchema>): Promise<Result<never>> {
  const parsed = staffLoginSchema.safeParse(raw);
  if (!parsed.success) return err('invalid_input', parsed.error.issues[0]?.message ?? 'Please check the form.');
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email: parsed.data.email, password: parsed.data.password });
  if (error) return err('bad_login', 'That email and password do not match.');
  const user = await getLiveSessionUser();
  if (!user || (user.role !== 'sales' && user.role !== 'admin')) {
    await supabase.auth.signOut();
    return err('not_staff', 'This account does not have staff access.');
  }
  const next = parsed.data.next;
  redirect(next && next.startsWith('/sales') ? next : '/sales');
}

export async function signOutAction(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect('/');
}
