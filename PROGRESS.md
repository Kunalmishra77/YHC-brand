# PROGRESS

Claude Code updates this file after every task. Humans update "Waiting on client" and sign-offs.

## Status
| Phase | Status | Branch | Started | Done | Acceptance |
|---|---|---|---|---|---|
| 00 Foundation | 🟡 Done except Supabase link/reset (waiting on yhc-dev keys) and Sentry (deferred) | feat/phase-00-foundation | 2026-10-02 | | 1 ✅ 2 ✅ (CI not run: no remote) 3 ⏳ 4 ✅ 5 ✅ |
| ★ Demo prototype (ADR-23) | ✅ All surfaces clickable on sample data | feat/phase-00-foundation | 2026-10-02 | 2026-10-02 | 70 routes 200/307/403 as intended; build ✅ |
| 01 Data layer | ⏳ | | | | |
| 02 Design system & website | ⏳ | | | | |
| 03 OTP, catalog & checkout | ⏳ | | | | |
| 04 Consultation booking | ⏳ | | | | |
| 05 Doctor Portal | ⏳ | | | | |
| 06 Recommendation & purchase | ⏳ | | | | |
| 07 Sales CRM | ⏳ | | | | |
| 08 Messaging & automation | ⏳ | | | | |
| 09 Fulfilment, care & refill | ⏳ | | | | |
| 10 Account & guarantee | ⏳ | | | | |
| 11 Admin & analytics | ⏳ | | | | |
| 12 Hardening & launch | ⏳ | | | | |

## Kit baseline (before Phase 00)
- 2026-10-02 · Schema migration + seed executed and behaviour-tested on Postgres 16 (stub auth/storage): holds, idempotent payment capture, late payments, credit consumption, reorder dates, lead stage rules + manual guard, jobs, RLS matrix incl. MFA-at-DB, hijack/escalation/reactivation blocks — all PASS (`supabase/tests/manual/`).
- 2026-10-02 · Independent review of the kit (35 findings: RLS gaps, payment atomicity, phase ordering, templates) — all addressed in schema + docs before handover (see docs/15 ADR-16…21).

## Log
<!-- YYYY-MM-DD · phase.task · what changed · FR IDs · tests -->
- 2026-10-02 · 00.2–0.8 · Next 16.3.8 scaffold (no kit files overwritten), strict TS, ESLint/Prettier, tokens + fonts, shadcn/ui, zod env · — · typecheck/lint ✅
- 2026-10-02 · 00.10–0.13 · Supabase browser/server/admin clients (+ lint restriction verified), money/time/result/errors utils, route skeleton, proxy role gates + requireRole, /api/health · — · unit ✅
- 2026-10-02 · 00.9/0.14–0.18 · supabase/config.toml (test OTP, TOTP, no email signup, 12 h session), scripts incl. CLI wrapper for hosted yhc-dev, Vitest + Playwright (smoke spec), CI workflow, pino logger, README · — · ✅
- 2026-10-02 · demo · pure domain logic reused later: availability engine, CRM stage map, plan pricing, guarantee eligibility, reorder guard, KPIs · FR-M3-2, FR-M7-3, FR-M6-4, FR-M11-4, FR-M10-5, FR-M13-1 · 82 unit/action tests ✅
- 2026-10-02 · demo · website, booking + checkout + /r + consult room, account, Doctor Portal, Sales CRM, Admin on in-memory store; role switcher /demo · M1–M14 (see commits) · build ✅, route sweep ✅

- 2026-10-05 · demo v2 (client brief) · trust/science-led site: video hero + glass start form, science/results/guarantee pages, sourced media (Mixkit/Unsplash, CREDITS.md); patient journey Details → 3D scan (demo) → assessment → health form → slot + ₹500 → portal → consult; scan in doctor + patient portals; footer + real Privacy/Terms/Refund text · ADR-26..28 · 88 tests ✅, build ✅, journey walked in browser ✅
- 2026-10-10 · demo v3 (client brief) · homepage rebuilt in the client's 15-section order (editorial "Hair Bureau" style, per-section visuals, seamless marquees, sticky journey stepper); 3D scan rebuilt as 7 guided zones (Forehead L/C/R, Top, Crown, Parting, Back; Forehead–Centre + Crown required, ≥ 4 captured) with camera sheet + upload fallback; testimonials consent-gated (none yet) · ADR-31 · 97 tests ✅, build ✅, 1440 + 390 px review ✅, 7-zone journey walked (scripts/journey-check.mjs) ✅

## Installed versions
Node 22.18.0 · pnpm 11.11.0 · Next 16.3.8 · React 19.2.8 · TypeScript 5 · Tailwind 4 · shadcn/ui (new-york, radix-ui) · zod 4.6.5 · @supabase/supabase-js 2.117.2 · @supabase/ssr 0.12.7 · supabase CLI 2.119.0 · react-hook-form 7.89 · date-fns 4.4 · date-fns-tz 3.2 · lucide-react 1.49 · motion 13.4 · pino 10.3 · vitest 5.0.3 · @playwright/test 1.63 · msw 3.0.1 · sonner, cmdk, react-day-picker, tw-animate-css (shadcn deps)

## Waiting on client (mirror of docs/12)
- [ ] D-P1 Guarantee terms
- [ ] D-P2 Product regulatory categories + licences
- [ ] D-P3 ₹500 credit confirmation
- [ ] D-P4 Consult cancellation/refund rules
- [ ] D-P5 Follow-up consult fee
- [ ] D-P6 Reorder validity
- [ ] D-P7 WhatsApp provider/number + API docs
- [ ] D-P8 Delivery SLA, pickup address, packaging
- [ ] D-P9 Consult-fee GST treatment
- [ ] D-P14 GST on plan orders (single line vs split)
- [ ] Razorpay test keys · [ ] Supabase projects (`yhc-dev` keys → .env.local, ADR-22) · [ ] Vercel team · [ ] Domain DNS access
- [ ] Dr. Tyagi photos, bio, registration no., signature · [ ] Product data & photos · [ ] Logo SVGs

## Decisions taken during build
- ADR-22 hosted Supabase `yhc-dev` instead of local Docker
- ADR-23 demo prototype first (DEMO_MODE, in-memory store, /demo role switcher)
- ADR-24 `muted`/`accent` follow shadcn semantics; brand accent = `brand`

### Demo known gaps (fix when the real phase lands)
- UI strings: surface copy is inline; extract to `src/i18n/en.ts` before Phase 12.
- Demo store shortcuts written by surfaces directly to `db()` (reschedule/cancel, claims, photos, consents, refunds, job retry) — replace with SQL functions/server code per phase.
- Not visually checked at 360 px in a browser (no browser available in this session) — do a manual pass.
- In-memory state: run as one process (`pnpm dev` / `pnpm start`); not suitable for serverless hosting.
- Sentry deferred; Playwright browsers not installed (`pnpm exec playwright install` when the network allows).

## Sign-offs
| Item | By | Date |
|---|---|---|
| UAT — Dr. Tyagi | | |
| UAT — Sales | | |
| UAT — Ops | | |
| UAT — Admin | | |
| Compliance checklist | | |
| Go-live | | |
