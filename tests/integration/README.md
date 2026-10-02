# Integration tests

Vitest suites that run against a real Supabase database (CI: `supabase start` on GitHub runners;
local: the hosted `yhc-dev` project, ADR-22). First suites arrive in Phase 01 (RLS matrix, SQL functions).
Run with `pnpm test:integration`.
