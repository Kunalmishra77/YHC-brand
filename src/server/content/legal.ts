import 'server-only';

import type { GuaranteePolicy } from '@/lib/domain/types';
import type { ContentBlock } from './types';

/*
 * Policy text for an Indian D2C dermatology telemedicine + hair-care business (docs/09). Written for
 * the Your Hair Company brand and the DPDP Act 2023, Telemedicine Practice Guidelines 2020, Consumer
 * Protection Act 2019 and E-Commerce Rules 2020. Values that live in settings (fees, windows) are
 * passed in via LegalContext, never hard-coded.
 *
 * INTERNAL: counsel review is still pending for every policy. Do not show "draft" to visitors; the
 * pages end with a "Last reviewed" line instead. Update `LEGAL_ENTITY.lastReviewed` once counsel signs off.
 * TODO(client): counsel-approved text for every policy — see docs/12 (legal), docs/09 §10
 */

/**
 * The one place for legal-entity details that are still pending client confirmation. While a value is
 * null, the policies use neutral wording ("the business that operates the Your Hair Company brand")
 * instead of a placeholder.
 * TODO(client): company name, CIN, registered address, governing-law city, grievance officer name — see docs/12 C, docs/09 §2, D-P7
 */
export const LEGAL_ENTITY: {
  brand: string;
  companyName: string | null;
  cin: string | null;
  registeredAddress: string | null;
  jurisdictionCity: string | null;
  grievanceOfficerName: string | null;
  /** ISO date (YYYY-MM-DD) the policies were last reviewed. */
  lastReviewed: string;
} = {
  brand: 'Your Hair Company',
  companyName: null,
  cin: null,
  registeredAddress: null,
  jurisdictionCity: null,
  grievanceOfficerName: null,
  lastReviewed: '2026-10-05',
};

/** How the operator is named in running text. */
function operatorName(): string {
  return LEGAL_ENTITY.companyName ?? 'the business that operates the Your Hair Company brand';
}

/** Display name for the grievance officer: their name once confirmed, otherwise the role. */
export function grievanceOfficerLabel(): string {
  return LEGAL_ENTITY.grievanceOfficerName ?? 'Grievance Officer';
}

function entityDetails(supportEmail: string): string {
  const { companyName, cin, registeredAddress } = LEGAL_ENTITY;
  if (companyName && registeredAddress) {
    return `Your Hair Company is a brand of ${companyName}${cin ? ` (CIN ${cin})` : ''}, with its registered office at ${registeredAddress}.`;
  }
  return `Your Hair Company is a brand operated from India. Our full company name, corporate identity number and registered office address are printed on every invoice and are available on request from ${supportEmail}.`;
}

function courts(): string {
  return LEGAL_ENTITY.jurisdictionCity
    ? `the courts at ${LEGAL_ENTITY.jurisdictionCity}`
    : 'the competent courts at the place of our registered office in India';
}

export type LegalSlug =
  'privacy' | 'terms' | 'refund-cancellation' | 'shipping' | 'guarantee' | 'medical-disclaimer' | 'grievance';

export interface LegalContext {
  consultFee: string;
  freeRescheduleHours: number;
  creditLine: string | null;
  doctorName: string;
  supportEmail: string;
  grievanceName: string;
  grievanceEmail: string;
  guarantee: GuaranteePolicy | null;
}

export interface LegalDocument {
  slug: LegalSlug;
  title: string;
  /** One-sentence plain-language summary shown under the title and on the index. */
  summary: string;
  lastUpdated: string;
  lastReviewed: string;
  blocks: ContentBlock[];
}

const LAST_UPDATED = '2026-10-05';

const h = (id: string, text: string): ContentBlock => ({ type: 'heading', id, text });
const sub = (text: string): ContentBlock => ({ type: 'subheading', text });
const p = (text: string): ContentBlock => ({ type: 'paragraph', text });
const ul = (...items: string[]): ContentBlock => ({ type: 'list', items });
const ol = (...items: string[]): ContentBlock => ({ type: 'list', items, ordered: true });
const note = (text: string, title?: string): ContentBlock => ({ type: 'callout', text, title });

