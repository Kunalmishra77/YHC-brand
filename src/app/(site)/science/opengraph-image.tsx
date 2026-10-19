import { OG_CONTENT_TYPE, OG_SIZE, brandCard } from '@/server/og/brand-card';

export const alt = 'The science behind hair growth — Your Hair Company';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return brandCard({
    eyebrow: 'The science',
    title: 'How hair roots and the growth cycle work',
    subtitle: 'An honest account of what is known, and what is not.',
    backdrop: 'cellular',
  });
}
