import { LINE_LABEL, PRODUCT_MEDIA, type ProductLine } from '@/lib/brand-media';
import { getProduct } from '@/server/catalog';
import { OG_CONTENT_TYPE, OG_SIZE, brandCard } from '@/server/og/brand-card';

export const alt = 'YHC product — Your Hair Company';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

/* Product card with the men's pack render (JPEG crop from scripts/build-assets.mjs — next/og can't read WebP). */
const productKey = (slug: string) =>
  ({
    'hair-regrowth-solution': 'solution-men',
    'hair-nourishing-tablets': 'tablets-men',
    'hair-regrowth-capsules': 'capsules-men',
    'hair-regrowth-powder': 'powder-men',
  })[slug] ?? 'solution-men';

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) {
    return brandCard({ eyebrow: 'Products', title: 'The YHC range', subtitle: 'Every ingredient listed.' });
  }
  const media = PRODUCT_MEDIA[product.slug];
  const lines = media ? (Object.keys(media.lines) as ProductLine[]).filter((l) => media.lines[l].length > 0) : [];
  return brandCard({
    eyebrow: 'YHC product',
    title: product.name,
    subtitle: product.requiresConsultation
      ? 'Supplied after a consultation with the doctor.'
      : 'Every ingredient listed on the page.',
    chips: [...(media ? [media.pack] : []), ...lines.map((l) => LINE_LABEL[l])],
    photo: `public/media/products/og/${productKey(product.slug)}.jpg`,
    backdrop: 'formulation',
  });
}
