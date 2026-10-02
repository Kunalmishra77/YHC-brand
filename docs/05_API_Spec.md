# 05 · API Specification

Conventions
- JSON over HTTPS. Errors: `{ "error": { "code": "SLOT_TAKEN", "message": "…" } }` with matching HTTP status.
- All inputs validated with zod schemas in `src/lib/validation/*` (shared with forms).
- Auth: `customer` = Supabase session from phone OTP; `staff(role)` = email+MFA session with role; `public` = none; `signed` = HMAC-signed link token; `secret` = Bearer/HMAC from provider or `CRON_SECRET`.
- Rate limits shown as `RL: n / window / key`.
- Money in paise. Times ISO-8601 UTC; clients render IST.

---

## 1. Public & customer route handlers (`src/app/api`)

| Method & path | Auth | Purpose | FR |
|---|---|---|---|
| `GET /api/slots?doctor=dr-tyagi&from=YYYY-MM-DD&days=7` | public · RL 60/min/IP | Available slots grouped by IST date: `{ days: [{ date, slots: [{ startsAt, endsAt }], remaining }] }` | M3-1/2 |
| `POST /api/auth/otp-channel` | public · RL 3/10min/phone | `{ phone, channel: 'sms' }` → sets a 5-min flag the Send SMS hook reads ("Send by SMS instead") | M3-3 |
| `POST /api/booking/hold` | customer · RL 10/10min/customer | Body `{ doctorSlug, startsAt, fullName, ageYears, concern, consents: { telemedicine, privacy, whatsappUtility, whatsappMarketing }, utm? }` → `{ appointmentId, code, razorpay: { keyId, orderId, amount, currency }, holdExpiresAt, prefill }` · 409 `SLOT_TAKEN` · 422 `UNDER_18` | M3-3..6 |
| `POST /api/booking/verify` | customer | Body `{ razorpay_order_id, razorpay_payment_id, razorpay_signature }` → verifies, fetches payment server-side, processes (idempotent) → `{ status }` | M3-7 |
| `GET /api/booking/{appointmentId}/status` | customer (owner) | `{ status: 'held'|'booked'|'slot_lost'|'expired'|'failed', code, startsAt, joinUrl? }` | M3-7 |
| `POST /api/booking/rebook` | customer or signed(`reschedule`) | Body `{ appointmentId, startsAt }` for `slot_lost` or reschedule: holds new slot, moves the captured payment to it, confirms → `{ appointmentId, status }` | M3-8, M3-12 |
| `POST /api/booking/{id}/cancel` | customer (owner) | Applies cancellation policy; refunds via job if eligible | M3-12 |
| `PUT /api/intake/{appointmentId}` | customer (owner) | Save draft/submit intake `{ answers, submit: boolean }` | M3-10 |
| `POST /api/uploads/sign` | customer or staff | Body `{ kind: 'intake'|'progress', appointmentId?, contentType }` → `{ path, signedUrl, token }` (10 MB max) | M3-10, M4-5 |
| `POST /api/uploads/complete` | customer or staff | Body `{ path, kind, appointmentId?, takenOn? }` → creates `media` row after verifying object exists | M3-10 |
| `POST /api/checkout` | customer · RL 10/10min | Body `{ items: [{ productId, qty }] | planId, addressId | address, consents }` → order `pending_payment` + Razorpay order | M2-4/5 |
| `POST /api/checkout/verify` | customer | Same pattern as booking verify | M2-5 |
| `GET /api/orders/{code}/status` | customer (owner) | Poll order status | M2-6 |
| `GET /api/recommendations/{token}` | public (token) | Plan view model: first name, doctor note, items, plans with prices, credit, guarantee summary (if enabled). Saved address **only** when the request carries a session for the same customer; sets `opened_at` on first view | M6-3 |
| `POST /api/recommendations/{token}/pay` | public (token) | Body `{ planId, address, consents }` → creates **or reuses** the recommendation's `pending_payment` order (re-priced; credit reserved once) + Razorpay order | M6-3/4 |
| `POST /api/reorder` | signed(`reorder`) or customer | Body `{ token | orderId }` → new order cloned from parent (validity check FR-M10-5) + Razorpay order | M10-4 |
| `POST /api/assessment` | public · RL | Free assessment answers → `assessments` row (clinical, not on the lead) + result; after OTP links `customer_id` and creates a lead (source `assessment`) | M1-5 |
| `POST /api/guarantee/claims` | customer | Body `{ statement, mediaIds? }` → evaluates eligibility, creates claim | M11-5 |
| `POST /api/data-requests` | customer | `{ kind, details }` | M14-5 |
| `GET /api/video/token/{appointmentId}` | customer (owner), signed `join` link, or doctor (aal2) | LiveKit access token (valid 2 h, room = appointment id; only from 10 min before start until 60 min after end) | M5-6 |
| `POST /api/contact` | public · RL | Contact form → task for sales | M4-8 |

