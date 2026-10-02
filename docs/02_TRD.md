# 02 · Technical Requirements Document (TRD)

**Scope:** how the PRD (`01_PRD.md`) is built. Version 1.0.
Decisions referenced as `ADR-x` live in `15_Decisions.md`.

---

## 1. Architecture overview

- **One Next.js application** (App Router, TypeScript strict) serving five surfaces through route groups: public site, customer account, Doctor Portal, Sales CRM, Admin. One codebase keeps types, auth and domain logic shared (ADR-1).
- **Supabase** (Mumbai region) for Postgres, Auth, Storage and Realtime. Postgres is the single source of truth (ADR-2).
- **Domain logic** lives in `src/server/**` (server-only TypeScript modules). Concurrency-critical operations are Postgres functions (`hold_slot`, `confirm_appointment_payment`, `claim_jobs`, `advance_lead_stage`, `mark_order_delivered`).
- **Events + jobs**: every state change writes `domain_events`; a **job runner** endpoint (`/api/cron/jobs`, triggered every minute by Supabase `pg_cron` + `pg_net`) dispatches events to handlers and executes `scheduled_jobs` (messages, reminders, Shiprocket calls, reconciliation). Host-independent (ADR-5).
- **Adapters** for every external provider (payments, messaging, video, calendar, shipping, email, SMS) behind TypeScript interfaces in `src/server/integrations/*` (ADR-6).

```
Browser ──► Next.js (RSC pages, server actions, route handlers) ──► Supabase Postgres (RLS)
                │                                      ▲
                ├─ service-role client (server only) ──┘
                ├─► Razorpay / WhatsApp / MSG91 / Resend / LiveKit / Google / Shiprocket / Meta CAPI
                ▲
Webhooks ───────┘  (/api/webhooks/*: verify signature → webhook_events → handler → domain_events)
pg_cron ──every minute──► /api/cron/jobs  (dispatch domain_events, run scheduled_jobs)
```

## 2. Stack

| Concern | Choice | Notes |
|---|---|---|
| Runtime | Node.js LTS, **pnpm** | |
| Framework | **Next.js latest stable**, App Router, React Server Components, Server Actions | `export const runtime = 'nodejs'` on webhook/cron routes |
| Language | TypeScript `strict: true`, `noUncheckedIndexedAccess: true` | |
| Styling | Tailwind CSS (v4), CSS variables from `design/tokens.css` | |
| Components | shadcn/ui (Radix) + lucide-react icons; `motion` for subtle animation | |
| Forms & validation | react-hook-form + **zod** (shared schemas client/server) | |
| Data | `@supabase/supabase-js` + `@supabase/ssr`; generated DB types (`pnpm db:types`) | No ORM |
| Dates | `date-fns` + `date-fns-tz` (`Asia/Kolkata`) | |
| Payments | Razorpay Node SDK + Checkout.js | Orders, Payment Links, Refunds; Subscriptions in P2 |
| WhatsApp | Adapter: `generic-http` (existing provider) or `meta-cloud` | ADR-7 |
| SMS | MSG91 (DLT templates) | OTP fallback + transactional fallback |
| Email | Resend + React Email | |
| Video | LiveKit Cloud (`livekit-server-sdk`, `@livekit/components-react`); Google Meet fallback | ADR-8 |
| Calendar | Google Calendar API (OAuth, free/busy + events) | |
| Shipping | Shiprocket API | |
| PDFs | `@react-pdf/renderer` (prescriptions, invoices) | |
| Rate limiting | Upstash Redis + `@upstash/ratelimit` | OTP, booking, webhooks |
| Errors/APM | Sentry (`@sentry/nextjs`) | PII scrubbing on |
| Analytics | GA4, Meta Pixel (client, consent-gated), Meta Conversions API (server) | |
| Tests | Vitest (unit/integration), Playwright (E2E), MSW (provider mocks) | |
| Lint/format | ESLint (next + typescript), Prettier | |
| CI/CD | GitHub Actions → Vercel (preview + prod), Supabase CLI migrations | |
| Hosting | Vercel (region `bom1`) + Supabase (`ap-south-1`) | Docker/VPS alternative documented |

Install latest stable versions at Phase 00 and pin them in `package.json`; record versions in `PROGRESS.md`.

## 3. Repository structure

