# Phase 05 · Doctor Portal

**Goal:** Dr. Tyagi can manage his availability, see his day, run the consultation (video + notes + prescription) in one workspace, and keep his Google Calendar in sync.
**Depends on:** Phase 04. **Inputs:** LiveKit keys, Google Cloud OAuth client (Internal app if Workspace), doctor signature PNG, prescription letterhead details, protocols per concern.
**FRs:** M5-1…M5-13 (M5-11 review UI built in Phase 10; M5-13 is a Should), M14-2, M14-3, M14-4.
**Time:** 1–1.5 weeks.

## Tasks
- [ ] **5.1 Plan.** Read PRD M5, deck slides 14–16, `docs/06` §6–7. Wait for OK.
- [ ] **5.2 Staff auth check**: login + TOTP were built in Phase 01; verify the doctor flow end to end (enrol, challenge, aal1 → redirected and DB returns nothing) and add "trusted device" UX polish if needed.
- [ ] **5.3 Portal shell** `/doctor`: obsidian sidebar (Today, Calendar, Patients, Follow-ups, Templates, Guarantee [Phase 10], Settings), top bar with patient search (name/phone/appointment code).
- [ ] **5.4 Today**: KPI tiles (consults today, intake pending, plans sent today, follow-ups due) + appointment list with StatusChips in words (`Paid · intake done`, `Paid · photos missing`, `Ready`, `No-show`, `Completed`), realtime updates (Supabase Realtime on appointments).
- [ ] **5.5 Calendar** (day/week): available (computed), held, booked, completed, cancelled, rescheduled, unavailable; click → appointment drawer (reschedule, cancel per policy, mark no-show, open workspace).
- [ ] **5.6 Settings › Availability**: weekly ranges per weekday (multiple), exceptions (leave/holiday/extra), slot length, buffer, max/day, booking window, min notice, consultation fee; preview of next 7 days' slots.
- [ ] **5.7 Google Calendar**: OAuth connect/disconnect (`doctor_integrations`, tokens encrypted with `ENCRYPTION_KEY` AES-256-GCM in `integrations/crypto.ts`); `calendar.sync` recurring job (every 5 min, free/busy → `calendar_busy_blocks`); `calendar.push_event` job on booking (no clinical text; title "YHC consult · {first name}"), update/delete on reschedule/cancel; Meet link creation when `VIDEO_PROVIDER=meet`.
- [ ] **5.8 Video**: LiveKit token endpoint `/api/video/token/{appointmentId}` (owner, signed `join` link, or doctor with aal2; window T-10 min → end+60 min); patient page `/consult/[appointmentId]` (pre-join check: camera/mic, network tips; OTP session or signed `join` link); doctor video panel inside workspace; "Switch to phone call" button (shows patient's verified phone, sets mode `audio`). Recording disabled.
- [ ] **5.9 Consultation workspace** `/doctor/consultations/[appointmentId]` — three panes (collapsible on laptop):
  - **Patient**: profile, age/gender, intake answers, photos (zoom, side-by-side with previous sets), past consultations, orders, check-in replies (when available). Each open writes `audit('clinical.view')`.
  - **Live consult**: video + structured notes (chief complaint, observations, assessment, treatment plan, follow-up instructions, private notes) with 5 s autosave and "saved" indicator; checkboxes identity verified + consent recorded.
  - **Outcome**: prescription builder (items: generic name, strength, dosage, frequency, duration, instructions; advice) → `Issue prescription`; follow-up in N weeks; `Complete consultation` (disabled until both checkboxes); recommendation builder placeholder (Phase 06).
- [ ] **5.10 Prescription PDF** (`server/consult/prescription-pdf.tsx`): per TRD §8 with registration no. + council, signature image, patient details, items; `prescription.render` job → private storage → patient notification job (`prescription_ready_email`).
- [ ] **5.11 Complete / no-show**: `completeConsultation` (server action, service role, one transaction) → appointment `completed`, consult credit row created **synchronously** (amount = fee paid, expires now + `consult.credit_window_days`), emit `consultation.completed`; `markNoShow` → emit (sales task in Phase 07).
- [ ] **5.12 Templates** CRUD (protocol presets), **Patients** list + patient file page, **Follow-ups** queue (due follow-ups now; flagged check-ins later).
- [ ] **5.13 Revenue view (S, FR-M5-13)**: own consult fees + plan revenue from own recommendations, by week/month (read-only, from payments/orders).
- [ ] **5.14 Tests**: RLS (doctor sees own appointments/clinical; sales cannot), completion guard, prescription PDF snapshot test (text extraction contains reg. no. and items), token window rules, encryption round-trip, calendar sync mapping (mocked Google).

## Acceptance criteria
1. Dr. Tyagi changes availability → `/book` reflects it within 15 s.
2. A full mock consult (two browsers) works on video; notes survive a page refresh.
3. Prescription PDF has all mandatory fields and is downloadable by the patient only.
4. Google event created on booking and removed on cancel; personal events block slots.
5. Every clinical view is in `audit_logs`.

## Paste-ready prompt
```
Read CLAUDE.md, then phases/PHASE_05_Doctor_Portal.md, PRD module M5 and docs/06 §6–7.
Plan first, wait for OK, then build task by task with tests. Use mocks where Google/LiveKit keys are missing.
```
