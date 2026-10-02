import { NotebookPen } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { EmptyState } from '@/components/shared/states';
import { PageIntro } from '@/components/site/page-intro';
import { pageMetadata } from '@/components/site/seo';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = pageMetadata({
  title: 'Hair health articles',
  description:
    'Articles on hair and scalp health from Your Hair Company, each medically reviewed by Dr. Tyagi before publishing.',
  path: '/blog',
});

export default function BlogPage() {
  // FR-M1-4: posts need medically_reviewed = true before publishing. None are published yet.
  // TODO(client): first articles for Dr. Tyagi's review — see docs/12 (content)
  return (
    <>
      <PageIntro title="Articles" lede={<p>Plain-English guides to hair and scalp health.</p>} />
      <section className="container-yhc py-12 md:py-16">
        <EmptyState
          icon={NotebookPen}
          title="Articles are published only after Dr. Tyagi's medical review"
          body="The first guides are with Dr. Tyagi now. Until then, the hair concern pages cover the basics."
          action={
            <Button asChild variant="outline" className="h-11 border-steel px-5">
              <Link href="/concerns">Read about hair concerns</Link>
            </Button>
          }
        />
      </section>
    </>
  );
}
