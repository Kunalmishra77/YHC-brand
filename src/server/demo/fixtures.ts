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

/*
 * Concern pages and FAQs: general education, worded to match published sources (AAD, NHS, DermNet,
 * StatPearls) — see src/server/content/evidence.ts for the citations. Never a diagnosis or a promise.
 * TODO(client): Dr. Tyagi to review all concern and FAQ copy before launch — see docs/12 (content).
 */
export const CONCERNS: Concern[] = [
  {
    slug: 'hair_fall',
    title: 'Hair fall',
    summary: 'More hair on the pillow, comb or shower drain than usual.',
    body: 'Losing around 50 to 100 hairs a day is considered normal — old hairs fall so new ones can grow. Heavier shedding often follows a trigger such as illness, high fever, childbirth, surgery, a crash diet or a very stressful period, usually around three months later (sometimes anywhere from one to six months). This kind of shedding often settles once the trigger has passed, but it can also unmask an early pattern of thinning. Looking at your roots and your recent history tells the two apart.',
    causes: [
      'An illness, high fever, surgery or very stressful period in the last few months',
      'Childbirth — shedding often starts a few months after the baby is born',
      'Rapid weight loss or a diet low in protein',
      'Low iron stores, or an under- or over-active thyroid',
      'Starting some medicines, or stopping the contraceptive pill',
      'An early sign of pattern hair loss',
    ],
    questions: [
      'When did you first notice more shedding, and has it changed since?',
      'Any illness, fever, surgery, childbirth, new medicine or big life change in the six months before?',
      'How are your diet, sleep and stress at the moment?',
      'Have you had blood tests recently — for example iron or thyroid?',
      'Is there thinning hair in your close family?',
    ],
    seeSoon: [
      'Hair coming out in patches or clumps',
      'Heavy shedding that has not eased after about six months, or keeps returning',
      'Pain, burning, redness or sores on the scalp',
      'Shedding along with tiredness, feeling cold, weight change or irregular periods',
    ],
    relatedProducts: ['hair-nutrition-tablets', 'scalp-serum', 'gentle-strengthening-shampoo'],
  },
  {
    slug: 'thinning',
    title: 'Overall thinning',
    summary: 'Hair feels less dense, or your scalp shows more than before.',
    body: 'Diffuse thinning — a widening parting, a thinner ponytail, more scalp showing under bright light — often has more than one cause working together. In pattern hair loss, follicles gradually shrink and produce finer, shorter hairs; in women it usually shows as a wider parting rather than a receding hairline. Nutrition and thyroid problems can add to it. Because the same look can have different causes, a close look at the roots and your history comes before any plan.',
    causes: [
      'Pattern hair loss, which often runs in families',
      'Low iron stores or other nutritional gaps — worth testing rather than guessing',
      'Thyroid changes, pregnancy, menopause or other hormonal shifts',
      'A long-running phase of heavier shedding after illness or stress',
      'Styling habits that pull on or heat-damage the hair',
    ],
    questions: [
      'Where do you notice the thinning most — parting, crown or all over?',
      'Have you had blood tests in the last year?',
      'For women: any changes in periods, a recent pregnancy, or menopause?',
      'Which hair products, treatments and styling tools do you use?',
      'Any family history of thinning hair?',
    ],
    seeSoon: [
      'Thinning that is getting noticeably worse month by month',
      'Patchy bald spots or broken hairs',
      'Scalp pain, scaling or redness',
      'Thinning together with acne, new facial hair or irregular periods',
    ],
    relatedProducts: ['topical-hair-solution', 'scalp-serum', 'hair-nutrition-tablets'],
  },
  {
    slug: 'receding_hairline',
    title: 'Receding hairline',
    summary: 'The hairline at the temples or front is moving back.',
    body: 'Hairline changes are common and often genetic: in an Indian population study, more than half of men aged 30 to 50 had some degree of pattern hair loss. Some change with age is normal; a fast or uneven change is worth a look. Dermatologists note that treatment tends to work best when started soon after hair loss is noticed. Less often, a hairline moves back because of tight hairstyles or a scarring condition — and a follicle that has scarred can no longer grow hair, which is why an early check matters.',
    causes: [
      'Pattern hair loss, influenced by genes and hormones',
      'Tight hairstyles that pull at the front over months or years (traction)',
      'Less often, scarring conditions that affect the hairline and eyebrows',
    ],
    questions: [
      'How quickly has the hairline changed, and over how long?',
      'Did a parent or grandparent have a similar pattern?',
      'Do you often wear your hair pulled back tightly, or use a helmet or cap for long hours?',
      'Have you tried any treatment before — what, for how long, and how did it go?',
    ],
    seeSoon: [
      'Redness, itching, burning or shiny skin along the hairline',
      'Eyebrow loss along with hairline change',
      'Very fast change over a few months',
    ],
    relatedProducts: ['topical-hair-solution', 'scalp-serum', 'gentle-strengthening-shampoo'],
  },
  {
    slug: 'crown_thinning',
    title: 'Crown thinning',
    summary: 'A thinner patch at the top or back of the head.',
    body: 'Crown thinning is often pattern-related and easy to miss until someone points it out or a photo shows it. Under magnification, pattern hair loss shows hairs of uneven thickness and fewer hairs per follicle group — changes that are hard to see in a mirror. Hair grows about a centimetre a month and any treatment is judged over several months, so plans focus on a steady routine, progress photos taken the same way each month, and regular review with Dr. Tyagi.',
    causes: [
      'Pattern hair loss, which often starts at the crown in men',
      'Hormonal factors',
      'Nutritional gaps or recent shedding that make thinning more visible',
    ],
    questions: [
      'When did you or someone else first notice the crown?',
      'Do you have photos from a year or two ago to compare?',
      'Any medicines, supplements or treatments you use now?',
      'Is there a similar pattern in your family?',
    ],
    seeSoon: [
      'A smooth, completely bald round patch',
      'Scalp sores, crusting or pain at the crown',
      'Thinning that is spreading quickly',
    ],
    relatedProducts: ['topical-hair-solution', 'hair-nutrition-tablets', 'scalp-serum'],
  },
  {
    slug: 'dandruff_scalp',
    title: 'Dandruff & scalp issues',
    summary: 'Flaking, itching or an irritated scalp.',
    body: 'Dandruff is common, it is not harmful and you cannot catch it from someone else. Flaking and itching can come from seborrhoeic dermatitis (linked to a yeast that normally lives on the skin), dryness, product build-up or sensitivity. A medicated anti-dandruff shampoo is the usual first step, and it is worth giving one around four weeks. If that does not help, the scalp is red or swollen, or itching is severe, a doctor should look — some scalp conditions need medical treatment.',
    causes: [
      'Seborrhoeic dermatitis, a common cause of dandruff',
      'Dry scalp, often worse in winter or with very hot showers',
      'Build-up or sensitivity from hair products or dyes',
      'Less often, psoriasis or a fungal infection',
    ],
    questions: [
      'Is the flaking oily and yellowish, or dry and white?',
      'Does anything make it better or worse — seasons, products, stress?',
      'Which anti-dandruff shampoos have you tried, and for how long?',
      'Do you have flaking or redness elsewhere — eyebrows, beside the nose, ears or chest?',
    ],
    seeSoon: [
      'No improvement after about four weeks of an anti-dandruff shampoo',
      'A red, swollen or very itchy scalp, or itching that disturbs your sleep',
      'Thick plaques, bleeding or weeping on the scalp',
      'Hair loss in the itchy or flaky area',
    ],
    relatedProducts: ['gentle-strengthening-shampoo', 'lightweight-conditioner', 'scalp-serum'],
  },
];

