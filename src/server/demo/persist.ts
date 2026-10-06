import 'server-only';

import { after } from 'next/server';
import { clientEnv } from '@/lib/env';
import { serverEnv } from '@/lib/env.server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { resetAllDemoData } from '@/server/admin/state';
import { GUARANTEE_POLICY, PLANS, PRODUCTS, STAFF } from './fixtures';

/*
 * DEMO ONLY (ADR-29). Serverless hosts run several instances, each with its own memory, so the
 * in-memory demo store is mirrored to one Supabase row (`public.demo_state`):
 *   - ensureDemoState() at the start of a request loads the shared snapshot if it is newer;
 *   - after the response, the snapshot is written back if this request changed anything.
 * Without Supabase keys this is a no-op and the demo stays purely in memory (local dev).
 */

const ROW_ID = 'default';

interface Globals {
  __yhcDemo?: unknown;
  __yhcJourneys?: { journeys: Map<string, unknown>; seq: number };
  __yhcAdmin?: unknown;
  __yhcKeptConsultPayments?: Map<string, string>;
  __yhcDemoSync?: { version: number; serialized: string | null; checkedAt: number };
}

interface Snapshot {
  demo: unknown;
  journeys: { seq: number; entries: [string, unknown][] } | null;
  admin: unknown;
  kept: [string, string][];
  catalog: { products: unknown[]; plans: unknown[]; staff: unknown[]; policy: Record<string, unknown> };
}

const g = globalThis as unknown as Globals;

function enabled() {
  return Boolean(
    serverEnv.DEMO_MODE && clientEnv.NEXT_PUBLIC_SUPABASE_URL && serverEnv.SUPABASE_SERVICE_ROLE_KEY,
  );
}

function sync() {
  g.__yhcDemoSync ??= { version: -1, serialized: null, checkedAt: 0 };
  return g.__yhcDemoSync;
}

function capture(): Snapshot {
  return {
    demo: g.__yhcDemo ?? null,
    journeys: g.__yhcJourneys
      ? { seq: g.__yhcJourneys.seq, entries: [...g.__yhcJourneys.journeys.entries()] }
      : null,
    admin: g.__yhcAdmin ?? null,
    kept: g.__yhcKeptConsultPayments ? [...g.__yhcKeptConsultPayments.entries()] : [],
    catalog: {
      products: PRODUCTS,
      plans: PLANS,
      staff: STAFF,
      policy: GUARANTEE_POLICY as unknown as Record<string, unknown>,
    },
  };
}

function replaceArray(target: unknown[], next: unknown[]) {
  target.splice(0, target.length, ...next);
}

function restore(snapshot: Snapshot) {
  if (snapshot.demo) g.__yhcDemo = snapshot.demo;
  if (snapshot.journeys) {
    g.__yhcJourneys = { seq: snapshot.journeys.seq, journeys: new Map(snapshot.journeys.entries) };
  }
  if (snapshot.admin) g.__yhcAdmin = snapshot.admin;
  g.__yhcKeptConsultPayments = new Map(snapshot.kept);
  // Admin edits mutate the catalog fixtures in place; mirror that.
  replaceArray(PRODUCTS, snapshot.catalog.products);
  replaceArray(PLANS, snapshot.catalog.plans);
  replaceArray(STAFF, snapshot.catalog.staff);
  Object.assign(GUARANTEE_POLICY, snapshot.catalog.policy);
}

/**
 * Call at the start of every request that reads or writes demo data (portal/journey pages and
 * server actions — wired into getSessionUser, requireRole and the journey/booking guards).
 */
export async function ensureDemoState(): Promise<void> {
  if (!enabled()) return;
  const s = sync();
  if (Date.now() - s.checkedAt < 250) {
    after(persistIfChanged);
    return; // already checked during this request burst
  }
  try {
    const supabase = createSupabaseAdminClient();
    const { data: head } = await supabase.from('demo_state').select('version').eq('id', ROW_ID).maybeSingle();
    if (head && head.version > s.version) {
      const { data } = await supabase.from('demo_state').select('state, version').eq('id', ROW_ID).single();
      if (data) {
        restore(data.state as Snapshot);
        s.version = data.version;
        s.serialized = JSON.stringify(capture());
      }
    } else if (s.serialized === null) {
      // First request on this instance and nothing stored yet: remember the seed as the baseline.
      s.serialized = JSON.stringify(capture());
    }
    s.checkedAt = Date.now();
  } catch {
    // Never break a page because the snapshot is unreachable; fall back to local memory.
    return;
  }
  after(persistIfChanged);
}

async function persistIfChanged(): Promise<void> {
  const s = sync();
  const serialized = JSON.stringify(capture());
  if (serialized === s.serialized) return;
  // Time-based versions stay monotonic across instances, including after a reset.
  const version = Math.max(Date.now(), s.version + 1);
  try {
    const { error } = await createSupabaseAdminClient()
      .from('demo_state')
      .upsert({ id: ROW_ID, version, state: JSON.parse(serialized), updated_at: new Date().toISOString() });
    if (!error) {
      s.version = version;
      s.serialized = serialized;
    }
  } catch {
    // Best effort: the next change retries.
  }
}

/** Reset every demo store on this instance and the shared snapshot (/demo and /admin › Reset). */
export async function resetSharedDemo(): Promise<void> {
  resetAllDemoData();
  g.__yhcJourneys = undefined;
  g.__yhcKeptConsultPayments = undefined;
  if (!enabled()) return;
  try {
    await createSupabaseAdminClient().from('demo_state').delete().eq('id', ROW_ID);
  } finally {
    const s = sync();
    s.version = -1;
    s.serialized = null;
  }
}
