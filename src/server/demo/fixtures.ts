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
  name: 'Dr. Anil Tyagi',
  qualifications: 'Dermatologist', // TODO(client): full qualifications — docs/16 C1
  registrationNo: 'to be added', // TODO(client): medical registration number — docs/16 C1
  council: 'State Medical Council', // TODO(client): exact council name — docs/16 C1
  bio: 'Dr. Tyagi is a dermatologist who focuses on hair and scalp health. He helped develop YHC’s products and our roots-first approach: look at the scalp first, then suggest a routine only if it can help.',
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
    description: 'One month of your routine.',
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
    description: 'Three months. Saves ₹2,998 compared with buying monthly.',
  },
];

/*
 * The real YHC range, transcribed from the client's label artwork (YHC-assets, 2026-10-18). Each
 * product comes in a men's and a women's pack with the same listed formula (src/lib/brand-media.ts).
 * Copy states what is on the label and how the doctor uses it — never the label's efficacy claims
 * (ADR-32). Ingredient amounts are left out until the master formula is confirmed (docs/16 D).
 * TODO(client): regulatory category, HSN/GST, MRP policy and final directions per product — docs/16 D.
 */
const EXPECT =
  'Hair grows slowly. Many people first notice less hair fall. Thicker-looking hair, if it comes, takes several months of daily use. Individual results vary. Dr. Tyagi checks your progress at follow-up.';

const AYURVEDIC_BLEND = [
  { name: 'Amla (Phyllanthus emblica)', role: 'Fruit listed in the Ayurvedic blend' },
  { name: 'Arjun (Terminalia arjuna)', role: 'Bark listed in the Ayurvedic blend' },
  { name: 'Bhringraj (Eclipta prostrata)', role: 'Herb traditionally used in Ayurvedic hair care' },
  { name: 'Shatavari (Asparagus racemosus)', role: 'Root listed in the Ayurvedic blend' },
  { name: 'Shuddh lakh (Laccifer lacca)', role: 'Purified lac resin listed in the blend' },
  { name: 'Ashwagandha (Withania somnifera)', role: 'Root listed in the Ayurvedic blend' },
];

export const PRODUCTS: Product[] = [
  {
    id: 'prod-topical',
    slug: 'hair-regrowth-solution',
    name: 'Hair Regrowth Solution',
    tagline: 'Scalp solution · 60 ml · prescription only',
    description:
      'A solution you put on your scalp and leave on. Its label lists branded cosmetic actives and finasteride, a prescription medicine. So you can get it only with a doctor’s prescription. Your doctor tells you how to use it.',
    ingredients: [
      { name: 'Redensyl', role: 'Branded cosmetic active listed on the label' },
      { name: 'Anagain', role: 'Pea-sprout extract (branded active) listed on the label' },
      { name: 'Procapil', role: 'Branded cosmetic active listed on the label' },
      { name: 'Capilia Longa', role: 'Turmeric-derived branded active listed on the label' },
      { name: 'Finasteride', role: 'Prescription medicine — used only when the doctor prescribes it' },
    ],
    howToUse:
      'Follow your prescription. The label says: fill the dropper to 1 ml. Put the drops on the thin areas of your scalp. Rub in gently with your fingertips. Do this twice a day. Wash your hands after.',
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
    slug: 'hair-nourishing-tablets',
    name: 'Hair Nourishing Tablets',
    tagline: 'Daily tablet · 30 tablets · plants, vitamins and minerals',
    description:
      'One tablet a day with 3 plant extracts, vitamins and minerals. It may help if your diet is missing something. It does not replace healthy food. Our hair-care team can tell you if it suits you.',
    ingredients: [
      { name: 'Green tea (Camellia sinensis)', role: 'Botanical listed on the label' },
      { name: 'Bhringraj (Eclipta prostrata)', role: 'Herb traditionally used in Ayurvedic hair care' },
      { name: 'Pumpkin seed (Cucurbita pepo)', role: 'Seed extract listed on the label' },
      { name: 'Iron', role: 'Mineral' },
      { name: 'Zinc', role: 'Mineral' },
      { name: 'Vitamin A', role: 'Vitamin' },
      { name: 'Copper', role: 'Trace mineral' },
      { name: 'Folic acid', role: 'B-group vitamin' },
      { name: 'Vitamin B5', role: 'B-group vitamin' },
      { name: 'Biotin', role: 'B-group vitamin' },
    ],
    howToUse: 'Take 1 tablet after dinner, as the label says — or as your doctor tells you.',
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
    slug: 'hair-regrowth-capsules',
    name: 'Hair Regrowth Capsules',
    tagline: 'Ayurvedic capsules · 30 capsules · with amla and bhringraj',
    description:
      'An Ayurvedic mix of 6 plants, mainly amla and bhringraj, in a capsule. Our hair-care team can tell you if it suits you.',
    ingredients: AYURVEDIC_BLEND,
    howToUse: 'Take it the way your doctor tells you.',
    whatToExpect: EXPECT,
    regulatoryCategory: 'ayurvedic',
    requiresConsultation: true,
    pricePaise: null,
    daysOfSupply: 30,
    hsn: '3004',
    gstRate: 12,
  },
];
/*
 * Concern pages and FAQs: general education, worded to match published sources (AAD, NHS, DermNet,
 * StatPearls) — see src/server/content/evidence.ts for the citations. Never a diagnosis or a promise.
 * TODO(client): Dr. Tyagi to review all concern and FAQ copy before launch — see docs/12 (content).
 */
