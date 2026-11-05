import type { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { EmptyState } from '@/components/shared/states';
import { getConsultTerms } from '@/components/site/consult-fee';
import { CtaBand } from '@/components/site/cta-band';
import { PageIntro } from '@/components/site/page-intro';
import { ProductTile } from '@/components/site/product-tile';
import { Reveal } from '@/components/site/reveal';
import { SECTION_Y, SectionHeader, TEXT_LINK } from '@/components/site/section';
import { pageMetadata } from '@/components/site/seo';
import { IMAGES } from '@/lib/images';
import { getProducts } from '@/server/catalog';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = pageMetadata({
  title: 'Products',
  description:
    'The YHC range: hair regrowth solution, nourishing tablets and Ayurvedic capsules, for men and women, every ingredient listed. Start with a free scalp scan.',
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
            3 products, each in a men’s and a women’s pack. Products are not sold online right now: start
            with a free scalp scan and our hair-care team will talk you through your options.
          </p>
        }
      />
      {products.length === 0 ? (
        <div className={`container-yhc ${SECTION_Y}`}>
          <EmptyState
            title="Products coming soon"
            body="We add each product once its details are confirmed. You can still take the free scalp scan."
          />
        </div>
      ) : null}
      {prescribed.length ? (
        <section className={`container-yhc ${SECTION_Y}`} aria-labelledby="prescribed-heading">
          <SectionHeader
            id="prescribed-heading"
            eyebrow="The YHC range"
            title="Developed with a dermatologist"
            lede="Every ingredient is listed. The solution has a prescription medicine, so it is supplied only with a doctor’s prescription."
            action={
              <Link href={terms.bookHref} className={`text-ink ${TEXT_LINK}`}>
                {terms.bookLabel} <ArrowRight className="size-4" aria-hidden />
              </Link>
            }
          />
          <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {prescribed.map((p, i) => (
              <Reveal key={p.id} delayMs={(i % 3) * 100}>
                <ProductTile product={p} />
              </Reveal>
            ))}
          </div>
        </section>
      ) : null}
      {open.length ? (
        <section className="border-t border-line bg-card" aria-labelledby="everyday-heading">
          <div className={`container-yhc ${SECTION_Y}`}>
            <SectionHeader
              id="everyday-heading"
              eyebrow="No prescription needed"
              title="Everyday hair care"
              lede="Gentle on a scalp under treatment. Ask our team about them after your scan."
            />
            <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {open.map((p, i) => (
                <Reveal key={p.id} delayMs={(i % 3) * 100}>
                  <ProductTile product={p} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}
      <CtaBand
        id="products-cta-heading"
        // Still from the client's dropper film (16:9) — the tall pack shot cropped into its own label here.
        image={{ src: '/media/seq/ritual/frame_0130.webp', width: 1600, height: 900, alt: 'A dropper over the scalp at the parting' }}
        imagePosition="65% 50%"
        align="left"
        title="Not sure which products you need?"
        bookLabel={terms.bookLabel}
        body="Take the free scalp scan. You see your result straight away, and our team calls you to talk it through."
      />
    </>
  );
}
