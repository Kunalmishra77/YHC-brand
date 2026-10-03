import { FileWarning } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { formatContentDate } from '@/components/site/article/content-blocks';
import { pageMetadata } from '@/components/site/seo';
import { LEGAL_PAGES, SITE } from '@/lib/site';
import { getLegalSummary, isLegalSlug } from '@/server/content/legal';

export const metadata: Metadata = pageMetadata({
  title: 'Legal',
  description:
    'Privacy, terms, refunds, shipping, guarantee terms, medical disclaimer and grievance officer.',
  path: '/legal',
});

export default function LegalIndexPage() {
  const docs = LEGAL_PAGES.map((p) => p.slug)
    .filter(isLegalSlug)
    .map((slug) => getLegalSummary(slug));

  return (
    <>
      <section className="border-b border-line">
        <div className="container-yhc grid gap-8 py-16 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:items-end md:py-24">
          <h1 className="display text-[clamp(2.5rem,1.7rem+3vw,4rem)]">Legal and policies</h1>
          <div className="space-y-4">
            <p className="text-lg leading-relaxed text-body">
              How we handle your data, your orders and your care — written to be read, not skimmed past.
            </p>
            <p
              role="note"
              className="inline-flex items-start gap-2 rounded-md bg-warning-bg px-3.5 py-2 text-[13px] text-warning"
            >
              <FileWarning className="mt-px size-4 shrink-0" aria-hidden />
              Draft — to be replaced with counsel-approved text.
            </p>
          </div>
        </div>
      </section>

      <section className="container-yhc py-12 md:py-20">
        <ol className="border-t border-line">
          {docs.map((d, i) => (
            <li key={d.slug} className="group relative border-b border-line">
              <div className="grid gap-2 py-7 md:grid-cols-[64px_minmax(0,5fr)_minmax(0,6fr)_auto] md:items-baseline md:gap-8 md:py-9">
                <span className="font-display text-2xl leading-none text-steel" aria-hidden>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h2 className="font-display text-[clamp(1.75rem,1.45rem+1vw,2.25rem)] leading-tight font-medium text-ink">
                  <Link
                    href={`/legal/${d.slug}`}
                    className="underline decoration-transparent underline-offset-[6px] group-hover:decoration-steel after:absolute after:inset-0"
                  >
                    {d.title}
                  </Link>
                </h2>
                <p className="leading-relaxed text-body">{d.summary}</p>
                <p className="text-[13px] whitespace-nowrap text-muted-foreground">
                  Updated <time dateTime={d.lastUpdated}>{formatContentDate(d.lastUpdated)}</time>
                </p>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-10 max-w-2xl text-sm text-body">
          Something not covered here? Write to{' '}
          <a
            href={`mailto:${SITE.supportEmail}`}
            className="text-ink underline decoration-steel underline-offset-4"
          >
            {SITE.supportEmail}
          </a>{' '}
          or the{' '}
          <Link href="/legal/grievance" className="text-ink underline decoration-steel underline-offset-4">
            grievance officer
          </Link>
          .
        </p>
      </section>
    </>
  );
}
