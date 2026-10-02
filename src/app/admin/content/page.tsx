import { BookOpenText, MessageSquareQuote } from 'lucide-react';
import { DataList } from '@/components/admin/data-list';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/states';
import { StatusChip } from '@/components/shared/status-chip';
import type { Concern, Faq } from '@/lib/domain/types';
import { requireAdminPage } from '@/server/admin/guard';
import { CONCERNS, FAQS } from '@/server/demo/fixtures';

export const metadata = { title: 'Content' };

function Section({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="space-y-3">
      <div>
        <h2 id={id} className="text-base font-semibold text-ink">
          {title}
        </h2>
        <p className="text-[13px] text-muted-foreground">{description}</p>
      </div>
      {children}
    </section>
  );
}

export default async function ContentPage() {
  await requireAdminPage();
  return (
    <div className="space-y-8">
      <PageHeader
        title="Content"
        description="Medical wording is approved by Dr. Tyagi before it goes live. No “cure”, “100%”, “permanent” or fixed timelines (PRD §15)."
      />

      <Section id="concerns-title" title="Hair concerns" description={`${CONCERNS.length} pages · /concerns`}>
        <DataList<Concern>
          rows={CONCERNS}
          rowKey={(c) => c.slug}
          caption="Concerns"
          columns={[
            { header: 'Title', cell: (c) => <span className="font-medium text-ink">{c.title}</span> },
            {
              header: 'Summary',
              className: 'max-w-md',
              cell: (c) => <span className="text-sm">{c.summary}</span>,
            },
            {
              header: 'Slug',
              cell: (c) => <code className="text-[12px] text-muted-foreground">{c.slug}</code>,
            },
            {
              header: 'Status',
              cell: () => <StatusChip tone="warning">Draft copy · review pending</StatusChip>,
            },
          ]}
        />
      </Section>

      <Section id="faqs-title" title="FAQs" description={`${FAQS.length} questions · grouped by category`}>
        <DataList<Faq>
          rows={FAQS}
          rowKey={(f) => f.id}
          caption="FAQs"
          columns={[
            { header: 'Question', cell: (f) => <span className="font-medium text-ink">{f.question}</span> },
            { header: 'Category', cell: (f) => <span className="text-sm capitalize">{f.category}</span> },
            {
              header: 'Answer',
              className: 'max-w-lg',
              cell: (f) => <span className="text-[13px] text-body">{f.answer}</span>,
            },
          ]}
        />
      </Section>

      <Section id="blog-title" title="Blog" description="Articles on hair and scalp health">
        <EmptyState
          icon={BookOpenText}
          title="No articles yet"
          body="Every article requires medical review before publishing."
        />
      </Section>

      <Section
        id="reviews-title"
        title="Reviews moderation"
        description="Customer reviews and before/after photos"
      >
        <EmptyState
          icon={MessageSquareQuote}
          title="No reviews to moderate"
          body="A review can only be approved when the customer has given review-publication consent. We never invent reviews."
        />
      </Section>
    </div>
  );
}
