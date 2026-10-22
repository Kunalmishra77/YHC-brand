import Image from 'next/image';
import Link from 'next/link';
import { IMAGES, type SiteImage } from '@/lib/images';
import { SLOTS } from '@/lib/slots';
import { cn } from '@/lib/utils';
import { IMG_HOVER_ZOOM } from '../section';
import type { Article } from '@/server/content/types';
import { formatContentDate } from './content-blocks';
import { ReviewBadge } from './review-badge';

/** Article image slots B01–B05 by slug (YHC_IMAGE_PROMPTS.md); other articles keep their own image. */
const ARTICLE_SLOT: Record<string, SiteImage> = {
  'hair-shedding-vs-hair-loss': SLOTS.B01,
  'hair-growth-cycle-explained': SLOTS.B02,
  'what-happens-in-a-video-consultation': SLOTS.B03,
  'how-to-take-scalp-photos': SLOTS.B04,
  'nutrition-and-hair': SLOTS.B05,
};

export function articleImage(article: Pick<Article, 'image' | 'slug'>): SiteImage {
  return ARTICLE_SLOT[article.slug] ?? IMAGES[article.image];
}

/** Category · reading time · date — one quiet line. */
export function ArticleMeta({ article, tone = 'light' }: { article: Article; tone?: 'light' | 'dark' }) {
  return (
    <p
      className={cn(
        'flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px]',
        tone === 'dark' ? 'text-on-dark-muted' : 'text-muted-foreground',
      )}
    >
      <span className={cn('font-medium', tone === 'dark' ? 'text-on-dark' : 'text-ink')}>
        {article.category}
      </span>
      <span aria-hidden>·</span>
      <span>{article.readingMinutes} min read</span>
      <span aria-hidden>·</span>
      <time dateTime={article.publishedOn}>{formatContentDate(article.publishedOn)}</time>
    </p>
  );
}

/** Editorial list row: text first, small still-life on the right from `sm` up. No card chrome. */
export function ArticleRow({
  article,
  headingLevel = 'h3',
}: {
  article: Article;
  headingLevel?: 'h2' | 'h3';
}) {
  const image = articleImage(article);
  const Heading = headingLevel;
  return (
    <article className="group relative grid gap-5 border-b border-line py-8 sm:grid-cols-[minmax(0,1fr)_180px] sm:gap-10 md:py-10">
      <div className="min-w-0">
        <ArticleMeta article={article} />
        <Heading className="mt-3 font-display text-[clamp(1.75rem,1.4rem+1.2vw,2.375rem)] leading-[1.15] font-medium text-balance text-ink">
          <Link
            href={`/blog/${article.slug}`}
            className="underline decoration-transparent underline-offset-[6px] group-hover:decoration-steel after:absolute after:inset-0"
          >
            {article.title}
          </Link>
        </Heading>
        <p className="mt-3 max-w-[60ch] leading-relaxed text-body">{article.dek}</p>
        <ReviewBadge status={article.reviewStatus} className="mt-4" />
      </div>
      <div className="relative order-first aspect-[16/9] overflow-hidden rounded-2xl bg-[#efeeeb] sm:order-none sm:aspect-square">
        <Image
          src={image.src}
          alt=""
          fill
          sizes="(min-width: 640px) 180px, 100vw"
          className={cn('object-cover', IMG_HOVER_ZOOM)}
        />
      </div>
    </article>
  );
}
