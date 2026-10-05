import type { Metadata } from 'next';
import Link from 'next/link';
import { EmptyState } from '@/components/shared/states';
import { getConsultTerms } from '@/components/site/consult-fee';
import { CtaBand } from '@/components/site/cta-band';
import { PageIntro } from '@/components/site/page-intro';
import { ProductTile } from '@/components/site/product-tile';
import { pageMetadata } from '@/components/site/seo';
import { IMAGES } from '@/lib/images';
import { t } from '@/i18n/en';
import { getProducts } from '@/server/catalog';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = pageMetadata({
  title: 'Products',
  description:
    'Prescription treatments dosed by Dr. Tyagi and everyday hair-care products, with every ingredient and its role listed.',
  path: '/products',
});

export default function ProductsPage() {
  const products = getProducts();
  const prescribed = products.filter((p) => p.requiresConsultation);
  const open = products.filter((p) => !p.requiresConsultation);
  const terms = getConsultTerms();

  return (
    <>
      <PageIntro
        title="Products"
        image={IMAGES.heroPortrait}
        tone="dark"
        lede={
          <p>
            Treatment products are prescribed after your consultation, so the strength and routine fit you.
            Everyday care products can be bought directly. {t('common.inclGst')}.
          </p>
        }
      />
      <div className="container-yhc space-y-24 py-16 md:py-24">
        {products.length === 0 ? (
          <EmptyState
            title="Products are being added"
            body="Our range is listed here once each product's details are confirmed. You can still book a consultation."
          />
        ) : null}
        {prescribed.length ? (
          <section>
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between md:gap-8">
              <h2 className="display text-[clamp(2rem,1.5rem+2vw,3rem)] text-balance">
                Prescribed after your consultation
              </h2>
              <Link
                href="/book"
                className="inline-flex min-h-11 items-center text-sm font-medium text-brand underline underline-offset-4"
              >
                {terms.bookLabel}
              </Link>
            </div>
            <div className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {prescribed.map((p) => (
                <ProductTile key={p.id} product={p} />
              ))}
            </div>
          </section>
        ) : null}
        {open.length ? (
          <section>
            <h2 className="display text-[clamp(2rem,1.5rem+2vw,3rem)] text-balance">Everyday hair care</h2>
            <p className="mt-3 max-w-xl text-body">
              No consultation needed. Gentle on a scalp under treatment.
            </p>
            <div className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {open.map((p) => (
                <ProductTile key={p.id} product={p} />
              ))}
            </div>
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
