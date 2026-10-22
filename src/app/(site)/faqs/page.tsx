import type { Metadata } from 'next';
import Link from 'next/link';
import { EmptyState } from '@/components/shared/states';
import { getConsultTerms } from '@/components/site/consult-fee';
import { CtaBand } from '@/components/site/cta-band';
import { FaqList, visibleFaqs } from '@/components/site/faq-list';
import { JsonLd } from '@/components/site/json-ld';
import { PageIntro } from '@/components/site/page-intro';
import { Reveal } from '@/components/site/reveal';
import { SECTION_Y } from '@/components/site/section';
import { pageMetadata } from '@/components/site/seo';
import type { Faq } from '@/lib/domain/types';
import { SITE } from '@/lib/site';
import { SLOTS } from '@/lib/slots';
import { getFaqs, getGuarantee } from '@/server/catalog';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = pageMetadata({
  title: 'FAQs',
  description:
    'Simple answers about the scan, the consultation, plans, delivery and the money-back guarantee conditions at Your Hair Company.',
  path: '/faqs',
});

const CATEGORY_LABEL: Record<string, string> = {
  scan: 'The scan and your report',
  consultation: 'Consultation',
  results: 'Treatment and what to expect',
  plans: 'Plans and prices',
  guarantee: 'Money-back guarantee',
  delivery: 'Delivery',
  privacy: 'Privacy',
};

/** Display order of FAQ groups; unknown categories follow in the order they appear. */
const CATEGORY_ORDER = ['scan', 'consultation', 'results', 'plans', 'guarantee', 'delivery', 'privacy'];

function categoryRank(category: string): number {
  const i = CATEGORY_ORDER.indexOf(category);
  return i === -1 ? CATEGORY_ORDER.length : i;
}

export default function FaqsPage() {
  const faqs = visibleFaqs(getFaqs(), getGuarantee() !== null);
  const terms = getConsultTerms();
  const groups = faqs.reduce<Map<string, Faq[]>>((acc, f) => {
    acc.set(f.category, [...(acc.get(f.category) ?? []), f]);
    return acc;
  }, new Map());

  return (
    <>
      {faqs.length ? (
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqs.map((f) => ({
              '@type': 'Question',
              name: f.question,
              acceptedAnswer: { '@type': 'Answer', text: f.answer },
            })),
          }}
        />
      ) : null}
      <PageIntro
        title="Your questions, answered"
        image={SLOTS.H27}
        lede={
          <p>
            Can&apos;t find your answer?{' '}
            <a
              href={SITE.whatsappUrl}
              className="font-medium text-ink underline decoration-steel underline-offset-4 hover:decoration-current"
            >
              {SITE.whatsappAvailable ? 'Message us on WhatsApp' : 'Send us a message'}
            </a>{' '}
            or{' '}
            <Link
              href="/contact"
              className="font-medium text-ink underline decoration-steel underline-offset-4 hover:decoration-current"
            >
              contact us
            </Link>
            .
          </p>
        }
      />
      <div className={`container-yhc space-y-12 md:space-y-16 ${SECTION_Y}`}>
        {faqs.length === 0 ? (
          <EmptyState
            title="We are updating our answers"
            body="Message us on WhatsApp and we will answer you directly."
          />
        ) : (
          [...groups]
            .sort(([a], [b]) => categoryRank(a) - categoryRank(b))
            .map(([category, items]) => (
              <section
                key={category}
                className="grid gap-6 border-t border-line pt-10 first:border-t-0 first:pt-0 md:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] md:gap-10"
                aria-labelledby={`faq-${category}`}
              >
                <h2
                  id={`faq-${category}`}
                  className="font-display text-[1.75rem] leading-tight font-medium text-ink md:sticky md:top-24 md:self-start"
                >
                  {CATEGORY_LABEL[category] ?? category}
                </h2>
                <Reveal>
                  <FaqList faqs={items} />
                </Reveal>
              </section>
            ))
        )}
      </div>
      <CtaBand
        id="faqs-cta-heading"
        image={SLOTS.H10}
        imagePosition="60% 50%"
        title="Ask about your own hair."
        bookLabel={terms.bookLabel}
        body="The best answers are about your own hair. Ask Dr. Tyagi at your consultation."
      />
    </>
  );
}
