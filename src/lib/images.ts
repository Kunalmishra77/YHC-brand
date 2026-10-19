import { PRODUCT_MEDIA } from '@/lib/brand-media';

/** A site image with its intrinsic size (for next/image) and alt text. */
export interface SiteImage {
  src: string;
  width: number;
  height: number;
  alt: string;
}

const real = (src: string, width: number, height: number, alt: string): SiteImage => ({ src, width, height, alt });

/**
 * Page-level imagery. Since the client's asset drop (2026-10-18) these are the real YHC packs and the
 * ingredient flat-lays (src/lib/brand-media.ts); the earlier concept still-lifes (ADR-25) are retired.
 */
export const IMAGES = {
  heroPortrait: real(
    '/media/products/solution-women-0.webp',
    1000,
    1250,
    'YHC Hair Regrowth Solution for women, black bottle with a blush label, with flowers on stone',
  ),
  heroStage: real(
    '/media/products/solution-men-0.webp',
    1000,
    1250,
    'YHC Hair Regrowth Solution for men, black bottle with a mint label, on dark stone with botanicals',
  ),
  topical: real(
    '/media/products/solution-men-1.webp',
    1000,
    1500,
    'YHC Hair Regrowth Solution for men with its dropper cap, on dark stone',
  ),
  tablets: real(
    '/media/products/tablets-men-0.webp',
    1000,
    1250,
    'YHC Hair Nourishing Tablets for men, black jar with a mint label, with seeds and leaves on stone',
  ),
  serum: real(
    '/media/ingredients/board-bowls.webp',
    1200,
    1200,
    'Bowls of amla, arjun bark, bhringraj, shatavari, ashwagandha and lac resin',
  ),
  textureDrop: real(
    '/media/ingredients/board-solution.webp',
    1200,
    1200,
    'Flat-lay of pea sprouts, turmeric, amber drops, glass vials and a molecule model',
  ),
  textureTablets: real(
    '/media/ingredients/board-tablet.webp',
    1200,
    1200,
    'Flat-lay of green tea, bhringraj, pumpkin seeds, minerals and vitamin-rich foods',
  ),
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
  /** H.264 MP4 (universal fallback). */
  src: string;
  /** Optional VP9 WebM, offered first when present (smaller). */
  webm?: string;
  poster: string;
  /** Short description for screen readers (b-roll has no audio). */
  label: string;
}

export const VIDEOS = {
  hero: {
    src: '/media/video/hero-microscope.mp4',
    webm: '/media/video/hero-microscope.webm',
    poster: '/media/img/poster-hero-microscope.jpg',
    label: 'Slow close-up of a laboratory microscope (illustrative footage)',
  },
  science: {
    src: '/media/video/science-cellular.mp4',
    webm: '/media/video/science-cellular.webm',
    poster: '/media/img/poster-science-cellular.jpg',
    label: 'Abstract microscopic texture in blue light (illustrative footage)',
  },
  journey: {
    src: '/media/video/journey-formulation.mp4',
    webm: '/media/video/journey-formulation.webm',
    poster: '/media/img/poster-journey-formulation.jpg',
    label: 'Glass laboratory tubes in soft blue light (illustrative footage)',
  },
  guarantee: {
    src: '/media/video/guarantee-bubbles.mp4',
    webm: '/media/video/guarantee-bubbles.webm',
    poster: '/media/img/poster-guarantee-bubbles.jpg',
    label: 'Slow bubbles rising through clear liquid (illustrative footage)',
  },
} as const satisfies Record<string, SiteVideo>;

/** Product slug → hero photograph of the real pack (men's line; the product page offers both lines). */
export const PRODUCT_IMAGES: Record<string, SiteImage> = Object.fromEntries(
  Object.entries(PRODUCT_MEDIA).map(([slug, media]) => [slug, media.lines.men[0]]),
) as Record<string, SiteImage>;

/** Pack photography is low-key (black bottles) — cards use an obsidian frame for every product. */
export const DARK_PRODUCT_IMAGES = new Set(Object.keys(PRODUCT_MEDIA));

/** Gallery shots per product (men's line; see PRODUCT_MEDIA for both lines). */
export const PRODUCT_GALLERY: Record<string, SiteImage[]> = Object.fromEntries(
  Object.entries(PRODUCT_MEDIA).map(([slug, media]) => [slug, media.lines.men]),
);
/** Dr. Anil Tyagi's portrait (supplied by the clinic, 2026-10-10). */
export const DOCTOR_PORTRAIT: SiteImage = {
  src: '/media/img/dr-anil-tyagi.webp',
  width: 1000,
  height: 1211,
  alt: 'Dr. Anil Tyagi, dermatologist, in a white coat with a stethoscope',
};
