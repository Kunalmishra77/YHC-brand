# 06 · Integrations

Every provider sits behind an interface in `src/server/integrations/*`. Each integration has: a **sandbox/test mode** for dev and staging, a **mock** (MSW handlers in `tests/fixtures/`) for unit/E2E tests, and a row in Admin › Webhook log.
Verify current API versions and limits in each provider's docs when implementing; links are in §10.

---

## 1. Razorpay (payments, refunds; subscriptions in Phase 2)

| Use | API |
|---|---|
| ₹500 consult + order payments | Orders API → Checkout.js (Standard Checkout) |
| Optional pay-by-link (not used by MVP flows; supported by `capture_payment` via `provider_payment_link_id`) | Payment Links API |
| Consult fee refunds, guarantee refunds | Refunds API (per payment; partial allowed) |
| Reconciliation | Fetch payments of an order |

Implementation notes
- `notes` on every Razorpay order: `{ purpose, appointment_id | order_id, customer_id, env }`.
- Checkout signature check (UX only): `HMAC_SHA256(order_id + "|" + payment_id, KEY_SECRET)`.
- Webhook: verify `X-Razorpay-Signature` over the **raw** body with `RAZORPAY_WEBHOOK_SECRET`; idempotency key = `x-razorpay-event-id` header (fallback: `event + payment.id`).
- Subscribe webhooks: `payment.captured`, `payment.failed`, `order.paid`, `payment_link.paid`, `payment_link.expired`, `refund.processed`, `refund.failed`.
- Auto-capture on (payment capture setting in dashboard) so `payment.captured` follows authorization.
- Test mode keys in dev/staging; live keys only in production env.
- **Before launch:** activate the account with full KYC; declare the business as healthcare products + teleconsultation; Razorpay may ask for extra documents (doctor registration, product licences). Confirm the maximum age of a payment that can still be refunded (affects guarantee refunds, ADR-12).

## 2. WhatsApp

Two adapters, chosen by `WHATSAPP_PROVIDER`:

| Adapter | When | Config |
|---|---|---|
| `generic-http` | YHC's **existing WhatsApp automation system** exposes an HTTP API (e.g., a BSP such as AiSensy/Interakt/Wati/Gupshup) | `WHATSAPP_HTTP_BASE_URL`, `WHATSAPP_HTTP_API_KEY`, mapping of send-template payload in `generic-http.ts`; inbound/status webhook forwarded to `/api/webhooks/whatsapp` with `WHATSAPP_WEBHOOK_SECRET` |
| `meta-cloud` | Direct Meta WhatsApp Cloud API | `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_ACCESS_TOKEN` (system user), `META_APP_SECRET`, `WHATSAPP_VERIFY_TOKEN` |

Rules
- Template messages outside the 24-hour window; free-form text only inside it.
- Categories drive cost: India rate card (Oct 2026) ≈ ₹0.8631 marketing, ₹0.115 utility/authentication/service (+18% GST, + BSP fee); service replies billed after 1,000 free/number/month. **Never put offers in utility templates.**
- Templates must be approved before use; track approval in `message_templates.provider_template_name` (null = not approved → job falls back to SMS/email).
- Opt-in captured at booking/checkout (`whatsapp_utility`, `whatsapp_marketing` consents). "STOP" → opt-out marketing.
- **Policy check:** keep all commerce on the website (links only). Do not use WhatsApp catalogues or in-chat payments for health products; review WhatsApp Business and Commerce policies before launch (risk R-07).
- Meta Business verification + display name approval needed for the YHC number.

## 3. SMS — MSG91

