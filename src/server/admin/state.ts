import 'server-only';

import type { GuaranteePolicy, Plan, Product, StaffUser } from '@/lib/domain/types';
import { GUARANTEE_POLICY, PLANS, PRODUCTS, STAFF } from '@/server/demo/fixtures';
import { resetDemo } from '@/server/demo/store';

/*
 * Admin-only demo state that the shared store does not model yet (refund records, journey
 * toggles, data requests, guarantee versions). Lives in process memory like the store (ADR-23)
 * and is cleared by "Reset demo data". Catalog, staff and guarantee edits mutate the fixture
 * objects in place so every surface sees them; the originals are snapshotted here for reset.
 */

export interface RefundRecord {
  id: string;
  target: string; // order or appointment code
  kind: 'order' | 'consult';
  amountPaise: number;
  full: boolean;
  reason: string;
  actor: string;
  at: string;
}

export interface Journey {
  key: string;
  label: string;
  trigger: string;
  templates: string[];
  quietHours: boolean;
  enabled: boolean;
}

export interface DataRequest {
  id: string;
  customerId: string;
  kind: 'access' | 'correction' | 'erasure' | 'grievance';
  status: 'open' | 'in_progress' | 'closed';
  openedAt: string;
  dueAt: string;
}

export interface AdminState {
  refunds: RefundRecord[];
  journeys: Journey[];
  dataRequests: DataRequest[];
  merged: { fromId: string; intoId: string; at: string }[];
  policyHistory: GuaranteePolicy[];
  policyDraft: GuaranteePolicy | null;
  seq: number;
}

/** docs/08 + FR-M8-4 journey list. Quiet hours apply to scheduled non-urgent ones (FR-M8-7). */
const DEFAULT_JOURNEYS: Omit<Journey, 'enabled'>[] = [
  {
    key: 'booking_confirmed',
    label: 'Booking confirmed',
    trigger: '₹500 captured',
    templates: ['booking_confirmed', 'booking_confirmed_email'],
    quietHours: false,
  },
  {
    key: 'intake_reminders',
    label: 'Intake reminders',
    trigger: 'T-24 h / T-3 h if intake or photos missing',
    templates: ['intake_reminder'],
    quietHours: false,
  },
  {
    key: 'consult_reminders',
    label: 'Consultation reminders',
    trigger: 'T-24 h and T-1 h',
    templates: ['consult_reminder_24h', 'consult_reminder_1h'],
    quietHours: false,
  },
  {
    key: 'plan_ready',
    label: 'Plan ready + unpaid nudge',
    trigger: 'Recommendation sent; nudge after 24 h unpaid',
    templates: ['plan_ready', 'plan_unpaid_nudge'],
    quietHours: true,
  },
  {
    key: 'order_updates',
    label: 'Order confirmed / shipped / delivered',
    trigger: 'Order paid, shipped, delivered',
    templates: ['order_confirmed', 'order_shipped', 'order_delivered'],
    quietHours: false,
  },
  {
    key: 'care_checkins',
    label: 'Care check-ins (weeks 1–4)',
    trigger: 'Weekly after delivery, 10:00 IST',
    templates: ['care_checkin'],
    quietHours: true,
  },
  {
    key: 'progress_photos',
    label: 'Monthly progress photo request',
    trigger: 'Every 30 days after delivery',
    templates: ['progress_photo_request'],
    quietHours: true,
  },
  {
    key: 'refill_reminders',
    label: 'Refill reminders',
    trigger: 'Plan end −7 / −4 / −1 days, 10:00 IST',
    templates: ['refill_reminder'],
    quietHours: true,
  },
  {
    key: 'followup_due',
    label: 'Follow-up consultation due',
    trigger: 'Follow-up week reached',
    templates: ['followup_consult_due'],
    quietHours: true,
  },
  {
    key: 'guarantee_updates',
    label: 'Guarantee claim updates',
    trigger: 'Claim status change',
    templates: ['guarantee_claim_update'],
    quietHours: false,
  },
];

interface Snapshot {
  products: Product[];
  plans: Plan[];
  staff: StaffUser[];
  policy: GuaranteePolicy;
}

const g = globalThis as unknown as { __yhcAdmin?: AdminState; __yhcAdminSnapshot?: Snapshot };

g.__yhcAdminSnapshot ??= structuredClone({
  products: PRODUCTS,
  plans: PLANS,
  staff: STAFF,
  policy: GUARANTEE_POLICY,
});

function fresh(): AdminState {
  const now = Date.now();
  return {
    refunds: [],
    journeys: DEFAULT_JOURNEYS.map((j) => ({ ...j, enabled: true })),
    dataRequests: [
      {
        id: 'dr-1',
        customerId: 'cus-s4',
        kind: 'access',
        status: 'open',
        openedAt: new Date(now - 2 * 86_400_000).toISOString(),
        dueAt: new Date(now + 28 * 86_400_000).toISOString(),
      },
      {
        id: 'dr-2',
        customerId: 'cus-s0',
        kind: 'correction',
        status: 'closed',
        openedAt: new Date(now - 12 * 86_400_000).toISOString(),
        dueAt: new Date(now + 18 * 86_400_000).toISOString(),
      },
    ],
    merged: [],
    policyHistory: [],
    policyDraft: null,
    seq: 0,
  };
}

export function adminState(): AdminState {
  g.__yhcAdmin ??= fresh();
  return g.__yhcAdmin;
}

export function nextAdminId(prefix: string): string {
  const s = adminState();
  s.seq += 1;
  return `${prefix}-${s.seq}`;
}

/** Resets the shared demo store, admin extras and every fixture edited from /admin. */
export function resetAllDemoData(): void {
  resetDemo();
  g.__yhcAdmin = fresh();
  const snap = g.__yhcAdminSnapshot;
  if (!snap) return;
  for (const original of structuredClone(snap.products)) {
    const live = PRODUCTS.find((p) => p.id === original.id);
    if (live) Object.assign(live, original);
  }
  for (const original of structuredClone(snap.plans)) {
    const live = PLANS.find((p) => p.id === original.id);
    if (live) Object.assign(live, original);
  }
  STAFF.splice(0, STAFF.length, ...structuredClone(snap.staff));
  Object.assign(GUARANTEE_POLICY, structuredClone(snap.policy));
}
