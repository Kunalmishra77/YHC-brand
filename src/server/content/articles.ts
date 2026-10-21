import 'server-only';

import type { EvidenceSource } from './evidence';
import type { Article, ContentBlock } from './types';

/*
 * Demo articles (FR-M1-1, FR-M1-4). General education only — every one is still waiting for
 * Dr. Tyagi's medical review, and the site labels it that way until `reviewStatus` changes.
 * TODO(client): Dr. Tyagi to review and approve each article before launch — see docs/12 (content)
 * Copy rules: PRD §15 — no outcome promises, no fixed timelines, no invented figures. Every figure
 * below comes from the source listed in that article's "Sources" section (checked 2026-10-05).
 */

const S = {
  aadShedding: {
    name: 'American Academy of Dermatology',
    title: 'Do you have hair loss or hair shedding?',
    url: 'https://www.aad.org/public/diseases/hair-loss/insider/shedding',
  },
  aadCauses: {
    name: 'American Academy of Dermatology',
    title: 'Hair loss: who gets and causes',
    url: 'https://www.aad.org/public/diseases/hair-loss/causes/18-causes',
  },
  aadMale: {
    name: 'American Academy of Dermatology',
    title: 'What is male pattern hair loss, and can it be treated?',
    url: 'https://www.aad.org/public/diseases/hair-loss/treatment/male-pattern-hair-loss-treatment',
  },
  aadFemale: {
    name: 'American Academy of Dermatology',
    title: 'Thinning hair and hair loss: could it be female pattern hair loss?',
    url: 'https://www.aad.org/public/diseases/hair-loss/types/female-pattern',
  },
  aadFFA: {
    name: 'American Academy of Dermatology',
    title: 'Frontal fibrosing alopecia: overview',
    url: 'https://www.aad.org/public/diseases/hair-loss/types/frontal-fibrosing-alopecia',
  },
  nhsHairLoss: {
    name: 'NHS',
    title: 'Hair loss',
    url: 'https://www.nhs.uk/conditions/hair-loss/',
  },
  statpearlsHair: {
    name: 'StatPearls (NCBI Bookshelf)',
    title: 'Anatomy, Hair — Murphrey, Agarwal & Zito',
    url: 'https://www.ncbi.nlm.nih.gov/books/NBK513312/',
    year: 2023,
  },
  statpearlsTE: {
    name: 'StatPearls (NCBI Bookshelf)',
    title: 'Telogen Effluvium — Hughes, Syed & Saleh',
    url: 'https://www.ncbi.nlm.nih.gov/books/NBK430848/',
    year: 2024,
  },
  statpearlsAGA: {
    name: 'StatPearls (NCBI Bookshelf)',
    title: 'Androgenetic Alopecia — Ho, Sood & Zito',
    url: 'https://www.ncbi.nlm.nih.gov/books/NBK430924/',
    year: 2024,
  },
  ccFollicle: {
    name: 'Cleveland Clinic',
    title: 'Hair follicle: function, structure and associated conditions',
    url: 'https://my.clevelandclinic.org/health/body/23435-hair-follicle',
  },
  ccTerminalHair: {
    name: 'Cleveland Clinic',
    title: 'Terminal hair: function and examples',
    url: 'https://my.clevelandclinic.org/health/body/23140-terminal-hair',
  },
  ccTE: {
    name: 'Cleveland Clinic',
    title: 'Telogen effluvium',
    url: 'https://my.clevelandclinic.org/health/diseases/24486-telogen-effluvium',
  },
  krupaShankar: {
    name: 'International Journal of Trichology',
    title: 'Male androgenetic alopecia: population-based study in 1,005 subjects — Krupa Shankar et al.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/20927235/',
    year: 2009,
  },
  dermnetTrichoscopy: {
    name: 'DermNet',
    title: 'Trichoscopy — Sadek et al.',
    url: 'https://dermnetnz.org/topics/trichoscopy',
    year: 2022,
  },
  dermnetFPHL: {
    name: 'DermNet',
    title: 'Female pattern hair loss',
    url: 'https://dermnetnz.org/topics/female-pattern-hair-loss',
  },
  guoKatta: {
    name: 'Dermatology Practical & Conceptual',
    title: 'Diet and hair loss: effects of nutrient deficiency and supplement use — Guo & Katta',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC5315033/',
    year: 2017,
  },
  fdaBiotin: {
    name: 'U.S. Food and Drug Administration',
    title: 'Biotin interference with troponin lab tests',
    url: 'https://www.fda.gov/medical-devices/in-vitro-diagnostics/biotin-interference-troponin-lab-tests-assays-subject-biotin-interference',
    year: 2022,
  },
} satisfies Record<string, EvidenceSource>;

