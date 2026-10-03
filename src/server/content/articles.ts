import 'server-only';

import type { Article } from './types';

/*
 * Demo articles (FR-M1-1, FR-M1-4). General education only — every one is still waiting for
 * Dr. Tyagi's medical review, and the site labels it that way until `reviewStatus` changes.
 * TODO(client): Dr. Tyagi to review and approve each article before launch — see docs/12 (content)
 * Copy rules: PRD §15 — no outcome promises, no fixed timelines, no invented figures.
 */
const ARTICLES: Article[] = [
  {
    slug: 'hair-shedding-vs-hair-loss',
    title: 'Hair shedding vs hair loss: how to tell the difference',
    dek: 'Finding hair on your pillow is not always a sign that something is wrong. Here is how shedding and thinning differ, and what each one usually means.',
    category: 'Understanding hair',
    readingMinutes: 5,
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
        text: 'Every hair on your scalp grows for a long period, rests, and then falls out so a new hair can take its place. Because thousands of follicles are at different stages at any moment, losing some hair every day is expected. Dermatology bodies often describe losing roughly 50 to 100 scalp hairs a day as within the normal range, although it varies from person to person and from day to day.',
      },
      {
        type: 'paragraph',
        text: 'You may also notice more hair on wash days simply because loose hairs collect between washes. Long hair can look like more, too, because each strand is easier to see.',
      },
      { type: 'heading', id: 'increased-shedding', text: 'When shedding increases' },
      {
        type: 'paragraph',
        text: 'Sometimes a larger number of follicles move into the resting phase together, and a few weeks to a few months later they shed at once. This pattern, called telogen effluvium, is often linked to a trigger such as a high fever, an illness, childbirth, surgery, a sudden change in diet, significant stress or a new medicine.',
      },
      {
        type: 'paragraph',
        text: 'The hair usually falls out evenly across the scalp, and the follicles themselves are typically still able to grow hair. That is why a doctor will ask what happened in the months before the shedding started — not just what is happening now.',
      },
      { type: 'heading', id: 'hair-loss', text: 'What hair loss looks like' },
      {
        type: 'paragraph',
        text: 'Hair loss usually describes something different: hair that grows back thinner, shorter or not at all in particular areas. It tends to happen gradually, so people often notice it in photos before they notice it in the mirror.',
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
        text: 'Pattern hair loss, patchy hair loss and breakage each have different causes, and they are managed differently. Some people have more than one at the same time, which is one reason self-diagnosis from photos online is unreliable.',
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
          'Shedding that is still heavy after a few months, or keeps coming back',
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
        text: 'If you are not sure whether what you are seeing is shedding or thinning, a consultation is the simplest way to find out. In a YHC video consultation, Dr. Tyagi reviews your history and photos, explains what is likely happening in plain words, and only suggests treatment if it is right for you.',
      },
    ],
  },
  {
    slug: 'hair-growth-cycle-explained',
    title: 'Why hair changes are slow — the hair growth cycle explained',
    dek: 'Hair does not respond on the schedule we would like. Understanding the growth cycle explains why patience and consistent photos matter more than day-to-day checking.',
    category: 'Understanding hair',
    readingMinutes: 5,
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
        text: 'A hair follicle does not produce hair continuously. It moves through phases, and each follicle on your scalp is on its own timetable.',
      },
      {
        type: 'list',
        items: [
          'Growth (anagen): the follicle actively produces hair. On the scalp this phase usually lasts for years, and it largely decides how long your hair can grow.',
          'Transition (catagen): a short phase in which growth stops and the follicle shrinks.',
          'Rest (telogen): the hair stays in place but no longer grows, typically for a few months.',
          'Shedding (exogen): the old hair falls out, often pushed out by a new hair starting to grow beneath it.',
        ],
      },
      {
        type: 'paragraph',
        text: 'At any time, most scalp follicles are in the growth phase and a smaller share are resting or shedding. That balance is what keeps hair looking full.',
      },
      { type: 'heading', id: 'why-slow', text: 'Why visible change takes time' },
      {
        type: 'paragraph',
        text: 'Scalp hair grows slowly — commonly described as around a centimetre a month, though this varies between people. Even when a follicle starts producing a stronger hair, that new hair has to grow long enough to be noticed against the rest.',
      },
      {
        type: 'paragraph',
        text: 'Many treatments work by supporting the follicle or by helping it stay in the growth phase longer. Neither effect is visible overnight. This is why doctors usually judge progress over several months rather than weeks, and why stopping and starting a routine makes it hard to know what is helping.',
      },
      {
        type: 'callout',
        title: 'A note on early shedding',
        text: 'With some treatments, a few people notice more shedding in the early weeks as resting hairs are replaced. It can be unsettling. If it happens to you, talk to your doctor before changing anything — do not simply stop.',
        tone: 'caution',
      },
      { type: 'heading', id: 'what-affects-the-cycle', text: 'What can affect the cycle' },
      {
        type: 'list',
        items: [
          'Genetics and hormones, which play a large part in pattern hair loss',
          'Illness, high fever, surgery or childbirth',
          'Low iron, thyroid changes and some other medical conditions',
          'Sudden changes in diet or rapid weight loss',
          'Some medicines',
          'Ongoing stress',
        ],
      },
      {
        type: 'paragraph',
        text: 'Because so many things can shift the cycle, the same visible change can have quite different causes in two people. That is why a plan should be chosen for your history, not copied from someone else.',
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
        text: 'Individual results vary, and no honest doctor can promise a timeline. What a consultation can give you is a clear picture of what is likely going on and a sensible way to measure progress. You can book a video consultation with Dr. Tyagi whenever you are ready.',
      },
    ],
  },
  {
    slug: 'what-happens-in-a-video-consultation',
    title: 'What happens in a YHC video consultation',
    dek: 'From choosing a time to receiving your plan on WhatsApp — a step-by-step look at the consultation, and how to make the most of it.',
    category: 'Your consultation',
    readingMinutes: 5,
    publishedOn: '2026-07-30',
    reviewStatus: 'pending_medical_review',
    image: 'heroStage',
    body: [
      {
        type: 'paragraph',
        text: 'If you have never had a video consultation before, it is reasonable to wonder what it involves. This guide walks through each step, so you know what to expect before you book.',
      },
      { type: 'heading', id: 'booking', text: 'Booking your time' },
      {
        type: 'paragraph',
        text: 'You start by choosing a time that suits you. You then confirm your mobile number with a one-time code, fill in a short form — your name, age and main concern — and pay the consultation fee online. Consultations are for adults aged 18 and over.',
      },
      {
        type: 'paragraph',
        text: 'Your confirmation, with a link to join the call, arrives on WhatsApp. You will also get a reminder before the consultation.',
      },
      { type: 'heading', id: 'before-the-call', text: 'Before the call' },
      {
        type: 'paragraph',
        text: 'After booking, you will be asked to complete a health questionnaire and upload a few scalp photos. This is the part that makes the biggest difference: Dr. Tyagi reads your history and looks at your photos before the call, so the time together is spent on you rather than on paperwork.',
      },
      {
        type: 'list',
        items: [
          'A list of medicines and supplements you take',
          'Any recent blood test reports, if you have them',
          'When you first noticed the change, and anything that happened around then',
          'What you have already tried, and for how long',
        ],
      },
      { type: 'heading', id: 'during-the-call', text: 'During the call' },
      {
        type: 'paragraph',
        text: 'The consultation is one to one, by video, with Dr. Tyagi. You will be asked to confirm who you are, and then the conversation usually covers:',
      },
      {
        type: 'list',
        items: [
          'Your concern in your own words, and how it has changed over time',
          'Your general health, family history, diet, sleep and stress',
          'A look at your scalp on camera, alongside the photos you sent',
          'What is likely going on, explained in plain language',
          'Whether treatment is appropriate for you — and if not, why not',
        ],
      },
      {
        type: 'paragraph',
        text: 'Ask anything. There are no silly questions about your own hair. If something is not suited to a video consultation, Dr. Tyagi will tell you and suggest what to do instead, such as an in-person examination or blood tests.',
      },
      { type: 'heading', id: 'after-the-call', text: 'After the call' },
      {
        type: 'paragraph',
        text: 'If treatment is right for you, you receive your prescription and a recommended plan on WhatsApp. The plan explains what each product is for and how to use it.',
      },
      {
        type: 'callout',
        title: 'Your prescription is yours',
        text: 'There is no obligation to buy anything from YHC. You are free to use your prescription wherever you prefer.',
      },
      {
        type: 'paragraph',
        text: 'If you do start a plan, it is delivered to your door, and care continues: short weekly check-ins, monthly progress photos and a follow-up review so your doctor can see how you are responding and adjust if needed.',
      },
      { type: 'heading', id: 'privacy', text: 'Who sees your information' },
      {
        type: 'paragraph',
        text: 'Your health details, photos and consultation notes are kept for your doctor. Our support team helps with bookings, orders and delivery, and cannot see your clinical information. Nothing clinical is ever put into marketing messages.',
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
        text: 'Every YHC plan starts with this conversation, and you can decide afterwards whether a plan is for you. Individual results vary. When you are ready, choose a time that suits you.',
      },
    ],
  },
  {
    slug: 'how-to-take-scalp-photos',
    title: 'How to take scalp photos your doctor can actually use',
    dek: 'Good photos make a consultation more useful and progress easier to judge. Here is how to capture your hairline, crown and parting clearly, with only a phone.',
    category: 'Your consultation',
    readingMinutes: 5,
    publishedOn: '2026-06-24',
    reviewStatus: 'pending_medical_review',
    image: 'topical',
    body: [
      {
        type: 'paragraph',
        text: 'Your doctor will look at your scalp on video, but photos taken in good light often show more than a live camera can. They also become the baseline for comparing progress later. A few minutes of care now makes them far more useful.',
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
        text: 'Comb your hair into a straight centre parting. Tilt your head forward slightly and photograph the parting from above, so it runs from the top of the image to the bottom. If you usually wear a side parting, take one of that as well.',
      },
      {
        type: 'callout',
        title: 'Check before you upload',
        text: 'Zoom in on each photo. If you cannot see individual hairs clearly, take it again. Three sharp photos are more useful than ten blurred ones.',
      },
      { type: 'heading', id: 'monthly-photos', text: 'Taking photos each month' },
      {
        type: 'paragraph',
        text: 'Hair changes gradually, so the most useful comparison is between photos taken months apart in the same conditions. Try to repeat the same three angles, the same light, the same distance and the same hairstyle. Consistency matters more than a perfect shot.',
      },
      { type: 'heading', id: 'privacy', text: 'Where your photos go' },
      {
        type: 'paragraph',
        text: 'Scalp photos you upload to YHC are stored privately and are seen only by your doctor for your care. They are never used in marketing unless you separately and explicitly agree, and you can withdraw that agreement at any time.',
      },
      { type: 'heading', id: 'when-to-see-a-doctor', text: 'When to see a doctor' },
      {
        type: 'paragraph',
        text: 'If you notice something unusual while taking photos — patches with no hair, broken hairs, redness, scaling, sores or a scalp that is tender to touch — mention it in your consultation, or see a doctor promptly if it is painful or spreading.',
      },
      { type: 'heading', id: 'next-step', text: 'The next step' },
      {
        type: 'paragraph',
        text: 'Once you book a consultation, you will be prompted to upload these photos before your call, so Dr. Tyagi can review them in advance. Individual results of any treatment vary; good photos simply make it easier to see what is really happening.',
      },
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
        text: 'Search for hair health online and you will find a long list of foods and supplements said to make hair thicker. The reality is more modest, and more useful: nutrition can make a real difference for some people, particularly when something is missing, but it is rarely the whole story.',
      },
      { type: 'heading', id: 'what-is-understood', text: 'What is reasonably well understood' },
      {
        type: 'paragraph',
        text: 'Hair follicles are among the most active cells in the body, and they need a steady supply of energy, protein and micronutrients. When the body is short of something, hair growth is often one of the first things to slow.',
      },
      {
        type: 'list',
        items: [
          'Low iron stores are commonly linked to increased shedding, particularly in women',
          'Very low protein intake, or rapid weight loss, can trigger a period of heavier shedding',
          'Low levels of vitamin D, vitamin B12, zinc and folate have been associated with hair changes in some studies',
          'Thyroid conditions, which are not a nutritional problem but can look like one, also affect hair',
        ],
      },
      {
        type: 'paragraph',
        text: 'In these situations, finding and correcting the underlying problem — with your doctor’s guidance — is what tends to help.',
      },
      { type: 'heading', id: 'what-is-not', text: 'What the evidence does not say' },
      {
        type: 'paragraph',
        text: 'There is far less evidence that supplements help people who are not short of anything. Taking more of a vitamin than your body needs does not usually mean more hair, and some nutrients can cause problems in excess.',
      },
      {
        type: 'list',
        items: [
          'Biotin deficiency is uncommon. High-dose biotin can also interfere with some blood tests, including certain thyroid and heart tests, so tell your doctor if you take it',
          'Too much vitamin A or selenium has itself been linked to hair shedding',
          'No single food or “superfood” has been shown to reverse pattern hair loss',
          'Diet alone does not change the genetic and hormonal factors behind pattern hair loss',
        ],
      },
      {
        type: 'callout',
        title: 'Testing before supplementing',
        text: 'If a deficiency is suspected, a simple blood test is usually the sensible first step. It tells you what, if anything, is low — rather than guessing.',
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
        text: 'If you follow a vegetarian or vegan diet, are pregnant or breastfeeding, have heavy periods or a digestive condition, you may be more likely to run short of some nutrients. It is worth mentioning in your consultation.',
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
        text: 'Nutrition is one piece of the picture. A consultation looks at the whole of it — your history, your scalp, your diet and any tests — and suggests what is worth doing. Individual results vary.',
      },
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

/** Same category first, then most recent — never the article itself. */
export function getRelatedArticles(slug: string, limit = 2): Article[] {
  const current = getArticle(slug);
  const others = getArticles().filter((a) => a.slug !== slug);
  if (!current) return others.slice(0, limit);
  const same = others.filter((a) => a.category === current.category);
  const rest = others.filter((a) => a.category !== current.category);
  return [...same, ...rest].slice(0, limit);
}
