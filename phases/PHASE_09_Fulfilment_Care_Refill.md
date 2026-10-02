# Phase 09 · Fulfilment, care follow-ups, refill & reorder

**Goal:** paid orders ship through Shiprocket, delivery starts the care and refill clocks, check-in replies reach the care team, and customers reorder in one tap.
**Depends on:** Phase 08. **Inputs:** Shiprocket account + pickup address + API user; D-P6 (reorder validity), D-P8 (delivery SLA, packaging); product weights/dimensions.
**FRs:** M9-1…M9-5, M10-1…M10-6, M7-10.
**Time:** ~1 week.

## Tasks
- [ ] **9.1 Plan.** Read PRD M9–M10, TRD §6.5, `docs/03` §4, `docs/06` §8. Wait for OK.
- [ ] **9.2 Shiprocket adapter** (token cache, create adhoc order, assign AWB, schedule pickup, cancel, track) + MSW mocks.
- [ ] **9.3 `shipping.create` job** on `order.paid` (idempotent: one shipment per order unless ops splits) → order `processing` → AWB/courier/tracking saved; failures → ops task.
- [ ] **9.4 Webhook** `/api/webhooks/shiprocket` → status map (`docs/06` §8; unknown statuses kept + Sentry warning) → `shipments.status`, `orders.status` (shipped/rto), `delivered` → `mark_order_delivered()` → emit `order.delivered`; journey messages shipped/out for delivery/delivered.
- [ ] **9.5 Ops views** `/admin/orders`: to-pack list, pick list by product, exceptions (NDR, RTO, delayed > SLA), manual status override with reason (audited), resend tracking.
- [ ] **9.6 Care check-ins**: on `order.delivered` (plan orders) create `care_checkins` rows for weeks in `care.checkin_weeks` and schedule `care.checkin` jobs (10:30 IST); inbound button replies → store response; "I have a question" → care task; "Facing an issue" (or free-text keywords list) → `side_effect_flag`, urgent task, doctor notification (portal Follow-ups + optional email), auto-reply text from `docs/08`.
- [ ] **9.7 Progress photos**: `progress.photo_request` job every 30 days during coverage; upload page via signed link (OTP if no session) → `media(kind progress)`.
- [ ] **9.8 Refill engine** (TRD §6.5): schedule `refill.reminder` at −7/−4/−1 days 10:00 IST and `refill.task` at plan end; first reminder emits `refill.first_reminder_sent` → stage `reorder_due`.
- [ ] **9.9 Reorder**: `/l/{token}` kind `reorder` and `/account` button → validity check (last consult ≤ `reorder.validity_days`, D-P6; else offer follow-up booking) → `POST /api/reorder` creates order cloned from parent (same items/plan/address, current prices) → pay → on paid: `cancel_jobs('refill:{parent}:')`, stage `reordered` → `followup_active`.
- [ ] **9.10 Follow-up consult due**: on `consultation.completed` with `follow_up_in_weeks` → `followup.due` job → `followup_consult_due` message + doctor Follow-ups queue; booking link prefilled kind `follow_up` with fee per D-P5.
- [ ] **9.11 Care view in CRM**: replies by week, flagged issues (resolve with notes / escalate to doctor), refill-due list with one-click "send reorder link".
- [ ] **9.12 Tests**: status mapping, idempotent shipment creation, `plan_end_on` IST edge (delivery 23:30 IST), job sets after delivery, flag routing, reorder validity, job cancellation on reorder.

## Acceptance criteria
1. Paid order → Shiprocket AWB within 2 minutes (staging/mocked) → delivered webhook → check-ins and refill jobs scheduled exactly once.
2. "Facing an issue" reply creates an urgent task and appears in the doctor's Follow-ups within 1 minute.
3. Reorder from WhatsApp link takes ≤ 3 taps to payment and cancels pending refill reminders.

## Paste-ready prompt
```
Read CLAUDE.md, then phases/PHASE_09_Fulfilment_Care_Refill.md, PRD modules M9–M10, TRD §6.5 and docs/06 §8.
Plan first, wait for OK, then build task by task with tests.
```