```
yhc-platform/
├─ CLAUDE.md · PROGRESS.md · README.md · START_HERE.md · .env.example
├─ docs/ (this documentation)          phases/ (build plan)
├─ design/tokens.css                   (brand tokens → Tailwind theme)
├─ supabase/
│  ├─ migrations/*.sql                 (schema, RLS, functions)
│  ├─ seed.sql                         (settings, plans, templates, FAQs)
│  └─ tests/manual/*.sql               (behaviour checks for SQL functions)
├─ scripts/ seed-dev.ts · create-staff.ts · gen-types.sh
├─ src/
│  ├─ app/
│  │  ├─ (site)/                       public pages (SSG/ISR)
│  │  │   page.tsx · about · doctor-tyagi · concerns/[slug] · products · products/[slug] · plans
│  │  │   how-it-works · assessment · stories · blog · blog/[slug] · faqs · contact · legal/[slug]
│  │  │   book/ (slot picker → otp → details → pay → confirmed) · cart · checkout · order/[code]
│  │  ├─ r/[token]/                    doctor recommendation → pay
│  │  ├─ l/[token]/                    signed short links (reorder, intake, join, reschedule)
│  │  ├─ consult/[appointmentId]/      patient video room
│  │  ├─ account/                      customer dashboard (auth: customer)
│  │  ├─ doctor/                       Doctor Portal (auth: doctor, aal2)
│  │  ├─ sales/                        CRM (auth: sales)
│  │  ├─ admin/                        Admin (auth: admin|ops, aal2 for admin)
│  │  ├─ auth/                         staff login, MFA, callback
│  │  └─ api/
│  │     ├─ slots/ · booking/* · checkout/* · uploads/sign · recommendations/[token]/pay
│  │     ├─ webhooks/razorpay · webhooks/whatsapp · webhooks/shiprocket · webhooks/meta-leads · hooks/send-sms
│  │     └─ cron/jobs · cron/calendar-sync · cron/reconcile
│  ├─ components/ ui/ (shadcn) · site/ · account/ · doctor/ · sales/ · admin/ · shared/
│  ├─ lib/        supabase/{browser,server,admin}.ts · money.ts · time.ts · rbac.ts · signed-links.ts
│  │              validation/ (zod schemas) · analytics.ts · env.ts (zod-validated env)
│  ├─ server/     (import 'server-only' in every file)
│  │  ├─ booking/      availability.ts · hold.ts · confirm.ts · reschedule.ts
│  │  ├─ payments/     razorpay.ts · handlers.ts · reconcile.ts · refunds.ts
│  │  ├─ orders/       create.ts · invoice.tsx · fulfilment.ts
│  │  ├─ consult/      workspace.ts · prescription-pdf.tsx · video.ts
│  │  ├─ recommendations/ create.ts · pricing.ts
│  │  ├─ crm/          stage-map.ts · assignment.ts · tasks.ts · meta-leads.ts
│  │  ├─ care/         checkins.ts · refill.ts · reorder.ts
│  │  ├─ guarantee/    eligibility.ts · claims.ts
│  │  ├─ messaging/    send.ts · templates.ts · journeys.ts · inbound.ts
│  │  ├─ events/       emit.ts · dispatch.ts · handlers/*.ts
│  │  ├─ jobs/         runner.ts · handlers/*.ts · schedule.ts
│  │  ├─ analytics/    capi.ts · kpis.ts
│  │  ├─ audit.ts · settings.ts · consents.ts
│  │  └─ integrations/ whatsapp/{index,generic-http,meta-cloud}.ts · sms/msg91.ts · email/resend.ts
│  │                   video/{livekit,meet}.ts · calendar/google.ts · shipping/shiprocket.ts · crypto.ts
│  ├─ emails/       React Email templates
│  └─ middleware.ts (session refresh + role gates)
└─ tests/ unit/ · integration/ · e2e/ · fixtures/
```

## 4. Rendering & data access

| Surface | Rendering | Data access |
|---|---|---|
| Public site | SSG + ISR (`revalidate` 300 s; on-demand `revalidatePath` from Admin saves) | anon Supabase client (RLS public policies) |
| `/book`, `/checkout`, `/r/[token]` | Dynamic, client components for interaction | Route handlers (service role inside, validated input) |
| `/account` | Dynamic RSC | User-scoped server client (RLS) + server functions for patient-safe clinical summaries |
| `/doctor`, `/sales`, `/admin` | Dynamic RSC + client islands; Realtime subscriptions | User-scoped server client (RLS) for reads; **server actions** for writes (validate → authorize → service role where needed → audit → emit event) |

