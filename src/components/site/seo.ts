import type { Metadata } from 'next';

const SITE_NAME = 'Your Hair Company';

/** URL of the default generated share card (`src/app/opengraph-image.tsx`). */
export const DEFAULT_OG_IMAGE = {
  url: '/opengraph-image',
  width: 1200,
  height: 630,
  alt: 'Your Hair Company — doctor-led hair care',
} as const;

/**
 * Unique title/description, canonical URL, OpenGraph and Twitter card per page (FR-M1-7, SEO-02/03).
 *
 * A page-level `openGraph` object replaces the parent's, which would drop the root
 * `opengraph-image`. So the default card is attached here explicitly — unless the page's own
 * segment has an `opengraph-image.tsx` (`ownImage: true`), in which case `images` must stay unset
 * for Next to use the file. Twitter falls back to the OpenGraph images.
 */
export function pageMetadata({
  title,
  description,
  path,
  ownImage = false,
}: {
  title: string;
  description: string;
  path: string;
  ownImage?: boolean;
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${title} · ${SITE_NAME}`,
      description,
      url: path,
      siteName: SITE_NAME,
      locale: 'en_IN',
      type: 'website',
      ...(ownImage ? {} : { images: [DEFAULT_OG_IMAGE] }),
    },
    twitter: { card: 'summary_large_image' },
  };
}
