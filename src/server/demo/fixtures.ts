import 'server-only';

import type {
  Concern,
  Doctor,
  Faq,
  GuaranteePolicy,
  MessageTemplate,
  Plan,
  Product,
  Setting,
  StaffUser,
} from '@/lib/domain/types';

/*
 * DEMO CONTENT. Product data, doctor credentials and guarantee terms are placeholders until the
 * client sends them. Copy follows PRD §15 (no banned claims; guarantee always with conditions).
 */

// TODO(client): Dr. Tyagi full name, qualifications, registration no., council, bio — see docs/12 C
export const DOCTOR: Doctor = {
  id: 'doc-tyagi',
  name: 'Dr. Tyagi',
  qualifications: 'MBBS, MD (Dermatology) · placeholder',
  registrationNo: 'REG-PENDING',
  council: 'State Medical Council · placeholder',
  bio: 'Dr. Tyagi is a dermatologist who focuses on hair and scalp health. Every YHC plan starts with a one-to-one video consultation, a look at your history and scalp photos, and a routine chosen for you — not a one-size-fits-all kit.',
};

export const PLANS: Plan[] = [
  {
    id: 'plan-1',
    slug: 'plan-1-month',
    name: '1-month plan',
    months: 1,
    pricePaise: 599900,
    compareAtPaise: null,
    isRecommended: false,
    description: 'One month of your doctor-recommended routine.',
  },
  {
    id: 'plan-2',
    slug: 'plan-2-months',
    name: '2-month plan',
    months: 2,
    pricePaise: 1099900,
    compareAtPaise: 1199800,
    isRecommended: false,
    description: 'Two months. Saves ₹999 compared with buying monthly.',
  },
  {
    id: 'plan-3',
    slug: 'plan-3-months',
    name: '3-month plan',
    months: 3,
    pricePaise: 1499900,
    compareAtPaise: 1799700,
    isRecommended: true,
    description: 'Three months. Saves ₹2,998 compared with buying monthly. Doctor-recommended duration.',
  },
];

// TODO(client): real product list, regulatory categories, HSN, GST, photos — see docs/12 D-P2
const EXPECT =
  'Hair grows in slow cycles. Many people first notice less shedding; any change in density takes several months of steady use. Individual results vary, and Dr. Tyagi reviews your progress at follow-up.';

