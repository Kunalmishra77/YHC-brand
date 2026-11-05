import 'server-only';

import { cache } from 'react';
import type { Json } from '@/lib/database.types';
import type { AppRole } from '@/lib/domain/types';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

/*
 * Platform helpers on the real database (ADR-36): settings, domain events (outbox), audit log.
 * Never put clinical content into event payloads or audit rows — ids and outcomes only.
 */

/** A setting's JSON value (settings table, seeded by migrations), or `fallback`. Cached per request. */
export const getLiveSetting = cache(async (key: string): Promise<Json | null> => {
  const { data } = await createSupabaseAdminClient().from('settings').select('value').eq('key', key).maybeSingle();
  return data?.value ?? null;
});

export async function emitEvent(type: string, entity: string, entityId: string, payload: Json = {}): Promise<void> {
  const { error } = await createSupabaseAdminClient().rpc('emit_event', {
    p_type: type,
    p_entity: entity,
    p_entity_id: entityId,
    p_payload: payload,
  });
  if (error) throw new Error(`emit_event failed: ${error.code ?? 'unknown'}`);
}

export async function audit(input: {
  actorId: string | null;
  actorRole: AppRole | null;
  action: string;
  entity: string;
  entityId: string;
}): Promise<void> {
  await createSupabaseAdminClient().from('audit_logs').insert({
    actor_id: input.actorId,
    actor_role: input.actorRole,
    action: input.action,
    entity: input.entity,
    entity_id: input.entityId,
  });
}
