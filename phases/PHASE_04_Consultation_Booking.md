# Phase 04 · Consultation booking (slots → OTP → ₹500 → confirmed → intake)

**Goal:** the complete booking funnel from FR-M3, with server-side confirmation, late-payment handling, intake + scalp photos, reminders scheduled, and the free hair assessment.
**Depends on:** Phase 03 (OTP, payment processor). **Inputs:** decisions D-P4 (cancellation rules), D-P5 (follow-up fee); draft intake questions (we draft, Dr. Tyagi approves).
**FRs:** M3-1…M3-14, M1-5, M14-1, M14-7.
**Time:** ~1 week.

## Tasks
- [ ] **4.1 Plan.** Read PRD M3, TRD §6.1–6.2, `docs/03` §1–2, `docs/05` §1. Wait for OK.
- [ ] **4.2 Availability engine** `server/booking/availability.ts` — pure function per TRD §6.1 + loader. Table-driven unit tests: weekly rules incl. multiple ranges, breaks, holidays (`unavailable`), extra hours, busy blocks, min notice, max/day, booking window, held (unexpired) vs expired holds, slot step = slot + buffer, IST day boundaries.
- [ ] **4.3 `GET /api/slots`** with 15 s cache (invalidated on hold/booking), rate limit.
- [ ] **4.4 Booking UI** `/book` (mobile-first stepper): (1) SlotPicker with Today/Tomorrow/dates and "x left" (≤ 3) → (2) OtpLogin → (3) short form: name, age (block < 18 with message), main concern (select), consents (telemedicine, privacy+terms, WhatsApp updates; marketing optional) → (4) Pay ₹500 with Countdown (hold) → (5) Confirming… → Confirmed page with "Complete your hair profile" CTA. Preserve UTM and `?ref=sales_<id>` params.
- [ ] **4.5 `POST /api/booking/hold`**: validate → re-check slot is offered → upsert customer + consents → `hold_slot` RPC (map `SLOT_TAKEN` → 409 with friendly message and refreshed slots) → Razorpay order (purpose consultation) → response.
- [ ] **4.6 Booking side effects as event handlers** (capture itself is SQL `capture_payment`, already wired in Phase 03; it emits `payment.consultation.captured` and `appointment.booked` / `appointment.slot_lost` — do **not** emit these again in TypeScript):
  - `appointment.booked` handler: set `video_provider` + room/join URL (LiveKit room id = appointment id; join URL `/consult/{id}`; Meet created in Phase 05 when `VIDEO_PROVIDER=meet`), schedule `appointment.reminder` at T-24h/T-1h/T-0 (dedupe `appt:{id}:r{offset}`), `intake.reminder` at T-24h/T-3h if intake incomplete, `calendar.push_event` (no-op until Phase 05), confirmation messages.
  - `appointment.slot_lost` handler: `slot_lost_rebook` message with signed `reschedule` link + sales task `rebook`.
  - **₹0 appointments** (free follow-ups, FR-M3-14): after `hold_slot`, the server checks eligibility (active plan) and calls `confirm_appointment_payment` directly — no Razorpay.
- [ ] **4.7 `/api/booking/verify`, `/status`, `/rebook`, `/cancel`.** Rebook moves the captured payment to the new appointment (update `payments.appointment_id`), then confirms. Cancel/reschedule rules from settings (D-P4): implement configurable windows; refunds via `refundPayment` job (Razorpay refunds).
- [ ] **4.8 Intake** `/book/intake/[appointmentId]` (also reachable via signed link `/l/{token}` kind `intake`; requires OTP session if none): form from a versioned schema `src/content/intake/v1.ts` (questions in docs-approved wording, placeholders marked), autosave (`PUT /api/intake/{id}`), submit sets `intake_completed_at` on appointment.
- [ ] **4.9 Scalp photos**: PhotoUploader with 3 guided angles (front hairline, crown, parting) + optional extra; client-side compression (≤ 2048 px, JPEG ~0.8); `POST /api/uploads/sign` → upload → `POST /api/uploads/complete` (the client re-encodes every photo to JPEG via canvas — handles iPhone HEIC and strips EXIF incl. GPS; the server only verifies the object exists and its type/size). Thumbnails via signed URLs.
- [ ] **4.10 Signed links** `lib/signed-links.ts` (TRD §6.7) + `/l/[token]` router page (kinds: intake, join, reschedule, booking-prefill).
- [ ] **4.11 Free hair assessment** `/assessment` (FR-M1-5): 6–8 questions, result page (no diagnosis; recommends consultation), optional OTP to save → lead with source `assessment`; answers stored in the `assessments` table (clinical RLS; **never** on the lead, which sales can read) and prefilled into intake.
- [ ] **4.12 Messages (temporary)**: on booked, enqueue `message.send` jobs with template keys (`booking_confirmed`, email) — the `log` provider records them; real delivery arrives in Phase 08 with no code change here.
- [ ] **4.13 Tests**: availability unit tests; integration: parallel holds (Promise.all) → one 409; full book → webhook → booked; webhook ×5; verify-without-webhook; late payment both branches; rebook; cancellation windows; under-18; signed link tamper/expiry. E2E (mobile): book with Razorpay test → confirmed → intake → photos.

## Acceptance criteria
1. Booking works end to end on a 360 px phone in ≤ 2 minutes with test payment.
2. Race test: 10 parallel holds on one slot → exactly one hold.
3. Every booking path ends in exactly one `booked` appointment and one set of reminder jobs (dedupe keys verified).
4. Sales-visible data (appointment + payment) present; clinical intake not readable by sales (RLS test).
5. Hold countdown and expiry behave correctly; expired slot reappears in `/api/slots`.

## Paste-ready prompt
```
Read CLAUDE.md, then phases/PHASE_04_Consultation_Booking.md, PRD module M3, TRD §6.1–6.2 and docs/03 §1–2.
Reuse the payment processor from Phase 03. Plan first, wait for OK, then build task by task with tests.
```
