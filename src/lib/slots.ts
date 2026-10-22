import { INGREDIENT_BOARDS, PRODUCT_MEDIA } from '@/lib/brand-media';
import type { SiteImage } from '@/lib/images';
import { slot } from '@/lib/visual-slots';

/*
 * Every image slot on the site, by ID from YHC_IMAGE_PROMPTS.md, each with a temporary fallback from
 * the current media. Components import SLOTS.H06 etc. — never a raw path — so the client's generated
 * images switch on without code changes (scripts/add-generated-images.mjs).
 */

const m = (file: string, width: number, height: number, alt: string): SiteImage => ({
  src: `/media/img/${file}`,
  width,
  height,
  alt,
});
const pack = (slug: string, line: 'men' | 'women' = 'men', i = 0): SiteImage => {
  const img = PRODUCT_MEDIA[slug]?.lines[line][i] ?? PRODUCT_MEDIA['hair-regrowth-solution']?.lines.men[0];
  if (!img) throw new Error(`missing pack image for ${slug}`);
  return img;
};
const board = (slug: string): SiteImage => {
  const img = INGREDIENT_BOARDS[slug];
  if (!img) throw new Error(`missing board for ${slug}`);
  return img;
};

const F = {
  heroPoster: m('poster-hero-microscope.jpg', 1280, 720, 'Close-up of a laboratory microscope'),
  scalpParting: m('scalp-parting.webp', 1600, 1067, 'Black-and-white close-up of a scalp parting showing hair roots'),
  scalpPartingTall: m('scalp-parting-portrait.webp', 1000, 1250, 'Black-and-white close-up of a scalp parting showing hair roots'),
  scalpExam: m('scalp-exam.webp', 1600, 1067, 'Hands parting hair to look closely at the scalp'),
  consultNotes: m('consult-notes.webp', 1600, 900, 'Illustrative image: a doctor taking notes across a desk from a patient'),
  consultRoom: m('clinic-desk.webp', 1600, 900, 'Illustrative image: a doctor writing on a clipboard'),
  labHand: m('lab-microscope-hand.jpg', 1600, 2400, 'A gloved hand adjusting a microscope'),
  lab: m('lab-microscope.jpg', 1600, 1067, 'Microscope lenses above a slide'),
  hairMacro: m('hair-macro-2.jpg', 1600, 900, 'Macro photograph of fine hair strands'),
  dna: m('dna-helix.jpg', 1600, 900, 'Illustration of DNA strands on a dark background'),
  cellular: m('poster-science-cellular.jpg', 1280, 720, 'Abstract microscopic texture in blue light'),
  formulation: m('poster-journey-formulation.jpg', 1280, 720, 'Glass laboratory tubes in soft light'),
  guarantee: m('poster-guarantee-bubbles.jpg', 1280, 720, 'Bubbles rising through clear liquid'),
  partingThinning: { src: '/media/hair/parting-thinning.webp', width: 1000, height: 1500, alt: 'Looking down on a widened centre parting' },
} satisfies Record<string, SiteImage>;

const SOL = 'hair-regrowth-solution';
const TAB = 'hair-nourishing-tablets';
const CAP = 'hair-regrowth-capsules';