function privacy(c: LegalContext): ContentBlock[] {
  return [
    p(
      'This Privacy Policy explains what personal data Your Hair Company (“YHC”, “we”, “us”) collects when you use our website, scalp scan, assessment, consultations and shop; why we collect it; who we share it with; how long we keep it; and the rights you have. It is written to meet the Digital Personal Data Protection Act, 2023 and the Digital Personal Data Protection Rules, 2025. In the language of that Act, you are the Data Principal and we are the Data Fiduciary.',
    ),
    note(
      'We use your data to look after your hair and scalp, and to run your bookings and orders. We never sell it. Your health information is seen only by your doctor and the people who support your care — not by our sales team, and never in marketing.',
      'In short',
    ),

    h('who-we-are', 'Who we are'),
    p(entityDetails(c.supportEmail)),
    p(
      `We provide online hair and scalp consultations with a registered medical practitioner, a guided 3D scalp scan and assessment, and the products a doctor prescribes or recommends. For the purposes of this policy, ${operatorName()} is the Data Fiduciary responsible for your personal data.`,
    ),

    h('what-we-collect', 'What we collect'),
    sub('Information you give us'),
    ul(
      'Identity and contact details: your name, mobile number, email address (if you share one), age and gender.',
      'Delivery details: your address, PIN code and any delivery instructions.',
      'Health information: your answers to the hair and health questionnaire, medical history, current medicines, allergies, scalp and hair photos, and anything you tell the doctor.',
      'Scalp scan data: the images captured during the guided 3D scalp scan and the assessment produced from them (whether you appear suitable for treatment, need a doctor’s review, or are unlikely to benefit, with the reasons).',
      'Messages: what you send us on WhatsApp, email, the contact form or in replies to check-ins.',
    ),
    sub('Information created while you use YHC'),
    ul(
      'Consultation records: the doctor’s notes, assessments, prescriptions and follow-up plans.',
      'Booking, order and payment records: what you booked or bought, amounts, invoices and payment status. Card, UPI and bank details are entered directly with our payment partner, Razorpay; we never see or store them.',
      'Care records: check-in replies, progress photos, reminders sent and whether your plan is active or paused.',
      'Consent records: which notices you agreed to, the version and when.',
    ),
    sub('Information collected automatically'),
    ul(
      'Device and usage data: browser and device type, pages visited, referring links and approximate location derived from your IP address, collected through cookies and similar tools (see “Cookies”).',
    ),

    h('why-we-use-it', 'Why we use it'),
    p(
      'We use personal data only for the purposes we tell you about when we collect it, and only as much as each purpose needs:',
    ),
    ul(
      'To run the scalp scan and give you a personalised assessment.',
      'To book your consultation, confirm it, and remind you on WhatsApp, SMS or email.',
      'To let your doctor understand your history, review your photos and scan, and prescribe appropriately.',
      'To process payments, pack and deliver orders, issue GST invoices and handle refunds.',
      'To send care messages you have agreed to: check-ins, refill reminders and follow-up invitations.',
      'To send offers and marketing messages, only if you have separately agreed to them.',
      'To run the money-back guarantee, where offered, including checking whether its conditions are met.',
      'To answer your questions and resolve complaints.',
      'To keep the service working and safe, prevent fraud and misuse, and meet our legal obligations.',
    ),

    h('scan-and-assessment', 'The 3D scalp scan and assessment'),
    ul(
      'The scan guides your phone camera to capture images of your scalp. These images, and the assessment created from them, are health information and are protected in the same way as your consultation records.',
      'The assessment is a screening aid that helps decide the next step. It is not a diagnosis. No treatment decision is made by software alone: a doctor reviews your scan, photos and history and makes the final decision.',
      'Scan images are used for your own care. They are not used in marketing, and are not used to train or improve any software unless you give separate, specific consent, which you can refuse or withdraw without affecting your care.',
    ),

    h('consent', 'Consent, and changing your mind'),
    p(
      'We ask for your consent in clear, separate steps for each purpose — for example this Privacy Policy, the telemedicine consultation, care messages on WhatsApp, marketing, and any use of your photos beyond your own care. Each request explains what the data will be used for. We keep a record of what you agreed to and when.',
    ),
    p(
      `You can withdraw any consent at any time, as easily as you gave it: from your account, by replying STOP to a marketing message, or by writing to ${c.grievanceEmail}. Once you withdraw, we stop that processing within a reasonable time. Withdrawal does not affect processing that already took place, and some records must still be kept by law (see “How long we keep data”). If you withdraw consent needed to provide a service — for example consent to hold your health information — we may no longer be able to provide that service.`,
    ),
    p(
      'In a few limited cases the law allows us to process data without asking for consent, for example to respond to a medical emergency or to comply with a legal obligation or court order.',
    ),

    h('clinical-data', 'How health information is protected'),
    ul(
      'Your questionnaire, scan, photos, consultation notes and prescriptions are available only to your treating doctor and the clinical staff who support your care.',
      'Our sales and customer support team helps with bookings, orders and delivery. They cannot see your clinical information.',
      'Health details are never written into WhatsApp marketing messages, email subject lines, calendar invitations or system logs.',
      'Every time a clinical record is opened, the access is recorded.',
      'Your photos are never used in advertising or published stories unless you give separate written consent, which you can withdraw at any time.',
    ),

    h('sharing', 'Who we share data with'),
    p(
      'We do not sell or rent personal data. We share it only with service providers (Data Processors) that help us run YHC, under written contracts that allow them to use it only on our instructions and require them to protect it:',
    ),
    ul(
      'Payments: Razorpay.',
      'Messaging: our WhatsApp Business service provider, MSG91 for SMS and one-time codes, and Resend for email.',
      'Video consultations and scheduling: LiveKit (or Google Meet as a fallback) for the call, and Google Calendar for the doctor’s schedule — appointment times only, never health details.',
      'Delivery: Shiprocket and its courier partners — your name, phone number and address only.',
      'Hosting and operations: Supabase (database and file storage), our website host, and Sentry for error monitoring, configured to exclude health information.',
      'Analytics and advertising measurement: Google Analytics and Meta, only with your cookie consent and never with health information.',
    ),
    p(
      'We may also disclose personal data when the law requires it — for example to a court, regulator or government authority acting lawfully — or to protect someone’s life or safety. If our business is reorganised or transferred, your data may pass to the new operator, who must honour this policy.',
    ),

    h('where-stored', 'Where your data is stored'),
    p(
      'Our database and file storage, including your health information, scan images and photos, are hosted in India (Mumbai region). Some service providers listed above may process limited data, such as message delivery or error reports, outside India. Where that happens, we do so only as permitted under the DPDP Act and any restrictions notified by the Government of India.',
    ),

    h('retention', 'How long we keep data'),
    ul(
      'Medical records — questionnaire answers, scan images and assessments that formed part of your care, consultation notes, prescriptions and related photos — are kept for at least three years from your last consultation, as required by the Indian Medical Council (Professional Conduct, Etiquette and Ethics) Regulations, 2002, or longer if another law or an ongoing claim requires it.',
      'If you complete a scan or assessment but never book a consultation, we delete those images and results once they are no longer needed, and in any case within 12 months of your last activity, unless you ask us to keep them.',
      'Invoices, payment and order records are kept for the period required under GST, income tax and company law (currently up to eight years).',
      'Marketing preferences are kept until you withdraw consent; after that we keep only a record that you opted out, so we do not contact you again.',
      'Other account data is deleted or anonymised once it is no longer needed for the purpose it was collected for, or when you ask us to erase it.',
    ),
    p(
      'If you ask us to erase your data and some of it must be kept by law, we restrict access to those records, keep them only for the legally required period, and then delete them.',
    ),

    h('your-rights', 'Your rights'),
    p('Under the DPDP Act you have the right to:'),
    ul(
      'Access: get a summary of the personal data we hold about you, how it is used, and who it has been shared with.',
      'Correction, completion and updating: ask us to fix data that is inaccurate, incomplete or out of date.',
      'Erasure: ask us to delete data we no longer need, subject to the retention rules above.',
      'Withdraw consent for any purpose, at any time.',
      'Grievance redressal: complain to our Grievance Officer and receive a response within the time the law sets.',
      'Nominate another person to exercise these rights on your behalf in the event of your death or incapacity.',
    ),
    p(
      `To use any of these rights, write to ${c.grievanceEmail} from the email address or mobile number linked to your account. We will confirm your identity before acting, and respond within 30 days. If you are not satisfied with our response, you may complain to the Data Protection Board of India.`,
    ),
    p(
      'As a Data Principal, you also have duties under the Act: to give accurate information, not to impersonate anyone, and not to file false or frivolous complaints.',
    ),

    h('protection', 'How we protect your data'),
    p(
      'We use reasonable technical and organisational safeguards: encryption in transit and at rest, private file storage shared only through short-lived links, role-based access limited to people who need it, multi-factor sign-in for doctors and administrators, access logging for clinical records, and regular reviews of who has access. No system is entirely free of risk.',
    ),
    p(
      'If a personal data breach affects you, we will tell you without delay — what happened, the likely impact, what we are doing about it and what you can do — and we will report it to the Data Protection Board of India as the law requires.',
    ),

    h('children', 'Children'),
    p(
      'YHC is only for adults aged 18 and over. We do not knowingly collect personal data from anyone under 18. If you believe a child has given us their data, write to us and we will delete it.',
    ),

    h('cookies', 'Cookies and analytics'),
    ul(
      'Essential cookies keep you signed in, remember your cart and keep the site working. They cannot be switched off.',
      'Analytics cookies help us understand which pages are useful, and advertising measurement cookies tell us whether our ads work. We use these only with your consent.',
      'You can change your choice at any time, and you can also block or delete cookies in your browser settings. Blocking essential cookies may stop parts of the site from working.',
    ),

    h('changes', 'Changes to this policy'),
    p(
      'We may update this policy as our service or the law changes. If a change affects how your data is used, we will tell you on WhatsApp or email before it takes effect and, where needed, ask for your consent again. The “Last updated” date at the top shows the current version.',
    ),

    h('contact', 'Contact and grievances'),
    p(
      `${c.grievanceName}, Your Hair Company — ${c.grievanceEmail}. We acknowledge every grievance within 48 hours. For general questions about your account, bookings or orders, write to ${c.supportEmail}.`,
    ),
  ];
}

