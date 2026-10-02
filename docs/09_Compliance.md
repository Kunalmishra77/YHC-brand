# 09 · Compliance Requirements

> Product-design checklist, **not legal advice**. YHC's counsel and CA must review before launch (task in Phase 12).
> Each row maps to features already in the PRD so compliance is built in, not bolted on.

## 1. Telemedicine (Telemedicine Practice Guidelines, 2020; NMC)

| Requirement | How the platform meets it | FR |
|---|---|---|
| Registered Medical Practitioner identifies self (name, qualification, registration no.) | Doctor card on site; registration no. on prescriptions, confirmations, receipts, WhatsApp consult messages | M1-9, M14-2 |
| Patient identification | Verified phone (OTP) + name/age; doctor ticks "identity verified" before completing | M14-3 |
| Consent (implied when patient initiates; explicit when staff initiates, e.g., sales "book on behalf") | Telemedicine consent checkbox with version at booking; stored in `consents`; doctor ticks "consent recorded" | M14-1/3 |
| Appropriate mode; first-consult prescribing of certain medicine lists only by video | Video is the default mode; mode stored per consult; audio fallback recorded | M5-6 |
| Prescription content and sharing; patient free to buy anywhere | Structured e-prescription PDF; recommendation page states the patient may use the prescription elsewhere | M5-7, M6-6 |
| Records maintained | Consult notes, prescriptions, messages retained; not deletable by customer erasure (anonymise instead). Retention period to be confirmed by counsel (the IMC 2002 regulations reference at least 3 years) | M14-5 |
| No consultation outside India's jurisdiction | Booking limited to Indian (+91) numbers and Indian delivery addresses at launch | M3-3 |

## 2. Doctor-owned brand / professional conduct
- The NMC's 2023 professional-conduct regulations (which restricted endorsements) were put in abeyance in Aug 2023; the Indian Medical Council (Professional Conduct, Etiquette and Ethics) Regulations, 2002 apply. **Counsel to confirm** how Dr. Tyagi may recommend YHC products he is associated with.
- Built-in mitigations: disclosure of Dr. Tyagi's association on doctor page and recommendation page; patient free not to buy; prescription delivered regardless (FR-M6-6).

## 3. Products (category decides what we may sell and say)
- Each SKU must have a confirmed `regulatory_category` (cosmetic / Ayurvedic / drug / supplement) with licence numbers on file before it is listed.
- If any product is a **prescription drug**, online sale needs a licensed pharmacy partner and is out of MVP scope until counsel approves the model.
- Labels/claims must match the product's licence; "patented" claims need the patent number and scope on file.
- Check every product claim against the Drugs & Magic Remedies (Objectionable Advertisements) Act, Drugs & Cosmetics rules and AYUSH rules (as applicable) with counsel.

## 4. Advertising & claims (ASCI Code, CCPA Guidelines on Misleading Advertisements 2022)
- ASCI has repeatedly upheld complaints against hair-growth ads for unsubstantiated claims and misleading before/after images.
- Platform rules: banned-words list (PRD §15) enforced by a lint script on content and templates (`pnpm lint:claims`, Phase 12); reviews require publication consent; before/after only with photo-marketing consent, unretouched, with "results vary"; every claim has substantiation on file (Admin › Content stores evidence links).
- **Guarantee advertising:** all material conditions shown with the claim, same wording everywhere (from the active policy).

## 5. Consumer protection — e-commerce
Consumer Protection (E-Commerce) Rules, 2020:
- Show legal name, address, contact and **grievance officer** (name, contact) on the site (FR-M14-6).
- Clear return/refund/cancellation/guarantee terms before purchase (checkout shows and links them; consent stored).
- Total price including taxes and charges before payment.
- Grievance acknowledgment and resolution timelines in the data-request/grievance workflow (FR-M14-5).

## 6. Data protection — DPDP Act 2023 and DPDP Rules 2025
- Rules notified Nov 2025, phased; full fiduciary duties ~May 2027. Build to them now.
- Itemised consent notice per purpose (booking, clinical care, WhatsApp updates, marketing, photo use) with withdrawal (FR-M14-1).
- Purpose limitation: sales cannot access clinical data (RLS).
- Security safeguards: encryption in transit, private storage, signed URLs, audit logs, least privilege, MFA for clinical access enforced in the database (ADR-17).
- Breach response plan (Phase 12): detect → contain → notify the Data Protection Board and affected people as the Rules require.
- Rights: access, correction, erasure (with medical-record exceptions), grievance — workflow with SLA.
- Children: platform is 18+ only (FR-M14-7).
- Data residency: Supabase Mumbai, Vercel Mumbai functions; sub-processors listed in Privacy Policy.

## 7. Payments
- RBI e-mandate framework (Phase 2 AutoPay): AFA at mandate creation; recurring debits ≤ ₹15,000 without AFA; pre-debit notification ≥ 24 h; easy cancellation. Plan prices (≤ ₹14,999) fit under the limit.
- Card data never touches our servers (Razorpay Checkout).

## 8. Tax
- GST invoices with HSN codes and correct rates per product (from CA); place-of-supply logic for CGST/SGST vs IGST.
- **Consult fee GST treatment** to be confirmed by CA (healthcare service exemption may or may not apply to this structure).

## 9. WhatsApp policies
- Opt-in before messaging; honour opt-out; correct template categories.
- Review WhatsApp Business and Commerce Policies for health products; keep transactions on the website.

## 10. Launch compliance checklist (owner: client + counsel, tracked in Phase 12)
- [ ] Privacy Policy (DPDP-aligned) · [ ] Terms of Use · [ ] Telemedicine consent text · [ ] Refund & Cancellation Policy (consult + products) · [ ] Shipping Policy · [ ] **Money-back Guarantee terms** · [ ] Medical disclaimer · [ ] Grievance officer details
- [ ] Product licences + regulatory category per SKU · [ ] Claims substantiation file · [ ] Patent details (if claimed)
- [ ] Dr. Tyagi registration certificate + council · [ ] Counsel opinion on doctor-owned brand recommendation
- [ ] GSTIN, HSN codes, tax rates, consult-fee GST treatment
- [ ] Razorpay KYC approved for this business category · [ ] DLT registration (entity, header, templates) · [ ] Meta Business verification + WhatsApp templates approved
- [ ] Review/testimonial consents on file for every published story