- Uses: OTP fallback, transactional fallback when WhatsApp fails.
- India requires **DLT registration** (entity, sender ID/header, each template's content and template ID). Templates mirror `docs/08` SMS rows.
- Config: `MSG91_AUTH_KEY`, `MSG91_SENDER_ID`, `MSG91_OTP_TEMPLATE_ID`, `MSG91_TXN_TEMPLATE_IDS` (JSON map key → DLT id).
- Delivery reports → `/api/webhooks/msg91` (verify `MSG91_WEBHOOK_TOKEN`).

## 4. Email — Resend

- React Email templates in `src/emails/`. Sender `care@yourhaircompany.com` (confirm).
- Domain verification (SPF, DKIM, DMARC) on the YHC domain.
- Config: `RESEND_API_KEY`, `EMAIL_FROM`, `RESEND_WEBHOOK_SECRET`.

## 5. Supabase Auth — Send SMS Hook (OTP delivery)

- In Supabase Dashboard › Auth › Hooks: enable **Send SMS hook** (HTTPS) → `https://<domain>/api/hooks/send-sms`; copy the secret to `SUPABASE_SEND_SMS_HOOK_SECRET`.
- Handler verifies the Standard Webhooks signature, sends `otp_login` WhatsApp authentication template; on failure sends MSG91 OTP SMS. Returns 200 within 5 s.
- Phone auth provider enabled; OTP length 6, expiry 5 min.

## 6. Video — LiveKit (default) / Google Meet (fallback)

| | LiveKit (ADR-8) | Google Meet |
|---|---|---|
| Where | Inside Doctor Portal workspace + `/consult/[appointmentId]` for patient | Link in confirmation |
| Setup | LiveKit Cloud project: `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET` | Created as conference on the Google Calendar event |
| Tokens | Server issues room token (identity = profile id, room = appointment id, TTL 2 h, valid from T-10 min) | n/a |
| Recording | Off. Only with explicit consent (future) | Off |
| Pros | On-platform, branded, patient never leaves site, doctor sees notes alongside | Zero build, familiar |

`VIDEO_PROVIDER=livekit|meet`. Test on low bandwidth (adaptive stream on, simulcast on). Provide "Switch to phone call" fallback (doctor calls the verified number) — record mode `audio` in consultation.

## 7. Google Calendar (two-way)

- Google Cloud project, OAuth client (web), redirect `https://<domain>/doctor/settings/calendar/callback`.
- Scopes: `calendar.events` (create/update booked consults) and `calendar.freebusy` (read busy time).
- **Important:** if the OAuth app is "External" and left in *Testing*, refresh tokens expire after 7 days. Use a Google Workspace account with an *Internal* app, or publish/verify the app before launch.
- Sync: every 5 min fetch free/busy for the booking window → replace `calendar_busy_blocks`. On booking → `events.insert` (title "YHC consult · {first name}", no clinical details in the event), store `external_calendar_event_id`; on cancel/reschedule → update/delete.
- Tokens encrypted with `ENCRYPTION_KEY` (AES-256-GCM) in `doctor_integrations`.

## 8. Shipping — Shiprocket

- Auth: API user (email/password) → bearer token (cache, refresh before expiry).
- On `order.paid`: job `shipping.create` → create order (adhoc) with pickup location, items (name, SKU, qty, price, HSN), dimensions/weight from product → assign AWB (preferred courier rules) → schedule pickup.
- Webhook (tracking) → map status → `shipments.status`; `delivered` → `mark_order_delivered()`.
- Status map (implement in `shiprocket.ts`): NEW→created · PICKUP SCHEDULED→pickup_scheduled · SHIPPED/IN TRANSIT→in_transit · OUT FOR DELIVERY→out_for_delivery · UNDELIVERED/NDR→ndr · DELIVERED→delivered · RTO INITIATED→rto_initiated · RTO DELIVERED→rto_delivered · CANCELED→cancelled. Verify exact status strings against the live webhook payloads in staging and keep unknown statuses in `events` with a Sentry warning.
- Config: `SHIPROCKET_EMAIL`, `SHIPROCKET_PASSWORD`, `SHIPROCKET_PICKUP_LOCATION`, `SHIPROCKET_WEBHOOK_TOKEN`.

## 9. Marketing & analytics

| Tool | Use | Notes |
|---|---|---|
| Meta Lead Ads | Leads into CRM | Page subscribed to `leadgen` webhook; page access token with `leads_retrieval`; fetch lead fields by `leadgen_id` |
| Meta Pixel | Client events (PageView, ViewContent, InitiateCheckout) | Consent-gated |
| Meta Conversions API | Server events: `Lead`, `Schedule` (consult booked), `Purchase` (consult ₹500, plan) | `event_id` shared with Pixel for dedupe; hashed phone/email (SHA-256, normalised); `META_PIXEL_ID`, `META_CAPI_TOKEN` |
| GA4 | Funnel + content analytics | `NEXT_PUBLIC_GA_ID`; consent mode |
| UTM capture | First-touch UTM stored in cookie → `leads.utm` at OTP | |

Click-to-WhatsApp ads: inbound message carries referral data (ad id/headline) on Meta Cloud API — store in `leads.utm.ctwa`.

## 10. Reference links (check versions at implementation time)
- Razorpay: https://razorpay.com/docs/payments/ (Orders, Checkout, Webhooks, Payment Links, Refunds)
- WhatsApp Cloud API: https://developers.facebook.com/docs/whatsapp/cloud-api
- WhatsApp pricing: https://developers.facebook.com/docs/whatsapp/pricing
- Meta Lead Ads webhooks: https://developers.facebook.com/docs/marketing-api/guides/lead-ads/retrieving
- Meta Conversions API: https://developers.facebook.com/docs/marketing-api/conversions-api
- Supabase Auth hooks: https://supabase.com/docs/guides/auth/auth-hooks
- Supabase cron / pg_net: https://supabase.com/docs/guides/cron
- LiveKit: https://docs.livekit.io
- Google Calendar API: https://developers.google.com/calendar/api
- Shiprocket API: https://apidocs.shiprocket.in
- MSG91: https://docs.msg91.com
- Resend: https://resend.com/docs