function terms(c: LegalContext): ContentBlock[] {
  return [
    p(
      `These Terms & Conditions (“Terms”) govern your use of the Your Hair Company website and services — the scalp scan and assessment, online consultations, treatment plans and product orders. YHC is operated by ${operatorName()} (“YHC”, “we”, “us”). By creating an account, booking a consultation or placing an order, you agree to these Terms. Please read them together with our Privacy Policy, Refund Policy, Shipping Policy and Medical Disclaimer, which form part of these Terms.`,
    ),

    h('eligibility', 'Who can use YHC'),
    ul(
      'You must be at least 18 years old and able to enter into a binding contract under Indian law.',
      'You must have an Indian mobile number and a delivery address in India.',
      'You must give true, accurate and complete information about yourself and your health, and keep it up to date. You may book or order only for yourself unless we have agreed otherwise.',
    ),

    h('the-service', 'What YHC provides'),
    p(
      'YHC provides a guided online scalp scan and assessment, video consultations with a registered medical practitioner for hair and scalp concerns, doctor-recommended treatment plans, and hair-care products, some of which can be bought without a consultation.',
    ),
    sub('Telemedicine'),
    ul(
      `Consultations are delivered as telemedicine under the Telemedicine Practice Guidelines, 2020. Your doctor, ${c.doctorName}, identifies themselves with their name, qualifications and registration number, and confirms your identity and consent at the start of the consultation.`,
      'The doctor uses independent clinical judgement. They may decide that a remote consultation is not suitable for your concern, ask for tests or an in-person examination, or decline to prescribe.',
      'Video is the default mode. If a call cannot continue on video, the doctor decides whether it can safely continue another way or should be rescheduled.',
    ),
    sub('The 3D scalp scan and assessment'),
    p(
      'The scan and assessment are screening aids that help decide whether a consultation is likely to be useful. They are not a diagnosis or a prescription. Image quality depends on your device, lighting and how the scan is taken. The doctor reviews your scan, photos and history and makes the final decision about your care.',
    ),
    note(
      'YHC is not an emergency service. If you have a medical emergency, sudden severe symptoms or a serious reaction to a product, go to your nearest hospital or call emergency services.',
      'Not for emergencies',
    ),

    h('account', 'Your account'),
    p(
      'You sign in with a one-time code sent to your mobile number. You are responsible for keeping access to your phone and account to yourself; activity after a valid sign-in is treated as yours. Tell us promptly if you think someone else has used your account. We may suspend an account to protect you or others while we look into a problem.',
    ),

    h('consultations', 'Consultations'),
    ul(
      `A consultation is a one-to-one video call with ${c.doctorName}. You pay the consultation fee (currently ${c.consultFee}) when you book; your slot is confirmed only once payment is confirmed.`,
      'Please join on time, from a quiet, well-lit place, with a working camera and microphone. Rescheduling, cancellation and no-shows are covered by the Refund Policy.',
      'A consultation record and, where appropriate, a prescription will be available in your account after the call.',
    ),

    h('prescriptions', 'Prescriptions'),
    ul(
      'Prescription medicines are supplied only after a consultation, only against a valid prescription issued by the doctor, and only in the quantity prescribed.',
      'Your prescription belongs to you. You are free to buy prescribed medicines from any pharmacy; you are never obliged to buy from YHC.',
      'Follow the dosage and instructions given by your doctor and on the product leaflet. Tell your doctor about any other medicines, health conditions, pregnancy, plans for pregnancy or breastfeeding.',
    ),

    h('orders', 'Orders, prices and payment'),
    ul(
      'Prices are shown in Indian rupees and include GST. Any delivery charge is shown before you pay. A GST invoice is issued for every order.',
      'All orders and consultations are prepaid online through our payment partner, Razorpay, using the methods it supports (such as UPI, cards, net banking and wallets). Cash on delivery is not offered.',
      'An order or booking is confirmed only when we receive confirmation of payment from Razorpay — not when you are redirected back to the site. If money leaves your account but the payment is not confirmed, it is returned by Razorpay or your bank, or we refund it once it reaches us.',
      'We may decline or cancel an order, with a full refund, if a product is unavailable, a price or description was shown in error, we cannot deliver to your address, or a prescription product is ordered without a valid prescription.',
      'Delivery is covered by the Shipping Policy, and cancellations and refunds by the Refund Policy.',
    ),

    h('plans', 'Treatment plans'),
    p(
      'A plan is a supply of products for a set number of months, recommended by your doctor. Using it as directed, replying to check-ins and attending follow-ups help your doctor judge how you are responding and adjust your plan. Hair responds slowly and differently for everyone; individual results vary and no particular outcome or timeline is promised.',
    ),

    h('guarantee', 'Money-back guarantee'),
    p(
      c.guarantee
        ? 'Where a money-back guarantee is offered on a plan, it applies only when every condition in the Guarantee Terms is met, and a doctor reviews every claim. The Guarantee Terms set out the conditions in full and form part of these Terms.'
        : 'No money-back guarantee is currently offered. If one is introduced, its full conditions will be published on the Guarantee Terms page before it is offered anywhere on the site.',
    ),

    h('communications', 'Messages from us'),
    p(
      'We send booking, order, delivery and care messages on WhatsApp, SMS and email so we can provide the service. Marketing messages are sent only if you have agreed to them, and you can opt out at any time by replying STOP or changing your preferences in your account.',
    ),

    h('acceptable-use', 'Acceptable use'),
    p('When using YHC, you agree not to:'),
    ul(
      'Give false information, impersonate anyone, or book or order on someone else’s behalf without their permission.',
      'Resell, share or supply prescribed products to anyone else.',
      'Try to access other people’s data, probe or disrupt the site, or use bots or scrapers on it.',
      'Upload content that is unlawful, abusive, obscene or that belongs to someone else.',
      'Record consultations without the doctor’s consent, or behave abusively towards doctors or staff.',
    ),
    p(
      'We may end a consultation, cancel an order or suspend or close an account if these Terms are broken, refunding any amount owed for services not provided.',
    ),

    h('intellectual-property', 'Intellectual property'),
    p(
      'The YHC name and logo, site design, text, images, articles, scan and assessment experience, and software belong to YHC or its licensors and are protected by law. You may view and print pages for your personal use. You may not copy, reproduce, modify or use them commercially without our written permission. Your own photos and information remain yours; you give us permission to use them only as described in our Privacy Policy.',
    ),

    h('site-information', 'Information on this site'),
    p(
      'Articles and pages on this site are general education, not medical advice for you personally. We take care to keep them accurate and up to date, but they do not replace a consultation with a doctor who has assessed you. Links to other websites are provided for convenience; we are not responsible for their content.',
    ),

    h('liability', 'Limitation of liability'),
    ul(
      'We take care to run YHC well, but we cannot promise that the site, scan or video calls will always be available, uninterrupted or error-free.',
      'To the extent the law allows, we are not liable for indirect or consequential loss, or for loss caused by events beyond our reasonable control (such as network outages, courier disruption, natural events or government action).',
      'To the extent the law allows, our total liability for any claim relating to a consultation, plan or order is limited to the amount you paid for that consultation, plan or order.',
      'Clinical advice is given by the treating doctor in the exercise of their independent professional judgement.',
      'Nothing in these Terms limits any right you have under the Consumer Protection Act, 2019 or any other law that cannot be excluded by contract, or our liability for death or personal injury caused by negligence, or for fraud.',
    ),

    h('indemnity', 'Indemnity'),
    p(
      'You agree to compensate YHC for reasonable losses, costs and claims that arise because you knowingly gave false information, misused the service or prescribed products, or broke these Terms or the law.',
    ),

    h('law', 'Governing law and disputes'),
    p(
      `These Terms are governed by the laws of India. If you have a concern, please contact us first — most problems are resolved quickly through support or our Grievance Officer. Any dispute that cannot be resolved this way is subject to the jurisdiction of ${courts()}. This does not affect your right to approach a consumer commission under the Consumer Protection Act, 2019.`,
    ),

    h('general', 'General'),
    ul(
      'If any part of these Terms is found to be unenforceable, the rest continues to apply.',
      'If we do not enforce a right immediately, we have not given it up.',
      'You may not transfer your rights under these Terms. We may transfer ours to a business that takes over the YHC service, provided your rights are not reduced.',
    ),

    h('changes', 'Changes to these Terms'),
    p(
      'We may update these Terms from time to time. We will tell you about important changes before they take effect. The version that applies to a consultation or order is the one in force when you booked or placed it.',
    ),

    h('contact', 'Contact'),
    p(
      `Questions about these Terms: ${c.supportEmail}. Complaints: ${c.grievanceName}, ${c.grievanceEmail}. ${entityDetails(c.supportEmail)}`,
    ),
  ];
}

