import { OG_ALT, OG_CONTENT_TYPE, OG_SIZE, brandCard } from '@/server/og/brand-card';

/** Default share card for every page without its own (SEO-02). */
export const alt = OG_ALT;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return brandCard({
    eyebrow: 'Doctor-led hair care',
    title: 'Hair care begins with science, not with products',
    subtitle: 'A guided 3D scalp scan, then a video consultation with a doctor.',
    backdrop: 'microscope',
  });
}
