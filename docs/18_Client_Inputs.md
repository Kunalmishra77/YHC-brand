# 18 · Client inputs and dependencies (audit Baseline v1 follow-up, 19 Oct 2026)

Everything the platform still needs from YHC (or its advisers) after the audit fixes. **Blocks** = the
audit item cannot be closed without it. Until each arrives the site **hides** the unconfirmed fact
(ADR-33) — nothing shows "to be added" or "pending".

**How to send things safely**
- Keys, tokens and passwords: never in chat, email or code. Add them yourself in **Vercel → Project
  yhc-brand → Settings → Environment Variables** (names below), or share them through a password
  manager. We redeploy; the code reads them from the environment.
- Documents and photos: a shared Google Drive folder (consent forms stay there, not in the repo).
- Wording approvals: reply "approved" on the specific item, or send corrections.

## P0 — before any paid traffic

| # | What | Why / audit ID | Affects | Blocks | How to provide |
|---|---|---|---|---|---|
| 1 | Dr. Tyagi's **medical registration number, council, full qualifications** | Telemedicine Practice Guidelines require it on every consult + prescription; trust (CON-01, E-01) | Hero, doctor card, /doctor-tyagi, prescriptions, MedicalWebPage `reviewedBy` | Yes | Text, plus a photo of the registration certificate for our records |
| 2 | **Legal entity** that sells (labels say *Santure Health Care Pvt. Ltd.*, footer credit says *SANTURE AI PRIVATE LIMITED*), **CIN, registered address**, **grievance officer name + designation + email** | E-Commerce Rules 2020, DPDP Act (SEC-05) | Footer, /legal/grievance, invoices, privacy policy | Yes | Text (from the company's MCA record) |
| 3 | **Legal sign-off** on Privacy, Terms, Refund/Cancellation, Shipping, Guarantee terms, Medical disclaimer | Policies are recommendations until approved (SEC-06, D-P1, D-P4) | /legal/*, guarantee, consents | Yes | Lawyer's approved versions or tracked changes |
| 4 | **WhatsApp Business number** (+ provider name/API if you already use one) | Main support + lead channel (FUN-01, D-P7) | Every WhatsApp button (hidden until set) | Yes | Set env `NEXT_PUBLIC_WHATSAPP_NUMBER` (e.g. 919876543210) in Vercel, or send the number |
| 5 | **Before/after cases: months between photos + consent form reference per patient** | Results claims need evidence (CON-02, E-05) | /results, homepage results | Yes for durations | Per case: patient label, months, consent date — consent PDFs to the Drive folder |
| 6 | **GA4 Measurement ID** and **Meta Pixel ID** (+ later a Conversions API access token) | Funnel measurement (BIZ-01) | Consent banner + events (built; dormant until IDs set) | Yes | Env `NEXT_PUBLIC_GA4_ID`, `NEXT_PUBLIC_META_PIXEL_ID` in Vercel |
| 7 | **Demo access code holders** | Portals are now behind a shared code (SEC-01) | /demo, staff portals | No | We send the code to the people you name; rotate it any time in Vercel (`DEMO_ACCESS_CODE`) |

## P1 — before scaling spend

| # | What | Why / audit ID | Affects | Blocks | How to provide |
|---|---|---|---|---|---|
| 8 | **Support / consultation hours** | CON-05 | Contact page, contact strip (hidden until set) | Partly | Text, e.g. "Mon–Sat, 10 am – 7 pm IST" |
| 9 | **Regulatory review of the Hair Regrowth Solution** (finasteride on men's *and* women's labels), and of label claims ("Prevents hair fall & regrow hair", "Stem cell therapy", "100% organic") | CON-07, docs/16 D6–D7 | Product pages, packs shown in photos | Yes for launch | Written opinion from a regulatory adviser |
| 10 | **Tablet amounts** (Vitamin A 70 mg, Biotin 100 mg, Iron 68 mg look wrong) and **capsule vs powder** directions | Safety (docs/16 D8–D9) | Product pages (amounts hidden) | No | Master formula from the manufacturer |
| 11 | **₹500 credit rule** — confirm "credited if a plan is bought within 7 days" | CON-04, D-P3 | /plans, /book, journey (caveat removed; value from settings) | No | "Approved" or the new rule |
| 12 | **Payment gateway test keys** (Razorpay key id/secret + webhook secret, test mode) and an **SMS/WhatsApp OTP provider** (MSG91 or BSP) for a staging environment | Real OTP + payments; end-to-end retest (FUN-11, SEC-09) | Staging, go-live build (kit Phase 01–03) | Yes for go-live | Add as Vercel env vars on a *staging* project — never live keys first |
| 13 | **Medical review** of the new ingredient notes, concern pages, FAQs, 5 Journal articles | Health-content quality (§F) | Content pages | No | Dr. Tyagi's approval or edits |
| 14 | **Real-world assets**: Dr. Tyagi portrait set (E-01), doctor intro video (E-03), real pack photography (E-04), scan screen recording (E-02) | Trust, conversion (§E) | Hero, doctor, products, scan section | No | Shoot briefs in `YOUR_HAIR_COMPANY_ASSET_GENERATION_PROMPTS.md` |

## P2–P3 — growth and polish

| # | What | Why | Affects | How to provide |
|---|---|---|---|---|
| 15 | Generated images/videos from the prompts file (E-07, E-08, E-09, E-10, E-11, E-12, E-15+) | Replace stock/illustrative media | Several sections | Upload outputs to the Drive folder; we optimise and integrate |
| 16 | **Vector logo (SVG)** | Sharp logo in portals and share cards (E-13) | Header, portals | SVG/AI/PDF file |
| 17 | **Patent details** (number, title, what is covered) — or confirm there is none | The patent line is hidden until verified (ADR-27) | Hero, science | Patent certificate / application |
| 18 | Delivery SLA, pickup address, packaging (D-P8); follow-up fee (D-P5); reorder validity (D-P6) | Policies + FAQ wording | /legal/shipping, FAQs | Decisions |
| 19 | Search Console access (Owner → add our email) | SEO coverage after launch | — | Google Search Console |
