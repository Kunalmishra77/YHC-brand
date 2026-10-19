import type { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { EmptyState } from '@/components/shared/states';
import { getConsultTerms } from '@/components/site/consult-fee';
import { CtaBand } from '@/components/site/cta-band';
import { PageIntro } from '@/components/site/page-intro';
import { ProductTile } from '@/components/site/product-tile';
import { SECTION_Y, SectionHeader, TEXT_LINK } from '@/components/site/section';
import { pageMetadata } from '@/components/site/seo';
import { IMAGES } from '@/lib/images';
import { t } from '@/i18n/en';
import { getProducts } from '@/server/catalog';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = pageMetadata({
  title: 'Products',
  description:
    'The YHC range of solution, tablets, capsules and powder, for men and for women, with every ingredient listed. Supplied after a doctor consultation.',
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
            Four products, each in a men’s and a women’s pack. They are supplied after your consultation, so
            the choice and routine fit you. {t('common.inclGst')}.
          </p>
        }
      />
      {products.length === 0 ? (
        <div className={`container-yhc ${SECTION_Y}`}>
          <EmptyState
            title="Products are being added"
            body="Our range is listed here once each product's details are confirmed. You can still book a consultation."
          />
        </div>
      ) : null}
      {prescribed.length ? (
        <section className={`container-yhc ${SECTION_Y}`} aria-labelledby="prescribed-heading">
          <SectionHeader
            id="prescribed-heading"
            eyebrow="The YHC range"
            title="Chosen at your consultation"
            lede="The doctor decides which products belong in your plan and how to use them. The solution contains a prescription medicine and is supplied only with a prescription."
            action={
              <Link href="/book" className={`text-ink ${TEXT_LINK}`}>
                {terms.bookLabel} <ArrowRight className="size-4" aria-hidden />
              </Link>
            }
          />
          <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 xl:grid-cols-4">
            {prescribed.map((p) => (
              <ProductTile key={p.id} product={p} />
            ))}
          </div>
        </section>
      ) : null}
      {open.length ? (
        <section className="border-t border-line bg-card" aria-labelledby="everyday-heading">
          <div className={`container-yhc ${SECTION_Y}`}>
            <SectionHeader
              id="everyday-heading"
              eyebrow="No consultation needed"
              title="Everyday hair care"
              lede="Gentle on a scalp under treatment. Order directly, on their own or alongside a plan."
            />
            <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {open.map((p) => (
                <ProductTile key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
      <CtaBand
        bookLabel={terms.bookLabel}
        body="Not sure which products you need? That's what the consultation decides — based on your history, not a quiz score."
      />
    </>
  );
}
