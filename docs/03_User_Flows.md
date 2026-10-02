# 03 · User Flows & State Machines

Mermaid diagrams render in GitHub and in VS Code (Markdown Preview Mermaid Support extension).

---

## 1. Consultation booking (FR-M3)

```mermaid
sequenceDiagram
  autonumber
  actor C as Customer
  participant W as Website /book
  participant API as Next.js API
  participant DB as Postgres
  participant RZ as Razorpay
  participant J as Job runner
  C->>W: Book consultation
  W->>API: GET /api/slots?from=today
  API->>DB: rules, exceptions, busy blocks, live appointments
  API-->>W: slots by day (IST)
  C->>W: pick 11:20 tomorrow
  W->>C: mobile number
  C->>W: OTP (WhatsApp, SMS fallback)
  C->>W: name, age (18+), concern, consents
  W->>API: POST /api/booking/hold
  API->>DB: hold_slot() (10-min hold)
  API->>RZ: orders.create(₹500, notes.appointment_id)
  API-->>W: order id + countdown
  C->>RZ: pays (UPI/card)
  RZ-->>W: success handler (signature)
  W->>API: POST /api/booking/verify
  API->>RZ: fetch payment (server-side)
  RZ-->>API: payment.captured (webhook, signed)
  API->>DB: webhook_events (idempotent) → capture_payment() → confirm_appointment_payment()
  DB-->>API: booked (events payment.consultation.captured + appointment.booked written in the same transaction)
  W->>API: poll /api/booking/{id}/status → booked
  W-->>C: Confirmed + "Complete your hair profile"
  J->>DB: dispatch events
  J-->>C: WhatsApp + email confirmation
  J->>J: schedule reminders (T-24h, T-1h, start), intake nudges
  J->>DB: CRM stage = payment_successful (realtime toast to sales)
```

## 2. Late payment after hold expiry (FR-M3-8)

```mermaid
flowchart TD
  A[payment.captured received] --> B{appointment status}
  B -- held --> C[booked]
  B -- booked --> D[already_booked: no-op]
  B -- expired --> E{slot still free?}
  E -- yes --> F[booked, rebooked_after_expiry]
  E -- no --> G[slot_lost]
  G --> H[WhatsApp: pick a new time, payment kept]
  G --> I[Sales task: help rebook]
  H --> J[Customer picks slot via signed link → new hold linked to same payment → booked]
```

## 3. Consultation → recommendation → one-tap purchase (FR-M5, FR-M6)

```mermaid
sequenceDiagram
  autonumber
  actor D as Dr. Tyagi
  participant P as Doctor Portal
  participant API as Server actions
  participant DB as Postgres
  participant WA as WhatsApp
  actor C as Customer
  D->>P: open appointment (Today list)
  P->>DB: patient file, intake, photos (audited view)
  D->>P: start video, take notes (autosave)
  D->>P: tick identity verified + consent recorded
  D->>P: pick template, adjust dosage, choose 3-month plan
  D->>API: Recommend & create order
  API->>DB: consultation completed, prescription PDF, consult credit (₹500, 7 days)
  API->>DB: recommendation sent (token, expires 72h, total = 14,999 − 500)
  API->>WA: plan_ready template → /r/{token}
  WA-->>C: "Dr. Tyagi has shared your personalised hair plan"
  C->>API: open /r/{token} → duration preselected, address prefilled
  C->>API: Pay securely → order pending_payment + Razorpay order
  Note over API,DB: Webhook → capture_payment() → mark_order_paid: order paid, credit consumed,<br/>recommendation paid → event handlers: invoice, Shiprocket job, CRM stage product_purchased
```

## 4. Post-purchase: delivery, care, refill, reorder (FR-M9, FR-M10)

```mermaid
flowchart LR
  P[order.paid] --> S[Shiprocket order + AWB]
  S --> T[shipped → WhatsApp tracking]
  T --> DL[delivered → mark_order_delivered\nplan_end_on = delivery + supply_days]
  DL --> W1[Week 1-4 check-ins]
  DL --> PH[Monthly photo requests]
  DL --> R7[Refill reminder −7d → stage reorder_due]
  R7 --> R4[−4d] --> R1[−1d] --> RT[plan end: sales refill call task]
  W1 -->|reply: issue / side effect| FLAG[Urgent care task + doctor notified]
  R7 -->|Reorder tap| RO[/l/token → same plan, same address → pay/]
  RO --> RP[order.paid source=reorder → cancel parent refill jobs → stage reordered → followup_active]
```

