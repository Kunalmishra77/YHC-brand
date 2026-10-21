import type { Metadata } from 'next';
import Link from 'next/link';
import { EmptyState } from '@/components/shared/states';
import { getConsultTerms } from '@/components/site/consult-fee';
import { ConcernList } from '@/components/site/concern-list';
import { CtaBand } from '@/components/site/cta-band';
import { PageIntro } from '@/components/site/page-intro';
import { pageMetadata } from '@/components/site/seo';
import { IMAGES } from '@/lib/images';
import { getConcerns } from '@/server/catalog';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = pageMetadata({
  title: 'Hair concerns',
  description:
    'Hair fall, thinning, a receding hairline, crown thinning or scalp problems: what each one can mean, common causes, and how a consultation helps.',
  path: '/concerns',
});

export default function ConcernsPage() {
  const concerns = getConcerns();
  const terms = getConsultTerms();
  return (
    <>
      <PageIntro
        title="Hair concerns"
        image={IMAGES.serum}
        lede={
          <p>
            Tap the one that looks most like you. Not sure? The{' '}
            <Link href="/start" className="text-brand underline underline-offset-4">
              free 3D scan
            </Link>{' '}
            shows you a next step.
          </p>
        }
      />
      <section className="container-yhc py-16 md:py-24">
        {concerns.length ? (
          <ConcernList concerns={concerns} />
        ) : (
          <EmptyState
            title="Guides coming soon"
            body="Dr. Tyagi checks every guide before we publish it. Until then, a consultation covers every concern."
          />
        )}
      </section>
      <CtaBand
        bookLabel={terms.bookLabel}
        body="Whatever you are noticing, a consultation is the fastest way to understand it."
      />
    </>
  );
}
