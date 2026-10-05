import { AlertTriangle, MessageSquareText } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getConsultTerms } from '@/components/site/consult-fee';
import { CtaBand } from '@/components/site/cta-band';
import { JsonLd } from '@/components/site/json-ld';
import { ProductTile } from '@/components/site/product-tile';
import { pageMetadata } from '@/components/site/seo';
import { Button } from '@/components/ui/button';
import { t } from '@/i18n/en';
import { clientEnv } from '@/lib/env';
import { IMAGES } from '@/lib/images';
import { getConcern, getConcerns, getProducts } from '@/server/catalog';

export const dynamic = 'force-dynamic';

export function generateStaticParams() {
  return getConcerns().map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<'/concerns/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  const concern = getConcern(slug);
  if (!concern) return { title: 'Concern not found' };
  return pageMetadata({
    title: concern.title,
    description: `${concern.summary} What it can mean, and how a consultation with Dr. Tyagi helps.`,
    path: `/concerns/${concern.slug}`,
  });
}

export default async function ConcernPage({ params }: PageProps<'/concerns/[slug]'>) {
  const { slug } = await params;
  const concern = getConcern(slug);
  if (!concern) notFound();
  const others = getConcerns().filter((c) => c.slug !== concern.slug);
  const products = getProducts().filter((p) => concern.relatedProducts.includes(p.slug));
  const terms = getConsultTerms();
  const base = clientEnv.NEXT_PUBLIC_SITE_URL;

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: base },
            { '@type': 'ListItem', position: 2, name: 'Hair concerns', item: `${base}/concerns` },
            {
              '@type': 'ListItem',
              position: 3,
              name: concern.title,
              item: `${base}/concerns/${concern.slug}`,
            },
          ],
        }}
      />
      <article>
        {/* Header */}
        <header className="relative isolate overflow-hidden bg-obsidian text-on-dark">
          <div className="absolute inset-y-0 right-0 -z-10 hidden w-1/2 md:block" aria-hidden>
            <Image src={IMAGES.heroStage.src} alt="" fill priority sizes="50vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-obsidian to-transparent" />
          </div>
          <div className="container-yhc py-16 md:py-28">
            <nav aria-label="Breadcrumb" className="text-sm text-on-dark-muted">
              <Link
                href="/concerns"
                className="underline decoration-line-dark underline-offset-4 hover:text-on-dark"
              >
                Hair concerns
              </Link>{' '}
              / <span className="text-on-dark">{concern.title}</span>
            </nav>
            <h1 className="display mt-6 max-w-2xl text-[clamp(2.75rem,1.8rem+3.6vw,5rem)] leading-[1.02] text-balance text-on-dark">
              {concern.title}
            </h1>
            <p className="mt-6 max-w-xl text-xl leading-relaxed text-on-dark-muted">{concern.summary}</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                className="h-12 bg-[image:var(--yhc-silver)] px-6 text-base font-semibold text-obsidian hover:opacity-95"
              >
                <Link href={`/book`}>{terms.bookLabel}</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-12 border-line-dark bg-transparent px-6 text-base text-on-dark hover:bg-graphite hover:text-on-dark"
              >
                <Link href="/assessment">{t('common.freeAssessment')}</Link>
              </Button>
            </div>
          </div>
        </header>

        {/* Overview + causes */}
        <section className="container-yhc grid gap-14 py-20 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:py-28">
          <div>
            <p className="text-xl leading-relaxed text-ink">{concern.body}</p>
            <h2 className="display mt-14 text-[clamp(2rem,1.5rem+2vw,3rem)] text-balance">
              What can be behind it
            </h2>
            <ul className="mt-6 divide-y divide-line border-y border-line">
              {concern.causes.map((cause) => (
                <li key={cause} className="flex gap-4 py-4 text-lg text-body">
                  <span className="mt-3.5 h-px w-5 shrink-0 bg-steel" aria-hidden />
                  {cause}
                </li>
              ))}
            </ul>
            <p className="mt-5 text-sm text-muted-foreground">
              General information, not a diagnosis. Only a consultation can say which applies to you.
            </p>
          </div>

          <aside className="space-y-6 md:sticky md:top-24 md:self-start">
            <div className="rounded-2xl bg-card p-7 shadow-card ring-1 ring-line">
              <MessageSquareText className="size-5 text-brand" aria-hidden />
              <h2 className="mt-4 text-lg font-semibold text-ink">What Dr. Tyagi may ask</h2>
              <ul className="mt-4 space-y-3 text-[15px] text-body">
                {concern.questions.map((q) => (
                  <li key={q} className="flex gap-3">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-steel" aria-hidden />
                    {q}
                  </li>
                ))}
              </ul>
              <p className="mt-5 border-t border-line pt-4 text-sm text-muted-foreground">
                You&apos;ll answer most of these in a short form before the call, so the {terms.slotMinutes}{' '}
                minutes are spent on you.
              </p>
            </div>
            <div className="rounded-2xl bg-warning-bg p-7">
              <p className="flex items-center gap-2 font-semibold text-warning">
                <AlertTriangle className="size-5" aria-hidden />
                See a doctor soon if you notice
              </p>
              <ul className="mt-4 space-y-2.5 text-[15px] text-ink">
                {concern.seeSoon.map((s) => (
                  <li key={s} className="flex gap-3">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-warning" aria-hidden />
                    {s}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-sm text-body">
                Some of these are better seen in person. Dr. Tyagi will tell you if that is the case.
              </p>
            </div>
          </aside>
        </section>

        {/* What a plan may include */}
        {products.length ? (
          <section className="border-t border-line bg-[#efeeeb]/60">
            <div className="container-yhc py-20 md:py-28">
              <div className="grid gap-6 md:grid-cols-2 md:items-end">
                <h2 className="display text-[clamp(2rem,1.5rem+2vw,3rem)] text-balance">
                  What a plan may draw on
                </h2>
                <p className="max-w-md text-body md:justify-self-end">
                  If treatment is right for you, Dr. Tyagi chooses the products, strength and routine. These
                  are the ones often considered for {concern.title.toLowerCase()}. {t('common.resultsVary')}
                </p>
              </div>
              <div className="mt-12 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((p) => (
                  <ProductTile key={p.id} product={p} />
                ))}
              </div>
            </div>
          </section>
        ) : null}
      </article>

      {/* Other concerns */}
      {others.length ? (
        <section className="container-yhc py-20 md:py-24">
          <h2 className="display text-[clamp(1.75rem,1.4rem+1.4vw,2.5rem)] text-balance">Other concerns</h2>
          <ul className="mt-8 grid gap-px overflow-hidden rounded-2xl bg-line sm:grid-cols-2 lg:grid-cols-4">
            {others.map((c) => (
              <li key={c.slug} className="bg-pearl">
                <Link href={`/concerns/${c.slug}`} className="group block h-full p-6 hover:bg-card">
                  <p className="font-semibold text-ink group-hover:text-brand">{c.title}</p>
                  <p className="mt-2 text-sm text-body">{c.summary}</p>
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-8 text-sm text-muted-foreground">{t('legal.disclaimer')}</p>
        </section>
      ) : null}

      <CtaBand
        bookLabel={terms.bookLabel}
        body={`${concern.title} has more than one possible cause. A consultation is how you find out which applies to you.`}
      />
    </>
  );
}
