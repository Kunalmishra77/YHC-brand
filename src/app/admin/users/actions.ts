'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { runAdminAction, type ActionResult } from '@/server/admin/guard';
import { changeRole, inviteStaff, setActive } from '@/server/admin/users';

const role = z.enum(['doctor', 'sales', 'ops', 'admin']);
const inviteSchema = z.object({ email: z.email('Enter a valid email.').max(120), role });

export async function inviteStaffAction(input: z.infer<typeof inviteSchema>): Promise<ActionResult> {
  return runAdminAction(['admin'], inviteSchema, input, (data, user) => {
    const u = inviteStaff(data.email, data.role, user.name);
    revalidatePath('/admin/users');
    return `Invite sent to ${u.email} (demo — no email leaves the server)`;
  });
}

const roleSchema = z.object({ role });

export async function changeRoleAction(
  userId: string,
  input: z.infer<typeof roleSchema>,
): Promise<ActionResult> {
  return runAdminAction(['admin'], roleSchema, input, (data, user) => {
    const u = changeRole(userId, data.role, user.id, user.name);
    revalidatePath('/admin/users');
    return `${u.name} is now ${u.role} · audited`;
  });
}

const activeSchema = z.object({ active: z.boolean() });

export async function setActiveAction(
  userId: string,
  input: z.infer<typeof activeSchema>,
): Promise<ActionResult> {
  return runAdminAction(['admin'], activeSchema, input, (data, user) => {
    const u = setActive(userId, data.active, user.id, user.name);
    revalidatePath('/admin/users');
    return `${u.name} ${u.active ? 'reactivated' : 'deactivated'} · audited`;
  });
}
