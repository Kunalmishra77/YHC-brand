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
    line: 'A free scalp scan, taken with your own phone at home.',
    image: SLOTS.H01,
  },
  {
    word: 'Roots first.',
    line: 'You see your result straight away, before anything else is suggested.',
    image: SLOTS.H13,
  },
  {
    word: 'A plan only if it helps.',
    line: 'Our hair-care team calls you to talk through your options. If we cannot help, we tell you.',
    image: SLOTS.P01,
  },
];

/** The client's bottle film (V01), watermark cropped, encoded as a seamless forward/back loop. */
export const HERO_FILM = {
  src: '/media/video/hero-bottle.mp4',
  poster: '/media/video/hero-bottle-poster.webp',
} as const;

export const HERO_HEADLINE = 'Hair care begins with science, not with products.';
export const HERO_LINE = 'First a free scan of your scalp. Then our team calls you to talk through your options.';

/** Static film grain (SVG noise), laid over the stage at low opacity. */
export const GRAIN_URL =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.55 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";
