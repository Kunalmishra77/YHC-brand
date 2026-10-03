/**
 * Typed content blocks shared by articles (FR-M1-4) and legal pages. Plain data — no markdown parser.
 * Type-only module, so client and server components can both import it.
 */
export type ContentBlock =
  | { type: 'heading'; id: string; text: string }
  | { type: 'subheading'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[]; ordered?: boolean }
  | { type: 'callout'; title?: string; text: string; tone?: 'note' | 'caution' };

export type ArticleCategory = 'Understanding hair' | 'Your consultation' | 'Everyday care';

export type ArticleImageKey =
  'textureDrop' | 'serum' | 'tablets' | 'topical' | 'heroStage' | 'textureTablets';

export interface Article {
  slug: string;
  title: string;
  dek: string;
  category: ArticleCategory;
  readingMinutes: number;
  /** ISO date (YYYY-MM-DD), Asia/Kolkata business date. */
  publishedOn: string;
  /** FR-M1-4: only `medically_reviewed` articles may publish. Every demo article is still pending. */
  reviewStatus: 'pending_medical_review' | 'medically_reviewed';
  image: ArticleImageKey;
  body: ContentBlock[];
}

export interface TocEntry {
  id: string;
  text: string;
}

/** Table-of-contents entries come from the `heading` blocks, in order. */
export function tocFromBlocks(blocks: ContentBlock[]): TocEntry[] {
  return blocks.flatMap((b) => (b.type === 'heading' ? [{ id: b.id, text: b.text }] : []));
}
