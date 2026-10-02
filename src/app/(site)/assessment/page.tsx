import type { Metadata } from 'next';
import { getConsultTerms } from '@/components/site/consult-fee';
import { pageMetadata } from '@/components/site/seo';
import { getConcerns } from '@/server/catalog';
import { AssessmentQuiz } from './assessment-quiz';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = pageMetadata({
  title: 'Free hair assessment',
  description:
    'Eight short questions about your hair. Get a suggested next step in about 2 minutes — not a diagnosis.',
  path: '/assessment',
});

export default function AssessmentPage() {
  const terms = getConsultTerms();
  return (
    <section className="container-yhc grid gap-10 py-10 md:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] md:py-16">
      <div>
        <h1 className="display text-3xl">Free hair assessment</h1>
        <p className="mt-4 text-body">
          Eight short questions, about 2 minutes. At the end you&apos;ll see a suggested next step and what to
          mention at your consultation.
        </p>
        <p className="mt-4 text-sm text-muted-foreground">
          This is not a diagnosis. Your answers are treated as clinical information and are never shown to our
          sales team.
        </p>
      </div>
      <AssessmentQuiz concerns={getConcerns()} bookLabel={terms.bookLabel} />
    </section>
  );
}
