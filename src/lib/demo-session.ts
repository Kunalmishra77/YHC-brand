import type { AppRole } from '@/lib/domain/types';

/** Demo-only session (ADR-23). Replaced by Supabase Auth in Phase 01/03. */
export const DEMO_COOKIE = 'yhc_demo_role';
export const DEMO_CUSTOMER_COOKIE = 'yhc_demo_customer';
export const DEMO_DEFAULT_CUSTOMER_ID = 'cus-s0';

const ROLES: readonly AppRole[] = ['customer', 'doctor', 'sales', 'ops', 'admin'];

export function isAppRole(value: string): value is AppRole {
  return (ROLES as readonly string[]).includes(value);
}

const DEMO_USERS: Record<AppRole, { id: string; name: string }> = {
  customer: { id: 'u-customer', name: 'Rahul Mehra' },
  doctor: { id: 'u-doctor', name: 'Dr. Anil Tyagi' },
  sales: { id: 'u-priya', name: 'Priya Sharma' },
  ops: { id: 'u-arjun', name: 'Arjun Mehta' },
  admin: { id: 'u-admin', name: 'Kavya Iyer' },
};

export function demoUserFor(role: AppRole, customerId: string | null) {
  const u = DEMO_USERS[role];
  return {
    id: u.id,
    name: u.name,
    role,
    aal: 'aal2' as const, // demo staff are treated as TOTP-verified
    customerId: role === 'customer' ? (customerId ?? DEMO_DEFAULT_CUSTOMER_ID) : null,
  };
}
