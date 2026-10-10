/**
 * Plain-language notes for catalog ingredients (homepage section 10). They explain what an ingredient
 * is and why it is in the formula — never an efficacy claim about a YHC product, never more than the
 * catalog's stated role. Ingredients without a note fall back to their catalog role.
 * TODO(client): Dr. Tyagi to review this wording before launch — see docs/12 (content).
 */
const NOTES: Record<string, string> = {
  'active ingredient (as prescribed)':
    'The prescription active in this solution is chosen by the doctor at your consultation, together with its strength and how often to apply it. It is dispensed only with a prescription.',
  'propylene glycol-free base':
    'The liquid that carries the active onto the scalp. Propylene glycol is left out because some scalps react to it.',
  biotin:
    'A B-vitamin the body uses when making keratin, the protein hair is built from. Extra biotin mainly matters when intake is actually low — which is why your intake answers count.',
  'iron and zinc':
    'Two minerals linked with hair health. Low iron stores are one of the things a doctor looks for when hair sheds more than usual; your history guides whether levels are checked.',
  'vitamin d3':
    'Often low in people who spend little time in the sun. Your levels and history are discussed at the consultation.',
  'peptide complex':
    'Short chains of amino acids used in scalp-care formulas to condition the scalp and leave it feeling comfortable.',
  'rosemary leaf extract':
    'A plant extract with a long history in traditional scalp care, included here as part of a scalp-care routine.',
  niacinamide:
    'A form of vitamin B3 widely used in skin care to support the skin’s natural barrier — on the scalp, that is the skin your hair grows from.',
  'mild amino-acid surfactants':
    'Cleansing agents made from amino acids. They lift oil and residue while stripping the scalp less than harsher cleansers.',
  panthenol: 'Pro-vitamin B5. It coats and conditions the hair shaft so hair feels softer and smoother.',
  'hydrolysed proteins':
    'Proteins broken into small pieces that settle on the hair surface and smooth it, so combing is easier.',
  glycerin: 'A humectant: it draws in and holds water, helping lengths feel less dry.',
};

export function ingredientNote(name: string, role: string): string {
  return NOTES[name.trim().toLowerCase()] ?? `${role}.`;
}
