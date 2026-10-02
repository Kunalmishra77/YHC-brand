# 08 · Messaging Templates

Seeded into `message_templates` (`supabase/seed.sql`). **Submit the WhatsApp ones to Meta in week 1** — approval takes time and booking can't launch without `booking_confirmed`, reminders and `otp_login`.
Category = what Meta charges. Utility templates must contain **no offers or promotions** (adding one makes Meta reclassify the template as marketing, at about 7.5× the utility price in India).
Variables: `{{1}}`, `{{2}}`… in order. Final wording to be approved by Dr. Tyagi (medical) and YHC (brand).

## WhatsApp

| Key | Category | Trigger | Body (draft) | Buttons |
|---|---|---|---|---|
| `otp_login` | authentication | OTP request | {{1}} is your Your Hair Company verification code. | Copy code (Meta auth template) |
| `lead_welcome` | marketing | New lead (opted in) | Hi {{1}}, thanks for reaching out to Your Hair Company. Book a video consultation with Dr. Tyagi or chat with our hair expert. | URL: Book consultation · Quick reply: Talk to an expert |
| `consult_link` | utility | Sales sends link | Hi {{1}}, here is your link to book a consultation with Dr. Tyagi: {{2}} | — |
| `booking_confirmed` | utility | ₹500 captured | Your consultation is confirmed. {{1}} with Dr. Tyagi (Reg. No. {{6}}) on {{2}} at {{3}} IST. Appointment ID {{4}}. Payment of ₹{{5}} received. | URL: Complete your hair profile · URL: Join consultation |
| `intake_reminder` | utility | T-24 h / T-3 h if intake/photos missing | Hi {{1}}, please complete your hair profile and upload scalp photos before your consultation on {{2}}. | URL: Complete now |
| `consult_reminder_24h` | utility | T-24 h | Reminder: your consultation with Dr. Tyagi is tomorrow, {{1}} at {{2}} IST. | URL: Join link |
| `consult_reminder_1h` | utility | T-1 h | Your consultation with Dr. Tyagi starts in 1 hour ({{1}} IST). Please join from a quiet, well-lit place. | URL: Join consultation |
| `consult_starting` | utility | Doctor opens room / T-0 | Dr. Tyagi is ready for your consultation now. | URL: Join now |
| `slot_lost_rebook` | utility | Late payment, slot taken | Your payment of ₹{{1}} was received but the slot was taken while you were paying. Please pick a new time; your payment is kept for it. | URL: Pick a new time |
| `plan_ready` | utility | Recommendation sent | Hi {{1}}, Dr. Tyagi (Reg. No. {{2}}) has shared your personalised hair plan. | URL: View my plan (`/r/` base) |
| `plan_unpaid_nudge` | utility | +24 h unpaid | Your plan from Dr. Tyagi is ready. The link is valid until {{1}}. | URL: View my plan |
| `order_confirmed` | utility | Order paid | Order {{1}} confirmed. Amount paid ₹{{2}}. We will share tracking as soon as it ships. | — |
| `order_shipped` | utility | Shipped | Your order {{1}} has shipped with {{2}}. Expected delivery: {{3}}. | URL: Track order |
| `order_delivered` | utility | Delivered | Your order {{1}} was delivered. Here is how to start your routine. | URL: How to start |
| `care_checkin` | utility | Weeks 1–4 after delivery | Week {{1}} check-in: how is your routine going? | Quick replies: Going well · I have a question · Facing an issue |
| `progress_photo_request` | utility | Monthly | Time for your monthly progress photos. They help Dr. Tyagi review your plan. | URL: Upload photos |
| `refill_reminder` | utility | Plan end −7/−4/−1 d | Your current plan ends around {{1}}. Continue your plan so there is no gap. | URL: Reorder |
| `followup_consult_due` | utility | Follow-up week reached | It is time for your follow-up review with Dr. Tyagi. | URL: Book follow-up |
| `guarantee_claim_update` | utility | Claim status change | Update on your guarantee claim {{1}}: {{2}}. | — |
| `consult_pay_link` | utility | Sales books on behalf | Hi {{1}}, we have reserved {{2}} IST for your consultation with Dr. Tyagi. Please confirm and pay ₹{{3}} before {{4}} to keep the slot. | URL: Confirm & pay |
| `appointment_rescheduled` | utility | Reschedule | Your consultation is now on {{1}} at {{2}} IST. Appointment ID {{3}}. | URL: Join consultation |
| `appointment_cancelled` | utility | Cancellation | Your consultation {{1}} has been cancelled. {{2}} | URL: Book again |
| `consult_refund_processed` | utility | Consult fee refunded | A refund of ₹{{1}} for appointment {{2}} has been processed. It may take 5–7 working days to reach your account. | — |
| `no_show_rebook` | utility | Doctor marks no-show | We missed you at your consultation today. Would you like to pick a new time? | URL: Pick a time |
| `prescription_ready` | utility | Prescription issued | Your prescription from Dr. Tyagi (Reg. No. {{1}}) is ready. | URL: View prescription |
| `order_out_for_delivery` | utility | Out for delivery | Your order {{1}} is out for delivery today. | URL: Track order |
| `reorder_needs_followup` | utility | Reorder blocked by validity | To continue your plan, Dr. Tyagi needs a quick follow-up review first. | URL: Book follow-up |
| `staff_side_effect_alert` | utility | Check-in flagged (to doctor/care team numbers) | Care alert: patient {{1}} reported an issue in week {{2}} check-in. Open the portal to review. | URL: Open portal |