Rules:
- `src/lib/supabase/admin.ts` (service role) may only be imported from `src/server/**` and `src/app/api/**`. ESLint `no-restricted-imports` enforces this.
- Every server action: `zod.parse(input)` → `requireRole([...])` → do work → `audit()` when sensitive → return typed result `{ ok: true, data } | { ok: false, error }`.

## 5. Auth & RBAC

### 5.1 Customers — phone OTP
- Supabase Auth phone provider with a **Send SMS Hook** pointing to `/api/hooks/send-sms` (verified with the hook secret). The hook sends the OTP as a WhatsApp authentication template (`otp_login`), falling back to MSG91 SMS (`otp_login_sms`) if WhatsApp fails. "Send by SMS instead" (after 20 s): the client calls `POST /api/auth/otp-channel { phone, channel:'sms' }`, which sets a 5-minute Upstash flag keyed by phone, then calls `signInWithOtp` again; the hook reads the flag (the hook payload has no channel field). Set Auth's SMS max frequency to 20 s.
- On first verification: `customers` row upserted by phone, `profile_id` linked, lead ensured.
- Rate limits: 3 OTP sends / 10 min / phone; 10 / hour / IP.

### 5.2 Staff — email + password + TOTP
- Invited by admin (`scripts/create-staff.ts` or Admin UI) → role set in `profiles.role`.
- TOTP MFA required for `doctor` and `admin`. Enforced **in the database**: `has_role()` and `current_doctor_id()` only grant doctor/admin rights when the JWT `aal` is `aal2`, so a stolen password alone exposes nothing clinical. Middleware also redirects aal1 sessions to the MFA challenge. Recommended for `sales`/`ops`.
- Staff login, TOTP enrolment and the MFA challenge are built in **Phase 01** (admin screens need them from Phase 02).
- Session 12 h; refresh via `@supabase/ssr` middleware.

### 5.3 Authorization layers
1. **Middleware**: route group → required roles (`/doctor`: doctor|admin; `/sales`: sales|admin; `/admin`: admin|ops (ops limited to orders/shipments); `/account`: customer).
2. **Server actions / handlers**: `requireRole()` again (never trust middleware alone).
3. **RLS** in Postgres (see migration): sales cannot read `intake_forms`, `media`, `consultations`, `prescriptions`, `assessments`, or recommendation/order-item dosage (sales use `v_sales_recommendations`, `v_sales_order_items`); doctors cannot read CRM tables; customers see only their rows; secrets tables have no policies.
4. **Guard triggers** for columns RLS can't express: `profiles` (role, is_active, email, phone admin-only), `customers` (profile_id, phone, deleted_at, opt-in flags server-only), `leads` (stage moves outside the manual rules). No browser UPDATE policies exist on appointments, orders or shipments — those change only through audited server actions.

## 6. Core algorithms

### 6.1 Availability engine (`server/booking/availability.ts`)
Input: doctorId, date range (IST days). Output: `{ date, slots: [{ startsAt, endsAt }] , remaining }[]`.
```
for each IST day in [today, today + booking_window_days):
  windows = availability_rules[weekday] as IST intervals
  windows += exceptions(kind='extra'); windows -= exceptions(kind='unavailable')
  windows -= calendar_busy_blocks
  step = slot_minutes + buffer_minutes
  candidates = for each window: t = window.start; while t + slot_minutes <= window.end: yield [t, t+slot); t += step
  candidates -= any overlapping appointment with status in (held [hold_expires_at > now], booked)
  candidates -= starts_at < now + min_notice_minutes
  if count(booked + held that day) >= max_per_day: no slots
  else keep first (max_per_day - taken) candidates
```
- Pure function over loaded data → unit-tested with fixtures (DST not applicable in IST, but keep tz-safe).
- Cache per doctor for 15 s; invalidate on hold/booking.

