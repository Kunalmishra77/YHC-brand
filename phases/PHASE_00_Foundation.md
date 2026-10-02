# Phase 00 · Foundation

**Goal:** a running, typed, linted, tested Next.js + Supabase skeleton with role-gated route groups, design tokens wired in, CI green. No product features yet.
**Depends on:** nothing. **Inputs from docs/12:** GitHub repo (or local only), Sentry DSN (optional), nothing else.
**Time:** 3–4 days.

## Tasks
- [ ] **0.1 Plan.** Read `CLAUDE.md`, `docs/00`, `docs/02` §2–5 and §11–12, `docs/11` §1–2. Post a short plan; wait for approval.
- [ ] **0.2 Git.** `git init` if needed; first commit of the kit as-is (`chore: project kit`); branch `feat/phase-00-foundation`.
- [ ] **0.3 Scaffold Next.js WITHOUT touching existing files.** The repo root already has docs. Run `create-next-app` (latest, TypeScript, ESLint, Tailwind, App Router, `src/` dir, import alias `@/*`, pnpm, non-interactive) into `./.scaffold-tmp`, then move its contents into the root. Rules: never overwrite `README.md`, `CLAUDE.md`, `docs/`, `phases/`, `supabase/`, `design/`, `.claude/`, `.gitignore`, `.env.example`; merge `.gitignore` entries; delete `.scaffold-tmp`.
- [ ] **0.4 TypeScript strict:** `strict`, `noUncheckedIndexedAccess`, `noImplicitOverride`. Path alias `@/*`.
- [ ] **0.5 Dependencies** (latest stable; record versions in `PROGRESS.md`): `@supabase/supabase-js @supabase/ssr zod react-hook-form @hookform/resolvers date-fns date-fns-tz clsx tailwind-merge class-variance-authority lucide-react motion server-only pino`; dev: `vitest @vitest/coverage-v8 @testing-library/react @testing-library/jest-dom jsdom @playwright/test msw prettier prettier-plugin-tailwindcss supabase` (CLI as dev dep).
- [ ] **0.6 shadcn/ui** init (New York style, CSS variables) + add: button, input, label, form, select, checkbox, radio-group, dialog, sheet, dropdown-menu, tabs, badge, card, table, toast/sonner, tooltip, skeleton, avatar, separator, textarea, calendar, popover, command.
- [ ] **0.7 Design tokens.** Import `design/tokens.css` in `src/app/globals.css`; add the `@theme inline` mapping from `docs/07` §4; map shadcn variables to tokens; load **Cormorant Garamond** + **DM Sans** with `next/font/google` as CSS variables.
- [ ] **0.8 Env.** `src/lib/env.ts`: zod schema split into `serverEnv` (import `server-only`) and `clientEnv` (`NEXT_PUBLIC_*`), validated at import; mark integration keys optional until their phase (`.optional()` with TODO). Copy `.env.example` → `.env.local` instructions in README.
- [ ] **0.9 Supabase.** `supabase init` (keep existing `migrations/` and `seed.sql`; if it refuses because the folder exists, generate `config.toml` in a temp dir and move it in). In `config.toml`: project_id `yhc-platform`, auth site_url `http://localhost:3000`, enable phone auth with **test OTP** for dev numbers (`[auth.sms.test_otp]` `919000000001 = "123456"` etc.), disable public email signup, enable MFA TOTP. `supabase start` + `supabase db reset` must succeed.
- [ ] **0.10 Supabase clients** in `src/lib/supabase/`: `browser.ts` (anon), `server.ts` (cookies, RLS user), `admin.ts` (service role, `import 'server-only'`). ESLint `no-restricted-imports`: `@/lib/supabase/admin` only allowed in `src/server/**` and `src/app/api/**`.
- [ ] **0.11 Utilities with unit tests:** `lib/money.ts` (`paise`, `formatINR` with Indian grouping, `rupeesToPaise`), `lib/time.ts` (`IST`, `toIST`, `istDate`, `startOfIstDay`, `formatIst`), `lib/result.ts` (`ok/err` types), `lib/errors.ts` (`AppError`).
- [ ] **0.12 Route skeleton** (placeholder pages + layouts): `(site)/page.tsx`, `account/`, `doctor/`, `sales/`, `admin/`, `auth/login`, `api/health/route.ts` (checks DB with a trivial query; returns `{ ok, db, time }`).
- [ ] **0.13 Middleware & RBAC.** `src/middleware.ts`: refresh Supabase session; gate `/account` (customer), `/doctor` (doctor|admin, aal2), `/sales` (sales|admin), `/admin` (admin|ops; aal2 for admin). `lib/rbac.ts`: `getSessionUser()`, `requireRole(roles, { aal2? })` for server actions/handlers. Unauthenticated → `/auth/login?next=`; wrong role → 403 page.
- [ ] **0.14 Tooling.** Prettier config; ESLint rules (no default exports outside app routes, no `any`); `package.json` scripts: `dev, build, start, lint, typecheck, format, test, test:watch, test:e2e, db:start, db:reset, db:types, seed:dev, lint:claims` (`lint:claims` placeholder script that exits 0 — real in Phase 12).
- [ ] **0.15 Testing setup.** Vitest (jsdom for components, node for server), Playwright config (projects: mobile Chrome Pixel 7, desktop Chrome), one smoke E2E (home renders, `/api/health` ok).
- [ ] **0.16 CI.** `.github/workflows/ci.yml`: pnpm install → typecheck → lint → unit tests → build; second job runs `supabase start` + `db reset` + integration tests (empty suite ok).
- [ ] **0.17 Observability.** Sentry (`@sentry/nextjs`) with DSN optional; `beforeSend` scrubs PII (phone, email, body on `/api/booking|intake|uploads|webhooks`). `pino` logger with request id.
- [ ] **0.18 Docs.** README "Run locally" section; update `PROGRESS.md`.

## Acceptance criteria
1. `pnpm dev` serves `/` (placeholder with tokens + fonts visible), `/api/health` → `{ ok: true, db: true }` with local Supabase running.
2. `pnpm typecheck && pnpm lint && pnpm test && pnpm build` pass locally and in CI.
3. `supabase db reset` applies both migrations and seed without errors.
4. Visiting `/doctor` logged out redirects to login; importing `@/lib/supabase/admin` from a client component fails lint.
5. No existing kit file was overwritten (git diff shows only additions/merges).

## Paste-ready prompt
```
Read CLAUDE.md, then phases/PHASE_00_Foundation.md. Follow "How to run a phase" in CLAUDE.md:
give me your plan for Phase 00 first (max 25 lines), wait for my OK, then execute task by task,
committing after each task and updating PROGRESS.md. Do not overwrite any existing kit files.
```