export const PRODUCTS: Product[] = [
  {
    id: 'prod-topical',
    slug: 'topical-hair-solution',
    name: 'Topical Hair Solution',
    tagline: 'Prescription topical, dosed by Dr. Tyagi',
    description:
      'A leave-on scalp solution prescribed after your consultation. Strength and frequency are set for you, based on your pattern and history.',
    ingredients: [
      { name: 'Active ingredient (as prescribed)', role: 'Supports the hair growth cycle' },
      { name: 'Propylene glycol-free base', role: 'Gentler on sensitive scalps' },
    ],
    howToUse: 'Apply to a dry scalp as directed on your prescription. Wash hands after use.',
    whatToExpect: EXPECT,
    regulatoryCategory: 'drug',
    requiresConsultation: true,
    pricePaise: null,
    daysOfSupply: 30,
    hsn: '3004',
    gstRate: 12,
  },
  {
    id: 'prod-tablets',
    slug: 'hair-nutrition-tablets',
    name: 'Hair Nutrition Tablets',
    tagline: 'Daily nutrients, matched to your intake answers',
    description:
      'A daily supplement included when your consultation suggests a nutritional gap. Not a substitute for a balanced diet.',
    ingredients: [
      { name: 'Biotin', role: 'B-vitamin involved in keratin production' },
      { name: 'Iron and zinc', role: 'Minerals linked with hair health' },
      { name: 'Vitamin D3', role: 'Commonly low; checked at consultation' },
    ],
    howToUse: 'One tablet a day after a meal, or as prescribed.',
    whatToExpect: EXPECT,
    regulatoryCategory: 'supplement',
    requiresConsultation: true,
    pricePaise: null,
    daysOfSupply: 30,
    hsn: '2106',
    gstRate: 18,
  },
  {
    id: 'prod-serum',
    slug: 'scalp-serum',
    name: 'Scalp Serum',
    tagline: 'Lightweight serum for scalp comfort',
    description:
      'A non-greasy serum with peptides and botanical extracts that conditions the scalp. Part of most YHC plans.',
    ingredients: [
      { name: 'Peptide complex', role: 'Scalp conditioning' },
      { name: 'Rosemary leaf extract', role: 'Traditional botanical for scalp care' },
      { name: 'Niacinamide', role: 'Supports the scalp barrier' },
    ],
    howToUse: 'Massage 4–5 drops into the scalp at night.',
    whatToExpect: EXPECT,
    regulatoryCategory: 'cosmetic',
    requiresConsultation: true,
    pricePaise: null,
    daysOfSupply: 30,
    hsn: '3305',
    gstRate: 18,
  },
  {
    id: 'prod-shampoo',
    slug: 'gentle-strengthening-shampoo',
    name: 'Gentle Strengthening Shampoo',
    tagline: 'Sulphate-free daily cleanser',
    description:
      'A mild shampoo that cleans without stripping the scalp. Safe to use alongside your treatment routine.',
    ingredients: [
      { name: 'Mild amino-acid surfactants', role: 'Gentle cleansing' },
      { name: 'Panthenol', role: 'Conditions hair' },
    ],
    howToUse: 'Use on wet hair 3–4 times a week. Rinse well.',
    whatToExpect: 'A clean, comfortable scalp. A shampoo alone does not change hair density.',
    regulatoryCategory: 'cosmetic',
    requiresConsultation: false,
    pricePaise: 69900,
    daysOfSupply: 45,
    hsn: '3305',
    gstRate: 18,
  },
  {
    id: 'prod-conditioner',
    slug: 'lightweight-conditioner',
    name: 'Lightweight Conditioner',
    tagline: 'Detangles without weighing hair down',
    description: 'A light conditioner for lengths and ends that reduces breakage from combing.',
    ingredients: [
      { name: 'Hydrolysed proteins', role: 'Smooths the hair surface' },
      { name: 'Glycerin', role: 'Holds moisture' },
    ],
    howToUse: 'Apply to lengths after shampoo, leave 2 minutes, rinse.',
    whatToExpect: 'Softer, easier-to-comb hair with less breakage.',
    regulatoryCategory: 'cosmetic',
    requiresConsultation: false,
    pricePaise: 59900,
    daysOfSupply: 45,
    hsn: '3305',
    gstRate: 18,
  },
];

export const CONCERNS: Concern[] = [
  {
    slug: 'hair_fall',
    title: 'Hair fall',
    summary: 'More hair on the pillow, comb or shower drain than usual.',
    body: 'Shedding can rise with stress, illness, diet changes, hormones or genetics. A consultation helps tell temporary shedding apart from patterns that need treatment.',
  },
  {
    slug: 'thinning',
    title: 'Overall thinning',
    summary: 'Hair feels less dense, or your scalp shows more than before.',
    body: 'Diffuse thinning often has more than one cause. Dr. Tyagi reviews your history and photos to suggest a plan that fits your pattern.',
  },
  {
    slug: 'receding_hairline',
    title: 'Receding hairline',
    summary: 'The hairline at the temples or front is moving back.',
    body: 'Hairline changes are common and often genetic. Starting early gives more options; a doctor can explain what is realistic for you.',
  },
  {
    slug: 'crown_thinning',
    title: 'Crown thinning',
    summary: 'A thinner patch at the top or back of the head.',
    body: 'Crown thinning is often pattern-related. Treatment plans focus on steady routines and regular review.',
  },
  {
    slug: 'dandruff_scalp',
    title: 'Dandruff & scalp issues',
    summary: 'Flaking, itching or an irritated scalp.',
    body: 'A healthy scalp matters for hair. Some scalp conditions need medical treatment; others need a gentler routine.',
  },
];