### 6.2 Booking & payment confirmation
```
POST /api/booking/hold
  session must be a verified customer (OTP) ─ zod(input) ─ rate-limit
  re-run availability for that exact slot (reject if not offered)
  upsert customer details + consents (versioned) ; ensure lead (advance to consult_booked happens via event)
  appt = rpc hold_slot(...)                       // raises SLOT_TAKEN → 409
  rzpOrder = razorpay.orders.create({ amount: appt.fee_paise, currency:'INR', receipt: appt.code,
                                       notes:{ purpose:'consultation', appointment_id: appt.id } })
  insert payments(status 'created', provider_order_id = rzpOrder.id)
  return { appointmentId, orderId, amount, keyId, holdExpiresAt, prefill }
  (fee_paise = 0, e.g. free follow-up: skip Razorpay; call confirm_appointment_payment(appt.id) directly)

Checkout success (browser) → POST /api/booking/verify { razorpay_order_id, payment_id, signature }
  verify HMAC → if valid: fetch payment from Razorpay API (server) → processCapturedPayment(payment)
  UI polls GET /api/booking/{id}/status until booked | slot_lost | failed

Webhook payment.captured / order.paid / payment_link.paid → verify X-Razorpay-Signature over raw body
  insert webhook_events (provider, event_id) ON CONFLICT DO NOTHING → if duplicate: 200 and stop
  processCapturedPayment(payment)
  (one payment produces several webhooks with different event ids — safe because of the compare-and-set below)

processCapturedPayment(p):   // webhook, verify and reconciliation all call this; it is a thin wrapper
  r = rpc capture_payment(order_id, payment_link_id, payment_id, amount, method, raw)
      // ONE SQL transaction: lock payment row → if captured: 'already_captured' → amount check ('amount_mismatch')
      // → mark captured → consultation: confirm_appointment_payment (emits appointment.booked | appointment.slot_lost)
      //                   order: mark_order_paid (consume credit, recommendation paid, emits order.paid)
  if r.result = 'amount_mismatch' → Sentry alert + ops task (refund manually); if 'invalid_state:cancelled' (order expired) → refund job
  return r      // NO side effects here
```
**All external side effects run in event handlers** (outbox, idempotent, retried): `appointment.booked` → video room/join link, Google event, reminder + intake jobs, confirmation messages; `appointment.slot_lost` → rebook message + sales task; `order.paid` → invoice job, Shiprocket job, confirmation messages, CAPI Purchase, cancel recommendation timers. Nothing is lost if the process dies after the SQL commit.
Reconciliation job every 5 min: payments `created` older than 2 min and younger than 48 h → fetch order payments from Razorpay → process captured ones.

### 6.3 CRM stage mapping (`server/crm/stage-map.ts`)

| Domain event | Lead stage (via `advance_lead_stage`) | Also |
|---|---|---|
| `lead.created` | new | auto-assign, SLA task |
| (manual) | contacted / interested / consult_suggested / lost | activity logged |
| `consult_link.sent` | consult_link_sent | |
| `appointment.held` | consult_booked | abandoned-hold timer |
| `payment.consultation.captured` | payment_successful | realtime toast "₹500 PAID" |
| `consultation.completed` | consult_completed | follow-up due job (the consult credit is created **synchronously** inside `completeConsultation`, so pricing can use it immediately) |
| `recommendation.sent` | product_recommended | unpaid timers (24 h nudge, 48 h task) |
| `order.paid` (source recommendation/shop) | product_purchased | Shiprocket job, CAPI Purchase |
| `order.delivered` | product_delivered → followup_active | check-ins, refill timers, guarantee enrollment (first guarantee-eligible plan order; `started_on` = delivery date) |
| `refill.first_reminder_sent` | reorder_due | |
| `order.paid` (source reorder) | reordered → followup_active | cancel pending refill jobs of parent order |

### 6.4 Recommendation pricing (`server/recommendations/pricing.ts`)
```
plan = plans[planId]; subtotal = plan.price_paise
credit = unused consult_credits for customer where expires_at > now() (oldest first), only if settings.consult.credit_enabled
         and this is a plan order ; applied = min(credit.amount_paise, subtotal)
total = subtotal - applied (+ shipping)
```
Credit is **reserved** (`consult_credits.used_order_id`) on order creation and **consumed** (`used_at`) inside `mark_order_paid`. Retrying "Pay" **reuses** the recommendation's open `pending_payment` order (unique index `orders_one_pending_per_recommendation`), re-pricing it if the customer changed duration/address. Job `order.expire` (24 h after creation) cancels unpaid orders and clears `used_order_id` so the credit can be used again.

