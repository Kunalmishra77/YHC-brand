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

## Run locally (after Phase 00)
```bash
cp .env.example .env.local      # fill what you have; integrations can stay empty in dev
pnpm install
pnpm db:start && pnpm db:reset  # local Supabase with schema + seed
pnpm seed:dev                   # dev doctor, staff, customers, products
pnpm dev                        # http://localhost:3000
pnpm jobs:tick                  # (separate terminal) runs background jobs every minute
```
Dev logins and test OTP numbers are printed by `pnpm seed:dev`.

## Repository layout
```
docs/        product + technical documentation
phases/      build plan, one file per phase, each with a paste-ready Claude Code prompt
supabase/    migrations (schema, RLS, functions), seed, SQL behaviour checks
design/      brand tokens
src/         application (created in Phase 00)
tests/       unit, integration, e2e (created in Phase 00)
```