function refund(c: LegalContext): ContentBlock[] {
  return [
    p(
      'This Refund Policy explains when you can reschedule or cancel a consultation, cancel an order or return a product, and how refunds are paid. It applies to everything booked or bought from Your Hair Company and forms part of our Terms & Conditions. It does not affect your rights under the Consumer Protection Act, 2019.',
    ),

    h('consultation', 'Consultation fee'),
    p(`The consultation fee (currently ${c.consultFee}) is paid when you book.`),
    ul(
      `Rescheduling: you can move your consultation free of charge up to ${c.freeRescheduleHours} hours before it starts, from your account or by messaging us.`,
      'Cancelling more than 24 hours before your consultation: you receive a full refund of the consultation fee.',
      'Cancelling within 24 hours of your consultation: the fee is not refunded, but you can reschedule once at no extra charge.',
      'Missing your consultation without notice (a no-show): the fee is not refunded. If something unexpected stopped you from joining, write to us and we will look at it fairly.',
      'If the doctor cannot attend, or the call cannot take place because of a problem on our side, you choose between a free reschedule and a full refund.',
    ),
    ...(c.creditLine ? [note(c.creditLine, 'Consultation credit')] : []),

    h('orders', 'Plan and product orders'),
    sub('Before dispatch'),
    p(
      'You can cancel any order — a treatment plan or individual products — for a full refund at any time before it is dispatched. Message us on WhatsApp or email us with your order number, or cancel from your account where the option is shown.',
    ),
    sub('After dispatch'),
    ul(
      'Once an order has been dispatched it cannot be cancelled.',
      'After dispatch we accept returns only for items that arrive damaged, leaking or tampered with, items that are not what you ordered, or items that are past their expiry date on delivery — reported within 48 hours of delivery (see below).',
      'If a parcel is lost in transit, or cannot be delivered for a reason on our side, we send a replacement or give you a full refund.',
    ),
    note(
      'For your safety and the safety of other customers, opened or used treatment products — including prescription medicines, serums, solutions, tablets and supplements — cannot be returned or exchanged unless they arrived damaged, wrong or expired.',
      'Why opened products cannot be returned',
    ),

    h('damaged', 'Damaged, wrong or expired items'),
    ol(
      'Tell us on WhatsApp or by email within 48 hours of delivery, with your order number.',
      'Send clear photos of the item, its batch and expiry details, the packaging and the shipping label. An unboxing video helps, but is not required.',
      'We review your request and reply within 2 working days. If needed, we arrange a free pickup of the item.',
      'We then send a replacement or refund the item — your choice where both are possible.',
    ),
    p(
      'Requests made after 48 hours, or without photos, may not be accepted, because we cannot then confirm with our courier and supplier what happened.',
    ),

    h('guarantee', 'Money-back guarantee refunds'),
    p(
      c.guarantee
        ? 'Refunds under the money-back guarantee are made only as set out in the Guarantee Terms, including all of its conditions and the doctor-reviewed claim process. Consultation fees and products bought without a consultation are not covered by the guarantee.'
        : 'No money-back guarantee is currently offered. If one is introduced, refunds under it will follow the Guarantee Terms published at that time.',
    ),

    h('how-refunds-work', 'How and when refunds are paid'),
    ul(
      'Refunds are paid to the original payment method (UPI, card, net banking or wallet) through our payment partner, Razorpay.',
      'Approved refunds are credited within 5–7 working days. We share the refund reference so you can check with your bank; the exact time it appears depends on your bank or card issuer.',
      'If the original payment method can no longer accept a refund, we will pay it by bank transfer to an account in your name.',
      'All orders and consultations are prepaid, so there are no cash refunds.',
    ),

    h('contact', 'How to request a refund or cancellation'),
    ol(
      `Message us on WhatsApp or write to ${c.supportEmail}.`,
      'Include your name, the mobile number on your account, your booking or order number, what you would like us to do, and photos if the request is about a product.',
      'We acknowledge your request within one working day and keep you updated until it is resolved.',
    ),
    p(
      `If you are not satisfied with the outcome, you can write to our Grievance Officer at ${c.grievanceEmail}. We acknowledge grievances within 48 hours and aim to resolve them within one month.`,
    ),
  ];
}

