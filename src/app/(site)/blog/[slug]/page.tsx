import type { Metadata } from 'next';
import { ExternalLink } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArticleMeta, ArticleRow, articleImage } from '@/components/site/article/article-row';
import { ContentBlocks } from '@/components/site/article/content-blocks';
import { ReviewBadge } from '@/components/site/article/review-badge';
import { TableOfContents } from '@/components/site/article/table-of-contents';
import { JsonLd } from '@/components/site/json-ld';
import { pageMetadata } from '@/components/site/seo';
import { Button } from '@/components/ui/button';
import { t } from '@/i18n/en';
import { clientEnv } from '@/lib/env';
import { SITE } from '@/lib/site';
import { getDoctor } from '@/server/catalog';
import { getArticle, getArticleSources, getArticles, getRelatedArticles } from '@/server/content/articles';
import { tocFromBlocks, type ContentBlock } from '@/server/content/types';

export function generateStaticParams() {
  return getArticles().map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps<'/blog/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return { title: 'Article not found' };
  const base = pageMetadata({
    title: article.title,
    description: article.dek,
    path: `/blog/${article.slug}`,
  });
  return {
    ...base,
    openGraph: {
      ...base.openGraph,
      type: 'article',
      publishedTime: article.publishedOn,
      images: [{ url: articleImage(article).src, alt: articleImage(article).alt }],
    },
  };
}

