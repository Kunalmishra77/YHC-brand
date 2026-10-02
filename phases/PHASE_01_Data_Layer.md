# Phase 01 · Data layer, events & job runner

**Goal:** the schema is live locally with types, dev seed data, typed data helpers, RLS tests, and the platform plumbing every later phase uses: settings, audit, consents, domain events dispatch and the job runner.
**Depends on:** Phase 00. **FRs:** foundation for all; M5-1 (staff auth + MFA), M14-1, M14-4 (helpers).
**Time:** 2–3 days.

## Tasks
- [ ] **1.1 Plan** (read `docs/04`, `docs/02` §6.8, migration files). Wait for OK.
- [ ] **1.2 Apply + verify schema.** `supabase db reset`. Run `supabase/tests/manual/01_behaviour_check.sql` against the local DB (psql on port 54322; skip `00_local_stub.sql` — real auth exists; if `auth.users` inserts need extra columns, adapt the test inserts, not the migration). All NOTICE lines must say PASS.
- [ ] **1.3 Types.** `pnpm db:types` → `src/lib/database.types.ts`; typed helpers `Tables<'orders'>`, enums.
- [ ] **1.4 Dev seed script** `scripts/seed-dev.ts` (uses service role, idempotent): staff users with email+password (doctor `doctor@yhc.test`, `sales1@yhc.test`, `sales2@yhc.test`, `ops@yhc.test`, `admin@yhc.test`), roles set, doctor row (Dr. Tyagi test, reg `TEST-REG-0001`), availability Mon–Sat 10:00–13:00 & 16:00–19:00 IST, 4 products (2 consultation-only, 1 care product with price, 1 supplement), 2 protocol templates, 5 customers with phones matching `test_otp` numbers, leads at various stages. `scripts/create-staff.ts` CLI for real staff invites.
- [ ] **1.5 Server platform modules** (`src/server/`, all `import 'server-only'`):
  - `settings.ts`: `getSetting<T>(key, zodSchema)` with 60 s in-memory cache; `setSetting` (admin, audited).
  - `audit.ts`: `audit({ action, entity, entityId, before?, after? })` using request IP + actor.
  - `consents.ts`: `recordConsents(customerId, kinds[], version, source, meta)`; policy versions in `src/content/policy-versions.ts`.
  - `events/emit.ts`: `emitEvent(type, entity, id, payload)` (inserts `domain_events`); `events/dispatch.ts`: loads unprocessed events in id order, routes to `events/handlers/<type>.ts` registry, marks processed / error; handlers must be idempotent.
  - `jobs/schedule.ts`: `scheduleJob(kind, runAt, payload, dedupeKey?)` (on conflict do nothing), `cancelJobs(prefix)`.
  - `jobs/runner.ts`: `runOnce({ budgetMs: 25000 })` → dispatch events → `claim_jobs` → handler registry (`jobs/handlers/*.ts`) → done/retry backoff [1, 5, 15, 60] min/failed → `expire_stale_holds`.
  - `app/api/cron/jobs/route.ts`: POST with `Authorization: Bearer CRON_SECRET` → `runOnce`; returns counts.
  - A `noop` job kind and a `system.ping` event handler for tests.
- [ ] **1.5b Staff auth + MFA** (moved here so Admin screens work from Phase 02): `/auth/login` (email + password), forced TOTP enrolment on first login for doctor/admin (QR + verify), `/auth/mfa` challenge for aal1 sessions, sign-out, password reset email, 12 h session. Middleware sends doctor/admin aal1 sessions to `/auth/mfa`. Remember the DB already ignores doctor/admin rights at aal1 (`has_role`, `current_doctor_id`), so test both layers. On deactivation (`profiles.is_active=false`) also sign the user out everywhere (`auth.admin.signOut` / ban).
- [ ] **1.6 Domain types & validation**: `src/lib/validation/` base schemas (E.164 Indian phone, pincode, paise, IST date), `src/server/domain/*.ts` small typed accessors (getCustomerByPhone, upsertCustomer, ensureLead) used by later phases.
- [ ] **1.7 RLS integration tests** (Vitest, `tests/integration/rls.test.ts`): sign in as each seeded role (password for staff; OTP test code for customer) and assert the matrix in `docs/04` §4 (at least: customer sees own appointment only; sales cannot select intake/media/consultations/prescriptions/assessments or base `recommendations`; doctor **aal1 sees nothing clinical**, aal2 sees own; doctor cannot select leads; anon can read plans + public settings but not customers; non-admin cannot change role/is_active; sales cannot change `customers.profile_id`; sales cannot set system lead stages).
- [ ] **1.8 Runner tests**: scheduling with dedupe, retries/backoff, stuck-job recovery, event dispatch idempotency.
- [ ] **1.9 Local cron**: document how to trigger the runner locally (`pnpm jobs:tick` script calling the endpoint every 60 s in a loop) since pg_cron isn't used locally.
- [ ] **1.10** Update `docs/04` if anything changed; `PROGRESS.md`.

## Acceptance criteria
1. Behaviour SQL all PASS on local Supabase; RLS integration tests green.
2. `pnpm seed:dev` can run twice without errors or duplicates.
3. `POST /api/cron/jobs` without the bearer → 401; with it → processes a scheduled `noop` job and a test event exactly once.
4. Types regenerate cleanly and the app builds.

## Paste-ready prompt
```
Read CLAUDE.md, then phases/PHASE_01_Data_Layer.md and docs/04_Database_Schema.md.
Give me your plan for Phase 01 first, wait for my OK, then execute task by task with tests,
committing after each task and updating PROGRESS.md.
```
