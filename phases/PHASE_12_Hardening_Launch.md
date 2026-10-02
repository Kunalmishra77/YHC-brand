# Phase 12 · Hardening, compliance & launch

**Goal:** the platform is secure, compliant, fast, fully tested, accepted by every user group, and live on production with monitoring.
**Depends on:** Phases 00–11. **Inputs:** all legal texts (counsel), live provider credentials, approved templates, DLT live, Razorpay live, UAT availability of Dr. Tyagi and team.
**FRs:** all NFRs (TRD §9–10), M14 complete, docs/09 checklist, docs/10 release gate.
**Time:** 1.5–2 weeks.

## Tasks
- [ ] **12.1 Plan.** Read TRD §9–10, `docs/09`, `docs/10`, `docs/11` §5–7. Produce the launch checklist with owners. Wait for OK.
- [ ] **12.2 Security**: security headers + CSP (allow Razorpay, LiveKit, GA, Meta domains only), Permissions-Policy (camera/mic only on consult pages), `Origin` checks on mutating route handlers, rate-limit review (OTP, booking, checkout, assessment, contact, webhooks), dependency audit, secret scan, verify service-role import rule, session/MFA settings, signed-link TTLs, PII scrubbing in Sentry/logs. Run OWASP ZAP baseline against staging; fix highs/mediums.
- [ ] **12.3 RLS & privacy**: complete RLS test suite for every table × role; clinical audit coverage; storage signed-URL TTL ≤ 5 min; no clinical text in Calendar/WhatsApp/email subjects.
- [ ] **12.4 Claims lint** `pnpm lint:claims`: scans `content/`, DB content export, `message_templates`, email templates and UI strings for banned words (PRD §15.3) and utility templates for offer words; runs in CI.
- [ ] **12.5 Compliance**: legal pages final (counsel text), grievance officer details, consent versions bumped and wired, age gate, disclosure, prescription mandatory fields, guarantee terms identical everywhere, data-request SLAs, breach response runbook (`docs/runbooks/breach.md`), retention policy doc.
- [ ] **12.6 Accessibility & performance**: axe on all key pages/portal screens; keyboard paths for booking and workspace; Lighthouse CI budgets; image audit; bundle analysis for portals; slot API p95 < 400 ms, webhook p95 < 1 s (k6 light load: 50 concurrent slot reads, 10 concurrent holds).
- [ ] **12.7 E2E suite** (Playwright, staging, Razorpay test): all critical cases in `docs/10` §2 automated where feasible; nightly run.
- [ ] **12.8 UAT** with scripts in `docs/10` §4: Dr. Tyagi, sales, ops, admin, 3–5 friendly customers on their own phones; log issues; fix S1/S2; record sign-offs in `PROGRESS.md`.
- [ ] **12.9 Ops readiness**: user guides (`docs/runbooks/doctor-guide.md`, `sales-guide.md`, `ops-guide.md`, `admin-guide.md`) with screenshots; on-call contacts; incident runbook (payments down, WhatsApp down, video down → phone fallback).
- [ ] **12.10 Go-live** per `docs/11` §7 (live keys, webhooks, templates, pg_cron, DNS, real ₹500 test + refund, 72 h hypercare). `guarantee.enabled` stays off until the approved policy is activated by admin.
- [ ] **12.11 Handover**: final `PROGRESS.md`, architecture diagram updated, `.env` inventory, provider account ownership list, Phase 2 backlog prioritised with 30-day data.

## Acceptance criteria (release gate)
1. `docs/10` §2 cases green; zero open S1/S2.
2. ZAP baseline: no high/medium findings open.
3. Compliance checklist (`docs/09` §10) fully ticked by client/counsel.
4. Live ₹500 booking → consult → plan → refund rehearsal succeeds on production.
5. Monitoring and alerts verified by triggering a test alert.

## Paste-ready prompt
```
Read CLAUDE.md, then phases/PHASE_12_Hardening_Launch.md, TRD §9–10, docs/09, docs/10 and docs/11.
Produce the launch checklist with owners first, wait for OK, then work through it. Never switch to live keys or touch production without my explicit go-ahead.
```