/** Sources per article, with links — the article body carries the same list as plain text. */
const ARTICLE_SOURCES: Record<string, EvidenceSource[]> = {
  'hair-shedding-vs-hair-loss': [
    S.aadShedding,
    S.statpearlsTE,
    S.statpearlsHair,
    S.statpearlsAGA,
    S.krupaShankar,
    S.aadFFA,
    S.dermnetTrichoscopy,
  ],
  'hair-growth-cycle-explained': [
    S.statpearlsHair,
    S.ccFollicle,
    S.ccTerminalHair,
    S.statpearlsAGA,
    S.aadMale,
    S.aadFemale,
    S.ccTE,
  ],
  'what-happens-in-a-video-consultation': [S.aadFFA, S.aadMale, S.dermnetTrichoscopy, S.statpearlsTE],
  'how-to-take-scalp-photos': [S.dermnetTrichoscopy, S.ccTerminalHair, S.dermnetFPHL],
  'nutrition-and-hair': [S.guoKatta, S.statpearlsTE, S.nhsHairLoss, S.aadCauses, S.fdaBiotin],
};

function sourcesBlocks(slug: string): ContentBlock[] {
  const sources = ARTICLE_SOURCES[slug] ?? [];
  if (sources.length === 0) return [];
  return [
    { type: 'heading', id: 'sources', text: 'Sources' },
    {
      type: 'list',
      ordered: true,
      items: sources.map((s) => `${s.name}${s.year ? ` (${s.year})` : ''}. ${s.title}.`),
    },
    {
      type: 'paragraph',
      text: 'Figures are general information from published sources and vary between studies. They are not claims about any YHC product.',
    },
  ];
}