export default async function ArticlePage({ params }: PageProps<'/blog/[slug]'>) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const doctor = getDoctor();
  const image = articleImage(article);
  const toc = tocFromBlocks(article.body);
  const related = getRelatedArticles(article.slug, 2);
  // Linked sources replace the body's plain-text "Sources" list; its closing note is kept.
  const sources = getArticleSources(article.slug);
  const cut = article.body.findIndex((b) => b.type === 'heading' && b.id === 'sources');
  const linked = sources.length > 0 && cut >= 0;
  const bodyBlocks = linked ? article.body.slice(0, cut) : article.body;
  const sourceNotes = linked
    ? article.body
        .slice(cut + 1)
        .filter((b): b is Extract<ContentBlock, { type: 'paragraph' }> => b.type === 'paragraph')
    : [];
  const siteUrl = clientEnv.NEXT_PUBLIC_SITE_URL;
  const url = `${siteUrl}/blog/${article.slug}`;

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
            { '@type': 'ListItem', position: 2, name: 'Articles', item: `${siteUrl}/blog` },
            { '@type': 'ListItem', position: 3, name: article.title, item: url },
          ],
        }}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: article.title,
          description: article.dek,
          datePublished: article.publishedOn,
          image: `${siteUrl}${image.src}`,
          url,
          mainEntityOfPage: url,
          articleSection: article.category,
          author: { '@type': 'Organization', name: 'Your Hair Company', url: siteUrl },
          publisher: {
            '@type': 'Organization',
            name: 'Your Hair Company',
            url: siteUrl,
            email: SITE.supportEmail,
          },
        }}
      />

      <article>
        <header className="container-yhc pt-10 md:pt-16">
          <nav aria-label="Breadcrumb" className="text-[13px] text-muted-foreground">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link href="/blog" className="underline decoration-steel underline-offset-4 hover:text-ink">
                  Articles
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li>{article.category}</li>
            </ol>
          </nav>
          <div className="mt-8 max-w-4xl">
            <ReviewBadge status={article.reviewStatus} />
            <h1 className="display mt-5 text-[clamp(2.5rem,1.6rem+3.2vw,4.25rem)] text-balance">
              {article.title}
            </h1>
            <p className="mt-6 max-w-[60ch] text-lg leading-relaxed text-pretty text-body md:text-xl">
              {article.dek}
            </p>
            <div className="mt-8 border-t border-line pt-5">
              <ArticleMeta article={article} />
              <p className="mt-1.5 text-[13px] text-muted-foreground">
                Medical review:{' '}
                {article.reviewStatus === 'medically_reviewed'
                  ? `reviewed by ${doctor.name}`
                  : `pending — to be reviewed by ${doctor.name} before publishing`}
              </p>
            </div>
          </div>
        </header>

        <div className="container-yhc mt-10 md:mt-14">
          <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-[#efeeeb] md:aspect-[21/8]">
            <Image
              src={image.src}
              alt={image.alt}
              fill
              priority
              sizes="(min-width: 1200px) 1168px, 100vw"
              className="object-cover"
            />
          </div>
          <p className="mt-3 text-[12px] text-muted-foreground">
            Concept still life — not a treatment result.
          </p>
        </div>

        <div className="container-yhc grid gap-10 py-12 md:py-20 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-16">
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <TableOfContents entries={toc} />
          </aside>
          <div className="min-w-0">
            <ContentBlocks blocks={bodyBlocks} />

            {linked ? (
              <section aria-labelledby="sources" className="mt-14 max-w-[68ch] border-t border-line pt-8">
                <h2
                  id="sources"
                  className="scroll-mt-28 font-display text-[clamp(1.5rem,1.3rem+0.8vw,1.875rem)] leading-tight font-medium text-ink"
                >
                  Sources
                </h2>
                <ol className="mt-5 space-y-4">
                  {sources.map((src, i) => (
                    <li key={src.url} className="flex gap-4">
                      <span className="price w-6 shrink-0 pt-0.5 text-sm text-steel">{i + 1}.</span>
                      <div className="min-w-0">
                        <a
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[15px] font-medium [overflow-wrap:anywhere] text-ink underline decoration-steel underline-offset-4 hover:decoration-ink"
                        >
                          {src.title}
                          <ExternalLink
                            className="ml-1 inline size-3.5 align-[-2px] text-muted-foreground"
                            aria-hidden
                          />
                          <span className="sr-only"> (opens in a new tab)</span>
                        </a>
                        <p className="mt-0.5 text-sm [overflow-wrap:anywhere] text-muted-foreground">
                          {src.name}
                          {src.year ? ` · ${src.year}` : null}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
                {sourceNotes.map((n) => (
                  <p key={n.text} className="mt-6 text-sm leading-relaxed text-muted-foreground">
                    {n.text}
                  </p>
                ))}
              </section>
            ) : null}

            {/* Closing consult prompt */}
            <div className="mt-16 max-w-[68ch] rounded-2xl bg-obsidian p-7 text-on-dark md:p-10">
              <p className="font-display text-[clamp(1.75rem,1.4rem+1.2vw,2.25rem)] leading-tight">
                Questions about your own hair?
              </p>
              <p className="mt-3 leading-relaxed text-on-dark-muted">
                A one-to-one video consultation with {doctor.name} looks at your history and scalp photos and
                explains what is likely going on. There is no obligation to buy anything afterwards.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Button
                  asChild
                  className="h-12 bg-[image:var(--yhc-silver)] px-6 text-base font-semibold text-obsidian hover:opacity-95"
                >
                  <Link href="/book">Book a consultation</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-12 border-line-dark bg-transparent px-6 text-base text-on-dark hover:bg-graphite hover:text-on-dark"
                >
                  <Link href="/assessment">Take the assessment first</Link>
                </Button>
              </div>
            </div>
            <p className="mt-6 max-w-[68ch] text-sm leading-relaxed text-muted-foreground">
              {t('legal.disclaimer')}
            </p>
          </div>
        </div>
      </article>

      {related.length > 0 ? (
        <section className="border-t border-line bg-[#efeeeb]/60">
          <div className="container-yhc py-16 md:py-24">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <h2 className="display text-[clamp(2rem,1.5rem+2vw,2.75rem)] text-balance">Keep reading</h2>
              <Link
                href="/blog"
                className="inline-flex min-h-11 items-center text-sm font-medium text-ink underline decoration-steel underline-offset-[6px]"
              >
                All articles
              </Link>
            </div>
            <div className="mt-8 border-t border-line">
              {related.map((a) => (
                <ArticleRow key={a.slug} article={a} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
