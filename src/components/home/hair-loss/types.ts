import type { ScalpPattern } from './head-diagram';

/** One hair-loss type as shown in the homepage explorer (serialisable: built on the server). */
export interface HairLossTypeView {
  id: string;
  pattern: ScalpPattern;
  name: string;
  /** Clinical or plain alternative name. */
  aka: string;
  /** Two-to-four word cue shown in the selector. */
  cue: string;
  looksLike: string;
  triggers: string[];
  helps: string;
  /** Needs prompt in-person care. */
  urgent: boolean;
  /** Text alternative for the side and top diagrams together. */
  illustrationAlt: string;
  /** Optional cited fact from src/server/content/evidence.ts. */
  fact: { stat?: string; label: string; detail: string; sourceName: string; sourceUrl: string } | null;
  /** Matching concern pages that exist in the catalog. */
  links: { href: string; label: string }[];
}