## 5. Guarantee claim (FR-M11)

```mermaid
sequenceDiagram
  autonumber
  actor C as Customer
  participant A as /account/guarantee
  participant E as Eligibility engine
  actor D as Dr. Tyagi
  actor O as Ops/Admin
  participant RZ as Razorpay
  C->>A: view guarantee status
  A->>E: evaluate(policy, orders, check-ins, photos, follow-ups)
  E-->>A: rules ✓/✗ with plain-language details
  C->>A: Claim (statement + final photos)
  A->>A: claim submitted (eligibility snapshot stored)
  A-->>D: claim in review queue
  D->>A: compare photos, review adherence → approve / reject (notes)
  alt approved
    A-->>O: refund task (amount = refund_percent × plan payments)
    O->>RZ: refunds.create per payment (or bank payout if outside refund window)
    RZ-->>A: refund.processed webhook → claim refunded
  else rejected
    A-->>C: rejected with failed rule(s) and doctor note
  end
```

## 6. Lead intake from Meta & WhatsApp (FR-M7-1)

```mermaid
flowchart TD
  M[Meta Lead Ad submit] -->|leadgen webhook| ML[fetch lead via Graph API]
  ML --> U[upsert customer by phone]
  WAin[Inbound WhatsApp from unknown number] --> U
  WEB[Website OTP at booking/checkout/assessment] --> U
  U --> L{lead exists?}
  L -- no --> N[create lead stage=new, source, UTM] --> AS[round-robin assign] --> SLA[task: contact within 15 min]
  L -- yes --> ACT[append activity, keep stage]
  N --> WEL[lead_welcome WhatsApp if marketing opt-in]
```

---

## State machines

### Appointment

```mermaid
stateDiagram-v2
  [*] --> held: hold_slot()
  held --> booked: payment captured
  held --> expired: hold timer ends
  expired --> booked: late payment, slot free
  booked --> completed: doctor completes
  booked --> no_show: doctor marks no-show
  booked --> cancelled: cancel (policy)
  booked --> rescheduled: reschedule (new appointment linked)
  completed --> [*]
```

### Order

```mermaid
stateDiagram-v2
  [*] --> pending_payment
  pending_payment --> paid: webhook order.paid
  pending_payment --> cancelled: expired unpaid (24h)
  paid --> processing: Shiprocket order created
  processing --> shipped: AWB picked up
  shipped --> delivered: courier delivered
  shipped --> rto: return to origin
  paid --> refunded: full refund
  delivered --> partially_refunded: guarantee/partial refund
  delivered --> refunded: guarantee full refund
```

### Recommendation

```mermaid
stateDiagram-v2
  [*] --> draft
  draft --> sent: Recommend & create order
  sent --> paid: order paid
  sent --> expired: 72h passed
  expired --> sent: sales/doctor reissues
  sent --> declined: customer declines
  sent --> cancelled: doctor cancels
```

### Lead stage (system moves forward only; loop allowed in retention)

```mermaid
stateDiagram-v2
  [*] --> new
  new --> contacted: manual
  contacted --> interested: manual
  interested --> consult_suggested: manual
  consult_suggested --> consult_link_sent: link sent
  new --> consult_booked: hold created (any earlier stage)
  consult_link_sent --> consult_booked
  consult_booked --> payment_successful: ₹500 captured
  payment_successful --> consult_completed
  consult_completed --> product_recommended
  product_recommended --> product_purchased
  product_purchased --> product_delivered
  product_delivered --> followup_active
  followup_active --> reorder_due
  reorder_due --> reordered
  reordered --> followup_active
  new --> lost: manual
  lost --> payment_successful: payment re-opens
```

### Guarantee claim

```mermaid
stateDiagram-v2
  [*] --> submitted
  submitted --> under_review: doctor opens
  under_review --> approved
  under_review --> rejected
  approved --> refunded: refunds processed
  submitted --> withdrawn: customer withdraws
```