/*
 * Categories, in display order (the FAQ page groups by first appearance): scan · consultation · results ·
 * plans · guarantee · delivery · privacy. Journey order per ADR-26: details → 3D scan → assessment →
 * health form → slot + ₹500 → consultation.
 */
export const FAQS: Faq[] = [
  {
    id: 'faq-scan-why',
    category: 'scan',
    question: 'Why do you start with a scalp scan instead of a product?',
    answer:
      'Because hair grows from roots, and treatment can only support follicles that are still alive. When a follicle has scarred, it can no longer grow hair, and shedding, pattern thinning and scarring hair loss can look alike in a mirror. Looking at your roots first lets us be honest early about whether treatment is likely to help — before you book or pay for anything.',
  },
  {
    id: 'faq-scan-how',
    category: 'scan',
    question: 'What is the 3D scalp scan, and how do I do it?',
    answer:
      'After a few basic details (name, mobile and address), you are guided step by step to capture your hairline, crown and parting with your phone camera. Use soft daylight, keep your hair clean, dry and unstyled, and turn off filters or beauty mode. The scan gives an initial view of your roots and scalp; the final assessment is always made by the doctor.',
  },
  {
    id: 'faq-scan-result',
    category: 'scan',
    question: 'What does the personalised assessment tell me?',
    answer:
      'You see one of three results, each with its reasons in plain words: treatment looks suitable, a doctor should look first, or treatment is unlikely to help the scanned areas. It covers things like how dense and active your roots look, whether hairs are becoming finer, and the condition of your scalp. It is a guide to help you decide on next steps — not a diagnosis.',
  },
  {
    id: 'faq-scan-not-suitable',
    category: 'scan',
    question: 'What happens if the assessment says treatment is unlikely to help?',
    answer:
      'We tell you plainly and explain why — for example, an area that has been bald for many years with very few visible active roots. We will not push you towards a plan. You can download your summary, ask us questions on WhatsApp, or still book a consultation to understand the cause and talk through other options with the doctor (the ₹500 fee applies).',
  },
  {
    id: 'faq-consult-how',
    category: 'consultation',
    question: 'How does the consultation work?',
    answer:
      'After your assessment you fill in a short health form — your history, medicines, previous treatments and what you have noticed. You then pick a time and pay the ₹500 consultation fee. Dr. Tyagi reviews your scan, assessment and form before meeting you one to one on a 30-minute video call. If treatment is right for you, you receive a link to your prescription and plan on WhatsApp after the call.',
  },
  {
    id: 'faq-consult-no-obligation',
    category: 'consultation',
    question: 'Do I have to buy a plan after the consultation?',
    answer:
      'No. Your prescription is yours, whether or not you buy from YHC, and you can fill it wherever you prefer. Dr. Tyagi is associated with Your Hair Company, and we say so on every plan page.',
  },
  {
    id: 'faq-consult-credit',
    category: 'consultation',
    question: 'Is the ₹500 adjusted if I buy a plan?',
    answer:
      'Yes. If you buy your recommended plan within 7 days of your consultation, ₹500 is deducted from the plan price. (Pending client confirmation.)',
  },
  {
    id: 'faq-consult-reschedule',
    category: 'consultation',
    question: 'Can I reschedule or cancel my consultation?',
    answer:
      'You can reschedule free of charge up to 6 hours before your slot. Cancel more than 24 hours ahead for a full refund of the fee; later cancellations are not refunded but include one free reschedule. Missed consultations are not refunded. (Draft policy — pending confirmation.)',
  },
  {
    id: 'faq-results-when',
    category: 'results',
    question: 'How soon will I see a difference?',
    answer:
      'Hair changes slowly. A scalp hair grows about a centimetre a month, and the growth phase of each hair lasts years, so doctors judge progress over several months, not weeks. Published dermatology reviews describe at least four to six months of consistent use before improvement in pattern hair loss is usually noticeable — and some people do not respond. Individual results vary, and we never promise a timeline.',
  },
  {
    id: 'faq-results-shedding',
    category: 'results',
    question: 'Is it normal to shed more when starting treatment?',
    answer:
      'With some treatments, a temporary increase in shedding in the first few weeks is a known effect, as resting hairs make way for new growth. It can be unsettling. If it happens, message us or raise it at your check-in — please do not stop or change your routine without speaking to the doctor first.',
  },
  {
    id: 'faq-results-ongoing',
    category: 'results',
    question: 'Will I need to keep using treatment?',
    answer:
      'For pattern hair loss, the benefit of most treatments usually lasts only while you keep using them; dermatologists note that stopping tends to mean losing it over time. That is why Dr. Tyagi chooses a routine you can realistically keep up, and reviews it with you at follow-up.',
  },
  {
    id: 'faq-results-supplements',
    category: 'results',
    question: 'Will supplements or vitamins help my hair?',
    answer:
      'They can help when something is actually low — such as iron — and that deficiency should be corrected. There is little evidence that supplements help people who are not deficient, and some can make hair loss worse in excess. Biotin can also interfere with certain lab tests, so mention it before a blood test. A nutrition supplement is only included in your plan if the doctor thinks it is appropriate for you.',
  },
  {
    id: 'faq-plans-cost',
    category: 'plans',
    question: 'What do the plans cost?',
    answer:
      '1 month ₹5,999 · 2 months ₹10,999 · 3 months ₹14,999. Prices include GST. Your plan contains only what the doctor recommends for you.',
  },
  {
    id: 'faq-plans-without-consult',
    category: 'plans',
    question: 'Can I buy products without a consultation?',
    answer:
      'Everyday care products such as the shampoo and conditioner can be bought directly. Prescription and treatment products are only available after a consultation, because the right choice and strength depend on your scan, history and the doctor’s assessment. (Pending client confirmation.)',
  },
  {
    id: 'faq-guarantee',
    category: 'guarantee',
    question: 'How does the money-back guarantee work?',
    answer:
      'If you follow your prescribed plan continuously for at least 3 months, reply to at least 75% of check-ins, share progress photos every month and attend your follow-up consultation, and see no visible improvement, you can claim a full refund of your plan payments within 30 days of finishing the plan. A doctor reviews every claim. (Draft terms — pending approval.)',
  },
  {
    id: 'faq-delivery',
    category: 'delivery',
    question: 'How long does delivery take?',
    answer:
      'Usually a few working days after payment. You get tracking on WhatsApp as soon as your order ships. (Delivery times pending confirmation.)',
  },
  {
    id: 'faq-privacy-who',
    category: 'privacy',
    question: 'Who can see my scan, photos and health details?',
    answer:
      'Your scan, photos, health form and consultation notes are for your care and are seen by your doctor. Our support team helps with bookings, orders and delivery, and cannot see your clinical information. Clinical details are never written into WhatsApp messages, email subject lines or marketing — messages simply link you to your private account.',
  },
  {
    id: 'faq-privacy-photos',
    category: 'privacy',
    question: 'Will my photos be used in before-and-after images?',
    answer:
      'Only if you separately agree in writing. Your scan and progress photos are never used for marketing without that explicit consent, and you can withdraw it at any time. We never present stock or AI-generated images as patient results.',
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
