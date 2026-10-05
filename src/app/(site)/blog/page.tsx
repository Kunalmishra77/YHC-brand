import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArticleMeta, ArticleRow, articleImage } from '@/components/site/article/article-row';
import { ReviewBadge } from '@/components/site/article/review-badge';
import { CtaBand } from '@/components/site/cta-band';
import { getConsultTerms } from '@/components/site/consult-fee';
import { JsonLd } from '@/components/site/json-ld';
import { pageMetadata } from '@/components/site/seo';
import { EmptyState } from '@/components/shared/states';
import { Button } from '@/components/ui/button';
import { t } from '@/i18n/en';
import { clientEnv } from '@/lib/env';
import { getArticles } from '@/server/content/articles';

// The closing band shows the live consultation fee (settings).
export const dynamic = 'force-dynamic';

export const metadata: Metadata = pageMetadata({
  title: 'Hair health articles',
  description:
    'Plain-English guides to hair and scalp health from Your Hair Company — shedding, the growth cycle, scalp photos, nutrition and what happens in a consultation.',
  path: '/blog',
});

export default function BlogPage() {
  const articles = getArticles();
  const terms = getConsultTerms();
  const [featured, ...rest] = articles;

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Blog',
          name: 'Your Hair Company — articles',
          url: `${clientEnv.NEXT_PUBLIC_SITE_URL}/blog`,
          blogPost: articles.map((a) => ({
            '@type': 'BlogPosting',
            headline: a.title,
            url: `${clientEnv.NEXT_PUBLIC_SITE_URL}/blog/${a.slug}`,
            datePublished: a.publishedOn,
          })),
        }}
      />

      <section className="border-b border-line">
        <div className="container-yhc grid gap-8 py-16 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:items-end md:py-24">
          <h1 className="display text-[clamp(2.5rem,1.7rem+3vw,4rem)] text-balance">
            Notes on hair, written plainly
          </h1>
          <div className="space-y-4">
            <p className="text-lg leading-relaxed text-body">
              Short guides to what is happening with your hair and scalp, and what a doctor looks for. General
              education — not a diagnosis.
            </p>
            <p className="text-sm text-muted-foreground">
              Every article is reviewed by Dr. Tyagi before it is published. Until then, it is marked as a
              draft.
            </p>
          </div>
        </div>
      </section>

      {featured ? (
        <>
          {/* Featured article */}
          <section className="container-yhc py-16 md:py-24">
            <article className="group relative grid gap-8 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:items-center md:gap-14">
              <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-[#efeeeb]">
                <Image
                  src={articleImage(featured).src}
                  alt={articleImage(featured).alt}
                  fill
                  priority
                  sizes="(min-width: 768px) 58vw, 100vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02] motion-reduce:transition-none"
                />
              </div>
              <div>
                <ArticleMeta article={featured} />
                <h2 className="display mt-4 text-[clamp(2.25rem,1.6rem+2.4vw,3.25rem)] text-balance">
                  <Link
                    href={`/blog/${featured.slug}`}
                    className="underline decoration-transparent underline-offset-[8px] group-hover:decoration-steel after:absolute after:inset-0"
                  >
                    {featured.title}
                  </Link>
                </h2>
                <p className="mt-5 text-lg leading-relaxed text-body">{featured.dek}</p>
                <ReviewBadge status={featured.reviewStatus} className="mt-6" />
                <p className="mt-7 text-sm font-medium text-ink underline decoration-steel underline-offset-[6px]">
                  Read the article
                </p>
              </div>
            </article>
          </section>

          {/* Editorial list */}
          {rest.length > 0 ? (
            <section className="container-yhc pb-20 md:pb-28">
              <div className="grid gap-10 md:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]">
                <div className="md:sticky md:top-28 md:self-start">
                  <h2 className="display text-[clamp(2rem,1.5rem+2vw,2.75rem)] text-balance">More to read</h2>
                  <p className="mt-4 max-w-xs leading-relaxed text-body">
                    Not sure where to start? The hair concern pages cover the most common patterns.
                  </p>
                  <Link
                    href="/concerns"
                    className="mt-5 inline-flex min-h-11 items-center text-sm font-medium text-ink underline decoration-steel underline-offset-[6px] hover:decoration-ink"
                  >
                    Browse hair concerns
                  </Link>
                </div>
                <div className="border-t border-line">
                  {rest.map((a) => (
                    <ArticleRow key={a.slug} article={a} />
                  ))}
                </div>
              </div>
              <p className="mt-10 text-sm text-muted-foreground">{t('legal.disclaimer')}</p>
            </section>
          ) : null}
        </>
      ) : (
        <section className="container-yhc py-16">
          <EmptyState
            title="No articles yet"
            body="Articles are published only after Dr. Tyagi's medical review. The hair concern pages cover the basics."
            action={
              <Button asChild variant="outline" className="h-11 border-steel px-5">
                <Link href="/concerns">Read about hair concerns</Link>
              </Button>
            }
          />
        </section>
      )}

      <CtaBand
        bookLabel={terms.bookLabel}
        title="Reading helps. A consultation answers."
        body="Articles explain the general picture. Dr. Tyagi can look at your history and scalp and tell you what is likely going on for you."
      />
    </>
  );
}
