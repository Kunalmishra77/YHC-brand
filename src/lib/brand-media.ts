import type { SiteImage } from '@/lib/images';

/*
 * The client's own brand and packaging media (asset drop 2026-10-18, built by scripts/build-assets.mjs).
 * Product images are renders of the real YHC packs — front of pack only (back labels carry claims that
 * are under regulatory review, ADR-32). Ingredient photos are illustrative flat-lays of the listed
 * botanicals and nutrients, never a depiction of the exact formula or of results. No people.
 */

export type ProductLine = 'men' | 'women';

export const LINE_LABEL: Record<ProductLine, string> = { men: 'For men', women: 'For women' };

export const BRAND_LOGO = {
  dark: { src: '/media/brand/logo-dark.webp', width: 1200, height: 473 },
  light: { src: '/media/brand/logo-light.webp', width: 1200, height: 473 },
} as const;

const pack = (file: string, width: number, height: number, alt: string): SiteImage => ({
  src: `/media/products/${file}.webp`,
  width,
  height,
  alt,
});

export interface ProductMedia {
  /** Pack size as printed on the label. */
  pack: string;
  lines: Record<ProductLine, SiteImage[]>;
}

/** Product slug → photography per line; the first image of each line is the 4:5 hero. */
export const PRODUCT_MEDIA: Record<string, ProductMedia> = {
  'hair-regrowth-solution': {
    pack: '60 ml',
    lines: {
      men: [
        pack('solution-men-0', 1000, 1250, 'YHC Hair Regrowth Solution for men, black bottle with a mint label, on dark stone with botanicals'),
        pack('solution-men-1', 1000, 1500, 'YHC Hair Regrowth Solution for men with its dropper cap, on dark stone'),
        pack('solution-men-2', 1000, 1250, 'YHC Hair Regrowth Solution for men in soft studio haze'),
        pack('solution-men-3', 330, 492, 'YHC Hair Regrowth Solution for men on a pale stone plinth'),
        pack('solution-men-4', 332, 521, 'Close-up of the YHC Hair Regrowth Solution cap with water droplets'),
      ],
      women: [
        pack('solution-women-0', 1000, 1250, 'YHC Hair Regrowth Solution for women, black bottle with a blush label, with flowers on stone'),
        pack('solution-women-1', 1000, 1500, 'YHC Hair Regrowth Solution for women with its dropper cap, on dark stone'),
        pack('solution-women-2', 1000, 1250, 'YHC Hair Regrowth Solution for women on rose quartz in warm light'),
        pack('solution-women-3', 1000, 1250, 'YHC Hair Regrowth Solution for women on blush sandstone'),
        pack('solution-women-4', 333, 503, 'YHC Hair Regrowth Solution for women on a pale stone plinth'),
      ],
    },
  },
  'hair-nourishing-tablets': {
    pack: '30 tablets',
    lines: {
      men: [
        pack('tablets-men-0', 1000, 1250, 'YHC Hair Nourishing Tablets for men, black jar with a mint label, with seeds and leaves on stone'),
        pack('tablets-men-1', 1000, 1250, 'YHC Hair Nourishing Tablets for men on dark marble'),
        pack('tablets-men-2', 1000, 1250, 'YHC Hair Nourishing Tablets for men among green leaves'),
        pack('tablets-men-3', 1000, 1499, 'YHC Hair Nourishing Tablets for men on dark stone with red leaves'),
        pack('tablets-men-4', 505, 348, 'Close-up of the YHC Hair Nourishing Tablets label for men'),
      ],
      women: [
        pack('tablets-women-0', 1000, 1250, 'YHC Hair Nourishing Tablets for women, black jar with a blush label, with blossom on stone'),
        pack('tablets-women-1', 1000, 1250, 'YHC Hair Nourishing Tablets for women on pink marble with blossom'),
        pack('tablets-women-2', 1000, 1250, 'YHC Hair Nourishing Tablets for women with cherry blossom'),
        pack('tablets-women-3', 941, 1672, 'YHC Hair Nourishing Tablets for women in front of a sweep of brown hair'),
        pack('tablets-women-4', 499, 345, 'Close-up of the YHC Hair Nourishing Tablets label for women'),
      ],
    },
  },
  'hair-regrowth-capsules': {
    pack: '30 capsules',
    lines: {
      men: [
        pack('capsules-men-0', 1000, 1250, 'YHC Hair Regrowth Capsules for men, black jar with a mint label, with fresh amla on dark stone'),
        pack('capsules-men-1', 1000, 1250, 'YHC Hair Regrowth Capsules for men in green-lit haze'),
        pack('capsules-men-2', 1000, 1250, 'YHC Hair Regrowth Capsules for men on dark marble'),
        pack('capsules-men-3', 1000, 1248, 'YHC Hair Regrowth Capsules for men on driftwood with moss'),
        pack('capsules-men-4', 502, 343, 'YHC Hair Regrowth Capsules for men with amla in morning light'),
      ],
      women: [
        pack('capsules-women-0', 1000, 1250, 'YHC Hair Regrowth Capsules for women, black jar with a blush label, on a dark podium in pink light'),
        pack('capsules-women-1', 1000, 1250, 'YHC Hair Regrowth Capsules for women with amla on plum-toned stone'),
        pack('capsules-women-2', 1000, 1250, 'YHC Hair Regrowth Capsules for women in a pink neon glow'),
        pack('capsules-women-3', 941, 1672, 'YHC Hair Regrowth Capsules for women with dried flowers on sandstone'),
        pack('capsules-women-4', 499, 304, 'YHC Hair Regrowth Capsules for women in a mist of droplets'),
      ],
    },
  },
};

