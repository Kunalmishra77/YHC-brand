# SQL behaviour checks

`01_behaviour_check.sql` exercises the concurrency-critical SQL functions and the RLS matrix.

**Against local Supabase (Phase 01 onward):**
```bash
supabase db reset
psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" -f supabase/tests/manual/01_behaviour_check.sql
```
Every `NOTICE` must say `PASS`; result columns are named with the expected value (e.g. `c1_sees_own_appts_1` should be 1).
The script inserts test rows — run it on a fresh `db reset`, never on staging/production.

**Against plain Postgres 16 (no Supabase):** create an empty database, run `00_local_stub.sql` (fake `auth`, `storage`, roles), then both migrations, `seed.sql`, then `01_behaviour_check.sql`. This is how the schema was verified before Phase 00.

Convert these into pgTAP tests (`supabase test db`) in Phase 12.
