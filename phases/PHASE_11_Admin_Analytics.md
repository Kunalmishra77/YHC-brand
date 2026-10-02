# Phase 11 · Admin panel & analytics

**Goal:** management runs the business from `/admin` — users, catalog, orders, refunds, templates, settings, audit — and sees the funnel and revenue with clearly defined metrics; ad platforms receive server-side conversions.
**Depends on:** Phase 10. **Inputs:** Meta Pixel ID + CAPI token, GA4 property.
**FRs:** M12-1…M12-11, M13-1…M13-5, M14-4.
**Time:** ~1 week.

## Tasks
- [ ] **11.1 Plan.** Read PRD M12–M13 + §17 metric definitions. Wait for OK.
- [ ] **11.2 Admin shell** `/admin` (admin full; ops limited to Orders/Shipments/Refunds per role), consistent DataTable pages with filters, detail drawers, CSV export (audited).
- [ ] **11.3 Modules**: Users & roles (invite email via `staff_invite_email`, role change audited, deactivate), Doctors (profile, fee), Products/Plans (price changes audited; images to `public-media`), Protocol templates (shared), Orders (timeline, refunds, invoice regenerate, override with reason), Appointments (manage, refund consult fee), Customers (timeline, consents, data requests, **merge duplicates** with conflict preview), Messaging (from Phase 08), Guarantee (policies draft → activate with confirmation; claims overview), Content (from Phase 02), Settings (typed editor per key with zod validation + description), Jobs & Webhooks monitors (retry/cancel, payload viewer with PII masked), Audit log viewer.
- [ ] **11.4 KPI dashboard** `/admin/analytics`: date range + compare; funnel (leads → holds → paid consults → attended → plans paid → reorders), revenue split, AOV, consult-to-plan (7-day cohort), reorder rate, 90-day retention cohort table, guarantee cost, doctor utilisation, no-show rate, by source/campaign, by rep. SQL in views/functions (security_invoker; admin only) — every number has a tooltip with its §17 definition.
- [ ] **11.5 Meta Conversions API** `server/analytics/capi.ts`: `Lead` (lead.created with source), `Schedule` (appointment booked), `Purchase` (consult ₹500 and plan orders, value in INR) via `capi.send` jobs; hashed phone/email; `event_id` shared with client Pixel events for dedupe; respect marketing consent.
- [ ] **11.6 GA4**: verify client funnel events from Phase 02/04; add `purchase` with transaction id on confirmation pages (after server confirms).
- [ ] **11.7 Tests**: KPI SQL against fixture data (known expected numbers), role restrictions for ops, audit entries for every ★ action, CAPI payload hashing/normalisation.

## Acceptance criteria
1. Every PRD §17 metric shows on the dashboard and matches fixture expectations.
2. Ops cannot open Settings, Users or Analytics.
3. Each sensitive admin action produces an audit row with before/after.
4. CAPI test events visible in Meta Events Manager (test code) on staging.

## Paste-ready prompt
```
Read CLAUDE.md, then phases/PHASE_11_Admin_Analytics.md and PRD modules M12–M13 with §17 definitions.
Plan first, wait for OK, then build task by task with tests.
```
