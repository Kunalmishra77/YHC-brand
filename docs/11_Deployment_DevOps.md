# 11 · Deployment & DevOps

## 1. Environments

| Env | Web | Database | Payments | Messaging | URL |
|---|---|---|---|---|---|
| local | `pnpm dev` | `supabase start` (Docker) | Razorpay test | `WHATSAPP_PROVIDER=log` | localhost:3000 |
| staging | Vercel preview/staging branch | Supabase project `yhc-staging` (Mumbai) | Razorpay test | test number / sandbox | staging.yourhaircompany.com |
| production | Vercel production | Supabase project `yhc-prod` (Mumbai, Pro + PITR recommended) | Razorpay live | approved number | yourhaircompany.com |

Portals live on the same domain under `/doctor`, `/sales`, `/admin` (ADR-1). Optional later: `portal.` subdomain.

## 2. Git & CI/CD
- Branches: `main` (production), `staging`, feature branches `feat/<phase>-<short-name>`; PRs into `staging`, release PR `staging → main`.
- Conventional commits referencing FR IDs: `feat(M3): slot hold endpoint [FR-M3-5]`.
- GitHub Actions (`.github/workflows/ci.yml`, created in Phase 00):
  1. install (pnpm cache) → typecheck → lint → unit tests
  2. integration tests with `supabase start` in CI
  3. build
  4. on `staging`/`main`: `supabase db push` to the matching project (needs `SUPABASE_ACCESS_TOKEN`, `SUPABASE_DB_PASSWORD`, project refs as secrets)
  5. Playwright E2E against the deployed staging URL (on `staging` only)
- Vercel: Git integration; production deploys from `main`; function region `bom1`; environment variables per environment.

## 3. Secrets
- Stored in Vercel env + GitHub Actions secrets; never committed. `.env.example` lists every key.
- Rotate Razorpay, WhatsApp, Supabase service keys before launch and on staff changes.
- `ENCRYPTION_KEY` (32-byte base64) for OAuth tokens; `LINK_SIGNING_SECRET` (32-byte) for signed links; `CRON_SECRET` for cron endpoints.

## 3a. Job runner (pg_cron → /api/cron/jobs)
Per Supabase project (staging, prod), in SQL editor:
1. `create extension if not exists pg_cron; create extension if not exists pg_net;`
2. Store secrets in Vault: `select vault.create_secret('https://<domain>/api/cron/jobs','jobs_url'); select vault.create_secret('<CRON_SECRET>','cron_secret');`
3. Run the commented `cron.schedule('yhc-run-jobs', '* * * * *', …)` block from `supabase/migrations/20261002000002_storage_and_cron.sql`.
4. Verify in Admin › Jobs that "last run" updates every minute.
Fallback if pg_cron is unavailable: Vercel Cron (Pro plan allows per-minute) or an external pinger (e.g., Upstash QStash schedule) calling the same endpoint with the bearer secret.

## 4. Supabase configuration checklist
- [ ] Region Mumbai (ap-south-1) · [ ] Phone auth on, OTP 6 digits, 300 s expiry · [ ] Send SMS hook → `/api/hooks/send-sms`
- [ ] Email auth for staff, invite-only (disable public email sign-ups) · [ ] TOTP MFA enabled
- [ ] Site URL + redirect URLs (local, staging, prod) · [ ] Storage buckets created by migration · [ ] RLS verified (behaviour script)
- [ ] Database backups on; PITR on for production · [ ] Network restrictions for DB (if available on plan) · [ ] Realtime enabled for `leads`, `payments`, `tasks`, `appointments`

## 5. Monitoring & alerting
| Signal | Tool | Alert |
|---|---|---|
| Errors | Sentry (PII scrubbing; no request bodies on clinical routes) | New issue in payments/booking → email + WhatsApp to tech lead |
| Uptime | Better Stack / UptimeRobot on `/api/health` (DB + Razorpay reachability) | 2 failures in a row |
| Jobs | Admin › Jobs (failed count, oldest pending) + daily digest | > 10 failed or oldest pending > 5 min |
| Webhooks | Admin › Webhooks (signature failures, processing errors) | Any signature failure spike |
| Payments | Daily reconciliation report (captured in Razorpay vs `payments`) | Any mismatch |

## 6. Backups & recovery
- Supabase daily backups; PITR (production). Quarterly restore drill to a scratch project (first drill before launch).
- Storage: clinical bucket replicated via Supabase backups; weekly export of `clinical` bucket listing for integrity check.
- RPO ≤ 24 h (≤ minutes with PITR), RTO ≤ 4 h.

## 7. Go-live runbook (Phase 12)
1. Freeze: release PR approved; all release gates green (docs/10 §5).
2. Production env vars set; Razorpay **live** keys + live webhook secret; webhooks registered to production URLs.
3. WhatsApp templates approved on production number; DLT templates live; Resend domain verified.
4. Google Calendar connected for Dr. Tyagi (production OAuth app published/internal).
5. Shiprocket pickup location verified with one real shipment of a low-value item to a team address (then refunded).
6. Run `supabase db push` to prod; run seed (settings, plans, templates); create staff accounts (MFA set up in person).
7. Enable pg_cron job; confirm jobs running.
8. Real end-to-end test with a team member: book ₹500 (live) → consult → plan → refund both.
9. DNS switch; monitor Sentry, jobs, webhooks closely for 72 h; daily standup with client for 2 weeks.
10. Turn on `guarantee.enabled` only when the approved policy is active.

## 8. Alternative hosting (if Vercel is not used)
Dockerfile (Next.js standalone output) on a VPS (Mumbai region) behind Caddy/Nginx with TLS; PM2 or Docker restart policy; the job runner stays the same (pg_cron calls the public endpoint). Keep Supabase managed for Auth/Storage/Realtime.
