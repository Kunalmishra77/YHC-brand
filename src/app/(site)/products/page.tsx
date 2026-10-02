import type { Metadata } from 'next';
import Link from 'next/link';
import { EmptyState } from '@/components/shared/states';
import { getConsultTerms } from '@/components/site/consult-fee';
import { CtaBand } from '@/components/site/cta-band';
import { PageIntro } from '@/components/site/page-intro';
import { PhotoPlaceholder } from '@/components/site/photo-placeholder';
import { REGULATORY_LABEL } from '@/components/site/product-meta';
import { pageMetadata } from '@/components/site/seo';
import { t } from '@/i18n/en';
import type { Product } from '@/lib/domain/types';
import { formatINR } from '@/lib/money';
import { getProducts } from '@/server/catalog';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = pageMetadata({
  title: 'Products',
  description:
    'Prescription treatments dosed by Dr. Tyagi and everyday hair-care products, with every ingredient and its role listed.',
  path: '/products',
});

function ProductRow({ product }: { product: Product }) {
  return (
    <li>
      <Link
        href={`/products/${product.slug}`}
        className="group grid grid-cols-[88px_1fr] items-center gap-4 rounded-md py-5 sm:grid-cols-[120px_1fr_auto] sm:gap-6"
      >
        <PhotoPlaceholder
          caption="Photo to be supplied"
          shape="product"
          tone="light"
          className="aspect-square w-full [&_figcaption]:hidden"
        />
        <div className="min-w-0">
          <p className="text-[13px] text-muted-foreground">{REGULATORY_LABEL[product.regulatoryCategory]}</p>
          <h3 className="mt-0.5 text-lg font-semibold text-ink group-hover:text-brand">{product.name}</h3>
          <p className="mt-1 text-sm text-body">{product.tagline}</p>
        </div>
        <p className="col-start-2 text-sm sm:col-start-3 sm:text-right">
          {product.requiresConsultation || product.pricePaise === null ? (
            <span className="text-body">After consultation</span>
          ) : (
            <span className="price text-ink">{formatINR(product.pricePaise)}</span>
          )}
        </p>
      </Link>
    </li>
  );
}

export default function ProductsPage() {
  const products = getProducts();
  const prescribed = products.filter((p) => p.requiresConsultation);
  const open = products.filter((p) => !p.requiresConsultation);
  const terms = getConsultTerms();

  return (
    <>
      <PageIntro
        title="Products"
        lede={
          <p>
            Treatment products are prescribed after your consultation, so the strength and routine fit you.
            Everyday care products can be bought directly. {t('common.inclGst')}.
          </p>
        }
      />
      <div className="container-yhc space-y-14 py-12 md:py-16">
        {products.length === 0 ? (
          <EmptyState
            title="Products are being added"
            body="Our range is listed here once each product's details are confirmed. You can still book a consultation."
          />
        ) : null}
        {prescribed.length ? (
          <section>
            <div className="flex flex-col gap-1 md:flex-row md:items-baseline md:justify-between">
              <h2 className="display text-3xl">Prescribed after your consultation</h2>
              <Link
                href="/book"
                className="inline-flex min-h-11 items-center text-sm font-medium text-brand underline underline-offset-4"
              >
                {terms.bookLabel}
              </Link>
            </div>
            <ul className="mt-6 divide-y divide-line border-y border-line">
              {prescribed.map((p) => (
                <ProductRow key={p.id} product={p} />
              ))}
            </ul>
          </section>
        ) : null}
        {open.length ? (
          <section>
            <h2 className="display text-3xl">Everyday hair care</h2>
            <p className="mt-2 text-body">No consultation needed. Gentle on a scalp under treatment.</p>
            <ul className="mt-6 divide-y divide-line border-y border-line">
              {open.map((p) => (
                <ProductRow key={p.id} product={p} />
              ))}
            </ul>
          </section>
        ) : null}
      </div>
      <CtaBand
        bookLabel={terms.bookLabel}
        body="Not sure which products you need? That's what the consultation decides — based on your history, not a quiz score."
      />
    </>
  );
}
