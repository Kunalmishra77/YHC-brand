# Phase 08 · Messaging & automation

**Goal:** every message in `docs/08` is delivered through real providers with consent, quiet hours, fallbacks, delivery tracking and inbound replies; journeys are configurable from Admin.
**Depends on:** Phase 07 (and all earlier phases that enqueue `message.send`). **Inputs:** D-P7 (WhatsApp provider), provider API docs/keys, approved templates, MSG91 DLT IDs, Resend domain.
**FRs:** M8-1…M8-8, M3-9/10/11 delivery, M6-5 delivery.
**Time:** ~1 week.

## Tasks
- [ ] **8.1 Plan.** Read PRD M8, TRD §6.9, `docs/06` §2–5, `docs/08`. Confirm which WhatsApp adapter to implement first (D-P7). Wait for OK.
- [ ] **8.2 Provider adapters** (`server/integrations/`): `whatsapp/meta-cloud.ts`, `whatsapp/generic-http.ts` (payload mapping isolated in one function, documented with the provider's API), `whatsapp/log.ts`; `sms/msg91.ts` (DLT template IDs map); `email/resend.ts` + React Email templates for every email key. Contract tests with MSW for each adapter.
- [ ] **8.3 `server/messaging/send.ts`**: `sendMessage({ customerId, templateKey, variables, related })` → checks template active & approved (`provider_template_name` present for WhatsApp), consent (`whatsapp_utility` / `whatsapp_marketing`), quiet hours (`messaging.quiet_hours`; applies only to scheduled non-urgent messages — user-triggered transactional, OTP and consult reminders are never delayed), journey switch (`messaging.journeys`), dedupe → `messages(queued)` → `message.send` job → provider → `sent`; on failure retry ×3 then fallback (utility/auth: WhatsApp → SMS → email).
- [ ] **8.4 Webhooks**: `/api/webhooks/whatsapp` (statuses → `messages.status`, inbound → `messages(direction inbound)` + attach to customer/lead timeline; unknown number → new lead source `whatsapp` with CTWA referral in `utm.ctwa`), `/api/webhooks/msg91`, `/api/webhooks/resend`.
- [ ] **8.5 Inbound handling** `server/messaging/inbound.ts`: "STOP"/"UNSUBSCRIBE" → withdraw marketing consent + confirmation; button replies for check-ins routed to Phase 09 handler (stub now); free text inside 24 h window → shown in CRM with "Reply" box (service message via `sendText`).
- [ ] **8.6 OTP delivery**: send-sms hook uses `otp_login` WhatsApp authentication template first, MSG91 fallback; "Send by SMS instead" link on OtpInput after 20 s → `POST /api/auth/otp-channel` sets a 5-min Upstash flag by phone → `signInWithOtp` again → hook reads the flag (the hook payload has no channel field); Auth SMS max frequency set to 20 s.
- [ ] **8.7 Journeys** `server/messaging/journeys.ts`: one declarative config mapping events/jobs → template keys + offsets (from settings) for: booking confirmed, intake reminders, consult reminders (24 h/1 h/start), slot lost, plan ready + nudge, order confirmed/shipped/delivered, care check-ins, progress photo requests, refill reminders, follow-up due, guarantee updates. Replace temporary enqueues from Phases 04–06 with journey calls.
- [ ] **8.8 Admin › Messaging**: template catalog (edit body preview, provider template name, active, category), journey toggles + offsets, message log with filters, failed queue with retry.
- [ ] **8.9 Tests**: consent & quiet-hour rules, fallback chain, dedupe, STOP handling, webhook signature checks, journey scheduling for a booking (exact job set), utility templates contain no offer words (lint over seed + DB).

## Acceptance criteria
1. Real WhatsApp delivery (staging number) for booking confirmation, reminders, plan ready; delivery/read statuses visible in CRM timeline.
2. Turning WhatsApp off (simulated failure) delivers utility messages by SMS/email.
3. "STOP" removes marketing consent within 1 minute; no further marketing messages.
4. Admin can change reminder offsets without a deploy.

## Paste-ready prompt
```
Read CLAUDE.md, then phases/PHASE_08_Messaging_Automation.md, PRD module M8, TRD §6.9, docs/06 §2–5 and docs/08.
Ask me which WhatsApp provider we are using before building adapters. Plan first, wait for OK, then build task by task with tests.
```
