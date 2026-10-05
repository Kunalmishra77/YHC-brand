import type { Metadata } from 'next';
import Link from 'next/link';
import { formatContentDate } from '@/components/site/article/content-blocks';
import { pageMetadata } from '@/components/site/seo';
import { LEGAL_PAGES, SITE } from '@/lib/site';
import { getLegalSummary, isLegalSlug, LEGAL_ENTITY } from '@/server/content/legal';

export const metadata: Metadata = pageMetadata({
  title: 'Legal',
  description:
    'Privacy Policy, Terms & Conditions, Refund Policy, shipping, guarantee terms, medical disclaimer and grievance officer.',
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
          <h1 className="display text-[clamp(2.5rem,1.7rem+3vw,4rem)] text-balance">Legal and policies</h1>
          <div className="space-y-4">
            <p className="text-lg leading-relaxed text-body">
              How we handle your data, your orders and your care — written to be read, not skimmed past.
            </p>
            {/* Counsel review pending (src/server/content/legal.ts) — no draft banner shown to visitors. */}
            <p className="text-[13px] text-muted-foreground">
              Last reviewed{' '}
              <time dateTime={LEGAL_ENTITY.lastReviewed}>{formatContentDate(LEGAL_ENTITY.lastReviewed)}</time>
            </p>
          </div>
        </div>
      </section>

      <section className="container-yhc py-16 md:py-24">
        <ol className="border-t border-line">
          {docs.map((d, i) => (
            <li key={d.slug} className="group relative border-b border-line">
              <div className="grid gap-2 py-7 md:grid-cols-[64px_minmax(0,1fr)] md:items-baseline md:gap-x-8 md:py-9 lg:grid-cols-[64px_minmax(0,5fr)_minmax(0,6fr)_auto]">
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
                <p className="max-w-[60ch] leading-relaxed text-pretty text-body md:col-start-2 lg:col-start-auto">
                  {d.summary}
                </p>
                <p className="text-[13px] whitespace-nowrap text-muted-foreground md:col-start-2 lg:col-start-auto">
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