export const CONCERNS: Concern[] = [
  {
    slug: 'hair_fall',
    title: 'Hair fall',
    summary: 'More hair than usual on your pillow, comb or shower drain.',
    body: 'Losing about 50 to 100 hairs a day is normal. Old hairs fall so new ones can grow. Heavy hair fall often comes after a shock to the body — illness, high fever, childbirth, surgery, a crash diet or a very stressful time. It usually starts about 3 months later (anywhere from 1 to 6 months). This kind of hair fall often settles once the cause has passed (doctors call it telogen effluvium). But it can also show the start of pattern thinning. Checking your roots and your recent history tells the two apart.',
    causes: [
      'An illness, high fever, surgery or very stressful time in the last few months',
      'Having a baby — hair fall often starts a few months after the birth',
      'Losing weight fast, or eating too little protein',
      'Low iron, or a thyroid that is too slow or too fast',
      'Starting some medicines, or stopping the birth-control pill',
      'An early sign of pattern hair loss',
    ],
    questions: [
      'When did you first notice more hair fall? Has it changed since?',
      'In the 6 months before, did you have an illness, fever, surgery, a baby, a new medicine or a big life change?',
      'How are your food, sleep and stress right now?',
      'Have you had blood tests lately — for example iron or thyroid?',
      'Does anyone in your close family have thinning hair?',
    ],
    seeSoon: [
      'Hair coming out in patches or clumps',
      'Heavy hair fall that has not eased after about 6 months, or keeps coming back',
      'Pain, burning, redness or sores on the scalp',
      'Hair fall along with tiredness, feeling cold, weight change or irregular periods',
    ],
    relatedProducts: ['hair-nourishing-tablets', 'hair-regrowth-capsules'],
  },
  {
    slug: 'thinning',
    title: 'Overall thinning',
    summary: 'Your hair feels less thick, or more scalp shows than before.',
    body: 'All-over thinning — a wider parting, a thinner ponytail, more scalp showing in bright light — often has more than one cause. In pattern hair loss, hair roots slowly get smaller and grow finer, shorter hairs (miniaturisation). In women it usually shows as a wider parting, not a receding hairline. Food and thyroid problems can add to it. The same look can have different causes. So we look closely at your roots and your history before any plan.',
    causes: [
      'Pattern hair loss, which often runs in families',
      'Low iron or other gaps in your diet — best to test, not guess',
      'Thyroid problems, pregnancy, menopause or other hormone changes',
      'A long spell of heavy hair fall after illness or stress',
      'Styling that pulls on the hair or damages it with heat',
    ],
    questions: [
      'Where do you notice it most — parting, crown or all over?',
      'Have you had blood tests in the last year?',
      'For women: any change in periods, a recent pregnancy, or menopause?',
      'Which hair products, treatments and styling tools do you use?',
      'Does thinning hair run in your family?',
    ],
    seeSoon: [
      'Thinning that gets clearly worse month by month',
      'Patchy bald spots or broken hairs',
      'Scalp pain, flaking or redness',
      'Thinning along with acne, new facial hair or irregular periods',
    ],
    relatedProducts: ['hair-regrowth-solution', 'hair-regrowth-capsules', 'hair-nourishing-tablets'],
  },
  {
    slug: 'receding_hairline',
    title: 'Receding hairline',
    summary: 'Your hairline at the temples or front is moving back.',
    body: 'Hairline changes are common and often run in families. In one Indian study, more than half of men aged 30 to 50 had some pattern hair loss. Some change with age is normal. A fast or uneven change is worth a check. Skin doctors say treatment tends to work best when started soon after you notice hair loss. Less often, a hairline moves back because of tight hairstyles or scarring. A scarred hair root cannot grow hair again. That is why an early check matters.',
    causes: [
      'Pattern hair loss, linked to genes and hormones',
      'Tight hairstyles that pull at the front for months or years (traction)',
      'Less often, scarring conditions that affect the hairline and eyebrows',
    ],
    questions: [
      'How fast has your hairline changed, and over how long?',
      'Did a parent or grandparent have a similar pattern?',
      'Do you often tie your hair back tightly, or wear a helmet or cap for long hours?',
      'Have you tried any treatment before? What, for how long, and did it help?',
    ],
    seeSoon: [
      'Redness, itching, burning or shiny skin along the hairline',
      'Losing eyebrow hair as well as hairline',
      'Very fast change over a few months',
    ],
    relatedProducts: ['hair-regrowth-solution', 'hair-regrowth-capsules'],
  },
  {
    slug: 'crown_thinning',
    title: 'Crown thinning',
    summary: 'A thinner patch on the top or back of your head.',
    body: 'Crown thinning is often pattern hair loss. It is easy to miss until someone mentions it or a photo shows it. Close up, the hairs are of mixed thickness and each root group has fewer hairs. That is hard to see in a mirror. Hair grows about 1 cm a month, and any treatment is judged over several months. So your plan is about a steady routine, monthly photos taken the same way, and regular check-ups with Dr. Tyagi.',
    causes: [
      'Pattern hair loss, which often starts at the crown in men',
      'Hormones',
      'Gaps in your diet, or recent hair fall, that make thinning easier to see',
    ],
    questions: [
      'When did you, or someone else, first notice your crown?',
      'Do you have photos from a year or two ago to compare?',
      'Which medicines, supplements or treatments do you use now?',
      'Does anyone in your family have a similar pattern?',
    ],
    seeSoon: [
      'A smooth, fully bald round patch',
      'Sores, crusts or pain on the crown',
      'Thinning that is spreading fast',
    ],
    relatedProducts: ['hair-regrowth-solution', 'hair-nourishing-tablets', 'hair-regrowth-capsules'],
  },
  {
    slug: 'dandruff_scalp',
    title: 'Dandruff & scalp issues',
    summary: 'Flakes, itching or a sore, irritated scalp.',
    body: 'Dandruff is common. It is not harmful, and you cannot catch it from anyone. Flakes and itching can come from an oily, flaky skin condition linked to a yeast that normally lives on skin (seborrhoeic dermatitis). They can also come from dryness, product build-up or sensitive skin. An anti-dandruff shampoo from the chemist is the usual first step. Give it about 4 weeks. If it does not help, or your scalp is red, swollen or very itchy, see a doctor. Some scalp problems need medical treatment.',
    causes: [
      'Seborrhoeic dermatitis, a common cause of dandruff',
      'Dry scalp, often worse in winter or with very hot showers',
      'Build-up or a reaction to hair products or dyes',
      'Less often, psoriasis or a fungal infection',
    ],
    questions: [
      'Are the flakes oily and yellow, or dry and white?',
      'Does anything make it better or worse — season, products, stress?',
      'Which anti-dandruff shampoos have you tried, and for how long?',
      'Do you have flakes or redness anywhere else — eyebrows, beside the nose, ears or chest?',
    ],
    seeSoon: [
      'No better after about 4 weeks of an anti-dandruff shampoo',
      'A red, swollen or very itchy scalp, or itching that keeps you awake',
      'Thick patches, bleeding or oozing on the scalp',
      'Hair loss where it itches or flakes',
    ],
    // None of the current range is a scalp-condition product; the doctor advises at consultation.
    relatedProducts: [],
  },
];

