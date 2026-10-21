/**
 * Plain-English notes for catalog ingredients (homepage section 10). They say what an ingredient is and
 * why a doctor cares — never an efficacy claim about a YHC product (ADR-32). Wording follows AAD, NIH ODS
 * and FDA label guidance; safety lines (vitamin A excess, biotin and lab tests, finasteride in pregnancy)
 * must stay. Ingredients without a note fall back to their catalog role. Keys are the ingredient name
 * without the botanical name in brackets, lower-cased.
 * TODO(client): Dr. Tyagi to review this wording before launch — see docs/16 D.
 */
const NOTES: Record<string, string> = {
  amla: 'Indian gooseberry. A sour fruit used in many Ayurvedic recipes, rich in vitamin C.',
  arjun: 'Bark of the arjun tree, used in Ayurveda for a very long time.',
  bhringraj:
    'A small herb with white flowers. Ayurveda calls it the “king of hair”. That is a tradition, not a proven result.',
  shatavari: 'A root used as a tonic in Ayurveda.',
  'shuddh lakh': 'Lac, a natural resin. “Shuddh” means it is cleaned the traditional Ayurvedic way.',
  ashwagandha:
    'A well-known Ayurvedic root, used as a general tonic. Tell your doctor if you have a thyroid problem or are pregnant.',
  'green tea': 'An extract from green tea leaves.',
  'pumpkin seed': 'An extract from pumpkin seeds, common in hair supplements.',
  iron: 'Low iron can cause extra hair fall. Extra iron helps only if you are low, and too much can harm you. Your doctor checks first.',
  zinc: 'A mineral your body needs. Too little can go with hair fall. More than you need does not help.',
  'vitamin a':
    'Your body needs only a little. Too much vitamin A can itself cause hair loss, so your doctor checks your other supplements.',
  copper: 'A mineral your body needs in very small amounts.',
  'folic acid': 'A B-vitamin your body uses to make new cells.',
  'vitamin b5': 'A B-vitamin found in many everyday foods.',
  biotin:
    'A B-vitamin. Extra biotin helps mainly if you are low in it. It can upset some blood tests, like thyroid tests, so tell the lab you take it.',
  redensyl: 'A branded scalp-care ingredient made in a lab. We tell you what it is, not the maker’s claims.',
  anagain: 'A branded extract from pea sprouts, used in scalp care.',
  procapil: 'A branded mix of a small protein and plant compounds, used in scalp care.',
  'capilia longa': 'A branded extract from turmeric, used in scalp care.',
  finasteride:
    'A prescription medicine for pattern hair loss. Used only if your doctor prescribes it after checking it suits you. Not safe during pregnancy or breastfeeding.',
};

export function ingredientNote(name: string, role: string): string {
  const key = name
    .replace(/\(.*\)/, '')
    .trim()
    .toLowerCase();
  return NOTES[key] ?? `${role}.`;
}
