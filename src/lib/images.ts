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

/**
 * Licensed editorial media (Unsplash / Mixkit free licences — sources in public/media/CREDITS.md).
 * Laboratory and macro b-roll only: no faces, never presented as patients, results, our clinic or
 * Dr. Tyagi.
 */
const media = (name: string, width: number, height: number, alt: string): SiteImage => ({
  src: `/media/img/${name}.jpg`,
  width,
  height,
  alt,
});

export const MEDIA = {
  labMicroscope: media('lab-microscope', 1600, 1067, 'Microscope objective lenses above a slide'),
  labMicroscopeHand: media(
    'lab-microscope-hand',
    1600,
    2400,
    'A gloved hand adjusting a laboratory microscope',
  ),
  labPetri: media('lab-petri', 1600, 2399, 'A gloved hand placing a petri dish under a microscope'),
  dnaHelix: media('dna-helix', 1600, 900, 'Illustration of DNA double helices on a dark background'),
  dnaParticles: media('dna-particles', 1600, 2053, 'Illustration of a glowing DNA helix made of particles'),
  hairMacro: media('hair-macro', 1600, 2400, 'Macro photograph of hair strands catching warm light'),
  hairMacroWide: media('hair-macro-2', 1600, 900, 'Macro photograph of fine hair strands'),
} as const;

/**
 * Clinical editorial stills (Unsplash licence, optimised WebP — sources in public/media/CREDITS.md).
 * Faces are never shown. The white-coat images are illustrative only: they must always carry a visible
 * "Illustrative image" note and must never be presented as Dr. Tyagi, our clinic or a patient.
 */
const still = (name: string, width: number, height: number, alt: string): SiteImage => ({
  src: `/media/img/${name}.webp`,
  width,
  height,
  alt,
});

export const CLINICAL = {
  /** Doctor section — illustrative, never labelled as Dr. Tyagi. */
  consultCoat: still(
    'consult-coat',
    1600,
    1067,
    'Illustrative image: a doctor in a white coat holding a stethoscope, face not shown',
  ),
  consultNotes: still(
    'consult-notes',
    1600,
    900,
    'Illustrative image: a doctor taking notes on a history form across a desk from a patient',
  ),
  consultRoom: still(
    'clinic-desk',
    1600,
    900,
    'Illustrative image: a doctor in a white coat writing on a clipboard in a consultation room',
  ),
  /** Trichoscopy-style macro of a scalp parting — where follicles are assessed. */
  scalpParting: still(
    'scalp-parting',
    1600,
    1067,
    'Black-and-white macro photograph of a scalp parting showing individual hair roots',
  ),
  scalpPartingPortrait: still(
    'scalp-parting-portrait',
    1000,
    1250,
    'Black-and-white macro photograph of a scalp parting showing individual hair roots',
  ),
  scalpExam: still(
    'scalp-exam',
    1600,
    1067,
    'Hands parting hair to look closely at the scalp and hair density at the crown',
  ),
} as const;

export interface SiteVideo {
  src: string;
  poster: string;
  /** Short description for screen readers (b-roll has no audio). */
  label: string;
}

export const VIDEOS = {
  hero: {
    src: '/media/video/hero-microscope.mp4',
    poster: '/media/img/poster-hero-microscope.jpg',
    label: 'Slow close-up of a laboratory microscope (illustrative footage)',
  },
  science: {
    src: '/media/video/science-cellular.mp4',
    poster: '/media/img/poster-science-cellular.jpg',
    label: 'Abstract microscopic texture in blue light (illustrative footage)',
  },
  journey: {
    src: '/media/video/journey-formulation.mp4',
    poster: '/media/img/poster-journey-formulation.jpg',
    label: 'Glass laboratory tubes in soft blue light (illustrative footage)',
  },
  guarantee: {
    src: '/media/video/guarantee-bubbles.mp4',
    poster: '/media/img/poster-guarantee-bubbles.jpg',
    label: 'Slow bubbles rising through clear liquid (illustrative footage)',
  },
} as const satisfies Record<string, SiteVideo>;

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

/** Dr. Anil Tyagi's portrait (supplied by the clinic, 2026-10-10). */
export const DOCTOR_PORTRAIT: SiteImage = {
  src: '/media/img/dr-anil-tyagi.webp',
  width: 1000,
  height: 1211,
  alt: 'Dr. Anil Tyagi, dermatologist, in a white coat with a stethoscope',
};