function shipping(c: LegalContext): ContentBlock[] {
  return [
    p('We deliver across India through our courier partners. This page explains how delivery works.'),
    h('where', 'Where we deliver'),
    p(
      'We deliver to serviceable PIN codes across India. At checkout we check your PIN code; if we cannot deliver there, you will be told before you pay.',
    ),
    h('when', 'Dispatch and delivery times'),
    p(
      'Orders are packed and handed to the courier after payment is confirmed. Delivery time depends on your PIN code and the courier; we share the expected delivery date with your tracking link.',
    ),
    h('charges', 'Delivery charges'),
    p('Any delivery charge is shown at checkout, before you pay. Prices already include GST.'),
    h('tracking', 'Tracking your order'),
    ul(
      'As soon as your order ships, we send the tracking link on WhatsApp.',
      'You can also see order status in your account.',
      'We message you again when the parcel is out for delivery and when it is delivered.',
    ),
    h('address', 'Your address and delivery attempts'),
    ul(
      'Please give a complete address with a landmark and a phone number that will be answered.',
      'Couriers usually try more than once. If a parcel cannot be delivered and returns to us, we will contact you to arrange a reattempt or a refund.',
      'Some products are temperature or light sensitive; please bring parcels indoors promptly.',
    ),
    h('packaging', 'Packaging'),
    p(
      'Parcels are packed plainly. The outside of the package does not describe your condition or treatment.',
    ),
    h('problems', 'Damaged or missing parcels'),
    p(
      'If a parcel arrives damaged or is marked delivered but has not reached you, tell us within 48 hours. See the Refund Policy for what happens next.',
    ),
    h('contact', 'Questions'),
    p(`Message us on WhatsApp, or write to ${c.supportEmail}.`),
  ];
}

