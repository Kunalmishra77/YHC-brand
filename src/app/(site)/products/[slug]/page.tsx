import { Stethoscope } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getConsultTerms } from '@/components/site/consult-fee';
import { JsonLd } from '@/components/site/json-ld';
import { ProductGallery } from '@/components/site/product-gallery';
import { ProductTile } from '@/components/site/product-tile';
import { REGULATORY_LABEL } from '@/components/site/product-meta';
import { pageMetadata } from '@/components/site/seo';
import { Button } from '@/components/ui/button';
import { t } from '@/i18n/en';
import { clientEnv } from '@/lib/env';
import { PRODUCT_GALLERY } from '@/lib/images';
import { formatINR } from '@/lib/money';
import { getProduct, getProducts } from '@/server/catalog';

export const dynamic = 'force-dynamic';

export function generateStaticParams() {
  return getProducts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<'/products/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return { title: 'Product not found' };
  return pageMetadata({
    title: product.name,
    description: `${product.tagline}. ${product.description}`.slice(0, 160),
    path: `/products/${product.slug}`,
  });
}

export default async function ProductPage({ params }: PageProps<'/products/[slug]'>) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();
  const terms = getConsultTerms();
  const base = clientEnv.NEXT_PUBLIC_SITE_URL;
  const buyable = !product.requiresConsultation && product.pricePaise !== null;

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: product.name,
          description: product.description,
          brand: { '@type': 'Brand', name: 'Your Hair Company' },
          url: `${base}/products/${product.slug}`,
          ...(buyable && product.pricePaise !== null
            ? {
                offers: {
                  '@type': 'Offer',
                  priceCurrency: 'INR',
                  price: (product.pricePaise / 100).toFixed(2),
                  availability: 'https://schema.org/InStock',
                },
              }
            : {}),
        }}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: base },
            { '@type': 'ListItem', position: 2, name: 'Products', item: `${base}/products` },
            {
              '@type': 'ListItem',
              position: 3,
              name: product.name,
              item: `${base}/products/${product.slug}`,
            },
          ],
        }}
      />

      <section className="container-yhc grid gap-10 py-10 md:grid-cols-2 md:gap-16 md:py-16">
        {/* Gallery — TODO(client): product photography — see docs/12 D-P2 */}
        <div className="md:sticky md:top-24 md:self-start">
          <ProductGallery images={PRODUCT_GALLERY[product.slug] ?? []} name={product.name} />
        </div>

        <div>
          <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
            <Link href="/products" className="underline underline-offset-2 hover:text-ink">
              Products
            </Link>{' '}
            / <span className="text-body">{product.name}</span>
          </nav>
          <p className="mt-5 text-sm text-muted-foreground">
            {REGULATORY_LABEL[product.regulatoryCategory]} · {product.daysOfSupply}-day supply
          </p>
          <h1 className="display mt-3 text-[clamp(2.5rem,1.8rem+2.6vw,4rem)]">{product.name}</h1>
          <p className="mt-3 text-xl text-ink">{product.tagline}</p>
          <p className="mt-6 max-w-prose text-lg leading-relaxed text-body">{product.description}</p>

          <div className="mt-10 rounded-2xl border border-line bg-card p-6 shadow-card">
            {buyable && product.pricePaise !== null ? (
              <>
                <p className="price text-2xl text-ink">{formatINR(product.pricePaise)}</p>
                <p className="text-sm text-muted-foreground">{t('common.inclGst')}</p>
                <Button asChild className="mt-4 h-12 w-full text-base sm:w-auto sm:px-8">
                  <Link href={`/cart?add=${encodeURIComponent(product.id)}`}>Add to cart</Link>
                </Button>
              </>
            ) : (
              <>
                <p className="flex items-start gap-2 text-body">
                  <Stethoscope className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden />
                  <span>
                    This product is prescribed after a consultation, so its use is matched to your history. It
                    is included in your plan if Dr. Tyagi recommends it.
                  </span>
                </p>
                <Button asChild className="mt-4 h-12 w-full text-base sm:w-auto sm:px-8">
                  <Link href="/book">Book consultation to get this prescribed</Link>
                </Button>
                <p className="mt-2 text-sm text-muted-foreground">Consultation fee {terms.fee}</p>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-card">
        <div className="container-yhc grid gap-12 py-12 md:grid-cols-2 md:py-16">
          <div>
            <h2 className="text-xl font-semibold text-ink">Ingredients and their roles</h2>
            <dl className="mt-5 divide-y divide-line border-y border-line">
              {product.ingredients.map((ing) => (
                <div key={ing.name} className="grid gap-1 py-4 sm:grid-cols-2 sm:gap-6">
                  <dt className="font-medium text-ink">{ing.name}</dt>
                  <dd className="text-sm text-body">{ing.role}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="space-y-10">
            <div>
              <h2 className="text-xl font-semibold text-ink">How to use</h2>
              <p className="mt-3 text-body">{product.howToUse}</p>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-ink">What to expect</h2>
              <p className="mt-3 text-body">{product.whatToExpect}</p>
              <p className="mt-3 text-sm font-medium text-ink">{t('common.resultsVary')}</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Category: {REGULATORY_LABEL[product.regulatoryCategory]}. {t('legal.disclaimer')}
            </p>
          </div>
        </div>
      </section>

      <section className="container-yhc py-20 md:py-24">
        <h2 className="display text-[clamp(2rem,1.5rem+2vw,3rem)]">
          {product.requiresConsultation ? 'Often prescribed together' : 'Also in everyday care'}
        </h2>
        <div className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 md:grid-cols-3">
          {getProducts()
            .filter((p) => p.slug !== product.slug && p.requiresConsultation === product.requiresConsultation)
            .slice(0, 3)
            .map((p) => (
              <ProductTile key={p.id} product={p} />
            ))}
        </div>
      </section>
    </>
  );
}