export const SLOTS = {
  // Home. How-it-works steps (H06–H12) fall back to neutral textures: a UI mock sits in front of them
  // until the photo arrives, and a labelled pack behind a mock looks broken.
  H01: slot('H01', 'A man holds his phone above his hairline in a dark bathroom, the screen lighting his scalp', F.heroPoster, { illustrative: true }),
  H02: slot('H02', 'A woman holds her phone above her hair parting, the screen lighting her scalp', F.heroPoster, { illustrative: true }),
  H03: slot('H03', 'Someone at a bathroom mirror holds a phone above the crown of their head to scan it', F.scalpExam, { illustrative: true }),
  H04: slot('H04', 'A person on a video call with a doctor from home', F.consultNotes, { illustrative: true }),
  H05: slot('H05', 'Black-and-white close-up of a scalp parting showing hair roots', F.scalpParting),
  H06: slot('H06', 'Hands typing name and mobile number into a phone', F.formulation),
  H07: slot('H07', 'A phone held above parted hair to scan the scalp', F.scalpExam, { illustrative: true }),
  H08: slot('H08', 'A phone showing a simple scan report', F.scalpParting),
  H09: slot('H09', 'Someone filling a short health form on their phone', F.consultNotes, { illustrative: true }),
  H10: slot('H10', 'A phone showing a booked time and a payment tick', F.lab),
  H11: slot('H11', 'A laptop video call with a doctor, seen over the patient’s shoulder', F.consultRoom, { illustrative: true }),
  H12: slot('H12', 'The YHC solution on a bathroom shelf next to a phone with a check-in chat', F.hairMacro),
  H13: slot('H13', 'Illustration of a living hair root under the skin', F.cellular),
  H14: slot('H14', 'Illustration of three hair roots getting smaller, left to right', F.hairMacro),
  H15: slot('H15', 'Illustration of living hair roots next to scarred skin with no roots', F.dna),
  H16: slot('H16', 'YHC tablets on a kitchen counter with a glass of water', pack(TAB, 'men', 2)),
  H17: slot('H17', 'A few drops of solution being applied to a parting', pack(SOL, 'women', 1), { illustrative: true }),
  H18: slot('H18', 'Someone photographing the top of their head in a mirror', F.scalpPartingTall, { illustrative: true }),
  H19: slot('H19', 'A follow-up video call with the doctor', F.consultRoom, { illustrative: true }),
  H20: slot('H20', 'Illustration: male pattern hair loss at the temples and crown', F.scalpExam),
  H21: slot('H21', 'Illustration: female pattern hair loss with a wider parting', F.partingThinning),
  H22: slot('H22', 'Illustration: even thinning all over the head', F.scalpParting),
  H23: slot('H23', 'Illustration: round bare patches', F.scalpParting),
  H24: slot('H24', 'Illustration: thinning at the hairline from tight hairstyles', F.scalpExam),
  H25: slot('H25', 'Illustration: a smooth scarred patch with no hair openings', F.scalpParting),
  H26: slot('H26', 'YHC capsules beside a three-month calendar', pack(CAP, 'men', 1)),
  H27: slot('H27', 'Hands holding a phone with a chat open', F.consultNotes),
  // Products
  P01: slot('P01', 'YHC Hair Regrowth Solution on a bathroom shelf', pack(SOL, 'men', 1)),
  P02: slot('P02', 'YHC Hair Nourishing Tablets on a breakfast table', pack(TAB, 'men', 2)),
  P03: slot('P03', 'YHC Hair Regrowth Capsules with amla and herbs', pack(CAP, 'men', 0)),
  // Page tops
  S01: slot('S01', 'Hair strands in soft blue light', F.hairMacro),
  S02: slot('S02', 'A phone, laptop and notebook on a stone desk', F.formulation),
  S03: slot('S03', 'A phone on a tripod facing a plain wall in even light', F.scalpParting),
  S04: slot('S04', 'YHC solution and tablets on a dark stone plinth', pack(SOL, 'men', 0)),
  S05: slot('S05', 'A small formulation lab with herbs and glassware', F.lab, { illustrative: true }),
  S06: slot('S06', 'Two people at a table, one writing notes, one on a laptop', F.consultNotes, { illustrative: true }),
  // Hair concerns
  C01: slot('C01', 'A hairbrush with a few loose hairs on a bathroom counter', board(CAP)),
  C02: slot('C02', 'Looking down on a centre parting that looks slightly wide', F.partingThinning, { illustrative: true }),
  C03: slot('C03', 'Side view of a hairline slightly receding at the temple', F.scalpExam, { illustrative: true }),
  C04: slot('C04', 'Looking down on slightly thinner hair at the crown', F.scalpParting, { illustrative: true }),
  C05: slot('C05', 'A wooden comb and a dropper bottle on stone', board(SOL)),
  // Journal
  B01: slot('B01', 'A few loose hairs on a white pillowcase', F.hairMacro),
  B02: slot('B02', 'Illustration of hair roots at different stages of growth', F.cellular),
  B03: slot('B03', 'A phone, laptop and notebook laid out like a journey', F.formulation),
  B04: slot('B04', 'A phone held above parted hair in daylight', F.scalpExam, { illustrative: true }),
  B05: slot('B05', 'Eggs, almonds, spinach, seeds and vegetables on stone', board(TAB)),
  // 3D scan guide
  J01: slot('J01', 'Close-up example: left side of the front hairline', F.scalpParting),
  J02: slot('J02', 'Close-up example: centre of the front hairline', F.scalpParting),
  J03: slot('J03', 'Close-up example: right side of the front hairline', F.scalpParting),
  J04: slot('J04', 'Close-up example: top of the head', F.scalpParting),
  J05: slot('J05', 'Close-up example: the crown', F.scalpParting),
  J06: slot('J06', 'Close-up example: a hair parting', F.scalpParting),
  J07: slot('J07', 'Close-up example: back of the head', F.scalpParting),
  // Empty states
  E01: slot('E01', 'Line drawing of an empty shopping bag', F.scalpParting),
  E02: slot('E02', 'Line drawing of a phone with a tick and a calendar', F.scalpParting),
  E03: slot('E03', 'Line drawing of a magnifying glass looking at a hair', F.scalpParting),
  J08: slot('J08', 'Someone relaxing on a sofa with their phone', F.scalpPartingTall, { illustrative: true }),
};

export type SlotId = keyof typeof SLOTS;