function guarantee(c: LegalContext): ContentBlock[] {
  const g = c.guarantee;
  if (!g) {
    return [
      p(
        'No money-back guarantee is currently offered. If one is introduced, its full conditions will be published on this page before it appears anywhere else on the site.',
      ),
    ];
  }
  const refundText =
    g.refundPercent === 100 ? 'your full plan payments' : `${g.refundPercent}% of your plan payments`;
  return [
    p(
      'Hair responds slowly and differently for everyone, and no treatment works for every person. The guarantee exists so that, if you follow your plan properly and see no visible improvement, you are not left out of pocket. It applies only when every condition below is met, and a doctor reviews every claim.',
    ),
    h('conditions', 'Conditions'),
    p('To be eligible, all of the following must be true:'),
    ol(
      `You bought a guarantee-eligible plan and followed it continuously for at least ${g.minPlanMonths} months.`,
      `You replied to at least ${g.minCheckinResponsePct}% of the weekly check-ins during that period.`,
      ...(g.requireMonthlyPhotos ? ['You shared progress photos every month, taken as the app asks.'] : []),
      ...(g.requireFollowupConsult ? ['You attended your follow-up consultation.'] : []),
      `You submit your claim within ${g.claimWindowDays} days of finishing the plan.`,
    ),
    h('when-it-starts', 'When the guarantee period starts'),
    p(
      'The period starts on the date your first paid guarantee-eligible plan order is delivered — not the date you paid. You can see, at any time, which conditions you currently meet in your account.',
    ),
    h('what-you-get', 'What is refunded'),
    p(`If your claim is approved, we refund ${refundText} for the plan covered by the claim.`),
    h('not-covered', 'What is not covered'),
    ul(
      'Consultation fees.',
      'Care products bought without a consultation.',
      'Periods where the plan was paused, stopped or not used as prescribed.',
      'Plans where any condition above was not met.',
    ),
    h('how-to-claim', 'How to make a claim'),
    ol(
      'From your account, submit a short statement and, if you wish, final photos taken the same way as your earlier ones.',
      `${c.doctorName} reviews your claim, comparing your photos over time and your adherence record.`,
      'The doctor approves or rejects the claim with notes. If it is rejected, you see which condition was not met.',
      'If approved, the refund is sent to your original payment method, or by bank transfer if the payment is too old to refund that way.',
      'We message you at every step.',
    ),
    note(
      'These terms are the same words shown beside plan prices and at checkout. You accept them when you buy your first plan, and the version you accepted is recorded.',
      'Same terms everywhere',
    ),
    h('contact', 'Questions'),
    p(
      `Write to ${c.supportEmail}, or to the grievance officer at ${c.grievanceEmail} if you disagree with a decision.`,
    ),
  ];
}

