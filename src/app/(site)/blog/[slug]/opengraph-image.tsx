import { getArticle } from '@/server/content/articles';
import { OG_CONTENT_TYPE, OG_SIZE, brandCard } from '@/server/og/brand-card';

export const alt = 'Hair health article — Your Hair Company';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticle(slug);
  return brandCard({
    eyebrow: article ? `Article · ${article.category}` : 'Articles',
    title: article ? (article.seoTitle ?? article.title) : 'Hair health articles',
    subtitle: article ? `${article.readingMinutes}-minute read · general information, not a diagnosis` : undefined,
    backdrop: 'hairMacro',
  });
}
