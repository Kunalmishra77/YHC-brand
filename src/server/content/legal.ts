import 'server-only';

import type { GuaranteePolicy } from '@/lib/domain/types';
import type { ContentBlock } from './types';

/*
 * DRAFT policy text for an Indian D2C telemedicine + e-commerce business (docs/09). Product-design
 * drafts only — not legal advice. Values that live in settings (fees, windows) are passed in, never
 * hard-coded. Every page renders under the "Draft — to be replaced with counsel-approved text" banner.
 * TODO(client): counsel-approved text for every policy, legal entity name, registered address — see docs/12 (legal), docs/09 §10
 */

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
  blocks: ContentBlock[];
}

const LAST_UPDATED = '2026-09-30';

const h = (id: string, text: string): ContentBlock => ({ type: 'heading', id, text });
const p = (text: string): ContentBlock => ({ type: 'paragraph', text });
const ul = (...items: string[]): ContentBlock => ({ type: 'list', items });
const ol = (...items: string[]): ContentBlock => ({ type: 'list', items, ordered: true });
const note = (text: string, title?: string): ContentBlock => ({ type: 'callout', text, title });

function privacy(c: LegalContext): ContentBlock[] {
  return [
    p(
      'This policy explains what personal data Your Hair Company (“YHC”, “we”) collects, why, who it is shared with, how long it is kept and the rights you have. It is written with the Digital Personal Data Protection Act, 2023 and the rules made under it in mind. In that Act’s terms, you are the Data Principal and YHC is the Data Fiduciary.',
    ),
    h('who-we-are', 'Who we are'),
    p(
      'YHC provides online hair and scalp consultations with a registered medical practitioner, and sells the products they prescribe or recommend. Our legal entity name and registered address will be shown here.',
    ),
    h('what-we-collect', 'What we collect'),
    ul(
      'Contact and account details: your name, mobile number, email address (if you give one) and age.',
      'Delivery details: your address and PIN code.',
      'Booking, order and payment records: what you booked or bought, amounts and payment status. Card, UPI and bank details are entered with our payment provider; we do not see or store them.',
      'Health information you give for your care: your health questionnaire, scalp photos, consultation notes, assessments and prescriptions.',
      'Messages you send us on WhatsApp, email or the contact form, and replies to check-ins.',
      'Technical data: device and browser type, pages visited and approximate location from your IP address, through cookies and similar tools.',
    ),
    h('why-we-use-it', 'Why we use it'),
    p('We use each kind of data only for the purposes we tell you about at the time we collect it:'),
    ul(
      'To book and hold your consultation, and to confirm it on WhatsApp, SMS or email.',
      'To let your doctor understand your history, examine your photos and prescribe safely.',
      'To process payments, deliver orders, issue GST invoices and handle refunds.',
      'To send care messages you have agreed to: reminders, check-ins, refill and follow-up messages.',
      'To send marketing messages, only if you have separately agreed to them.',
      'To run the money-back guarantee, where offered, including checking whether its conditions are met.',
      'To keep the service working, prevent fraud and meet our legal obligations.',
    ),
    h('consent', 'Consent, and changing your mind'),
    p(
      'We ask for your consent separately for each purpose — for example the privacy notice, the telemedicine consultation, WhatsApp updates, marketing, and any use of your photos beyond your own care. We record which version of each notice you agreed to and when.',
    ),
    p(
      'You can withdraw any consent at any time, as easily as you gave it: from your account, by replying STOP to marketing messages, or by writing to the grievance officer. Withdrawing consent does not affect processing that already happened, and some records must still be kept by law (see “How long we keep data”).',
    ),
    h('clinical-data', 'How health information is handled'),
    ul(
      'Your health questionnaire, photos, consultation notes and prescriptions are available to your treating doctor and to staff who need them for your care.',
      'Our sales and support team helps with bookings, orders and delivery. They cannot see your clinical information.',
      'Health details are never put into WhatsApp marketing text, email subject lines, calendar invitations or error logs.',
      'Every time a clinical record is opened, the access is logged.',
      'Your photos are never used in marketing or published stories unless you separately agree in writing, and you can withdraw that agreement.',
    ),
    h('sharing', 'Who we share data with'),
    p(
      'We do not sell personal data. We share it only with service providers (Data Processors) who help us run the service, under contracts that limit their use of it to our instructions:',
    ),
    ul(
      'Payment processing (Razorpay)',
      'WhatsApp messaging through our WhatsApp Business provider, SMS (MSG91) and email (Resend)',
      'Video consultations (LiveKit, or Google Meet as a fallback) and doctor scheduling (Google Calendar — appointment times only, no health details)',
      'Courier and shipping partners (through Shiprocket) — name, phone and address only',
      'Hosting and database (Supabase, Vercel) and error monitoring (Sentry — configured to exclude clinical data)',
      'Website analytics and advertising measurement (Google Analytics, Meta) — never health information',
    ),
    p(
      'We may also disclose data where the law requires it, for example to a court or a government authority acting lawfully.',
    ),
    h('where-stored', 'Where your data is stored'),
    p(
      'Our database and file storage are hosted in India (Mumbai region). Some service providers listed above may process limited data outside India; where they do, we rely on the transfer rules under Indian law.',
    ),
    h('retention', 'How long we keep data'),
    ul(
      'Medical records — consultation notes, prescriptions and related photos — are kept for the period required for medical records (Indian medical regulations reference at least three years; the exact period is being confirmed with counsel). If you ask us to erase your data, these records are restricted and anonymised where deletion is not allowed.',
      'Invoices, payment and order records are kept for the period required by tax and accounting law.',
      'Marketing preferences are kept until you withdraw consent, and then only as a record that you opted out.',
      'Other account data is deleted or anonymised when it is no longer needed for the purpose it was collected for.',
    ),
    h('your-rights', 'Your rights'),
    ul(
      'Access: ask for a summary of the personal data we hold about you and how it is used.',
      'Correction and completion: ask us to fix data that is wrong or incomplete.',
      'Erasure: ask us to delete data we no longer need, subject to the retention rules above.',
      'Withdraw consent for any purpose, at any time.',
      'Grievance redressal: complain to our grievance officer, and then to the Data Protection Board of India if you are not satisfied.',
      'Nominate someone to exercise these rights on your behalf if you die or become unable to.',
    ),
    p(
      `To use any of these rights, write to ${c.grievanceEmail}. We will confirm your identity before acting on the request.`,
    ),
    h('protection', 'How we protect data'),
    p(
      'Data is encrypted in transit, files are kept in private storage and shared only through short-lived links, access is limited to people who need it, clinical access requires multi-factor sign-in, and access to clinical records is logged. No system is free of risk; if a personal data breach affects you, we will tell you and the Data Protection Board as the law requires.',
    ),
    h('children', 'Children'),
    p('YHC is for adults aged 18 and over. We do not knowingly collect data from children.'),
    h('cookies', 'Cookies and analytics'),
    p(
      'We use essential cookies to keep you signed in and remember your cart, and analytics cookies to understand how the site is used. You can block non-essential cookies in your browser.',
    ),
    h('changes', 'Changes to this policy'),
    p(
      'If we change this policy in a way that affects how your data is used, we will tell you and, where needed, ask for your consent again. The date at the top shows the latest version.',
    ),
    h('contact', 'Contact and grievances'),
    p(`${c.grievanceName} — ${c.grievanceEmail}. For general questions, write to ${c.supportEmail}.`),
  ];
}

