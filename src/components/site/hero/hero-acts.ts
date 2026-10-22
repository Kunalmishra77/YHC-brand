import type { VisualSlot } from '@/lib/visual-slots';
import { SLOTS } from '@/lib/slots';

/**
 * The three short "acts" of the homepage hero story (docs/21): the giant word, one plain line, and the
 * picture that goes with it. Shared by the pinned desktop film and the phone swipe cards.
 */
export interface HeroAct {
  word: string;
  line: string;
  image: VisualSlot;
}

export const HERO_ACTS: readonly HeroAct[] = [
  {
    word: 'Look closer.',
    line: 'A free 3D scan of your scalp, taken with your own phone at home.',
    image: SLOTS.H01,
  },
  {
    word: 'Roots first.',
    line: 'A doctor checks your hair roots before anything else is suggested.',
    image: SLOTS.H13,
  },
  {
    word: 'A plan only if it helps.',
    line: 'If treatment can help, your doctor makes a plan. If not, we tell you.',
    image: SLOTS.P01,
  },
];

export const HERO_HEADLINE = 'Hair care begins with science, not with products.';
export const HERO_LINE = 'First we scan your scalp. Then a doctor tells you if treatment will help.';

/** Static film grain (SVG noise), laid over the stage at low opacity. */
export const GRAIN_URL =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.55 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";
