import DefaultImage from './opengraph-image';
import { OG_ALT, OG_CONTENT_TYPE, OG_SIZE } from '@/server/og/brand-card';

/** Twitter/X uses the same default card as Open Graph (SEO-02). */
export const alt = OG_ALT;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default DefaultImage;