function disclaimer(c: LegalContext): ContentBlock[] {
  return [
    p(
      'Information on this website — including articles, concern pages, product pages, the scalp scan and the online assessment — is for general education and screening. It is not a diagnosis and is not a substitute for advice from a doctor who has assessed you.',
    ),
    h('telemedicine', 'Consultations are telemedicine'),
    p('YHC consultations follow the Telemedicine Practice Guidelines, 2020. In practice, this means:'),
    ul(
      `The doctor identifies themselves with their name, qualifications and registration number. ${c.doctorName}’s registration number appears on every prescription.`,
      'Your identity and consent are confirmed at the start of the consultation.',
      'Video is the default. The doctor decides whether a concern can be managed remotely, and may ask for an in-person examination or tests.',
      'The doctor may decline to prescribe if it is not appropriate.',
      'Consultation records and prescriptions are kept as medical records.',
    ),
    h('no-promises', 'Results and expectations'),
    ul(
      'Hair responds slowly and differently for everyone. Individual results vary.',
      'We do not promise specific outcomes or timelines.',
      'Concept images on this site show products, not treatment results.',
    ),
    h('safety', 'Using treatment safely'),
    ul(
      'Tell your doctor about every medicine, supplement and health condition, and if you are pregnant, planning a pregnancy or breastfeeding.',
      'Use products only as prescribed and read the leaflet that comes with them.',
      'Like any treatment, products can cause side effects in some people. Stop and contact us, or see a doctor, if you have a reaction.',
    ),
    h('emergencies', 'Not for emergencies'),
    p(
      'This service is not for emergencies. If you have a medical emergency, contact your nearest hospital or call emergency services.',
    ),
    h('association', 'Doctor association'),
    p(
      `${c.doctorName} is associated with Your Hair Company. You are always free to use your prescription elsewhere and are never obliged to buy from YHC.`,
    ),
  ];
}

