# Phase 07 · Sales CRM

**Goal:** the sales team works every lead from one screen, sees payments the moment they happen, and never updates a status the system can set itself.
**Depends on:** Phase 06. **Inputs:** Meta Business access (Lead Ads webhook, page token), D-P12 (round-robin pool & hours).
**FRs:** M7-1…M7-11, M3-13.
**Time:** ~1 week.

## Tasks
- [ ] **7.1 Plan.** Read PRD M7, TRD §6.3, `docs/03` §6, deck slide 20. Wait for OK.
- [ ] **7.2 Stage machine handlers** `server/crm/stage-map.ts` + event handlers for every row in TRD §6.3 using `advance_lead_stage`; unit tests for the mapping; integration test running the whole journey's events → final stage `followup_active`.
- [ ] **7.3 Assignment** `server/crm/assignment.ts`: round-robin over `settings.sales.round_robin_pool` (profile ids) respecting `sales.working_hours`; reassign action; SLA task `call_new_lead` due `created_at + sales.first_contact_sla_minutes`.
- [ ] **7.4 Sales shell** `/sales`: Board (Kanban by stage; drag allowed only into manual stages: contacted, interested, consult_suggested, lost-with-reason), List (filters: stage, owner, source, campaign, date, next action; saved views), My tasks, Care (placeholder lists until Phase 09), Bookings (today/tomorrow with payment status).
- [ ] **7.5 Lead detail**: header (name, phone with click-to-call/WhatsApp, owner, stage, source/UTM), **payment cards** ("₹500 payment: PAID · payment ID · appointment ID · slot · booking status"; plan orders likewise), timeline (activities, messages, appointments, recommendations via `v_sales_recommendations`, orders + items via `v_sales_order_items`, shipments — **no clinical data, no dosage**), next action, tasks.
- [ ] **7.6 Quick actions**: log call (outcome select + note), note, create task, set manual stage and mark lost (reason) via SQL `set_lead_stage_manual`, reissue an expired plan link, **send consult link** (`consult_link` template with signed booking link prefilled → emit `consult_link.sent`), **book on behalf** (slot picker → `hold_slot` with source `sales` and `consult.sales_hold_minutes` → WhatsApp `consult_pay_link` with signed `/l/` link kind `pay_consult` → customer page: slot, age 18+, consents (explicit — staff-initiated), Razorpay Checkout → same processor → booked). ADR-20.
- [ ] **7.7 Auto tasks** (event handlers/jobs, dedupe keys): new lead SLA; abandoned hold (expired without payment) → `recover_hold`; slot_lost → `rebook`; no-show → `rebook_no_show`; unpaid plan 48 h → `unpaid_plan`; intake missing at T-3 h → `intake_missing`; side-effect flag → `side_effect` (urgent, Phase 09 source).
- [ ] **7.8 Realtime alerts**: subscribe to `payments` (captured), `leads` (assigned to me), `tasks` (urgent) → toast + optional sound + browser notification permission; e.g., "₹500 PAID · Rahul S · Tue 14 Oct 11:20".
- [ ] **7.9 Meta Lead Ads**: `/api/webhooks/meta-leads` (GET verify, POST signature) → `webhook_events` → job `meta.fetch_lead` (Graph API by `leadgen_id`) → upsert customer/lead with campaign/ad/form fields → assignment → optional `lead_welcome` (marketing, only with consent captured in the form).
- [ ] **7.10 CSV import** (admin/sales lead): map columns, validate phones (E.164), dedupe, preview, import report.
- [ ] **7.11 Rep performance (S)**: leads handled, median first-contact time, stage conversion by rep (SQL view, security_invoker).
- [ ] **7.12 Tests**: RLS (sales sees leads, not clinical), stage-map unit + journey integration, drag rules, book-on-behalf `pay_consult` flow (mock Checkout), Meta webhook signature + dedupe, CSV import edge cases.

## Acceptance criteria
1. "₹500 PAID" toast within 5 s of webhook on staging.
2. Stages after `consult_booked` cannot be set by hand (UI and server).
3. New Meta lead appears assigned with an SLA task within 1 minute.
4. Lead timeline never shows intake, photos, notes or prescriptions.

## Paste-ready prompt
```
Read CLAUDE.md, then phases/PHASE_07_Sales_CRM.md, PRD module M7 and TRD §6.3.
Plan first, wait for OK, then build task by task with tests.
```
