// Deletes the shared live-demo snapshot (public.demo_state, ADR-29) so the hosted demo restarts from
// seed data only — audit SEC-02 (visitor submissions purged). Demo data only; no other table is touched.
// Reads NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY from .env.local (never printed).
// Usage: node scripts/purge-demo-state.mjs
import { readFileSync } from 'node:fs';

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8')
    .split(/\r?\n/)
    .filter((l) => l.includes('=') && !l.startsWith('#'))
    .map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1).trim()]),
);
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error('Supabase URL / service key missing in .env.local');

const headers = { apikey: key, Authorization: `Bearer ${key}` };
const before = await fetch(`${url}/rest/v1/demo_state?select=id,version,updated_at`, { headers });
console.log('rows before:', await before.json());
const res = await fetch(`${url}/rest/v1/demo_state?id=eq.default`, { method: 'DELETE', headers });
console.log('delete status:', res.status);
const after = await fetch(`${url}/rest/v1/demo_state?select=id`, { headers });
console.log('rows after:', await after.json());
