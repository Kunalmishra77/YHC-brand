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
    'Hair fall, thinning, a receding hairline, crown thinning or scalp problems — what each can mean and how a consultation helps.',
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
            Choose what sounds most like you. Not sure? The{' '}
            <Link href="/assessment" className="text-brand underline underline-offset-4">
              free hair assessment
            </Link>{' '}
            suggests a next step in about 2 minutes.
          </p>
        }
      />
      <section className="container-yhc py-16 md:py-24">
        {concerns.length ? (
          <ConcernList concerns={concerns} />
        ) : (
          <EmptyState
            title="Concern guides are being written"
            body="Each guide is reviewed by Dr. Tyagi before it is published. In the meantime, a consultation covers every concern."
          />
        )}
      </section>
      <CtaBand
        bookLabel={terms.bookLabel}
        body="Whatever you are noticing, a consultation is the quickest way to understand it."
      />
    </>
  );
}