### 6.5 Refill scheduling (`server/care/refill.ts`)
On `order.delivered` (plan order): for d in `refill.reminder_days_before` → `scheduled_jobs(kind 'refill.reminder', run_at = plan_end_on - d at 10:00 IST, dedupe 'refill:{orderId}:{d}')`; plus `'refill.task'` at plan_end_on 10:00 IST. On reorder paid → `cancel_jobs('refill:{parentOrderId}:')`.

### 6.6 Guarantee eligibility (`server/guarantee/eligibility.ts`)
Pure function: `(policy, enrollment, orders, checkins, photos, consults, today) → { eligible, rules[] }`.
Rules (each `{ id, label, passed, detail }`):
1. `min_plan_months`: contiguous paid plan coverage ≥ N months (gap between plan_end_on and next delivery ≤ 7 days).
2. `checkin_response`: answered check-ins ÷ sent ≥ `min_checkin_response_pct`.
3. `monthly_photos`: ≥ 1 progress photo set in each 30-day window of coverage (if required).
4. `followup_consult`: ≥ 1 completed follow-up consultation during coverage (if required).
5. `claim_window`: today ≤ coverage end + `claim_window_days`.
Refund amount = `refund_percent` × sum of plan payments in coverage. Refunds issued per payment (Razorpay refund API). If a payment is older than Razorpay's refund window, ops pays out by bank transfer and records it (ADR-12).

### 6.7 Signed links (`lib/signed-links.ts`)
`/l/{token}` where token = base64url(payload).base64url(HMAC-SHA256(payload, LINK_SIGNING_SECRET)); payload `{ k: 'reorder'|'intake'|'join'|'reschedule'|'booking'|'pay_consult'|'photos', id, exp }`. TTL by kind: `join`/`intake`/`reschedule` = appointment end + 1 h; `pay_consult` = hold expiry; `reorder` = plan end + 14 days; `booking`/`photos` = 7 days. Reminder jobs mint fresh links. Used inside WhatsApp messages so customers act without logging in; intake and photos pages still require OTP if the device has no session.

### 6.8 Job runner (`server/jobs/runner.ts`)
```
POST /api/cron/jobs  (Authorization: Bearer CRON_SECRET) — runs ≤ 25 s
  1. dispatch up to 200 unprocessed domain_events in id order → handlers (idempotent) → processed_at
  2. jobs = rpc claim_jobs(50) → run handler by kind → done | retry with backoff (1, 5, 15, 60 min) | failed after max_attempts
  3. rpc expire_stale_holds()
```
Job kinds: `message.send`, `appointment.reminder`, `intake.reminder`, `recommendation.nudge`, `recommendation.task`, `recommendation.expire`, `order.expire`, `calendar.sync`, `meta.fetch_lead`, `refund.process`, `care.checkin`, `progress.photo_request`, `refill.reminder`, `refill.task`, `followup.due`, `shipping.create`, `calendar.push_event`, `payments.reconcile`, `capi.send`, `invoice.generate`, `prescription.render`.

### 6.9 Messaging (`server/messaging/*`)
```ts
interface WhatsAppProvider {
  sendTemplate(i: { to: string; template: string; language: string; variables: string[]; buttons?: ButtonParam[] }): Promise<{ providerMessageId: string }>
  sendText(i: { to: string; body: string }): Promise<{ providerMessageId: string }>   // only inside 24 h service window
  parseWebhook(req: Request): Promise<InboundEvent[]>                              // statuses + inbound messages
  verifyWebhook(req: Request): Promise<boolean>
}
```
`send()` → checks consent (marketing needs `whatsapp_marketing`), quiet hours (`messaging.quiet_hours`; applies only to **scheduled non-urgent** messages — check-ins, photo requests, refill reminders, nudges, marketing; user-triggered transactional and OTP messages are never held), journey switch (`messaging.journeys`), template active → inserts `messages(queued)` → schedules `message.send` job → provider → status updates via webhook. Fallback to SMS for utility/auth on failure.

