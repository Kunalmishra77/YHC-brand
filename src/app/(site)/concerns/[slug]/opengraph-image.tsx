import { concernKeyFromParam } from '@/lib/concern-path';
import { getConcern } from '@/server/catalog';
import { OG_CONTENT_TYPE, OG_SIZE, brandCard } from '@/server/og/brand-card';

export const alt = 'Hair concern guide — Your Hair Company';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const key = concernKeyFromParam(slug);
  const concern = key ? getConcern(key) : null;
  return brandCard({
    eyebrow: 'Hair concern',
    title: concern?.title ?? 'Hair concerns',
    subtitle: concern?.summary ?? 'What each can mean, and how a consultation helps.',
    backdrop: 'hairMacro',
  });
}