## 2. Webhooks & hooks (`src/app/api/webhooks`, `src/app/api/hooks`)

All: `runtime = 'nodejs'`, read **raw body**, verify signature, insert `webhook_events` (unique `provider,event_id`), return 200 fast, process idempotently.

| Path | Provider | Verify | Events handled |
|---|---|---|---|
| `POST /api/webhooks/razorpay` | Razorpay | `X-Razorpay-Signature` = HMAC-SHA256(raw, `RAZORPAY_WEBHOOK_SECRET`) | `payment.captured`, `payment.failed`, `order.paid`, `payment_link.paid`, `payment_link.expired`, `refund.processed`, `refund.failed` (P2: `subscription.*`) |
| `GET/POST /api/webhooks/whatsapp` | Meta Cloud API or BSP | Meta: `hub.verify_token` + `X-Hub-Signature-256`; BSP: shared secret header | message statuses, inbound messages, button replies |
| `POST /api/webhooks/shiprocket` | Shiprocket | `x-api-key` header = `SHIPROCKET_WEBHOOK_TOKEN` | shipment status updates |
| `GET/POST /api/webhooks/meta-leads` | Meta Lead Ads | verify token + `X-Hub-Signature-256` | `leadgen` → fetch lead via Graph API |
| `POST /api/hooks/send-sms` | Supabase Auth Send SMS Hook | Standard Webhooks signature (`SUPABASE_SEND_SMS_HOOK_SECRET`) | send OTP via WhatsApp auth template, fallback MSG91 |
| `POST /api/webhooks/msg91` | MSG91 | `MSG91_WEBHOOK_TOKEN` | SMS delivery reports |
| `POST /api/webhooks/resend` | Resend | Svix signature | email delivered/bounced |

## 3. Cron endpoints (`Authorization: Bearer CRON_SECRET`)

| Path | Schedule | Work |
|---|---|---|
| `POST /api/cron/jobs` | every minute (pg_cron + pg_net) | dispatch domain events, run due jobs, expire holds |
| `POST /api/cron/calendar-sync` | every 5 min (job `calendar.sync` scheduled by runner) | pull Google free/busy for next `booking_window_days` → replace `calendar_busy_blocks` |
| `POST /api/cron/reconcile` | every 5 min (job) | Razorpay reconciliation for `created` payments 2 min – 48 h old |

(Calendar sync and reconcile can also run as recurring jobs inside `/api/cron/jobs`; endpoints exist for manual triggering from Admin.)

## 4. Server actions (staff)

Each: zod input → `requireRole` → work → audit (when marked ★) → emit event → `revalidatePath`.