export const FAQS: Faq[] = [
  {
    id: 'faq-1',
    category: 'consultation',
    question: 'How does the consultation work?',
    answer:
      'Pick a time, pay the ₹500 consultation fee, share a few details and scalp photos, then meet Dr. Tyagi on a 30-minute video call. You receive your personalised plan on WhatsApp after the call.',
  },
  {
    id: 'faq-2',
    category: 'consultation',
    question: 'Is the ₹500 adjusted if I buy a plan?',
    answer:
      'Yes. If you buy your recommended plan within 7 days of your consultation, ₹500 is deducted from the plan price. (Pending client confirmation.)',
  },
  {
    id: 'faq-3',
    category: 'plans',
    question: 'What do the plans cost?',
    answer: '1 month ₹5,999 · 2 months ₹10,999 · 3 months ₹14,999. Prices include GST.',
  },
  {
    id: 'faq-4',
    category: 'guarantee',
    question: 'How does the money-back guarantee work?',
    answer:
      'Follow your plan as prescribed for the minimum period, reply to check-ins, share monthly progress photos and attend your follow-up consultation. If there is no visible improvement, you can claim a refund under the published terms. (Draft terms — pending approval.)',
  },
  {
    id: 'faq-5',
    category: 'delivery',
    question: 'How long does delivery take?',
    answer:
      'Usually a few working days after payment. You get tracking on WhatsApp as soon as it ships. (SLA pending.)',
  },
  {
    id: 'faq-6',
    category: 'consultation',
    question: 'Do I have to buy a plan after the consultation?',
    answer:
      'No. Your prescription is yours whether or not you buy from YHC. Dr. Tyagi is associated with Your Hair Company, and we say so on every plan page.',
  },
];

// TODO(client): approved terms — see docs/15 D-P1. Values are our recommendation, shown as DRAFT.
export const GUARANTEE_POLICY: GuaranteePolicy = {
  version: 1,
  name: 'YHC Money-Back Guarantee v1 (DRAFT)',
  refundPercent: 100,
  minPlanMonths: 3,
  claimWindowDays: 30,
  minCheckinResponsePct: 75,
  requireMonthlyPhotos: true,
  requireFollowupConsult: true,
  termsMd:
    'If you follow your prescribed plan continuously for at least 3 months, reply to at least 75% of check-ins, share progress photos every month and attend your follow-up consultation, and see no visible improvement, you can claim a refund of 100% of your plan payments within 30 days of finishing the plan. A doctor reviews every claim.',
  isActive: true,
  isDraft: true,
};

export const STAFF: StaffUser[] = [
  { id: 'u-doctor', name: 'Dr. Tyagi', email: 'doctor@demo.yhc', role: 'doctor', active: true },
  { id: 'u-priya', name: 'Priya Sharma', email: 'priya@demo.yhc', role: 'sales', active: true },
  { id: 'u-rohit', name: 'Rohit Verma', email: 'rohit@demo.yhc', role: 'sales', active: true },
  { id: 'u-neha', name: 'Neha Gupta', email: 'neha@demo.yhc', role: 'sales', active: true },
  { id: 'u-arjun', name: 'Arjun Mehta', email: 'arjun@demo.yhc', role: 'ops', active: true },
  { id: 'u-admin', name: 'Kavya Iyer', email: 'admin@demo.yhc', role: 'admin', active: true },
];