## 7. File uploads & clinical media
- Client asks `POST /api/uploads/sign { kind, appointmentId? }` → server checks ownership → returns Supabase signed upload URL for `clinical/{customerId}/{kind}/{uuid}.jpg` (max 10 MB, image/jpeg|png|webp only).
- The client **re-encodes every photo to JPEG via canvas** (max 2048 px, quality ~0.8) before upload. This handles iPhone HEIC and strips all EXIF incl. GPS. The server only validates type/size (no image library on the server).
- Reads: signed URLs with 5-minute TTL generated on the server for the doctor/customer; every clinical view writes `audit_logs(action 'clinical.view')`.

## 8. PDFs
- Prescription: `@react-pdf/renderer` template with letterhead, doctor name, qualifications, **registration no. + council**, patient name/age/gender, date, chief complaint/diagnosis (provisional), Rx table (generic name, strength, dosage, frequency, duration, instructions), advice, follow-up, signature image, "This is an electronically generated prescription" note.
- Invoice: GST invoice (supplier GSTIN, invoice no. `YHC/{FY}/{seq}`, HSN, taxable value, CGST/SGST or IGST by place of supply, total in words). Per-line `hsn_code`, `gst_rate`, `taxable_paise`, `tax_paise` are snapshotted on `order_items`; order totals in `orders.taxable_paise/cgst/sgst/igst`. **Plan orders:** the plan price is allocated across the products in proportion to their list prices unless the CA decides on a single plan line (decision D-P14).

## 9. Non-functional requirements

| Area | Requirement |
|---|---|
| Performance | Public pages LCP < 2.5 s on 4G mid-range Android; slot API p95 < 400 ms; webhook handler p95 < 1 s |
| Availability | 99.5% monthly for site + booking; jobs catch up after outages (idempotent) |
| Scalability | 50k customers, 200 consults/day, 2k orders/day without redesign |
| Security | OWASP ASVS L2 targets; RLS on every table; secrets only in env; CSP headers; HSTS; webhooks signature-verified; rate limits; dependency audit in CI |
| Privacy | Data stored in India region; PII scrubbed from logs/Sentry; clinical data access audited |
| Accessibility | WCAG 2.1 AA; status never conveyed by colour alone |
| Reliability | Webhooks idempotent; jobs retried with backoff; reconciliation every 5 min |
| Backups | Supabase daily backups (PITR add-on recommended for production) ; restore drill before launch |
| Observability | Sentry errors + performance; structured logs (`pino`) with request IDs; jobs/webhooks dashboards in Admin |
| Browser support | Last 2 versions of Chrome, Safari (iOS 16+), Samsung Internet, Firefox, Edge |
| i18n | All UI strings through a dictionary (`src/i18n/en.ts`) so Hindi can be added in P2 |

## 10. Security checklist (implemented by Phase 12, enforced throughout)
- Next.js security headers (CSP with Razorpay/LiveKit/GA domains allowed, `frame-ancestors 'none'`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` camera/mic only on consult pages).
- CSRF: server actions (built-in origin check) + route handlers check `Origin` for state changes.
- Input validation with zod on every boundary; output encoding by React; markdown rendered with sanitisation (`rehype-sanitize`).
- Webhook raw-body signature checks (Razorpay HMAC, Meta `X-Hub-Signature-256`, Shiprocket token, Supabase hook secret).
- Least privilege: service role only server-side; `doctor_integrations` tokens encrypted (AES-256-GCM, `ENCRYPTION_KEY`).
- Audit log for clinical views, refunds, price/settings/terms changes, role changes, exports.
- Dependency scanning (`pnpm audit`, GitHub Dependabot); secret scanning on.

## 11. Environment variables
See `.env.example` (every variable documented). `src/lib/env.ts` validates them with zod at boot; the app refuses to start if any required server variable is missing.

## 12. Coding conventions (summary — full list in `CLAUDE.md`)
- Money: integers in paise; format with `formatINR()` only at the edge.
- Time: store UTC; compute business days in `Asia/Kolkata` with `date-fns-tz`.
- IDs: UUID; human codes (`YHC-A-1001`, `YHC-10001`) for display only.
- Errors: typed `AppError(code, message, httpStatus)`; never leak stack traces to clients.
- Every new table: RLS enabled + policies + migration test.
- No `any`; no default exports except Next.js pages/layouts; colocate component tests.
