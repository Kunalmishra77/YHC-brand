import type { Metadata } from 'next';

const SITE_NAME = 'Your Hair Company';

/** Unique title/description, canonical URL and OpenGraph per page (FR-M1-7). */
export function pageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
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
    },
  };
}