Notes
- URL buttons use a dynamic suffix so each link is a signed token. The base is fixed at approval time, per template: plan templates (`plan_ready`, `plan_unpaid_nudge`) use `https://yourhaircompany.com/r/{{1}}`; all others use `https://yourhaircompany.com/l/{{1}}`.
- Dr. Tyagi's registration number is a variable in consult-related templates (Telemedicine Guidelines) — include it before submission so templates don't need re-approval later.
- `staff_side_effect_alert` goes to staff numbers only and never includes clinical details.
- `care_checkin` replies: "Going well" → logged; "I have a question" → care task (normal); "Facing an issue" → care task (urgent) + doctor notified + auto-reply: "Thanks for telling us. Our care team will call you shortly. If this is an emergency, please contact a doctor near you." No automated medical advice.
- Quiet hours (`messaging.quiet_hours`, default 21:00–09:00 IST) apply only to scheduled non-urgent messages (check-ins, photo requests, refill reminders, nudges, marketing). User-triggered transactional messages, OTPs and consultation reminders are always sent immediately.

## SMS (MSG91, DLT-registered)

| Key | Use | Text (draft, must match DLT template exactly) |
|---|---|---|
| `otp_login_sms` | OTP fallback | {#var#} is your Your Hair Company verification code. Do not share it. - YHC |
| `booking_confirmed_sms` | WhatsApp failed | Consultation confirmed: {#var#} IST with Dr. Tyagi. ID {#var#}. Details: {#var#} - YHC |
| `consult_reminder_sms` | WhatsApp failed | Reminder: your YHC consultation is at {#var#} IST. Join: {#var#} - YHC |
| `plan_ready_sms` | WhatsApp failed | Dr. Tyagi has shared your hair plan. View: {#var#} - YHC |
| `order_shipped_sms` | WhatsApp failed | Order {#var#} shipped. Track: {#var#} - YHC |

## Email (Resend + React Email)

| Key | Subject |
|---|---|
| `booking_confirmed_email` | Consultation confirmed — {date} {time} IST |
| `prescription_ready_email` | Your prescription from Dr. Tyagi |
| `plan_ready_email` | Your personalised hair plan from Dr. Tyagi |
| `order_confirmed_email` | Order {code} confirmed (with GST invoice attached) |
| `order_shipped_email` | Your order {code} is on its way |
| `guarantee_claim_email` | Your guarantee claim {id}: {status} |
| `staff_invite_email` | You've been invited to the YHC portal |
