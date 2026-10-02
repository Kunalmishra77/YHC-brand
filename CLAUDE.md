# CLAUDE.md — Your Hair Company platform

You are building the **Your Hair Company (YHC)** platform: a doctor-led hair-care e-commerce + teleconsultation + retention system for Dr. Tyagi. Scope is approved; build exactly what the docs say.

## Read before any work
1. `docs/00_Project_Blueprint.md` — the map.
2. The current phase file in `phases/` — your task list.
3. Only the doc sections the phase file points to (PRD module, TRD sections). Don't load every doc every time.
4. `PROGRESS.md` — what is already done and any notes from the previous session.

## How to run a phase
1. **Plan first.** Summarise the phase in ≤ 25 lines: tasks in order, files you'll create/change, migrations, tests, open questions, anything blocked by `docs/12_What_We_Need.md`. **Wait for the user's OK.**
2. Work **task by task** in the order listed. For each task: implement → write/adjust tests → run `pnpm typecheck && pnpm lint && pnpm test` (and integration tests when DB code changed) → fix → commit (`feat(M3): slot hold endpoint [FR-M3-5]`) → tick the task in the phase file and add a line to `PROGRESS.md`.
3. If something in the docs is wrong, contradictory or missing: stop, explain the problem and propose a fix; record the agreed change in `docs/15_Decisions.md`. Don't silently invent scope.
4. If a client input is missing (keys, content, decisions), build against the interface/mock, mark the gap with `// TODO(client): <what> — see docs/12 <row>` and list it in `PROGRESS.md` → "Waiting on client".
5. End of phase: run the phase's acceptance criteria, report results (pass/fail per item), update `PROGRESS.md`, and suggest the next phase.

## Stack (details: docs/02 §2)
Next.js (latest stable, App Router, TypeScript strict) · Tailwind v4 + shadcn/ui · Supabase (Postgres, Auth, Storage, Realtime; Mumbai) · zod · react-hook-form · Razorpay · WhatsApp adapter (existing BSP or Meta Cloud) · MSG91 · Resend + React Email · LiveKit (Meet fallback) · Google Calendar · Shiprocket · @react-pdf/renderer · Upstash ratelimit · Sentry · Vitest · Playwright · pnpm.

## Commands
```
pnpm dev            # app on :3000
pnpm db:start       # supabase start (Docker)
pnpm db:reset       # apply migrations + seed.sql
pnpm db:types       # regenerate src/lib/database.types.ts
pnpm seed:dev       # dev users/doctor/products (idempotent)
pnpm jobs:tick      # run the job runner locally every 60 s
pnpm typecheck && pnpm lint && pnpm test
pnpm test:e2e
```

## Architecture rules (non-negotiable)
- **Server decides money.** Bookings/orders become paid/booked only through SQL `capture_payment()` (called by `processCapturedPayment()` from the webhook, server verify or reconciliation). `processCapturedPayment()` has no side effects — those live in event handlers for `appointment.booked`, `appointment.slot_lost`, `order.paid`. Never from a browser redirect. Recompute every price on the server; ignore client amounts.
- **Idempotency everywhere**: webhooks via `webhook_events(provider,event_id)`; jobs via `dedupe_key`; event handlers safe to run twice.
- **Concurrency in SQL**: use `hold_slot`, `capture_payment`, `confirm_appointment_payment`, `mark_order_paid`, `advance_lead_stage`, `set_lead_stage_manual`, `claim_jobs`, `cancel_jobs`, `mark_order_delivered`. Don't re-implement them in TypeScript.
- **MFA is enforced in the database**: doctor/admin rights need an `aal2` session. When testing as a doctor/admin, sign in with TOTP or the DB returns nothing.
- **Events**: every important state change calls `emitEvent()`; CRM stages, messages, analytics react to events in handlers — not inline in UI code.
- **RLS is the safety net, not the plan**: check roles in server actions/handlers too (`requireRole`). Service-role client (`@/lib/supabase/admin`) only in `src/server/**` and `src/app/api/**`.
- **Clinical data** (intake, photos, assessments, consultations, prescriptions, dosage) is never shown to sales (they use `v_sales_*` views), never put in WhatsApp text, email subjects, calendar events, logs or Sentry. Patient-facing consult summaries never include `private_notes`. Every clinical view → `audit('clinical.view')`.
- **Adapters** for every provider (`src/server/integrations/*`), with a `log`/mock implementation for dev and tests.
- **Settings over constants**: time windows, offsets, fees and toggles come from the `settings` table (`getSetting`), seeded in `supabase/seed.sql`.
- **Guarantee** terms come from the active `guarantee_policies` row; everything guarantee-related is hidden while `guarantee.enabled = false`.

## Code conventions
- TypeScript strict, no `any`, no non-null assertions without a comment. Named exports (default only for Next.js route files).
- Money: integer **paise** (`*_paise`); format with `formatINR()` at the edge. Time: store UTC, compute business dates in `Asia/Kolkata` via `lib/time.ts`.
- Validation: zod schemas in `src/lib/validation/` shared by forms and server.
- Server modules start with `import 'server-only'`.
- Errors: throw `AppError(code, message, status)`; route handlers return `{ error: { code, message } }`; never leak stack traces.
- UI: components from `src/components/ui` + `shared`; tokens from `design/tokens.css`; mobile-first; every list has empty/loading/error states; status chips always include words.
- Copy: no "cure", "100%", "guaranteed regrowth", "permanent", "miracle", "no side effects", fixed timelines, invented reviews. Guarantee always mentioned with its conditions. (PRD §15)
- Strings via `t()` from `src/i18n/en.ts`.
- Tests: unit tests next to domain logic (`*.test.ts`), integration in `tests/integration`, E2E in `tests/e2e`. Every bug fix gets a test.
- Migrations: new file per change (`supabase migration new`), never edit an applied migration; every new table gets RLS + policies + a line in `docs/04`.

## Ask the user before
- Installing anything not listed in `docs/02` §2 (say why).
- Changing the database schema beyond what the phase file lists.
- Deleting files, rewriting git history, force-pushing.
- Anything touching production, live keys, real customer data, or sending real messages to real numbers.
- Changing medical wording, guarantee terms, prices or legal text.

## Definition of done (every task)
Typecheck, lint and tests pass · acceptance criteria met · no secrets in code · RLS/role checks in place · loading/empty/error states · mobile layout checked at 360 px · `PROGRESS.md` updated · committed with FR IDs.

## Where things are
`docs/01_PRD.md` (FR IDs) · `docs/02_TRD.md` (architecture, algorithms) · `docs/03_User_Flows.md` · `docs/04_Database_Schema.md` · `docs/05_API_Spec.md` · `docs/06_Integrations.md` · `docs/07_Design_System.md` + `design/tokens.css` · `docs/08_Messaging_Templates.md` · `docs/09_Compliance.md` · `docs/10_Testing_QA.md` · `docs/11_Deployment_DevOps.md` · `docs/12_What_We_Need.md` · `docs/15_Decisions.md` · `docs/reference/YHC_Approved_Strategy_Deck.pdf`.
