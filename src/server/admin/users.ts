import 'server-only';

import type { AppRole, StaffUser } from '@/lib/domain/types';
import { AppError } from '@/lib/errors';
import { STAFF } from '@/server/demo/fixtures';
import { recordAudit } from '@/server/demo/store';
import { nextAdminId } from './state';

/*
 * Staff users & roles (FR-M12-1). Demo: edits the STAFF fixture in place (restored on reset).
 * Phase 01: Supabase Auth invite email + `profiles.role`; role changes audited (FR-M14-4).
 */

export type StaffRole = Exclude<AppRole, 'customer'>;
export const STAFF_ROLES: StaffRole[] = ['doctor', 'sales', 'ops', 'admin'];

function find(id: string): StaffUser {
  const u = STAFF.find((x) => x.id === id);
  if (!u) throw new AppError('not_found', 'User not found', 404);
  return u;
}

const activeAdmins = () => STAFF.filter((u) => u.role === 'admin' && u.active).length;

export function inviteStaff(email: string, role: StaffRole, actor: string): StaffUser {
  const normalized = email.trim().toLowerCase();
  if (STAFF.some((u) => u.email.toLowerCase() === normalized)) {
    throw new AppError('duplicate', 'Someone with this email is already on the team.', 409);
  }
  const local = normalized.split('@')[0] ?? normalized;
  const name = local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
  const user: StaffUser = {
    id: nextAdminId('u-invite'),
    name: name || normalized,
    email: normalized,
    role,
    active: true,
  };
  STAFF.push(user);
  recordAudit(actor, 'user.invite', `${normalized} as ${role}`);
  return user;
}

export function changeRole(id: string, role: StaffRole, actorId: string, actor: string): StaffUser {
  const u = find(id);
  if (u.role === role) return u;
  if (u.id === actorId) throw new AppError('forbidden', 'You cannot change your own role.', 403);
  if (u.role === 'admin' && activeAdmins() <= 1) {
    throw new AppError('last_admin', 'Keep at least one active admin.', 409);
  }
  recordAudit(actor, 'role.change', `${u.email}: ${u.role} → ${role}`);
  u.role = role;
  return u;
}

export function setActive(id: string, active: boolean, actorId: string, actor: string): StaffUser {
  const u = find(id);
  if (u.id === actorId) throw new AppError('forbidden', 'You cannot deactivate yourself.', 403);
  if (!active && u.role === 'admin' && activeAdmins() <= 1) {
    throw new AppError('last_admin', 'Keep at least one active admin.', 409);
  }
  u.active = active;
  recordAudit(actor, active ? 'user.reactivate' : 'user.deactivate', u.email);
  return u;
}
