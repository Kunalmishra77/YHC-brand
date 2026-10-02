# Phase 03 · Customer OTP, catalog, cart, checkout & payments core

**Goal:** a customer can sign in with phone OTP, add a care product or plan to cart, pay with Razorpay (test mode), and the order becomes `paid` only via the verified webhook/server fetch. The **payment processor** built here is reused by booking (Phase 04) and recommendations (Phase 06).
**Depends on:** Phase 02. **Inputs:** Razorpay test keys + webhook secret; product data (placeholders ok); decision D-P2, D-P9.
**FRs:** M2-1…M2-8, M4-1 (auth), M14-1 (checkout consents).
**Time:** ~1 week.

## Tasks
- [ ] **3.1 Plan.** Read PRD M2, TRD §5.1, §6.2, `docs/06` §1 and §5. Wait for OK.
- [ ] **3.2 Customer OTP auth.** `OtpLogin` flow component (phone → OTP → session) used by checkout/booking/account. `/api/hooks/send-sms` (Supabase Send SMS Hook): verify signature; deliver via messaging interface — implement `log` provider now (prints OTP in dev, stores masked message), MSG91 adapter behind env (real use in Phase 08). On first login: upsert `customers` by phone, link `profile_id`, `ensureLead(source)`, emit `lead.created` if new. Rate limit with Upstash (fallback: in-memory in dev).
- [ ] **3.3 Cart.** Client store (zustand, persisted per device) for care products (`requires_consultation=false`) and direct plan purchase only where allowed (D-P10; until decided, plans are bought via recommendation only — show "Book consultation" instead). Cart drawer + `/cart`.
- [ ] **3.4 Checkout** `/checkout`: OTP if needed → address (form + saved addresses; pincode 6 digits) → summary (prices incl. GST, shipping from settings) → consents (terms, privacy, refund policy; WhatsApp updates opt-in) → `POST /api/checkout` → Razorpay Checkout.js.
- [ ] **3.5 Razorpay integration** `src/server/integrations/razorpay.ts` (orders.create, payments.fetch, orders.fetchPayments, paymentLinks.create, refunds.create) + `server/payments/`:
  - `createRazorpayOrderFor({ purpose, appointmentId|orderId, amount, customer })` → inserts `payments(created)`.
  - `processCapturedPayment(payment)` — a **thin wrapper around SQL `capture_payment()`** (TRD §6.2, ADR-16). It never performs side effects; it maps results (`already_captured`, `amount_mismatch` → alert + ops task, `invalid_state:cancelled` → refund job).
  - Event handlers for `order.paid`: `invoice.generate`, confirmation message (log provider for now), cancel recommendation timers; (Shiprocket arrives in Phase 09). Handlers idempotent with dedupe keys.
  - `order.expire` job (24 h after creation) cancels unpaid orders and releases reserved consult credit.
  - `/api/webhooks/razorpay`: raw body, HMAC verify, `webhook_events` insert (dedupe by `x-razorpay-event-id`), route events; `payment.failed` → update payment.
  - `/api/checkout/verify` and `GET /api/orders/{code}/status`.
  - Reconciliation job `payments.reconcile` scheduled every 5 min by the runner (self-rescheduling job).
- [ ] **3.6 Orders.** `server/orders/create.ts` (server recomputes all prices from DB; ignores client amounts), order items snapshot names/prices, `orders.total` check satisfied. Order confirmation page `/order/[code]` polling status (FR-M2-6).
- [ ] **3.7 GST invoice.** Migration `invoice_sequences(fy, last_no)` + `next_invoice_no(fy)` SQL function; fill `order_items.hsn_code/gst_rate/taxable_paise/tax_paise` and `orders.taxable_paise/cgst/sgst/igst` at invoice time (plan orders: allocation per D-P14 — default proportional to product list prices); `invoice.generate` job on `order.paid` renders PDF (`@react-pdf/renderer`): supplier details from settings, HSN, taxable value, CGST/SGST vs IGST by state (supplier state in settings), stored in `clinical/invoices/...` (private); download via signed URL.
- [ ] **3.8 Minimal account**: `/account/orders` list + detail (status, invoice download) so customers can see what they bought.
- [ ] **3.9 Tests**: unit (price computation, GST split, webhook signature verify incl. bad signature), integration (checkout → webhook replay ×5 → one paid order, one invoice job; concurrent `payment.captured` + `order.paid` + verify → one capture; amount mismatch → not captured, alert raised), E2E with Razorpay test mode on staging (or mocked Checkout in CI).

## Acceptance criteria
1. Order turns `paid` only after the webhook or server fetch; closing the browser right after paying still results in a paid order (webhook/reconcile).
2. Replayed webhooks cause no duplicate side effects.
3. Consultation-only products cannot be added to cart (UI and API).
4. Invoice PDF numbers are sequential per financial year.
5. Dev OTP works with test numbers; rate limits enforced.

## Paste-ready prompt
```
Read CLAUDE.md, then phases/PHASE_03_Catalog_Checkout.md, PRD module M2, TRD §5–6 and docs/06 §1 and §5.
The payment processor you build here must be reusable for consultations (Phase 04) and plan orders (Phase 06).
Plan first, wait for OK, then build task by task with tests.
```