function terms(c: LegalContext): ContentBlock[] {
  return [
    p(
      'These terms apply when you use the Your Hair Company website, book a consultation or buy a product. By using the service you agree to them. Please read them with the Privacy Policy, the Refund & Cancellation Policy and the Medical Disclaimer.',
    ),
    h('the-service', 'The service'),
    p(
      'YHC arranges online video consultations with a registered medical practitioner for hair and scalp concerns, and sells the products they prescribe or recommend. YHC also sells some care products that do not need a consultation.',
    ),
    h('eligibility', 'Who can use it'),
    ul(
      'You must be 18 or older.',
      'You must have an Indian mobile number and a delivery address in India.',
      'You must give true and complete information about yourself and your health.',
    ),
    h('account', 'Your account'),
    p(
      'You sign in with a one-time code sent to your mobile number. Keep access to your phone to yourself; activity after a valid sign-in is treated as yours. Tell us promptly if you think someone else has used your account.',
    ),
    h('consultations', 'Consultations and prescriptions'),
    ul(
      `A consultation is a one-to-one video call with ${c.doctorName}. Booking it requires the consultation fee (currently ${c.consultFee}).`,
      'The doctor uses independent clinical judgement. They may decide that treatment is not appropriate, that you need tests or an in-person examination, or that a video consultation is not suitable for your concern.',
      'Prescription products are supplied only after a consultation and only as prescribed.',
      'Your prescription is yours. You are free to buy prescribed products anywhere; you are not required to buy from YHC.',
      'The service is not for emergencies. If you need urgent care, contact your nearest hospital.',
    ),
    h('orders', 'Products, prices and payment'),
    ul(
      'Prices are shown in Indian rupees and include GST. Any delivery charge is shown before you pay.',
      'Payment is taken in advance online. Cash on delivery is not offered.',
      'An order is confirmed only when we receive confirmation of payment from our payment provider — not when you are redirected back to the site.',
      'We may cancel and fully refund an order if a product is unavailable, a price was shown in error, or we cannot deliver to your address.',
    ),
    h('plans', 'Treatment plans'),
    p(
      'A plan is a supply of products for a set number of months, recommended by your doctor. Using it as directed, replying to check-ins and attending follow-ups help your doctor judge how you are responding. Individual results vary and no particular outcome is promised.',
    ),
    h('guarantee', 'Money-back guarantee'),
    p(
      c.guarantee
        ? 'Where a money-back guarantee is offered, it applies only when every condition in the Guarantee Terms is met, and a doctor reviews every claim. The Guarantee Terms page sets out the conditions in full.'
        : 'No money-back guarantee is currently offered. If one is introduced, its full conditions will be published on the Guarantee Terms page first.',
    ),
    h('use-of-site', 'Using the site fairly'),
    ul(
      'Do not misuse the site, try to access other people’s data, or interfere with how it works.',
      'Do not upload content that is unlawful, abusive or belongs to someone else.',
      'Be respectful to doctors and staff. We may end a consultation or close an account in case of abuse.',
    ),
    h('content', 'Information on this site'),
    p(
      'Articles and pages on this site are general education, not medical advice for you personally. Site content, design and branding belong to YHC or its licensors and may not be copied for commercial use without permission.',
    ),
    h('liability', 'Our responsibility'),
    p(
      'We take care to run the service well, but cannot promise it will always be available or error-free. To the extent the law allows, our liability for any claim relating to an order or consultation is limited to the amount you paid for it. Nothing in these terms limits rights you have under the Consumer Protection Act, 2019 or other law that cannot be excluded.',
    ),
    h('law', 'Governing law'),
    p(
      'These terms are governed by the laws of India. Courts at the city of YHC’s registered office will have jurisdiction, without affecting your right to approach a consumer commission.',
    ),
    h('changes', 'Changes'),
    p(
      'We may update these terms. The version that applies to an order or consultation is the one in force when you placed or booked it.',
    ),
    h('contact', 'Contact'),
    p(`Questions: ${c.supportEmail}. Complaints: ${c.grievanceName}, ${c.grievanceEmail}.`),
  ];
}

