# Your Hair Company — Platform

Doctor-led hair-care platform: website + shop, ₹500 video consultation booking, Doctor Portal, one-tap plan purchase, Sales CRM, WhatsApp automation, refill/reorder and a tracked money-back guarantee.

**New here? Open [`START_HERE.md`](START_HERE.md).**

| | |
|---|---|
| Blueprint | [`docs/00_Project_Blueprint.md`](docs/00_Project_Blueprint.md) |
| Requirements (PRD) | [`docs/01_PRD.md`](docs/01_PRD.md) |
| Technical design (TRD) | [`docs/02_TRD.md`](docs/02_TRD.md) |
| Build plan | [`phases/`](phases/) |
| What we need from the client | [`docs/12_What_We_Need.md`](docs/12_What_We_Need.md) |
| Progress | [`PROGRESS.md`](PROGRESS.md) |
| Approved deck | [`docs/reference/YHC_Approved_Strategy_Deck.pdf`](docs/reference/YHC_Approved_Strategy_Deck.pdf) |

## Stack
Next.js (App Router, TypeScript) · Tailwind + shadcn/ui · Supabase (Mumbai) · Razorpay · WhatsApp (BSP / Meta Cloud API) · MSG91 · Resend · LiveKit · Google Calendar · Shiprocket · Vercel.

## Run the demo prototype (no keys needed)
```bash
cp .env.example .env.local      # keep DEMO_MODE=true
pnpm install
pnpm dev                        # http://localhost:3000  ·  role switcher at /demo
```
The demo runs on in-memory sample data (ADR-23): no Supabase, payments or messages. Book a consultation
on the website (demo OTP `123456`, "Razorpay (demo)" payment), then open `/demo` and switch to Dr. Tyagi,
Sales or Admin to see it arrive. Data resets when the server restarts (or via `/demo` › Reset sample data).
Run it as a single process (`pnpm dev` or `pnpm build && pnpm start`); serverless hosts would split the in-memory state.

## Run locally with Supabase (from Phase 01)
Docker is not used locally (ADR-22): development uses a hosted Supabase project `yhc-dev` (Mumbai).
```bash
# .env.local: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY,
#             SUPABASE_PROJECT_REF, SUPABASE_DB_PASSWORD, SUPABASE_ACCESS_TOKEN
pnpm db:link                    # once
pnpm db:config                  # push auth settings from supabase/config.toml (test OTPs, TOTP, no email signup)
pnpm db:reset                   # WIPES yhc-dev, applies migrations + seed.sql
pnpm db:types                   # regenerate src/lib/database.types.ts
pnpm dev
```
Checks: `pnpm typecheck && pnpm lint && pnpm test` · E2E: `pnpm test:e2e` (starts `pnpm dev` if nothing runs on :3000).

## Repository layout
```
docs/        product + technical documentation
phases/      build plan, one file per phase, each with a paste-ready Claude Code prompt
supabase/    migrations (schema, RLS, functions), seed, SQL behaviour checks
design/      brand tokens
src/         application (created in Phase 00)
tests/       unit, integration, e2e (created in Phase 00)
```
