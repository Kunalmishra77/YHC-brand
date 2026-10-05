import 'server-only';

/*
 * "What the research says" (FR-M1-1, ADR-27). General facts about hair biology and hair loss, each
 * taken from a high-trust published source and worded conservatively to match it. These are NOT claims
 * about YHC products, and no figure here may be reused as one.
 * Sources checked 2026-10-05. TODO(client): Dr. Tyagi to review wording before launch — see docs/12 (content).
 */

export interface EvidenceSource {
  /** Publisher or journal, e.g. "American Academy of Dermatology". */
  name: string;
  /** Page or paper title. */
  title: string;
  url: string;
  year?: number;
}

export interface EvidenceFact {
  id: string;
  /** Headline figure — only when the source gives one. */
  stat?: string;
  label: string;
  detail: string;
  source: EvidenceSource;
}

export interface Reference extends EvidenceSource {
  /** 1-based citation number, in order of first use. */
  n: number;
}

const SRC = {
  aadShedding: {
    name: 'American Academy of Dermatology',
    title: 'Do you have hair loss or hair shedding?',
    url: 'https://www.aad.org/public/diseases/hair-loss/insider/shedding',
  },
  statpearlsHair: {
    name: 'StatPearls (NCBI Bookshelf)',
    title: 'Anatomy, Hair — Murphrey, Agarwal & Zito',
    url: 'https://www.ncbi.nlm.nih.gov/books/NBK513312/',
    year: 2023,
  },
  ccTerminalHair: {
    name: 'Cleveland Clinic',
    title: 'Terminal hair: function and examples',
    url: 'https://my.clevelandclinic.org/health/body/23140-terminal-hair',
  },
  statpearlsTE: {
    name: 'StatPearls (NCBI Bookshelf)',
    title: 'Telogen Effluvium — Hughes, Syed & Saleh',
    url: 'https://www.ncbi.nlm.nih.gov/books/NBK430848/',
    year: 2024,
  },
  krupaShankar: {
    name: 'International Journal of Trichology',
    title: 'Male androgenetic alopecia: population-based study in 1,005 subjects — Krupa Shankar et al.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/20927235/',
    year: 2009,
  },
  statpearlsAGA: {
    name: 'StatPearls (NCBI Bookshelf)',
    title: 'Androgenetic Alopecia — Ho, Sood & Zito',
    url: 'https://www.ncbi.nlm.nih.gov/books/NBK430924/',
    year: 2024,
  },
  dermnetFPHL: {
    name: 'DermNet',
    title: 'Female pattern hair loss',
    url: 'https://dermnetnz.org/topics/female-pattern-hair-loss',
  },
  dermnetTrichoscopy: {
    name: 'DermNet',
    title: 'Trichoscopy — Sadek et al.',
    url: 'https://dermnetnz.org/topics/trichoscopy',
    year: 2022,
  },
  dermnetTrichoscopyNonScarring: {
    name: 'DermNet',
    title: 'Trichoscopy of generalised non-cicatricial hair loss — Sadek',
    url: 'https://dermnetnz.org/topics/trichoscopy-of-generalised-noncicatricial-hair-loss',
    year: 2022,
  },
  aadFFA: {
    name: 'American Academy of Dermatology',
    title: 'Frontal fibrosing alopecia: overview',
    url: 'https://www.aad.org/public/diseases/hair-loss/types/frontal-fibrosing-alopecia',
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
  guoKatta: {
    name: 'Dermatology Practical & Conceptual',
    title: 'Diet and hair loss: effects of nutrient deficiency and supplement use — Guo & Katta',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC5315033/',
    year: 2017,
  },
  nhsHairLoss: {
    name: 'NHS',
    title: 'Hair loss',
    url: 'https://www.nhs.uk/conditions/hair-loss/',
  },
} satisfies Record<string, EvidenceSource>;

/** Ordered for reading: biology → how common → shedding → evaluation → treatment expectations. */
export const EVIDENCE: EvidenceFact[] = [
  {
    id: 'daily-shedding',
    stat: '50–100',
    label: 'hairs shed a day is considered normal',
    detail:
      'Dermatologists describe losing between 50 and 100 hairs a day as normal. Old hairs fall out so new ones can grow in their place, which is why some hair on the brush or pillow is not, by itself, a sign of hair loss.',
    source: SRC.aadShedding,
  },
  {
    id: 'scalp-hairs',
    stat: '80,000–120,000',
    label: 'terminal hairs on a typical healthy scalp',
    detail:
      'Most healthy adults have roughly 80,000 to 120,000 terminal (full-thickness) hairs on the scalp.',
    source: SRC.statpearlsHair,
  },
  {
    id: 'growth-phase',
    stat: '85–90%',
    label: 'of scalp follicles are in the growth phase at any time',
    detail:
      'The growth (anagen) phase lasts about 2 to 6 years, and at any moment roughly 85–90% of follicles are in it. A short transition phase follows, then a resting (telogen) phase of about three months before the hair sheds.',
    source: SRC.statpearlsHair,
  },
  {
    id: 'growth-rate',
    stat: '~1 cm',
    label: 'of growth a month for a scalp hair',
    detail:
      'Each scalp hair grows at about one centimetre a month. Even when a follicle starts producing a stronger hair, it takes months for that hair to grow long enough to be seen — one reason hair changes are slow to judge.',
    source: SRC.ccTerminalHair,
  },
  {
    id: 'india-aga',
    stat: '58%',
    label: 'of men aged 30–50 had pattern hair loss in an Indian population study',
    detail:
      'In a population-based study of 1,005 men aged 30 to 50 in India, 58% had some degree of androgenetic (pattern) hair loss, and it was more common with age — from 47.5% in men aged 30–35 to 73.2% in those aged 41–45. Most of those affected had early grades (I–III).',
    source: SRC.krupaShankar,
  },
  {
    id: 'men-by-age',
    stat: '~50%',
    label: 'of men are affected by pattern hair loss by age 50',
    detail:
      'Reviews estimate that androgenetic alopecia affects about half of men by age 50 and around 80% by age 70. Figures vary between populations and studies.',
    source: SRC.statpearlsAGA,
  },
  {
    id: 'women-by-age',
    stat: '~40%',
    label: 'of women show signs of hair loss by age 50',
    detail:
      'Female pattern hair loss is common and often looks different from male pattern loss — typically diffuse thinning over the top of the scalp rather than a receding hairline. Around 40% of women show signs of hair loss by age 50.',
    source: SRC.dermnetFPHL,
  },
  {
    id: 'shedding-trigger',
    stat: '~3 months',
    label: 'is the usual gap between a trigger and heavier shedding',
    detail:
      'In telogen effluvium, a trigger such as illness, high fever, childbirth, surgery or a crash diet is usually found about three months before the shedding starts, although the gap can range from one to six months. That is why a doctor asks what happened in the months before — not just now.',
    source: SRC.statpearlsTE,
  },
  {
    id: 'shedding-recovery',
    label: 'Stress-related shedding often settles on its own',
    detail:
      'When shedding follows a stressful event and the stress passes, hair tends to regain its normal fullness within about six to nine months. Shedding that continues, or hair that stops growing back, deserves a proper evaluation.',
    source: SRC.aadShedding,
  },
  {
    id: 'miniaturisation',
    label: 'Pattern hair loss shrinks follicles gradually',
    detail:
      'In androgenetic alopecia, the growth phase becomes progressively shorter and follicles miniaturise, producing shorter, finer hairs over time. Because the change is gradual, it is often noticed late.',
    source: SRC.statpearlsAGA,
  },
  {
    id: 'trichoscopy',
    stat: '20–160×',
    label: 'magnification used in trichoscopy to examine hair and scalp',
    detail:
      'Trichoscopy is a non-invasive, low-cost examination of the hair and scalp at roughly 20 to 160 times magnification. It looks at follicular openings, the skin around follicles, hair shafts and blood vessels, and can help tell scarring from non-scarring hair loss and early pattern loss from shedding.',
    source: SRC.dermnetTrichoscopy,
  },
  {
    id: 'shaft-variability',
    stat: '≥20%',
    label: 'variation in hair-shaft thickness is a recognised sign of pattern hair loss',
    detail:
      'On trichoscopy, hair-shaft thickness varying by 20% or more is described as a diagnostic sign of androgenetic alopecia, together with more single-hair follicular units at the front of the scalp than at the back.',
    source: SRC.dermnetTrichoscopyNonScarring,
  },
  {
    id: 'scarred-follicles',
    label: 'A scarred follicle can no longer grow hair',
    detail:
      'In scarring forms of hair loss, follicles are replaced by scar tissue, and once a follicle scars it can no longer grow hair. Caught and treated early, some people with scarring hair loss may regrow some hair — so changes along the hairline deserve a prompt look.',
    source: SRC.aadFFA,
  },
  {
    id: 'early-evaluation',
    label: 'Earlier treatment tends to work better',
    detail:
      'Dermatologists note that people with pattern hair loss who start treatment soon after noticing it tend to see the best results, and that treatment works best when started at the first signs.',
    source: SRC.aadMale,
  },
  {
    id: 'treatment-timeline',
    stat: '4–6+ months',
    label: 'of consistent use before improvement is usually visible',
    detail:
      'Medical treatments for pattern hair loss generally need at least four to six months of consistent use before any improvement is noticeable, and ongoing use to keep it. Responses vary, and some people do not respond.',
    source: SRC.statpearlsAGA,
  },
  {
    id: 'ongoing-use',
    label: 'Benefits usually last only while treatment continues',
    detail:
      'For female pattern hair loss, dermatologists advise using minoxidil continuously for about six to 12 months before judging how well it works — and stopping means losing its benefits and gradually shedding more hair. A routine you can keep up matters more than an intense one.',
    source: SRC.aadFemale,
  },
  {
    id: 'test-before-supplementing',
    label: 'Test first; supplements help when something is actually low',
    detail:
      'Deficiencies that are found should be corrected, but there is little evidence that supplements help hair in people who are not deficient, and some can worsen hair loss or cause toxicity. Iron and thyroid checks are guided by your history and symptoms; a normal ferritin result does not always rule out iron deficiency.',
    source: SRC.guoKatta,
  },
  {
    id: 'medical-causes',
    label: 'Hair loss from a medical cause often improves once it is treated',
    detail:
      'Temporary hair loss can follow illness, stress, weight loss or iron deficiency, and hair loss caused by a medical condition usually stops or grows back once you have recovered. Finding the cause is the first step.',
    source: SRC.nhsHairLoss,
  },
];

/** Every distinct source, numbered in order of first use. */
export const REFERENCES: Reference[] = EVIDENCE.reduce<Reference[]>((acc, fact) => {
  if (!acc.some((r) => r.url === fact.source.url)) acc.push({ ...fact.source, n: acc.length + 1 });
  return acc;
}, []);

/** Citation number for a source URL (0 if unknown). */
export function referenceNumber(url: string): number {
  return REFERENCES.find((r) => r.url === url)?.n ?? 0;
}

/** The short set shown by the compact section (homepage). */
export const KEY_EVIDENCE_IDS = ['daily-shedding', 'growth-phase', 'india-aga', 'shedding-trigger'] as const;

export function keyEvidence(): EvidenceFact[] {
  return KEY_EVIDENCE_IDS.flatMap((id) => EVIDENCE.filter((f) => f.id === id));
}