/*
 * Categories, in display order (the FAQ page groups by first appearance): scan · results · plans ·
 * guarantee · delivery · privacy. Journey per ADR-36: details + email code → scalp scan → result → our
 * team calls. The consultation questions return with the doctor consultation.
 */
export const FAQS: Faq[] = [
  {
    id: 'faq-scan-why',
    category: 'scan',
    question: 'Why do you start with a scalp scan instead of a product?',
    answer:
      'Hair grows from roots. Treatment can only help roots that are still alive. A scarred root cannot grow hair again. And hair fall, pattern thinning and scarring can look the same in a mirror. Looking at your roots first lets us tell you early, and honestly, if treatment is likely to help, before you spend anything.',
  },
  {
    id: 'faq-scan-how',
    category: 'scan',
    question: 'What is the scalp scan, and how do I do it?',
    answer:
      'Enter your name, mobile, email and age. We email you a 6-digit code to confirm it. Then you answer 4 short questions, and your phone guides you through up to 7 areas of your scalp, one close-up at a time (at least 4). Use soft daylight. Keep your hair clean, dry and loose. Turn off filters and beauty mode. It is free and takes a few minutes.',
  },
  {
    id: 'faq-scan-result',
    category: 'scan',
    question: 'What does the result tell me?',
    answer:
      'You see 1 of 3 results, with the reasons in plain words: hair roots are still visible, we need a closer look, or treatment is unlikely to help the bare areas. It is a photo check, not a medical diagnosis. Then our hair-care team calls you to talk through your options.',
  },
  {
    id: 'faq-scan-not-suitable',
    category: 'scan',
    question: 'What happens if the result says treatment is unlikely to help?',
    answer:
      'We tell you clearly and explain why, for example an area that has been bald for many years with no hair left. We will not push you to buy anything. Our team can still call you to answer your questions.',
  },
  {
    id: 'faq-scan-call',
    category: 'scan',
    question: 'Who calls me after the scan, and does it cost anything?',
    answer:
      'A person from our hair-care team calls you on the mobile number you gave, during working hours. The scan and the call are free. If you miss the call, we try again or send you a WhatsApp message.',
  },
  {
    id: 'faq-results-when',
    category: 'results',
    question: 'How soon will I see a difference?',
    answer:
      'Hair changes slowly. It grows about 1 cm a month, and each hair grows for years. So doctors judge progress over months, not weeks. Skin-doctor research says pattern hair loss usually needs at least 4 to 6 months of daily use before people notice a change — and some people do not respond. Individual results vary. We never promise a timeline.',
  },  {
    id: 'faq-plans-buy',
    category: 'plans',
    question: 'How do I buy YHC products?',
    answer:
      'Products are not sold online right now. After your scan, our hair-care team talks you through your options by phone and helps you order. The Hair Regrowth Solution is supplied only with a doctor’s prescription.',
  },
  {
    id: 'faq-guarantee',
    category: 'guarantee',
    question: 'How does the money-back guarantee work?',
    answer:
      'You can claim a full refund of your plan payments if you see no visible improvement and you did all of this: used your prescribed plan without a break for at least 3 months, replied to at least 75% of check-ins, sent progress photos every month and joined your follow-up consultation. Claim within 30 days of finishing the plan. A doctor reviews every claim.',
  },  {
    id: 'faq-delivery',
    category: 'delivery',
    question: 'How long does delivery take?',
    answer: 'Usually a few working days after your order is confirmed. Our team tells you when it ships.',
  },
  {
    id: 'faq-privacy-who',
    category: 'privacy',
    question: 'Who can see my scan, photos and answers?',
    answer:
      'You can see them in your account. If you agreed to share them when you took the scan, our hair-care team can also see them, to advise you on your call. We never put health details in WhatsApp messages, email subject lines or marketing.',
  },
  {
    id: 'faq-privacy-photos',
    category: 'privacy',
    question: 'Will my photos be used in before-and-after images?',
    answer:
      'Only if you agree in writing, separately. We never use your scan or progress photos for marketing without that clear yes, and you can take it back at any time. We never show stock or AI-made images as patient results.',
  },];

// TODO(client): approved terms — see docs/15 D-P1. Values are our recommendation, shown as DRAFT.
export const GUARANTEE_POLICY: GuaranteePolicy = {
  version: 1,
  name: 'YHC Money-Back Guarantee v1', // TODO(client): terms pending approval — docs/15 D-P1 (isDraft keeps the admin warning)
  refundPercent: 100,
  minPlanMonths: 3,
  claimWindowDays: 30,
  minCheckinResponsePct: 75,
  requireMonthlyPhotos: true,
  requireFollowupConsult: true,
  termsMd:
    'If you follow your prescribed plan continuously for at least 3 months, reply to at least 75% of check-ins, share progress photos every month and attend your follow-up consultation, and see no visible improvement, you can claim a full refund of your plan payments within 30 days of finishing the plan. A doctor reviews every claim.',
  isActive: true,
  isDraft: true,
};

export const STAFF: StaffUser[] = [
  { id: 'u-doctor', name: 'Dr. Anil Tyagi', email: 'doctor@demo.yhc', role: 'doctor', active: true },
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
  {
    key: 'consult.sales_hold_minutes',
    value: '240',
    description: 'Hold length when sales books on behalf and sends a pay link',
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
