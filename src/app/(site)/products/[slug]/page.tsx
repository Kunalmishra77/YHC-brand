import { Pill, ShieldAlert, Stethoscope } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
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
import { LABEL_PARTIES, PRODUCT_MEDIA, ingredientImage, productHero } from '@/lib/brand-media';
import { formatINR } from '@/lib/money';
import { getProduct, getProducts } from '@/server/catalog';
import { PRODUCT_SEO_DESCRIPTION, clampDescription } from '@/server/content/seo-copy';

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
    description:
      PRODUCT_SEO_DESCRIPTION[product.slug] ?? clampDescription(`${product.tagline}. ${product.description}`),
    path: `/products/${product.slug}`,
    ownImage: true,
  });
}

export default async function ProductPage({ params }: PageProps<'/products/[slug]'>) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();
  const terms = getConsultTerms();
  const base = clientEnv.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');
  const hero = productHero(product.slug);
  const buyable = !product.requiresConsultation && product.pricePaise !== null;
  const media = PRODUCT_MEDIA[product.slug];
  const hasFinasteride = product.ingredients.some((i) => /finasteride/i.test(i.name));

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
          // SEO-06: absolute URL of the men-line pack hero (front of pack only, ADR-32).
          ...(hero ? { image: `${base}${hero.src}` } : {}),
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

      <section className="container-yhc grid grid-cols-1 gap-10 py-10 md:grid-cols-2 md:gap-12 md:py-16 lg:gap-16">
        <div className="min-w-0 md:sticky md:top-24 md:self-start">
          <ProductGallery lines={media?.lines ?? {}} name={product.name} />
        </div>

        <div className="min-w-0">
          <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
            <Link href="/products" className="underline underline-offset-2 hover:text-ink">
              Products
            </Link>{' '}
            / <span className="text-body">{product.name}</span>
          </nav>
          <p className="mt-5 text-sm text-muted-foreground">
            {REGULATORY_LABEL[product.regulatoryCategory]}
            {media ? ` · ${media.pack}` : ''} · For men and for women
          </p>
          <h1 className="display mt-3 text-[clamp(2.5rem,1.8rem+2.6vw,4rem)] text-balance">{product.name}</h1>
          <p className="mt-3 text-xl text-pretty text-ink">{product.tagline}</p>
          <p className="mt-6 max-w-prose text-lg leading-relaxed text-pretty text-body">
            {product.description}
          </p>

          {hasFinasteride ? (
            <p className="mt-6 flex max-w-prose items-start gap-2.5 rounded-xl bg-mist p-4 text-sm leading-relaxed text-ink">
              <ShieldAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
              <span>
                Contains finasteride, a prescription medicine. It is not suitable during pregnancy or
                breastfeeding — tell the doctor if either applies, or if you are planning a pregnancy.
              </span>
            </p>
          ) : null}

          <div className="mt-10 rounded-2xl border border-line bg-card p-5 shadow-card sm:p-6">
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
                <Button
                  asChild
                  className="mt-4 h-auto min-h-12 w-full py-3 text-base whitespace-normal lg:w-auto lg:px-8"
                >
                  <Link href="/book">Book consultation to get this prescribed</Link>
                </Button>
                <p className="mt-2 text-sm text-muted-foreground">Consultation fee {terms.fee}</p>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-card">
        <div className="container-yhc grid gap-12 py-16 md:grid-cols-2 md:gap-16 md:py-24">
          <div>
            <h2 className="text-xl font-semibold text-ink">Ingredients and their roles</h2>
            <dl className="mt-5 divide-y divide-line border-y border-line">
              {product.ingredients.map((ing) => {
                const photo = ingredientImage(ing.name);
                return (
                  <div key={ing.name} className="grid grid-cols-[3.5rem_minmax(0,1fr)] items-center gap-4 py-3.5">
                    <div className="relative flex size-14 items-center justify-center overflow-hidden rounded-full bg-mist ring-1 ring-line">
                      {photo ? (
                        <Image src={photo.src} alt="" fill sizes="56px" className="object-cover" />
                      ) : (
                        <Pill className="size-5 text-body" aria-hidden />
                      )}
                    </div>
                    <div className="min-w-0">
                      <dt className="font-medium text-ink">{ing.name}</dt>
                      <dd className="text-sm text-body">{ing.role}</dd>
                    </div>
                  </div>
                );
              })}
            </dl>
            <p className="mt-4 text-[13px] leading-relaxed text-muted-foreground">
              Ingredient photos are illustrative. Amounts are shown on the pack; your doctor explains them at
              the consultation.
            </p>
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
            <dl className="space-y-2 text-sm text-body">
              <div>
                <dt className="inline font-medium text-ink">Marketed by: </dt>
                <dd className="inline">{LABEL_PARTIES.marketedBy}</dd>
              </div>
              <div>
                <dt className="inline font-medium text-ink">Manufactured by: </dt>
                <dd className="inline">{LABEL_PARTIES.manufacturedBy}</dd>
              </div>
            </dl>
            <p className="text-sm text-muted-foreground">
              Category: {REGULATORY_LABEL[product.regulatoryCategory]}. {t('legal.disclaimer')}
            </p>
          </div>
        </div>
      </section>

      <section className="container-yhc py-20 md:py-24">
        <h2 className="display text-[clamp(2rem,1.5rem+2vw,3rem)] text-balance">
          {product.requiresConsultation ? 'Often prescribed together' : 'Also in everyday care'}
        </h2>
        <div className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
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