### Doctor (`src/app/doctor/**/actions.ts`)
| Action | Input | Effect |
|---|---|---|
| `saveAvailabilityRules` | weekday ranges | replace rules for doctor |
| `addException` / `removeException` | range, kind, reason | leave/holidays/extra hours |
| `updateDoctorSettings` | slot, buffer, max/day, window, notice, fee | validated ranges |
| `connectGoogleCalendar` / `disconnectGoogleCalendar` | OAuth code | encrypted token in `doctor_integrations` |
| `startConsultation` | appointmentId | creates/opens `consultations` draft, `started_at`; ★ clinical view |
| `saveConsultationNotes` | id, fields | autosave |
| `completeConsultation` | id, identityVerified, consentRecorded, followUpWeeks | requires both checkboxes; appointment completed; consult credit; emits `consultation.completed` |
| `markNoShow` | appointmentId | status no_show; emits event (sales task to rebook) |
| `issuePrescription` | consultationId, items, advice | PDF render job; share link to patient ★ |
| `createRecommendation` (Recommend & create order) | consultationId, planId, items, note | recommendation `sent`, link, WhatsApp, timers |
| `cancelRecommendation` / `reissueRecommendation` | id | |
| `saveProtocolTemplate` | template | |
| `reviewGuaranteeClaim` | claimId, decision, notes | approved/rejected ★ |
| `rescheduleAppointment` | id, newStartsAt | new appointment linked (`rescheduled_from_id`), old → rescheduled |

### Sales (`src/app/sales/**/actions.ts`)
| Action | Effect |
|---|---|
| `createLead` / `importLeadsCsv` | upsert customer by phone + lead |
| `setLeadStageManual` | calls SQL `set_lead_stage_manual`: only `contacted`, `interested`, `consult_suggested` (before payment) or `lost` (with reason, before purchase) |
| `assignLead` | change owner |
| `logActivity` | call (outcome) / note |
| `sendConsultLink` | WhatsApp `consult_link` with signed booking link → `consult_link.sent` |
| `bookOnBehalf` | hold slot for `consult.sales_hold_minutes` (source `sales`) → WhatsApp `consult_pay_link` with a signed `/l/` link (kind `pay_consult`) → customer page shows slot, age (18+), consents, then Razorpay Checkout (same processor) |
| `reissueRecommendation` | sales can reissue an expired plan link (new expiry, timers re-scheduled) |
| `createTask` / `completeTask` | |
| `resolveCareCheckin` | mark handled, notes, escalate to doctor |

### Admin / Ops (`src/app/admin/**/actions.ts`)
`inviteStaff`, `setRole` ★, `deactivateUser` ★, product/plan/template CRUD ★ (prices), `updateSetting` ★, `upsertMessageTemplate`, `toggleJourney`, `retryJob`, `cancelJob`, `refundPayment` ★, `overrideOrderStatus` ★, `createShipmentManually`, `activateGuaranteePolicy` ★, `approveReview` (requires consent) , `resolveDataRequest` ★, `exportCsv` ★, `mergeCustomers` ★.

## 5. Domain events (catalogue)

| Event | Emitted by | Payload |
|---|---|---|
| `lead.created` | lead upsert | customer_id, source, campaign |
| `consult_link.sent` | sales action | customer_id |
| `appointment.held` | `hold_slot` | customer_id, starts_at, source |
| `appointment.booked` | `confirm_appointment_payment` | customer_id, after_expiry? |
| `appointment.slot_lost` | same | customer_id |
| `appointment.cancelled` / `.rescheduled` / `.no_show` | actions | |
| `payment.consultation.captured` / `payment.order.captured` / `payment.failed` | payment processor | payment_id, amount |
| `consultation.completed` | doctor action | consultation_id, follow_up_in_weeks |
| `prescription.issued` | doctor action | |
| `recommendation.sent` / `.expired` / `.paid` | | recommendation_id |
| `order.paid` | payment processor | order_id, source |
| `order.shipped` / `order.delivered` / `order.rto` | Shiprocket handler / `mark_order_delivered` | |
| `checkin.replied` / `checkin.flagged` | inbound handler | |
| `refill.first_reminder_sent` | job | order_id |
| `guarantee.enrolled` / `.claim_submitted` / `.claim_decided` / `.refunded` | | |
| `message.failed` | messaging | |
| `payment.amount_mismatch` | `capture_payment` | expected, received |
| `order.expired` | `order.expire` job | order_id, credit released |

Handlers live in `src/server/events/handlers/<event>.ts` and must be idempotent (use dedupe keys).
