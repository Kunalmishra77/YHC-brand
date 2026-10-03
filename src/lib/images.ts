/**
 * Concept imagery (AI-generated product still-lifes, ADR-25) used until the client's real photography
 * arrives. No people, no doctor likeness, no before/after — packaging is unlabelled.
 * TODO(client): replace with real product and doctor photography — see docs/12 C.
 */
export interface SiteImage {
  src: string;
  width: number;
  height: number;
  alt: string;
}

const img = (name: string, width: number, height: number, alt: string): SiteImage => ({
  src: `/images/concept/${name}.webp`,
  width,
  height,
  alt,
});

export const IMAGES = {
  hero: img(
    'hero',
    2000,
    1116,
    'YHC serum, cleanser and supplement jar on a dark stone plinth under soft studio light',
  ),
  heroPortrait: img(
    'hero-portrait',
    1200,
    1490,
    'YHC serum, cleanser and supplement jar on a dark stone plinth',
  ),
  heroStage: img('hero-stage', 1400, 1302, 'YHC products on a dark stone plinth'),
  serum: img('serum', 1200, 1200, 'Frosted glass serum bottle with a silver dropper on pale stone'),
  topical: img('topical', 1200, 1200, 'Amber glass topical solution bottle with a dropper on pale stone'),
  tablets: img('tablets', 1200, 1200, 'White supplement jar with a brushed silver lid and tablets on stone'),
  shampoo: img('shampoo', 900, 1125, 'Matte black pump bottle of shampoo beside a white jar'),
  conditioner: img('conditioner', 900, 1126, 'White conditioner jar with a polished silver lid'),
  textureDrop: img('texture-drop', 1400, 789, 'A drop of clear serum on pale stone'),
  textureTablets: img('texture-tablets', 1400, 1011, 'Small white tablets on a stone surface'),
} as const;

/** Product slug → concept image. */
export const PRODUCT_IMAGES: Record<string, SiteImage> = {
  'topical-hair-solution': IMAGES.topical,
  'hair-nutrition-tablets': IMAGES.tablets,
  'scalp-serum': IMAGES.serum,
  'gentle-strengthening-shampoo': IMAGES.shampoo,
  'lightweight-conditioner': IMAGES.conditioner,
};

/** Products photographed on dark backgrounds — cards use an obsidian frame for these. */
export const DARK_PRODUCT_IMAGES = new Set(['gentle-strengthening-shampoo', 'lightweight-conditioner']);

/** Secondary gallery shots per product (detail, then the range). */
export const PRODUCT_GALLERY: Record<string, SiteImage[]> = {
  'topical-hair-solution': [IMAGES.topical, IMAGES.textureDrop, IMAGES.heroStage],
  'hair-nutrition-tablets': [IMAGES.tablets, IMAGES.textureTablets, IMAGES.heroStage],
  'scalp-serum': [IMAGES.serum, IMAGES.textureDrop, IMAGES.heroStage],
  'gentle-strengthening-shampoo': [IMAGES.shampoo, IMAGES.heroStage, IMAGES.heroPortrait],
  'lightweight-conditioner': [IMAGES.conditioner, IMAGES.heroStage, IMAGES.heroPortrait],
};
