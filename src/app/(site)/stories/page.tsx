import type { Metadata } from 'next';
import { getConsultTerms } from '@/components/site/consult-fee';
import { CtaBand } from '@/components/site/cta-band';
import { PageIntro } from '@/components/site/page-intro';
import { pageMetadata } from '@/components/site/seo';
import { StoriesEmpty } from '@/components/site/stories-empty';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = pageMetadata({
  title: 'Real stories',
  description:
    'Experiences shared by Your Hair Company patients — published only with their written consent, unretouched.',
  path: '/stories',
});

export default function StoriesPage() {
  const terms = getConsultTerms();
  // FR-M1-6: only reviews with stored publication consent would be listed here. None exist yet.
  return (
    <>
      <PageIntro
        title="Real stories"
        lede={
          <p>
            Hair changes are personal. We publish a story only when the patient has agreed in writing, and
            photos only with separate photo consent.
          </p>
        }
      />
      <section className="container-yhc py-12 md:py-16">
        <StoriesEmpty />
      </section>
      <CtaBand
        bookLabel={terms.bookLabel}
        body="Every story starts with a consultation. Yours can start today."
      />
    </>
  );
}