/** Hero image of a product for one line (men by default). */
export function productHero(slug: string, line: ProductLine = 'men'): SiteImage | null {
  return PRODUCT_MEDIA[slug]?.lines[line][0] ?? null;
}

const ing = (file: string, width: number, height: number, alt: string): SiteImage => ({
  src: `/media/ingredients/${file}.webp`,
  width,
  height,
  alt,
});

/** Lower-cased ingredient name (as in the catalog) → illustrative photo. */
export const INGREDIENT_MEDIA: Record<string, SiteImage> = {
  amla: ing('amla', 440, 560, 'Fresh amla (Indian gooseberry) fruit with its leaves'),
  arjun: ing('arjun', 400, 540, 'Pieces of arjun tree bark'),
  bhringraj: ing('bhringraj', 444, 590, 'Bhringraj herb with small white flowers'),
  shatavari: ing('shatavari', 480, 620, 'Pale shatavari roots'),
  'shuddh lakh': ing('shuddh-lakh', 400, 500, 'Amber pieces of lac resin'),
  ashwagandha: ing('ashwagandha', 454, 620, 'Dried ashwagandha roots with leaves'),
  'green tea': ing('green-tea', 540, 260, 'Green tea leaves, fresh and dried'),
  'pumpkin seed': ing('pumpkin-seed', 540, 250, 'A pile of green pumpkin seeds'),
  iron: ing('iron', 520, 250, 'Dark mineral granules representing iron'),
  zinc: ing('zinc', 540, 230, 'Silver mineral granules representing zinc'),
  'vitamin a': ing('vitamin-a', 570, 230, 'Sliced carrots, a food source of vitamin A'),
  copper: ing('copper', 420, 230, 'A nugget of copper'),
  'folic acid': ing('folic-acid', 570, 270, 'Leafy greens, a food source of folate'),
  'vitamin b5': ing('vitamin-b5', 480, 270, 'Mushrooms, a food source of vitamin B5'),
  biotin: ing('biotin', 540, 270, 'An egg and almonds, food sources of biotin'),
  anagain: ing('anagain', 640, 553, 'Pea sprouts, the plant source of Anagain'),
  'capilia longa': ing('capilia-longa', 590, 560, 'Turmeric root and a drop of golden extract'),
  redensyl: ing('molecule', 330, 500, 'A glass molecule model representing a laboratory active'),
  procapil: ing('botanical-oil', 420, 470, 'Amber drops of a cosmetic active'),
};

/** Ingredient photo for a catalog ingredient name like "Amla (Phyllanthus emblica)". */
export function ingredientImage(name: string): SiteImage | null {
  const key = name.replace(/\(.*\)/, '').trim().toLowerCase();
  return INGREDIENT_MEDIA[key] ?? null;
}

/** Full flat-lay boards per product, for editorial spreads. */
export const INGREDIENT_BOARDS: Record<string, SiteImage> = {
  'hair-regrowth-capsules': ing('board-capsule', 1200, 1200, 'Flat-lay of amla, arjun bark, bhringraj, shatavari, lac resin and ashwagandha'),
  'hair-nourishing-tablets': ing('board-tablet', 1200, 1200, 'Flat-lay of green tea, bhringraj, pumpkin seeds, minerals and vitamin-rich foods'),
  'hair-regrowth-solution': ing('board-solution', 1200, 1200, 'Flat-lay of pea sprouts, turmeric, amber drops, glass vials and a molecule model'),
};

/** Female-pattern thinning at the parting (illustrative, not a patient). */
export const HAIR_PARTING_THINNING: SiteImage = {
  src: '/media/hair/parting-thinning.webp',
  width: 1000,
  height: 1500,
  alt: 'Illustrative photo: looking down on a centre parting that has widened, with the scalp more visible',
};

/** Marketer and manufacturer as printed on the YHC labels (Legal Metrology / e-commerce disclosure). */
export const LABEL_PARTIES = {
  marketedBy: 'Santure Health Care Pvt. Ltd., D-472, 2nd Floor, Ramphal Chowk, Dwarka Sector 7, New Delhi 110075',
  manufacturedBy: 'Meenakshi Ayurvedic, Kheri Road, Kheri Kalan, near Kheri Hospital, Faridabad 121002',
} as const;
