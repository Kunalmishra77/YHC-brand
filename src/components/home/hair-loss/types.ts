import type { ScalpPattern } from './head-diagram';

/** One hair-loss type as shown in the homepage explorer (serialisable: built on the server). */
export interface HairLossTypeView {
  id: string;
  pattern: ScalpPattern;
  /** Everyday name first. */
  name: string;
  /** The medical name, shown small (helps search). */
  aka: string;
  /** Two-to-four word cue shown in the selector. */
  cue: string;
  /** One or two short sentences shown up front. */
  short: string;
  looksLike: string;
  triggers: string[];
  helps: string;
  /** Needs prompt in-person care. */
  urgent: boolean;
  /** Text alternative for the head diagrams (used when no illustration is ready). */
  illustrationAlt: string;
  /** The generated illustration (SLOTS.H20…H25) once it is on the site; null → line diagrams. */
  image: { src: string; alt: string } | null;
  /** Optional cited fact from src/server/content/evidence.ts. */
  fact: { stat?: string; label: string; detail: string; sourceName: string; sourceUrl: string } | null;
  /** Matching concern pages that exist in the catalog. */
  links: { href: string; label: string }[];
}
