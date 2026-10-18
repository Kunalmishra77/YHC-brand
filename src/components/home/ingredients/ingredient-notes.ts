/**
 * Plain-language notes for catalog ingredients (homepage section 10 and product pages). They explain
 * what an ingredient is and why a doctor cares — never an efficacy claim about a YHC product (ADR-32).
 * Wording follows AAD, NIH ODS and FDA label guidance. Ingredients without a note fall back to their
 * catalog role. Keys are the ingredient name without the botanical name in brackets, lower-cased.
 * TODO(client): Dr. Tyagi to review this wording before launch — see docs/16 D.
 */
const NOTES: Record<string, string> = {
  amla: 'Indian gooseberry — a sour fruit that is a staple of Ayurvedic formulas and naturally rich in vitamin C.',
  arjun: 'Bark of the arjuna tree (Terminalia arjuna), long used in Ayurvedic preparations.',
  bhringraj:
    'Eclipta prostrata, a small flowering herb whose name is often translated as “king of hair” in Ayurvedic tradition. That is a traditional use, not a clinical finding.',
  shatavari: 'Root of Asparagus racemosus, a classic Ayurvedic tonic herb.',
  'shuddh lakh':
    'Lac, a natural resin, purified (“shuddh”) by traditional Ayurvedic processing before it goes into the blend.',
  ashwagandha:
    'Withania somnifera root, one of the best-known Ayurvedic herbs, traditionally used as a general tonic. Tell the doctor about thyroid conditions or pregnancy.',
  'green tea': 'Leaves of Camellia sinensis, included as a plant extract.',
  'pumpkin seed': 'Extract of Cucurbita pepo seeds, a common ingredient in hair-care supplements.',
  iron: 'Low iron stores are one of the things a doctor looks at when hair sheds more than usual. Extra iron only helps if you are actually low — too much can be harmful — so your history guides it.',
  zinc: 'A trace mineral used by many enzymes in the body. A deficiency can go with hair shedding; more than you need does not help.',
  'vitamin a':
    'Needed in small amounts. Too much vitamin A is itself linked with hair loss, so the doctor checks what other supplements you take.',
  copper: 'A trace mineral the body needs in very small amounts.',
  'folic acid': 'A B-vitamin (folate) the body uses to make new cells.',
  'vitamin b5': 'Pantothenic acid, a B-vitamin found in many everyday foods.',
  biotin:
    'A B-vitamin used in making keratin. A deficiency can cause hair loss, but evidence for extra biotin in people who are not deficient is limited. Biotin can distort some blood tests (such as thyroid tests) — tell the lab if you take it.',
  redensyl:
    'A branded cosmetic active from a specialist supplier. We describe it by what it is, not by the supplier’s marketing.',
  anagain: 'A branded extract of organic pea sprouts, used in cosmetic scalp formulas.',
  procapil: 'A branded cosmetic complex that pairs a peptide with plant-derived compounds, used in scalp care.',
  'capilia longa': 'A branded active derived from turmeric (Curcuma longa), used in cosmetic scalp formulas.',
  finasteride:
    'A prescription medicine that lowers DHT, the hormone involved in pattern hair loss. It is used on the scalp only when the doctor prescribes it after checking it suits you, and it is not suitable during pregnancy or breastfeeding.',
};

export function ingredientNote(name: string, role: string): string {
  const key = name.replace(/\(.*\)/, '').trim().toLowerCase();
  return NOTES[key] ?? `${role}.`;
}
