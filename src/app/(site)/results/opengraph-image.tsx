import { OG_CONTENT_TYPE, OG_SIZE, brandCard } from '@/server/og/brand-card';

export const alt = 'Before-and-after results shared with consent — Your Hair Company';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

/** No patient photos on share cards — only on the page, where consent and context are shown. */
export default function Image() {
  return brandCard({
    eyebrow: 'Results',
    title: 'Before and after, shared with written consent',
    subtitle: 'Plans prescribed by the doctor. Faces hidden. Individual results vary.',
    backdrop: 'formulation',
  });
}
