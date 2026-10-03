import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/domain/types';
import { DARK_PRODUCT_IMAGES, PRODUCT_IMAGES } from '@/lib/images';
import { formatINR } from '@/lib/money';
import { cn } from '@/lib/utils';
import { REGULATORY_LABEL } from './product-meta';

/** Editorial product tile: photograph first, quiet text below — no card chrome. */
export function ProductTile({
  product,
  sizes = '(min-width: 768px) 33vw, 100vw',
  className,
}: {
  product: Product;
  sizes?: string;
  className?: string;
}) {
  const image = PRODUCT_IMAGES[product.slug];
  const dark = DARK_PRODUCT_IMAGES.has(product.slug);
  return (
    <Link href={`/products/${product.slug}`} className={cn('group block rounded-xl', className)}>
      <div
        className={cn(
          'relative aspect-[4/5] overflow-hidden rounded-xl',
          dark ? 'bg-obsidian' : 'bg-[#efeeeb]',
        )}
      >
        {image ? (
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes={sizes}
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03] motion-reduce:transition-none"
          />
        ) : null}
        <span
          className={cn(
            'absolute top-3 left-3 rounded-full px-2.5 py-1 text-[12px] font-medium backdrop-blur',
            dark ? 'bg-white/10 text-on-dark' : 'bg-white/70 text-ink',
          )}
        >
          {product.requiresConsultation ? 'Prescribed after consultation' : 'Buy directly'}
        </span>
      </div>
      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-ink group-hover:text-brand">{product.name}</h3>
          <p className="mt-0.5 text-sm text-body">{product.tagline}</p>
          <p className="mt-1 text-[13px] text-muted-foreground">
            {REGULATORY_LABEL[product.regulatoryCategory]}
          </p>
        </div>
        {product.pricePaise !== null && !product.requiresConsultation ? (
          <span className="price shrink-0 text-ink">{formatINR(product.pricePaise)}</span>
        ) : (
          <span className="shrink-0 text-[13px] text-muted-foreground">In plans</span>
        )}
      </div>
    </Link>
  );
}
