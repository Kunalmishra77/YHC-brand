import { NextResponse } from 'next/server';
import { clientEnv } from '@/lib/env';
import { serverEnv } from '@/lib/env.server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function checkDb(): Promise<boolean | 'demo'> {
  if (!clientEnv.NEXT_PUBLIC_SUPABASE_URL || !serverEnv.SUPABASE_SERVICE_ROLE_KEY) {
    return serverEnv.DEMO_MODE ? 'demo' : false;
  }
  try {
    const { error } = await createSupabaseAdminClient().from('settings').select('key').limit(1);
    return !error;
  } catch {
    return false;
  }
}

export async function GET() {
  const db = await checkDb();
  const ok = db !== false;
  return NextResponse.json(
    { ok, db, demo: serverEnv.DEMO_MODE, time: new Date().toISOString() },
    { status: ok ? 200 : 503 },
  );
}
