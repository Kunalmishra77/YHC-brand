import { OG_ALT, OG_CONTENT_TYPE, OG_SIZE, brandCard } from '@/server/og/brand-card';

/** Default share card for every page without its own (SEO-02). */
export const alt = OG_ALT;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return brandCard({
    eyebrow: 'Science-first hair care',
    title: 'Hair care begins with science, not with products',
    subtitle: 'A free scalp scan with your phone. Your result straight away, then a call from our team.',
    backdrop: 'microscope',
  });
}
