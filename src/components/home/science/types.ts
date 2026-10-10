import type { ReactNode } from 'react';

export type ChapterId = 'follicle' | 'cycle' | 'thinning' | 'scan' | 'plan';

/** A cited evidence fact, flattened for the client (source data lives in src/server/content/evidence.ts). */
export interface ChapterCite {
  stat?: string;
  label: string;
  source: string;
  year?: number;
  url: string;
}

export interface Chapter {
  id: ChapterId;
  kicker: string;
  title: string;
  body: string;
  cite?: ChapterCite;
  secondary?: ChapterCite;
  /** Server-rendered extra content (plan targets list, patent slot). */
  extra?: ReactNode;
}

export interface PlanTarget {
  slug: string;
  product: string;
  roles: { name: string; role: string }[];
}