const ARTICLES: Article[] = [
  {
    slug: 'hair-shedding-vs-hair-loss',
    title: 'Hair shedding vs hair loss: how to tell the difference',
    seoTitle: 'Hair shedding vs hair loss',
    dek: 'Hair on your pillow does not always mean something is wrong. Here is how hair fall and thinning differ, what each one usually means, and when to get your roots checked.',
    seoDescription:
      'Hair on your pillow is not always a sign of a problem. How shedding and thinning differ, what each usually means, and when to get your roots checked.',
    category: 'Understanding hair',
    readingMinutes: 6,
    publishedOn: '2026-09-18',
    reviewStatus: 'pending_medical_review',
    image: 'textureDrop',
    body: [
      {
        type: 'paragraph',
        text: 'Most people notice hair in the same places: the shower drain, the hairbrush, the pillow. It is natural to worry. But hair that falls out and hair that stops growing back are two different things. Telling them apart is the first step to knowing if you need help.',
      },
      { type: 'heading', id: 'shedding-is-normal', text: 'Some hair fall is normal and healthy' },
      {
        type: 'paragraph',
        text: 'Every hair grows for years, rests for a few months, then falls out so a new hair can take its place. A healthy scalp has about 80,000 to 120,000 hairs. At any time, about 85–90% of them are growing and the rest are resting or falling. Because of this constant change, the American Academy of Dermatology (AAD) says losing 50 to 100 hairs a day is normal.',
      },
      {
        type: 'paragraph',
        text: 'You may see more hair on wash days, simply because loose hairs collect between washes. Long hair can also look like more, because each strand is easier to see.',
      },
      { type: 'heading', id: 'increased-shedding', text: 'When more hair starts to fall' },
      {
        type: 'paragraph',
        text: 'Sometimes lots of hair roots go into the resting stage together and fall at once. Doctors call this sudden shedding telogen effluvium. It usually follows a shock to the body — a high fever, an illness, having a baby, surgery, losing weight fast, a very stressful time or a new medicine. The hair fall usually starts about 3 months later, but it can be anywhere from 1 to 6 months.',
      },
      {
        type: 'paragraph',
        text: 'The hair usually falls evenly from all over the scalp, and the roots can still grow hair. Once the cause has passed, the AAD says hair tends to look full again within about 6 to 9 months. Hair fall that goes on for more than 6 months is called chronic. It needs a closer look.',
      },
      {
        type: 'callout',
        title: 'Why the doctor asks about last season, not just last week',
        text: 'Hair fall starts months after its cause. So the most useful question is often “what happened before this started?” — an illness, a new medicine, a baby, a crash diet.',
      },
      { type: 'heading', id: 'hair-loss', text: 'What hair loss looks like' },
      {
        type: 'paragraph',
        text: 'Hair loss is different: something stops hair from growing back as it was. In pattern hair loss (androgenetic alopecia), each hair grows for a shorter time, and the roots slowly get smaller (miniaturisation). They grow shorter, finer hairs. It is very common. In a study of 1,005 men aged 30 to 50 in India, 58% had some pattern hair loss. Because it is slow, people often notice it in photos before they see it in the mirror.',
      },
      {
        type: 'list',
        items: [
          'A hairline that is moving back, mostly at the temples',
          'A wider parting, or more scalp showing at the crown',
          'A ponytail that feels thinner than before',
          'Round or oval patches with little or no hair',
          'Hairs that break easily, instead of falling out from the root',
        ],
      },
      {
        type: 'paragraph',
        text: 'Pattern hair loss, patchy hair loss, scarring hair loss and breakage all have different causes and need different care. Some people have more than one. In scarring types, scar tissue replaces the hair roots — and a scarred root can never grow hair again. That is the best reason not to “wait and see” when something looks unusual.',
      },
      { type: 'heading', id: 'how-doctors-tell', text: 'How a doctor tells them apart' },
      {
        type: 'paragraph',
        text: 'A skin doctor (dermatologist) puts your story together with a close look at your scalp. A close-up scalp check called trichoscopy looks at the hair and scalp at about 20 to 160 times bigger. It shows the hair openings, the skin around them and how thick each hair is. It can help tell scarring from non-scarring hair loss, and early pattern hair loss from hair fall. It can also be repeated to track progress.',
      },
      { type: 'heading', id: 'simple-checks', text: 'Simple things to note at home' },
      {
        type: 'list',
        items: [
          'When did you first notice the change? Did anything happen in the months before?',
          'Does the hair fall out with a small white bulb at the root, or snap along its length?',
          'Is the change all over the scalp, or in one area?',
          'Does anyone in your close family have similar thinning?',
          'Any other changes — itching, flakes, redness, tiredness or recent weight change?',
        ],
      },
      {
        type: 'paragraph',
        text: 'Write these down and take a few clear scalp photos. That gives a doctor much more to work with than memory alone.',
      },
      { type: 'heading', id: 'when-to-see-a-doctor', text: 'When to see a doctor' },
      {
        type: 'list',
        items: [
          'Hair fall that is still heavy after about 6 months, or keeps coming back',
          'Bald patches that appear quickly',
          'A scalp that hurts, burns, itches a lot, or is red or scaly',
          'Hair loss along with other signs, such as unusual tiredness, weight change or irregular periods',
          'Thinning that is clearly getting worse, or is affecting how you feel every day',
        ],
      },
      {
        type: 'callout',
        title: 'This is general information',
        text: 'It is not a diagnosis. Only a doctor who has looked at your history and your scalp can tell you what is going on. Individual results of any treatment vary.',
      },
      { type: 'heading', id: 'next-step', text: 'The next step' },
      {
        type: 'paragraph',
        text: 'Not sure if it is hair fall or thinning? Start with the guided 3D scalp scan. Your report tells you, in plain words, if treatment looks suitable, if a doctor should look first, or if treatment is unlikely to help. If you go ahead, Dr. Tyagi checks everything before your video consultation. He suggests treatment only if it can help you.',
      },
      ...sourcesBlocks('hair-shedding-vs-hair-loss'),
    ],
  },
  {
    slug: 'hair-growth-cycle-explained',
    title: 'Why hair changes are slow — the hair growth cycle explained',
    seoTitle: 'The hair growth cycle explained',
    dek: 'Hair does not change as fast as we would like. Knowing how hair grows explains why patience and regular photos matter more than checking every day.',
    seoDescription:
      'Hair does not change on the schedule we would like. How the growth cycle works, and why patience and consistent photos matter more than daily checks.',
    category: 'Understanding hair',
    readingMinutes: 6,
    publishedOn: '2026-08-27',
    reviewStatus: 'pending_medical_review',
    image: 'serum',
    body: [
      {
        type: 'paragraph',
        text: 'One of the hardest parts of caring for thinning hair is waiting. People often expect a change within days of a new routine. When nothing seems to happen, they feel let down. The reason is how hair grows.',
      },
      { type: 'heading', id: 'three-phases', text: 'Each hair has its own cycle' },
      {
        type: 'paragraph',
        text: 'A hair root (follicle) does not grow hair all the time. It goes through stages, and every root on your scalp keeps its own timetable. That is why you never lose all your hair at once.',
      },
      {
        type: 'list',
        items: [
          'Growing (anagen): the root makes hair. On the scalp this lasts about 2 to 6 years. It mostly decides how long your hair can grow.',
          'Slowing (catagen): a short stage of about 2 weeks. Growth stops and the root shrinks.',
          'Resting (telogen): the hair stays in place but stops growing, for about 3 months.',
          'Falling (exogen): the old hair falls out, often pushed out by a new hair growing under it.',
        ],
      },
      {
        type: 'paragraph',
        text: 'At any time, about 85–90% of scalp hair roots are growing. The rest are resting or falling. That balance keeps hair looking full.',
      },
      { type: 'heading', id: 'why-slow', text: 'Why change takes time' },
      {
        type: 'paragraph',
        text: 'Scalp hair grows about 0.35 mm a day — about 1 cm a month. Even when a root starts growing a stronger hair, that hair must grow long enough to be noticed.',
      },
      {
        type: 'paragraph',
        text: 'In pattern hair loss, hairs grow for a shorter time and the roots slowly get smaller. Treatments try to slow this down, or to help roots that are still active. Neither shows overnight. Published reviews say people usually need at least 4 to 6 months of daily use before they notice a change. The AAD advises using minoxidil for about 6 to 12 months before judging how well it works. Some people do not respond at all. That is why progress is checked, not assumed.',
      },
      {
        type: 'callout',
        title: 'A note on early hair fall',
        text: 'With some treatments, a few people see more hair fall in the first weeks, as resting hairs make way for new ones. It can be worrying. If it happens to you, talk to your doctor before you change anything. Do not just stop.',
        tone: 'caution',
      },
      {
        type: 'paragraph',
        text: 'There is a second reason for patience. For pattern hair loss, treatment usually helps only while you use it. Skin doctors say that if you stop, you tend to lose the benefit over time. So a routine you can keep up matters more than a strong one.',
      },
      { type: 'heading', id: 'what-affects-the-cycle', text: 'What can upset the cycle' },
      {
        type: 'list',
        items: [
          'Genes and hormones, which play a big part in pattern hair loss',
          'Illness, high fever, surgery or having a baby',
          'A thyroid that is too slow or too fast',
          'Low iron and some other gaps in your diet',
          'Sudden diet changes or losing weight fast',
          'Some medicines, and stopping the birth-control pill',
          'Strong or long-lasting stress',
        ],
      },
      {
        type: 'paragraph',
        text: 'So many things can upset the cycle that the same change can have very different causes in two people. That is why your plan should fit your history and your roots — not be copied from someone else.',
      },
      { type: 'heading', id: 'tracking-progress', text: 'How to track progress fairly' },
      {
        type: 'list',
        items: [
          'Take photos in the same place, light and angle each month — do not check the mirror every day',
          'Keep using your routine as prescribed, so you can see what it does',
          'Write down any changes — a new medicine, an illness, a new diet',
          'Compare photos months apart, not days apart',
        ],
      },
      {
        type: 'paragraph',
        text: 'This is why every YHC plan includes monthly progress photos and follow-up reviews. They let your doctor see change that is too slow to notice day to day.',
      },
      { type: 'heading', id: 'when-to-see-a-doctor', text: 'When to see a doctor' },
      {
        type: 'list',
        items: [
          'You have tried products on your own for a while and cannot tell if anything helps',
          'Hair fall has suddenly increased, or is not settling',
          'You notice patches, scalp pain, redness or flakes',
          'You want to know if what you see is likely to respond to treatment at all',
        ],
      },
      { type: 'heading', id: 'next-step', text: 'The next step' },
      {
        type: 'paragraph',
        text: 'Individual results vary, and no honest doctor can promise a timeline. A scan and consultation can give you a clear picture: what is likely going on, if your roots are still active, and a fair way to measure progress. Start your scan whenever you are ready.',
      },
      ...sourcesBlocks('hair-growth-cycle-explained'),
    ],
  },
  {
    slug: 'what-happens-in-a-video-consultation',
    title: 'From scan to consultation: what happens at each step',
    seoTitle: 'What happens in a hair consultation',
    dek: 'From your first details to a plan on WhatsApp — the scan, your report and the video consultation, step by step, and how to get the most from each.',
    seoDescription:
      'From your first details to a plan on WhatsApp: a step-by-step look at the scan, assessment and video consultation, and how to make the most of each.',
    category: 'Your consultation',
    readingMinutes: 6,
    publishedOn: '2026-07-30',
    reviewStatus: 'pending_medical_review',
    image: 'heroStage',
    body: [
      {
        type: 'paragraph',
        text: 'Never had a video consultation for your hair? It is fair to wonder what happens. At YHC, the consultation is the last step of a short journey that starts with your roots. This guide walks you through each step, so you know what to expect.',
      },
      { type: 'heading', id: 'why-scan-first', text: 'Why we start with your roots' },
      {
        type: 'paragraph',
        text: 'Treatment can only help hair roots that are still alive. In scarring hair loss, scar tissue replaces the roots, and a scarred root can never grow hair again. Hair fall, pattern thinning and scarring can look the same in a mirror. So we look closely at your scalp first — the way skin doctors do with a close-up scalp check called trichoscopy — before suggesting anything.',
      },
      { type: 'heading', id: 'details-and-scan', text: 'Steps 1 and 2: your details and the 3D scan' },
      {
        type: 'paragraph',
        text: 'You start with a few details — your name, mobile number and address. Then we guide you, step by step, to photograph your hairline, crown and parting with your phone. Soft daylight, clean, dry, loose hair, and no camera filters make the biggest difference.',
      },
      { type: 'heading', id: 'assessment', text: 'Step 3: your report' },
      {
        type: 'paragraph',
        text: 'Next you see your report, with the reasons in plain words. It shows 1 of 3 results:',
      },
      {
        type: 'list',
        items: [
          'Treatment looks suitable — your roots look active, and you can go on to your health form',
          'A doctor should look first — some signs, like round patches or an area bald for a long time, need a doctor before any plan',
          'Treatment is unlikely to help the scanned areas — for example, where very few active roots are left. We tell you honestly instead of selling you a plan',
        ],
      },
      {
        type: 'paragraph',
        text: 'The report is a guide, not a diagnosis. The doctor always makes the final call.',
      },
      { type: 'heading', id: 'health-form', text: 'Step 4: your health form' },
      {
        type: 'paragraph',
        text: 'The health form asks more about your health. It helps to have these ready:',
      },
      {
        type: 'list',
        items: [
          'A list of the medicines and supplements you take, including any biotin',
          'Any recent blood test reports, if you have them',
          'When you first noticed the change, and what happened in the months before — illness, a baby, surgery, stress, a new diet',
          'What you have already tried, for how long, and if it helped',
        ],
      },
      { type: 'heading', id: 'booking', text: 'Step 5: picking a time' },
      {
        type: 'paragraph',
        text: 'Then you pick a time that suits you and pay the ₹500 consultation fee online. Consultations are for adults aged 18 and over. Your confirmation arrives on WhatsApp, with your booking details and the doctor’s registration number. We also remind you before the call.',
      },
      { type: 'heading', id: 'during-the-call', text: 'Step 6: the consultation' },
      {
        type: 'paragraph',
        text: 'Dr. Tyagi looks at your scan, report and health form before the call. So your time together is about you, not paperwork. It is a one-to-one video call. You will be asked to confirm who you are. Then you usually talk about:',
      },
      {
        type: 'list',
        items: [
          'Your concern in your own words, and how it has changed',
          'Your general health, family, food, sleep and stress',
          'A look at your scalp on camera, next to your scan',
          'What is likely going on, in plain words',
          'Whether treatment suits you — and if not, why not',
          'How long it fairly takes to judge progress',
        ],
      },
      {
        type: 'paragraph',
        text: 'Ask anything. There are no silly questions about your own hair. If something cannot be checked on video, Dr. Tyagi will tell you what to do instead — for example, an in-person check or blood tests.',
      },
      { type: 'heading', id: 'after-the-call', text: 'After the call' },
      {
        type: 'paragraph',
        text: 'If treatment can help, we send a link to your prescription and plan on WhatsApp. The plan explains what each product is for and how to use it.',
      },
      {
        type: 'callout',
        title: 'Your prescription is yours',
        text: 'You do not have to buy anything from YHC. You are free to use your prescription anywhere you like.',
      },
      {
        type: 'paragraph',
        text: 'If you start a plan, we deliver it to your door, and care goes on: short check-ins, monthly progress photos and a follow-up review. Your doctor sees how you are doing and adjusts if needed. Treatment for pattern hair loss is judged over several months. Skin doctors say people who start soon after noticing hair loss tend to see the best results.',
      },
      { type: 'heading', id: 'privacy', text: 'Who sees your information' },
      {
        type: 'paragraph',
        text: 'Your scan, health details, photos and consultation notes are for your doctor. Our support team helps with bookings, orders and delivery, and cannot see your health details. We never put health details in WhatsApp messages or marketing.',
      },
      { type: 'heading', id: 'getting-ready', text: 'Getting ready on the day' },
      {
        type: 'list',
        items: [
          'Find a quiet, bright spot and check your internet',
          'Join from your phone or laptop a couple of minutes early',
          'Keep your hair dry and loose, so your scalp shows clearly on camera',
          'Keep your list of questions close by',
        ],
      },
      { type: 'heading', id: 'when-to-see-a-doctor', text: 'When to see a doctor in person instead' },
      {
        type: 'paragraph',
        text: 'A video consultation is not for emergencies. If you have sudden severe symptoms, signs of infection with fever, or feel unwell, go to your nearest hospital or see a doctor in person.',
      },
      { type: 'heading', id: 'next-step', text: 'The next step' },
      {
        type: 'paragraph',
        text: 'Every YHC plan starts with your roots, and you decide at each step if you want to go on. Individual results vary. When you are ready, start with the scan.',
      },
      ...sourcesBlocks('what-happens-in-a-video-consultation'),
    ],
  },
  {
    slug: 'how-to-take-scalp-photos',
    title: 'How to take scalp photos your doctor can actually use',
    seoTitle: 'How to take scalp photos for a doctor',
    dek: 'Good photos make your scan, your consultation and your progress checks more useful. Here is how to photograph your hairline, crown and parting clearly, with just a phone.',
    seoDescription:
      'Good photos make your scan, consultation and progress reviews more useful. How to capture your hairline, crown and parting clearly with just a phone.',
    category: 'Your consultation',
    readingMinutes: 5,
    publishedOn: '2026-06-24',
    reviewStatus: 'pending_medical_review',
    image: 'topical',
    body: [
      {
        type: 'paragraph',
        text: 'Skin doctors need a close, well-lit view of the scalp. In clinic they often use a close-up scalp check (trichoscopy), which they can repeat to see how you respond to treatment. At home, careful phone photos are the next best thing. They become the starting point for your scan and for comparing progress later. A few minutes of care makes them much more useful.',
      },
      { type: 'heading', id: 'before-you-start', text: 'Before you start' },
      {
        type: 'list',
        items: [
          'Wash and fully dry your hair. Skip oils, gels, sprays and hair fibres',
          'Leave it loose — no fresh blow-dry, straightening or tight hairstyles',
          'Turn off filters, beauty mode and portrait blur on your camera',
          'Clean the camera lens',
          'If you can, ask someone to help with the crown photo',
        ],
      },
      { type: 'heading', id: 'lighting', text: 'Get the light right' },
      {
        type: 'paragraph',
        text: 'Light changes how much scalp shows through your hair more than anything else. Bright light right above you can make hair look thinner than it is. Dim light can hide real change.',
      },
      {
        type: 'list',
        items: [
          'Use soft daylight — face a window, but stay out of direct sun',
          'Avoid a single bright ceiling light right above your head',
          'Do not use the flash. It hides detail and causes glare on the scalp',
          'Use the same spot, at about the same time of day, every time',
        ],
      },
      { type: 'heading', id: 'front-hairline', text: 'Photo 1: front hairline' },
      {
        type: 'paragraph',
        text: 'Pull your hair back from your forehead, or hold it with a soft band. Look straight at the camera, held at eye level about an arm’s length away. Take 1 photo straight on, and 1 of each temple with your head turned a little to the side.',
      },
      { type: 'heading', id: 'crown', text: 'Photo 2: crown' },
      {
        type: 'paragraph',
        text: 'The crown is the hardest area to photograph yourself. Best is to sit down and ask someone to hold the phone above and a little behind your head, pointing down at the top of your scalp. On your own, use the timer or a mirror behind you. Take a few shots so at least one is sharp.',
      },
      { type: 'heading', id: 'parting', text: 'Photo 3: parting' },
      {
        type: 'paragraph',
        text: 'Comb your hair into a straight centre parting. Tilt your head forward a little and photograph the parting from above, so it runs from the top of the photo to the bottom. A wider parting is a common sign of female pattern hair loss, so this photo matters for everyone. If you usually wear a side parting, take one of that too.',
      },
      {
        type: 'callout',
        title: 'Check before you upload',
        text: 'Zoom in on each photo. If you cannot see single hairs clearly, take it again. 3 sharp photos are more useful than 10 blurry ones.',
      },
      { type: 'heading', id: 'monthly-photos', text: 'Taking photos each month' },
      {
        type: 'paragraph',
        text: 'Scalp hair grows only about 1 cm a month. So the most useful comparison is between photos taken months apart, in the same conditions. Repeat the same 3 angles, the same light, the same distance and the same hairstyle. Doing it the same way matters more than a perfect shot.',
      },
      { type: 'heading', id: 'privacy', text: 'Where your photos go' },
      {
        type: 'paragraph',
        text: 'We store the scalp photos you upload privately. Only your doctor sees them, for your care. We never use them in marketing unless you agree clearly and separately, in writing. You can take that agreement back at any time.',
      },
      { type: 'heading', id: 'when-to-see-a-doctor', text: 'When to see a doctor' },
      {
        type: 'paragraph',
        text: 'Notice something unusual while taking photos? Patches with no hair, broken hairs, redness, flakes, shiny skin along the hairline, sores or a sore scalp — mention it at your consultation. If it is painful or spreading, see a doctor soon.',
      },
      { type: 'heading', id: 'next-step', text: 'The next step' },
      {
        type: 'paragraph',
        text: 'The guided 3D scan uses these same tips and walks you through each angle. Dr. Tyagi checks your scan before your call. Individual results of any treatment vary. Good photos simply make it easier to see what is really happening.',
      },
      ...sourcesBlocks('how-to-take-scalp-photos'),
    ],
  },
  {
    slug: 'nutrition-and-hair',
    title: 'Nutrition and hair: what the evidence does and does not say',
    seoTitle: 'Nutrition and hair: what evidence says',
    dek: 'Food matters for hair, but not always the way supplement ads say. A simple look at what is fairly well known — and what is not.',
    seoDescription:
      'Diet matters for hair, but not always in the way supplement advertising suggests. A plain look at what is reasonably well understood, and what is not.',
    category: 'Everyday care',
    readingMinutes: 6,
    publishedOn: '2026-05-21',
    reviewStatus: 'pending_medical_review',
    image: 'tablets',
    body: [
      {
        type: 'paragraph',
        text: 'Search for hair health online and you will find long lists of foods and supplements said to make hair thicker. The truth is smaller, and more useful: food can make a real difference when something is missing. But it is rarely the whole story.',
      },
      { type: 'heading', id: 'what-is-understood', text: 'What is fairly well known' },
      {
        type: 'paragraph',
        text: 'Hair roots are among the busiest parts of the body. They need a steady supply of energy, protein, vitamins and minerals. When the body is short of something, hair can grow more slowly, or more can fall.',
      },
      {
        type: 'list',
        items: [
          'Low iron is a known cause of short-term hair loss. The NHS lists low iron among its common causes',
          'Eating very little protein, crash diets or losing weight fast can cause heavy hair fall, usually a few months later',
          'Too little biotin, iron, protein or zinc can show up as clear hair loss, says the AAD',
          'Thyroid problems are not about food, but can look like it, and they also affect hair',
        ],
      },
      {
        type: 'paragraph',
        text: 'In these cases, finding and fixing the real problem — with your doctor’s help — is what tends to work. The NHS says hair loss caused by a medical condition usually stops, or grows back, once you are well again.',
      },
      { type: 'heading', id: 'what-is-not', text: 'What the evidence does not say' },
      {
        type: 'paragraph',
        text: 'A review of diet and hair loss in the journal Dermatology Practical & Conceptual says low levels should be fixed. But it found little research on whether supplements help people whose levels are normal. Some supplements can even make hair loss worse or be harmful.',
      },
      {
        type: 'list',
        items: [
          'Low biotin is rare. Biotin supplements can also upset some lab tests, including troponin, a heart test. Always tell your doctor and the lab if you take it',
          'Too much of some nutrients, such as vitamin A or selenium, has itself been linked to hair loss',
          'No single food or “superfood” has been shown to reverse pattern hair loss',
          'Food alone does not change the genes and hormones behind pattern hair loss',
        ],
      },
      {
        type: 'callout',
        title: 'Test before you take supplements',
        text: 'If your history or diet suggests something is low, a blood test is the sensible first step. It shows what, if anything, is low — no guessing. Results need a doctor to read them: a low ferritin confirms low iron stores, but a normal ferritin does not always rule out low iron.',
      },
      { type: 'heading', id: 'everyday-eating', text: 'Everyday food that supports hair' },
      {
        type: 'paragraph',
        text: 'You do not need a special diet. The same healthy eating that is good for your body is good for your hair:',
      },
      {
        type: 'list',
        items: [
          'Enough protein through the day — dal, beans, milk and curd, eggs, fish, paneer or tofu',
          'Iron-rich foods such as leafy greens, beans and, if you eat it, meat — with some vitamin C to help your body take in the iron',
          'Plenty of different vegetables, fruit, nuts and seeds',
          'No crash diets, and no very fast weight loss',
        ],
      },
      {
        type: 'paragraph',
        text: 'You may be more likely to run short of some nutrients if you are vegetarian or vegan, pregnant or breastfeeding, have heavy periods or a stomach or gut problem. Mention it on your health form.',
      },
      { type: 'heading', id: 'supplements-in-a-plan', text: 'Where supplements fit in a plan' },
      {
        type: 'paragraph',
        text: 'At YHC, your plan includes a supplement only if Dr. Tyagi thinks you need it — based on your health, your diet and any test results. It is one part of a routine. It does not replace finding the cause.',
      },
      { type: 'heading', id: 'when-to-see-a-doctor', text: 'When to see a doctor' },
      {
        type: 'list',
        items: [
          'Hair fall that started after an illness, a baby, surgery or a big diet change, and has not settled',
          'Hair changes along with tiredness, feeling cold, breathlessness or pale skin',
          'You are thinking of high-dose supplements, or already take several',
          'You have a health condition, or take medicines, that could affect your nutrient levels',
        ],
      },
      { type: 'heading', id: 'next-step', text: 'The next step' },
      {
        type: 'paragraph',
        text: 'Food is one piece of the picture. The scan and consultation look at all of it — your roots, your health, your diet and any tests — and suggest what is worth doing. Individual results vary.',
      },
      ...sourcesBlocks('nutrition-and-hair'),
    ],
  },
];

/** Newest first. */
export function getArticles(): Article[] {
  return [...ARTICLES].sort((a, b) => b.publishedOn.localeCompare(a.publishedOn));
}

export function getArticle(slug: string): Article | null {
  return ARTICLES.find((a) => a.slug === slug) ?? null;
}

/** Linked sources for an article (the body's "Sources" list carries the same entries as text). */
export function getArticleSources(slug: string): EvidenceSource[] {
  return ARTICLE_SOURCES[slug] ?? [];
}

/** Same category first, then most recent — never the article itself. */
export function getRelatedArticles(slug: string, limit = 2): Article[] {
  const current = getArticle(slug);
  const others = getArticles().filter((a) => a.slug !== slug);
  if (!current) return others.slice(0, limit);
  const same = others.filter((a) => a.category === current.category);
  const rest = others.filter((a) => a.category !== current.category);
  return [...same, ...rest].slice(0, limit);
}