function refund(c: LegalContext): ContentBlock[] {
  return [
    p(
      'This policy explains when you can reschedule or cancel a consultation, cancel an order, and get a refund. The consultation rules below are the recommended rules awaiting the client’s confirmation.',
    ),
    h('consultation', 'Consultation fee'),
    p(`The first consultation fee is ${c.consultFee}, paid when you book.`),
    ul(
      `Reschedule free of charge until ${c.freeRescheduleHours} hours before your consultation.`,
      'Cancel more than 24 hours before your consultation for a full refund.',
      'Cancel within 24 hours of your consultation: the fee is not refunded, but you can reschedule once at no charge.',
      'If you do not join the call (a no-show), the fee is not refunded.',
      'If the doctor cannot attend, or the call cannot happen because of a problem on our side, you choose between a free reschedule and a full refund.',
    ),
    ...(c.creditLine ? [note(c.creditLine, 'Consultation credit')] : []),
    h('orders', 'Cancelling an order'),
    ul(
      'Before dispatch: you can cancel any order for a full refund. Message us on WhatsApp or write to us.',
      'After dispatch: orders cannot be cancelled. You may refuse the parcel at delivery; once it has come back to us unopened, we refund the product amount.',
      'Treatment plans are prescribed for you. Opened or used products cannot be returned, for safety and hygiene reasons.',
    ),
    h('damaged', 'Damaged, wrong or missing items'),
    p(
      'If a product arrives damaged, leaking, or is not what you ordered, tell us on WhatsApp or email within 48 hours of delivery (window to be confirmed), with a photo of the item and the packaging. We will send a replacement or refund the item — your choice where both are possible.',
    ),
    h('how-refunds-work', 'How refunds are paid'),
    ul(
      'Refunds go back to the original payment method through our payment provider.',
      'We start the refund once it is approved and share a reference. How long it takes to appear depends on your bank or card issuer.',
      'Orders are prepaid only; we do not offer cash on delivery, so there are no cash refunds.',
    ),
    h('guarantee', 'Guarantee refunds'),
    p(
      c.guarantee
        ? 'Refunds under the money-back guarantee follow the Guarantee Terms, including its conditions and claim process.'
        : 'No money-back guarantee is currently offered.',
    ),
    h('contact', 'How to ask'),
    p(
      `Message us on WhatsApp or write to ${c.supportEmail} with your order or booking reference. If you are not happy with the outcome, you can write to the grievance officer at ${c.grievanceEmail}.`,
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
      'Orders are packed and handed to the courier after payment is confirmed. Delivery time depends on your PIN code. Confirmed dispatch and delivery times will be listed here.',
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
      'If a parcel arrives damaged or is marked delivered but has not reached you, tell us as soon as you can. See the Refund & Cancellation Policy for what happens next.',
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
      'Information on this website — including articles, concern pages, product pages and the online assessment — is for general education. It is not a diagnosis and is not a substitute for advice from a doctor who has assessed you.',
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
    title: 'Privacy policy',
    summary: 'What we collect, why, who sees it, where it is stored, how long it is kept, and your rights.',
    build: privacy,
  },
  terms: {
    title: 'Terms of use',
    summary: 'The rules for using the site, booking consultations and buying products.',
    build: terms,
  },
  'refund-cancellation': {
    title: 'Refund & cancellation',
    summary: 'Rescheduling and cancelling consultations, cancelling orders, and how refunds are paid.',
    build: refund,
  },
  shipping: {
    title: 'Shipping policy',
    summary: 'Where we deliver, charges, tracking on WhatsApp and what to do if a parcel goes wrong.',
    build: shipping,
  },
  guarantee: {
    title: 'Guarantee terms',
    summary: 'The money-back guarantee conditions and how a claim is reviewed, when a guarantee is offered.',
    build: guarantee,
  },
  'medical-disclaimer': {
    title: 'Medical disclaimer',
    summary: 'What the information on this site is, and is not, and how telemedicine consultations work.',
    build: disclaimer,
  },
  grievance: {
    title: 'Grievance officer',
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
  return { slug, title: d.title, summary: d.summary, lastUpdated: LAST_UPDATED, blocks: d.build(ctx) };
}
