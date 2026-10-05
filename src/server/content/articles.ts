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
    dek: 'Finding hair on your pillow is not always a sign that something is wrong. Here is how shedding and thinning differ, what each one usually means, and when to get your roots checked.',
    category: 'Understanding hair',
    readingMinutes: 6,
    publishedOn: '2026-09-18',
    reviewStatus: 'pending_medical_review',
    image: 'textureDrop',
    body: [
      {
        type: 'paragraph',
        text: 'Most people notice hair changes in the same places: the shower drain, the hairbrush, the pillow. It is natural to worry. But hair that falls out and hair that stops growing back are two different things, and telling them apart is the first step towards knowing whether you need help.',
      },
      { type: 'heading', id: 'shedding-is-normal', text: 'Some shedding is part of a healthy cycle' },
      {
        type: 'paragraph',
        text: 'Every hair on your scalp grows for years, rests for a few months and then falls out so a new hair can take its place. A healthy scalp has roughly 80,000 to 120,000 hairs, and at any moment about 85–90% of follicles are in the growing phase while the rest are resting or shedding. Because of that constant turnover, the American Academy of Dermatology describes losing between 50 and 100 hairs a day as normal.',
      },
      {
        type: 'paragraph',
        text: 'You may notice more hair on wash days simply because loose hairs collect between washes. Long hair can look like more, too, because each strand is easier to see.',
      },
      { type: 'heading', id: 'increased-shedding', text: 'When shedding increases' },
      {
        type: 'paragraph',
        text: 'Sometimes a larger number of follicles move into the resting phase together and shed at once. This pattern, called telogen effluvium, usually follows a trigger — a high fever, an illness, childbirth, surgery, rapid weight loss, a very stressful period or a new medicine. The shedding typically starts around three months after the trigger, although the gap can be anywhere from one to six months.',
      },
      {
        type: 'paragraph',
        text: 'The hair usually falls evenly across the scalp, and the follicles themselves are still able to grow hair. Once the trigger has passed, the AAD notes that hair tends to regain its normal fullness within about six to nine months. Shedding that carries on for longer than six months is described as chronic, and it deserves a closer look.',
      },
      {
        type: 'callout',
        title: 'Why the doctor asks about last season, not just last week',
        text: 'Because the shedding lags behind the cause by months, the most useful question is often “what happened before this started?” — an illness, a new medicine, a baby, a crash diet.',
      },
      { type: 'heading', id: 'hair-loss', text: 'What hair loss looks like' },
      {
        type: 'paragraph',
        text: 'Hair loss is different: something stops hair from growing back as it was. In pattern hair loss (androgenetic alopecia), the growth phase gets shorter with each cycle and follicles gradually shrink, producing shorter, finer hairs. It is very common — in a population study of 1,005 men aged 30 to 50 in India, 58% had some degree of it. Because it happens slowly, people often notice it in photos before the mirror.',
      },
      {
        type: 'list',
        items: [
          'A hairline that is moving back, especially at the temples',
          'A widening parting, or more scalp visible at the crown',
          'A ponytail that feels thinner than it used to',
          'Round or oval patches with little or no hair',
          'Hairs that break easily rather than falling out from the root',
        ],
      },
      {
        type: 'paragraph',
        text: 'Pattern hair loss, patchy hair loss, scarring hair loss and breakage each have different causes and are managed differently. Some people have more than one at once. In scarring forms, follicles are replaced by scar tissue — and once a follicle scars, it can no longer grow hair. That is the strongest reason not to wait and see when something looks unusual.',
      },
      { type: 'heading', id: 'how-doctors-tell', text: 'How a doctor tells them apart' },
      {
        type: 'paragraph',
        text: 'A dermatologist combines your history with a close look at the scalp. Trichoscopy — examining the hair and scalp under roughly 20 to 160 times magnification — shows the follicle openings, the skin around them and the thickness of individual hairs. It can help distinguish scarring from non-scarring hair loss, and early pattern hair loss from shedding, and it can be repeated to follow progress.',
      },
      { type: 'heading', id: 'simple-checks', text: 'Simple things you can note at home' },
      {
        type: 'list',
        items: [
          'When did you first notice the change, and did anything happen in the months before?',
          'Is the hair falling out with a small white bulb at the root, or snapping along its length?',
          'Is the change spread across the scalp, or concentrated in one area?',
          'Does anyone in your close family have similar thinning?',
          'Are there other changes — itching, flaking, redness, tiredness or a recent weight change?',
        ],
      },
      {
        type: 'paragraph',
        text: 'Writing these down, along with a few clear scalp photos, gives a doctor far more to work with than a description from memory.',
      },
      { type: 'heading', id: 'when-to-see-a-doctor', text: 'When to see a doctor' },
      {
        type: 'list',
        items: [
          'Shedding that is still heavy after about six months, or keeps coming back',
          'Patches of hair loss that appear quickly',
          'A scalp that is painful, burning, very itchy, red or scaly',
          'Hair loss along with other symptoms such as unusual tiredness, weight change or irregular periods',
          'Thinning that is clearly progressing, or that is affecting how you feel day to day',
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
        text: 'If you are not sure whether you are seeing shedding or thinning, start with the guided 3D scalp scan. Your personalised assessment explains, in plain words, whether treatment looks suitable, whether a doctor should look first, or whether treatment is unlikely to help. If you go ahead, Dr. Tyagi reviews everything before your video consultation and only suggests treatment if it is right for you.',
      },
      ...sourcesBlocks('hair-shedding-vs-hair-loss'),
    ],
  },
  {
    slug: 'hair-growth-cycle-explained',
    title: 'Why hair changes are slow — the hair growth cycle explained',
    dek: 'Hair does not respond on the schedule we would like. Understanding the growth cycle explains why patience and consistent photos matter more than day-to-day checking.',
    category: 'Understanding hair',
    readingMinutes: 6,
    publishedOn: '2026-08-27',
    reviewStatus: 'pending_medical_review',
    image: 'serum',
    body: [
      {
        type: 'paragraph',
        text: 'One of the hardest parts of looking after thinning hair is waiting. People often expect to see a difference within days of starting a new routine, and feel let down when nothing seems to change. The reason lies in how hair grows.',
      },
      { type: 'heading', id: 'three-phases', text: 'Each hair follows its own cycle' },
      {
        type: 'paragraph',
        text: 'A hair follicle does not produce hair continuously. It moves through phases, and each follicle on your scalp is on its own timetable — which is why you never lose all your hair at once.',
      },
      {
        type: 'list',
        items: [
          'Growth (anagen): the follicle actively produces hair. On the scalp this lasts about two to six years, and it largely decides how long your hair can grow.',
          'Transition (catagen): a short phase of about two weeks in which growth stops and the follicle shrinks.',
          'Rest (telogen): the hair stays in place but no longer grows, for about three months.',
          'Shedding (exogen): the old hair falls out, often pushed out by a new hair starting to grow beneath it.',
        ],
      },
      {
        type: 'paragraph',
        text: 'At any time, roughly 85–90% of scalp follicles are in the growth phase and the rest are resting or shedding. That balance is what keeps hair looking full.',
      },
      { type: 'heading', id: 'why-slow', text: 'Why visible change takes time' },
      {
        type: 'paragraph',
        text: 'Scalp hair grows about 0.35 mm a day — roughly a centimetre a month. Even when a follicle starts producing a stronger hair, that new hair has to grow long enough to be noticed against the rest.',
      },
      {
        type: 'paragraph',
        text: 'In pattern hair loss, the growth phase becomes shorter and follicles gradually shrink. Treatments aim to slow that process or to support follicles that are still active, and neither effect is visible overnight. Published reviews describe at least four to six months of consistent use before improvement is usually noticeable, and the AAD advises using minoxidil for about six to 12 months before judging how well it works. Some people do not respond at all, which is why progress is reviewed, not assumed.',
      },
      {
        type: 'callout',
        title: 'A note on early shedding',
        text: 'With some treatments, a few people notice more shedding in the early weeks as resting hairs are replaced. It can be unsettling. If it happens to you, talk to your doctor before changing anything — do not simply stop.',
        tone: 'caution',
      },
      {
        type: 'paragraph',
        text: 'There is a second reason for patience: for pattern hair loss, the benefit of treatment generally lasts only while it is used. Dermatologists note that stopping tends to mean losing the benefit over time, so a routine you can keep up matters more than an intense one.',
      },
      { type: 'heading', id: 'what-affects-the-cycle', text: 'What can affect the cycle' },
      {
        type: 'list',
        items: [
          'Genetics and hormones, which play a large part in pattern hair loss',
          'Illness, high fever, surgery or childbirth',
          'An under- or over-active thyroid',
          'Low iron and some other nutritional gaps',
          'Sudden changes in diet or rapid weight loss',
          'Some medicines, and stopping the contraceptive pill',
          'Severe or ongoing stress',
        ],
      },
      {
        type: 'paragraph',
        text: 'Because so many things can shift the cycle, the same visible change can have quite different causes in two people. That is why a plan should be chosen for your history and your roots, not copied from someone else.',
      },
      { type: 'heading', id: 'tracking-progress', text: 'How to track progress fairly' },
      {
        type: 'list',
        items: [
          'Take photos in the same place, light and angle each month, rather than checking the mirror daily',
          'Keep using your routine as prescribed so you can see what it is doing',
          'Write down anything that changes — a new medicine, an illness, a change in diet',
          'Compare photos months apart, not days apart',
        ],
      },
      {
        type: 'paragraph',
        text: 'At YHC, monthly progress photos and follow-up reviews are part of every plan for exactly this reason: they let your doctor see change that is too gradual to notice day to day.',
      },
      { type: 'heading', id: 'when-to-see-a-doctor', text: 'When to see a doctor' },
      {
        type: 'list',
        items: [
          'You have been trying products on your own for a while and cannot tell whether anything is helping',
          'Shedding has increased suddenly, or is not settling',
          'You notice patches, scalp pain, redness or scaling',
          'You want to know whether what you are seeing is likely to respond to treatment at all',
        ],
      },
      { type: 'heading', id: 'next-step', text: 'The next step' },
      {
        type: 'paragraph',
        text: 'Individual results vary, and no honest doctor can promise a timeline. What a scan and consultation can give you is a clear picture of what is likely going on, whether your roots are still active, and a fair way to measure progress. You can start your scan whenever you are ready.',
      },
      ...sourcesBlocks('hair-growth-cycle-explained'),
    ],
  },
  {
    slug: 'what-happens-in-a-video-consultation',
    title: 'From scan to consultation: what happens at each step',
    dek: 'From your first details to a plan on WhatsApp — a step-by-step look at the scan, the assessment and the video consultation, and how to make the most of them.',
    category: 'Your consultation',
    readingMinutes: 6,
    publishedOn: '2026-07-30',
    reviewStatus: 'pending_medical_review',
    image: 'heroStage',
    body: [
      {
        type: 'paragraph',
        text: 'If you have never had a video consultation for your hair, it is reasonable to wonder what it involves. At YHC the consultation is the last step of a short journey that starts with your roots. This guide walks through each step, so you know what to expect.',
      },
      { type: 'heading', id: 'why-scan-first', text: 'Why we start with your roots' },
      {
        type: 'paragraph',
        text: 'Treatment can only support hair follicles that are still alive. In scarring forms of hair loss, follicles are replaced by scar tissue, and once a follicle scars it can no longer grow hair. Shedding, pattern thinning and scarring can look alike in a mirror, so looking at the scalp closely — the way dermatologists use magnified examination, called trichoscopy — comes before any recommendation.',
      },
      { type: 'heading', id: 'details-and-scan', text: 'Step 1 and 2: your details and the 3D scan' },
      {
        type: 'paragraph',
        text: 'You begin with a few basic details — your name, mobile number and address. You are then guided, step by step, to capture your hairline, crown and parting with your phone camera. Soft daylight, clean and dry unstyled hair, and no camera filters make the biggest difference.',
      },
      { type: 'heading', id: 'assessment', text: 'Step 3: your personalised assessment' },
      {
        type: 'paragraph',
        text: 'Next you see your assessment, with its reasons in plain words. It shows one of three results:',
      },
      {
        type: 'list',
        items: [
          'Treatment looks suitable — your roots look active, and you can continue to your health form',
          'A doctor should look first — some signs, such as round patches or a long-standing bald area, need a doctor’s eye before any plan',
          'Treatment is unlikely to help the scanned areas — for example where very few active roots are visible; we say so honestly rather than sell you a plan',
        ],
      },
      {
        type: 'paragraph',
        text: 'The assessment is a guide, not a diagnosis. The final assessment is always made by the doctor.',
      },
      { type: 'heading', id: 'health-form', text: 'Step 4: your health form' },
      {
        type: 'paragraph',
        text: 'The health form asks about your history in more depth. It helps to have these to hand:',
      },
      {
        type: 'list',
        items: [
          'A list of medicines and supplements you take, including any biotin',
          'Any recent blood test reports, if you have them',
          'When you first noticed the change, and anything that happened in the months before — illness, childbirth, surgery, stress, a change in diet',
          'What you have already tried, for how long, and how it went',
        ],
      },
      { type: 'heading', id: 'booking', text: 'Step 5: choosing a time' },
      {
        type: 'paragraph',
        text: 'You then pick a time that suits you and pay the ₹500 consultation fee online. Consultations are for adults aged 18 and over. Your confirmation, with your appointment details and the doctor’s registration number, arrives on WhatsApp, followed by reminders before the call.',
      },
      { type: 'heading', id: 'during-the-call', text: 'Step 6: the consultation' },
      {
        type: 'paragraph',
        text: 'Dr. Tyagi reviews your scan, assessment and health form before the call, so your time together is spent on you rather than on paperwork. The consultation is one to one, by video. You will be asked to confirm who you are, and then the conversation usually covers:',
      },
      {
        type: 'list',
        items: [
          'Your concern in your own words, and how it has changed over time',
          'Your general health, family history, diet, sleep and stress',
          'A look at your scalp on camera, alongside your scan',
          'What is likely going on, explained in plain language',
          'Whether treatment is appropriate for you — and if not, why not',
          'What a realistic timeline for judging progress looks like',
        ],
      },
      {
        type: 'paragraph',
        text: 'Ask anything. There are no silly questions about your own hair. If something is not suited to a video consultation, Dr. Tyagi will tell you and suggest what to do instead, such as an in-person examination or blood tests.',
      },
      { type: 'heading', id: 'after-the-call', text: 'After the call' },
      {
        type: 'paragraph',
        text: 'If treatment is right for you, you receive a link to your prescription and recommended plan on WhatsApp. The plan explains what each product is for and how to use it.',
      },
      {
        type: 'callout',
        title: 'Your prescription is yours',
        text: 'There is no obligation to buy anything from YHC. You are free to use your prescription wherever you prefer.',
      },
      {
        type: 'paragraph',
        text: 'If you do start a plan, it is delivered to your door, and care continues: short check-ins, monthly progress photos and a follow-up review so your doctor can see how you are responding and adjust if needed. Treatments for pattern hair loss are judged over several months, and dermatologists note that people who start soon after noticing hair loss tend to see the best results.',
      },
      { type: 'heading', id: 'privacy', text: 'Who sees your information' },
      {
        type: 'paragraph',
        text: 'Your scan, health details, photos and consultation notes are for your doctor. Our support team helps with bookings, orders and delivery, and cannot see your clinical information. Clinical details are never written into WhatsApp messages or marketing.',
      },
      { type: 'heading', id: 'getting-ready', text: 'Getting ready on the day' },
      {
        type: 'list',
        items: [
          'Find a quiet, well-lit spot and check your internet connection',
          'Join from your phone or laptop a couple of minutes early',
          'Keep your hair dry and unstyled, so your scalp can be seen clearly on camera',
          'Have your list of questions to hand',
        ],
      },
      { type: 'heading', id: 'when-to-see-a-doctor', text: 'When to see a doctor in person instead' },
      {
        type: 'paragraph',
        text: 'A video consultation is not for emergencies. If you have sudden severe symptoms, signs of infection with fever, or feel unwell, contact your nearest hospital or see a doctor in person.',
      },
      { type: 'heading', id: 'next-step', text: 'The next step' },
      {
        type: 'paragraph',
        text: 'Every YHC plan starts with your roots, and you decide at each step whether to continue. Individual results vary. When you are ready, start with the scan.',
      },
      ...sourcesBlocks('what-happens-in-a-video-consultation'),
    ],
  },
  {
    slug: 'how-to-take-scalp-photos',
    title: 'How to take scalp photos your doctor can actually use',
    dek: 'Good photos make your scan, your consultation and your progress reviews more useful. Here is how to capture your hairline, crown and parting clearly, with only a phone.',
    category: 'Your consultation',
    readingMinutes: 5,
    publishedOn: '2026-06-24',
    reviewStatus: 'pending_medical_review',
    image: 'topical',
    body: [
      {
        type: 'paragraph',
        text: 'Dermatologists rely on a close, well-lit view of the scalp — in clinic they often use magnified examination (trichoscopy), which can also be repeated to follow how someone responds to treatment. At home, careful phone photos are the next best thing. They become the baseline for your scan and for comparing progress later, so a few minutes of care makes them far more useful.',
      },
      { type: 'heading', id: 'before-you-start', text: 'Before you start' },
      {
        type: 'list',
        items: [
          'Wash and fully dry your hair; skip oils, gels, sprays and hair fibres',
          'Leave it unstyled — no fresh blow-dry, straightening or tight hairstyles',
          'Turn off filters, beauty mode and portrait blur on your camera',
          'Clean the camera lens',
          'If you can, ask someone to help with the crown photo',
        ],
      },
      { type: 'heading', id: 'lighting', text: 'Get the lighting right' },
      {
        type: 'paragraph',
        text: 'Lighting changes how much scalp shows through hair more than anything else. Bright light directly overhead can make hair look thinner than it is; dim light can hide real change.',
      },
      {
        type: 'list',
        items: [
          'Use soft daylight — stand facing a window, but out of direct sunlight',
          'Avoid a single bright ceiling light directly above your head',
          'Do not use the flash; it flattens detail and causes glare on the scalp',
          'Use the same spot and roughly the same time of day every time',
        ],
      },
      { type: 'heading', id: 'front-hairline', text: 'Photo 1: front hairline' },
      {
        type: 'paragraph',
        text: 'Pull your hair back from your forehead, or hold it with a soft band. Look straight at the camera, held at eye level about an arm’s length away. Take one photo straight on, and one of each temple with your head turned slightly to the side.',
      },
      { type: 'heading', id: 'crown', text: 'Photo 2: crown' },
      {
        type: 'paragraph',
        text: 'The crown is the hardest area to photograph yourself. Ideally, sit down and ask someone to hold the phone above and slightly behind your head, pointing down at the top of your scalp. On your own, use the timer or a mirror behind you, and take several shots so at least one is in focus.',
      },
      { type: 'heading', id: 'parting', text: 'Photo 3: parting' },
      {
        type: 'paragraph',
        text: 'Comb your hair into a straight centre parting. Tilt your head forward slightly and photograph the parting from above, so it runs from the top of the image to the bottom. A wider parting is a common sign of female pattern hair loss, so this view matters for everyone. If you usually wear a side parting, take one of that as well.',
      },
      {
        type: 'callout',
        title: 'Check before you upload',
        text: 'Zoom in on each photo. If you cannot see individual hairs clearly, take it again. Three sharp photos are more useful than ten blurred ones.',
      },
      { type: 'heading', id: 'monthly-photos', text: 'Taking photos each month' },
      {
        type: 'paragraph',
        text: 'A scalp hair grows only about a centimetre a month, so the most useful comparison is between photos taken months apart in the same conditions. Repeat the same three angles, the same light, the same distance and the same hairstyle. Consistency matters more than a perfect shot.',
      },
      { type: 'heading', id: 'privacy', text: 'Where your photos go' },
      {
        type: 'paragraph',
        text: 'Scalp photos you upload to YHC are stored privately and are seen only by your doctor for your care. They are never used in marketing unless you separately and explicitly agree in writing, and you can withdraw that agreement at any time.',
      },
      { type: 'heading', id: 'when-to-see-a-doctor', text: 'When to see a doctor' },
      {
        type: 'paragraph',
        text: 'If you notice something unusual while taking photos — patches with no hair, broken hairs, redness, scaling, shiny skin along the hairline, sores or a scalp that is tender to touch — mention it at your consultation, or see a doctor promptly if it is painful or spreading.',
      },
      { type: 'heading', id: 'next-step', text: 'The next step' },
      {
        type: 'paragraph',
        text: 'The guided 3D scan uses these same principles and walks you through each angle. Dr. Tyagi reviews your scan before your call. Individual results of any treatment vary; good photos simply make it easier to see what is really happening.',
      },
      ...sourcesBlocks('how-to-take-scalp-photos'),
    ],
  },
  {
    slug: 'nutrition-and-hair',
    title: 'Nutrition and hair: what the evidence does and does not say',
    dek: 'Diet matters for hair, but not always in the way supplement advertising suggests. A plain look at what is reasonably well understood — and what is not.',
    category: 'Everyday care',
    readingMinutes: 6,
    publishedOn: '2026-05-21',
    reviewStatus: 'pending_medical_review',
    image: 'tablets',
    body: [
      {
        type: 'paragraph',
        text: 'Search for hair health online and you will find a long list of foods and supplements said to make hair thicker. The reality is more modest, and more useful: nutrition can make a real difference when something is actually missing, but it is rarely the whole story.',
      },
      { type: 'heading', id: 'what-is-understood', text: 'What is reasonably well understood' },
      {
        type: 'paragraph',
        text: 'Hair follicles are among the most active tissues in the body, and they need a steady supply of energy, protein and micronutrients. When the body is short of something, hair growth can slow or shedding can increase.',
      },
      {
        type: 'list',
        items: [
          'Low iron is a recognised cause of temporary hair loss, and the NHS lists iron deficiency among its common causes',
          'Very low protein intake, crash diets or rapid weight loss can trigger a period of heavier shedding, usually a few months later',
          'Too little biotin, iron, protein or zinc can show up as noticeable hair loss, according to the AAD',
          'Thyroid conditions, which are not a nutritional problem but can look like one, also affect hair',
        ],
      },
      {
        type: 'paragraph',
        text: 'In these situations, finding and correcting the underlying problem — with your doctor’s guidance — is what tends to help. The NHS notes that hair loss caused by a medical condition usually stops or grows back once you have recovered.',
      },
      { type: 'heading', id: 'what-is-not', text: 'What the evidence does not say' },
      {
        type: 'paragraph',
        text: 'A review of diet and hair loss in Dermatology Practical & Conceptual concluded that deficiencies should be corrected, but that research is lacking on whether supplements help people who are not deficient — and that some supplements can actually worsen hair loss or cause toxicity.',
      },
      {
        type: 'list',
        items: [
          'Biotin deficiency is uncommon. Biotin in supplements can also interfere with certain laboratory tests, including troponin, a heart test, so always tell your doctor and the lab if you take it',
          'Too much of some nutrients, such as vitamin A or selenium, has itself been linked to hair loss',
          'No single food or “superfood” has been shown to reverse pattern hair loss',
          'Diet alone does not change the genetic and hormonal factors behind pattern hair loss',
        ],
      },
      {
        type: 'callout',
        title: 'Testing before supplementing',
        text: 'If a deficiency is suspected from your history or diet, a blood test is the sensible first step — it shows what, if anything, is low, rather than guessing. Results need interpreting: a low ferritin confirms low iron stores, but a normal ferritin does not always rule iron deficiency out.',
      },
      { type: 'heading', id: 'everyday-eating', text: 'Everyday eating that supports hair' },
      {
        type: 'paragraph',
        text: 'You do not need a special diet. The general pattern recommended for overall health also suits hair:',
      },
      {
        type: 'list',
        items: [
          'Enough protein through the day — dal, legumes, dairy, eggs, fish, paneer or tofu',
          'Iron-rich foods such as leafy greens, legumes and, if you eat it, meat — with a source of vitamin C to help absorption',
          'A variety of vegetables, fruit, nuts and seeds',
          'Avoiding crash diets and very rapid weight loss',
        ],
      },
      {
        type: 'paragraph',
        text: 'If you follow a vegetarian or vegan diet, are pregnant or breastfeeding, have heavy periods or a digestive condition, you may be more likely to run short of some nutrients. It is worth mentioning on your health form.',
      },
      { type: 'heading', id: 'supplements-in-a-plan', text: 'Where supplements fit in a plan' },
      {
        type: 'paragraph',
        text: 'At YHC, a nutrition supplement is only included in a plan when Dr. Tyagi thinks it is appropriate for you, based on your history, diet and any test results. It is one part of a routine, not a replacement for finding the cause.',
      },
      { type: 'heading', id: 'when-to-see-a-doctor', text: 'When to see a doctor' },
      {
        type: 'list',
        items: [
          'Shedding that started after illness, childbirth, surgery or a big change in diet and has not settled',
          'Hair changes along with tiredness, feeling cold, breathlessness or pale skin',
          'You are considering high-dose supplements, or already taking several',
          'You have a medical condition or take medicines that could affect nutrient levels',
        ],
      },
      { type: 'heading', id: 'next-step', text: 'The next step' },
      {
        type: 'paragraph',
        text: 'Nutrition is one piece of the picture. The scan and consultation look at the whole of it — your roots, your history, your diet and any tests — and suggest what is worth doing. Individual results vary.',
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