export const TEMPLATES: MessageTemplate[] = [
  [
    'lead_welcome',
    'whatsapp',
    'marketing',
    'Hi {{1}}, thanks for reaching out to Your Hair Company. Book a video consultation with Dr. Tyagi or chat with our hair expert.',
  ],
  [
    'consult_link',
    'whatsapp',
    'utility',
    'Hi {{1}}, here is your link to book a consultation with Dr. Tyagi: {{2}}',
  ],
  [
    'booking_confirmed',
    'whatsapp',
    'utility',
    'Your consultation is confirmed. {{1}} with Dr. Tyagi (Reg. No. {{6}}) on {{2}} at {{3}} IST. Appointment ID {{4}}. Payment of ₹{{5}} received.',
  ],
  [
    'intake_reminder',
    'whatsapp',
    'utility',
    'Hi {{1}}, please complete your hair profile and upload scalp photos before your consultation on {{2}}.',
  ],
  [
    'consult_reminder_24h',
    'whatsapp',
    'utility',
    'Reminder: your consultation with Dr. Tyagi is tomorrow, {{1}} at {{2}} IST.',
  ],
  [
    'consult_reminder_1h',
    'whatsapp',
    'utility',
    'Your consultation with Dr. Tyagi starts in 1 hour ({{1}} IST). Please join from a quiet, well-lit place.',
  ],
  [
    'plan_ready',
    'whatsapp',
    'utility',
    'Hi {{1}}, Dr. Tyagi (Reg. No. {{2}}) has shared your personalised hair plan.',
  ],
  [
    'plan_unpaid_nudge',
    'whatsapp',
    'utility',
    'Your plan from Dr. Tyagi is ready. The link is valid until {{1}}.',
  ],
  [
    'order_confirmed',
    'whatsapp',
    'utility',
    'Order {{1}} confirmed. Amount paid ₹{{2}}. We will share tracking as soon as it ships.',
  ],
  [
    'order_shipped',
    'whatsapp',
    'utility',
    'Your order {{1}} has shipped with {{2}}. Expected delivery: {{3}}.',
  ],
  [
    'order_delivered',
    'whatsapp',
    'utility',
    'Your order {{1}} was delivered. Here is how to start your routine.',
  ],
  ['care_checkin', 'whatsapp', 'utility', 'Week {{1}} check-in: how is your routine going?'],
  [
    'progress_photo_request',
    'whatsapp',
    'utility',
    'Time for your monthly progress photos. They help Dr. Tyagi review your plan.',
  ],
  [
    'refill_reminder',
    'whatsapp',
    'utility',
    'Your current plan ends around {{1}}. Continue your plan so there is no gap.',
  ],
  ['followup_consult_due', 'whatsapp', 'utility', 'It is time for your follow-up review with Dr. Tyagi.'],
  ['otp_login', 'whatsapp', 'authentication', '{{1}} is your Your Hair Company verification code.'],
  [
    'otp_login_sms',
    'sms',
    'authentication',
    '{#var#} is your Your Hair Company verification code. Do not share it. - YHC',
  ],
  ['booking_confirmed_email', 'email', 'utility', 'Consultation confirmed — {{date}} {{time}} IST'],
  ['plan_ready_email', 'email', 'utility', 'Your personalised hair plan from Dr. Tyagi'],
].map(([key, channel, category, bodyPreview], i) => ({
  key: key as string,
  channel: channel as MessageTemplate['channel'],
  category: category as MessageTemplate['category'],
  bodyPreview: bodyPreview as string,
  approval: i % 7 === 6 ? 'pending' : 'approved',
}));

export const SETTINGS: Setting[] = [
  { key: 'consult.fee_paise', value: '50000', description: 'First consultation fee (paise)' },
  {
    key: 'consult.hold_minutes',
    value: '10',
    description: 'Minutes a slot stays held while the customer pays',
  },
  { key: 'consult.slot_minutes', value: '30', description: 'Consultation length' },
  { key: 'consult.buffer_minutes', value: '10', description: 'Gap between consultations' },
  { key: 'consult.booking_window_days', value: '7', description: 'How many days ahead customers can book' },
  { key: 'consult.min_notice_minutes', value: '60', description: 'Earliest bookable slot from now' },
  { key: 'consult.max_per_day', value: '12', description: 'Maximum consultations per day' },
  {
    key: 'consult.credit_enabled',
    value: 'true',
    description: 'Credit the consultation fee against the first plan',
  },
  {
    key: 'consult.credit_window_days',
    value: '7',
    description: 'Days after a completed consult in which the credit can be used',
  },
  {
    key: 'consult.free_reschedule_hours',
    value: '6',
    description: 'Free reschedule allowed until this many hours before start',
  },
  { key: 'recommendation.link_ttl_hours', value: '72', description: 'Plan payment link validity' },
  { key: 'recommendation.nudge_after_hours', value: '24', description: 'WhatsApp nudge if plan unpaid' },
  { key: 'refill.reminder_days_before', value: '[7, 4, 1]', description: 'Refill reminders before plan end' },
  {
    key: 'sales.first_contact_sla_minutes',
    value: '15',
    description: 'Target time to first contact a new lead',
  },
  {
    key: 'messaging.quiet_hours',
    value: '{"start":"21:00","end":"09:00"}',
    description: 'No scheduled non-urgent messages in this IST window',
  },
  {
    key: 'guarantee.enabled',
    value: 'true',
    description: 'Show the guarantee (demo: on, with DRAFT terms; production default off until approved)',
  },
];