function grievance(c: LegalContext): ContentBlock[] {
  return [
    p(
      'If something has gone wrong — with a booking, an order, a refund, your data or the way you were treated — and our support team has not resolved it, you can write to our grievance officer. This is required under the Consumer Protection (E-Commerce) Rules, 2020 and the Digital Personal Data Protection Act, 2023.',
    ),
    h('how-to-raise', 'How to raise a grievance'),
    p(`Email ${c.grievanceEmail} and include:`),
    ul(
      'Your name and the mobile number on your account',
      'Your order or booking reference, if you have one',
      'What happened, and what you would like us to do',
      'Any photos or screenshots that help',
    ),
    note(
      'Please do not include detailed medical information in an email. If your grievance is about clinical care, say so and we will arrange for the right person to contact you.',
    ),
    h('timelines', 'What happens next'),
    ol(
      'We acknowledge your grievance within 48 hours and give you a reference number.',
      'We investigate and keep you updated.',
      'We aim to resolve it within one month of receiving it, and tell you the outcome and the reasons.',
    ),
    h('data-requests', 'Requests about your data'),
    p(
      'You can also write to the grievance officer to access, correct or erase your personal data, or to withdraw consent. See the Privacy Policy for details.',
    ),
    h('escalation', 'If you are not satisfied'),
    ul(
      'Consumer complaints: the National Consumer Helpline, or the consumer commission for your district.',
      'Data protection complaints: the Data Protection Board of India, once you have used our grievance process.',
    ),
  ];
}

const DOCS: Record<
  LegalSlug,
  { title: string; summary: string; build: (c: LegalContext) => ContentBlock[] }
> = {
  privacy: {
    title: 'Privacy Policy',
    summary:
      'What we collect — including your scalp scan and health information — why, who can see it, where it is stored, how long it is kept, and your rights.',
    build: privacy,
  },
  terms: {
    title: 'Terms & Conditions',
    summary:
      'The terms for using YHC: the scalp scan, telemedicine consultations, prescriptions, orders and payments.',
    build: terms,
  },
  'refund-cancellation': {
    title: 'Refund Policy',
    summary:
      'Rescheduling and cancelling consultations, cancelling orders, returning damaged or wrong items, and how refunds are paid.',
    build: refund,
  },
  shipping: {
    title: 'Shipping Policy',
    summary: 'Where we deliver, charges, tracking on WhatsApp and what to do if a parcel goes wrong.',
    build: shipping,
  },
  guarantee: {
    title: 'Guarantee Terms',
    summary: 'The money-back guarantee conditions and how a claim is reviewed, when a guarantee is offered.',
    build: guarantee,
  },
  'medical-disclaimer': {
    title: 'Medical Disclaimer',
    summary: 'What the information on this site is, and is not, and how telemedicine consultations work.',
    build: disclaimer,
  },
  grievance: {
    title: 'Grievance Officer',
    summary: 'Who to write to if something has not been resolved, and how quickly we respond.',
    build: grievance,
  },
};

export const LEGAL_SLUGS = Object.keys(DOCS) as LegalSlug[];

export function isLegalSlug(slug: string): slug is LegalSlug {
  return Object.hasOwn(DOCS, slug);
}

export function getLegalSummary(slug: LegalSlug) {
  const d = DOCS[slug];
  return { slug, title: d.title, summary: d.summary, lastUpdated: LAST_UPDATED };
}

export function getLegalDocument(slug: LegalSlug, ctx: LegalContext): LegalDocument {
  const d = DOCS[slug];
  return {
    slug,
    title: d.title,
    summary: d.summary,
    lastUpdated: LAST_UPDATED,
    lastReviewed: LEGAL_ENTITY.lastReviewed,
    blocks: d.build(ctx),
  };
}
