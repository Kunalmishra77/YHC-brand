import { Mail } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { GuaranteeTerms } from '@/components/shared/pricing';
import { ContentBlocks, formatContentDate } from '@/components/site/article/content-blocks';
import { TableOfContents } from '@/components/site/article/table-of-contents';
import { getConsultTerms } from '@/components/site/consult-fee';
import { pageMetadata } from '@/components/site/seo';
import { t } from '@/i18n/en';
import { LEGAL_PAGES, SITE } from '@/lib/site';
import { getDoctor, getGuarantee } from '@/server/catalog';
import {
  getLegalDocument,
  getLegalSummary,
  grievanceOfficerLabel,
  isLegalSlug,
  type LegalContext,
} from '@/server/content/legal';
import { tocFromBlocks } from '@/server/content/types';
import { getSettingNumber } from '@/server/demo/store';

// Fees, reschedule window and guarantee visibility come from live settings.
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: PageProps<'/legal/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  if (!isLegalSlug(slug)) return { title: 'Page not found' };
  const doc = getLegalSummary(slug);
  return pageMetadata({ title: doc.title, description: doc.summary, path: `/legal/${slug}` });
}

function legalContext(): LegalContext {
  const terms = getConsultTerms();
  return {
    consultFee: terms.fee,
    freeRescheduleHours: getSettingNumber('consult.free_reschedule_hours'),
    creditLine: terms.creditLine,
    doctorName: getDoctor().name,
    supportEmail: SITE.supportEmail,
    grievanceName: grievanceOfficerLabel(),
    grievanceEmail: SITE.grievanceOfficer.email,
    guarantee: getGuarantee(),
  };
}

/*
 * Policy pages. Counsel review of the text is still pending (see src/server/content/legal.ts) — visitors
 * see a "Last reviewed" line, not a draft banner. The guarantee page keeps its own draft-terms label
 * (inside <GuaranteeTerms>) while the active guarantee policy is a draft.
 */
export default async function LegalPage({ params }: PageProps<'/legal/[slug]'>) {
  const { slug } = await params;
  if (!isLegalSlug(slug)) notFound();
  const ctx = legalContext();
  const doc = getLegalDocument(slug, ctx);
  const toc = tocFromBlocks(doc.blocks);
  const otherPolicies = LEGAL_PAGES.filter((p) => p.slug !== doc.slug);

  return (
    <>
      <header className="border-b border-line">
        <div className="container-yhc py-14 md:py-20">
          <nav aria-label="Breadcrumb" className="text-[13px] text-muted-foreground">
            <Link href="/legal" className="underline decoration-steel underline-offset-4 hover:text-ink">
              Legal and policies
            </Link>
          </nav>
          <h1 className="display mt-6 text-[clamp(2.5rem,1.7rem+3vw,4rem)] text-balance">{doc.title}</h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-pretty text-body">{doc.summary}</p>
          <p className="mt-8 text-[13px] text-muted-foreground">
            Last updated <time dateTime={doc.lastUpdated}>{formatContentDate(doc.lastUpdated)}</time>
            {toc.length > 1 ? (
              <>
                <span aria-hidden> · </span>
                {toc.length} sections
              </>
            ) : null}
          </p>
        </div>
      </header>

      <div className="container-yhc grid gap-10 py-12 md:py-20 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-16">
        <aside className="min-w-0 lg:sticky lg:top-28 lg:max-h-[calc(100dvh-8rem)] lg:[scrollbar-width:thin] lg:self-start lg:overflow-y-auto lg:overscroll-contain lg:pr-2">
          <TableOfContents entries={toc} />
          <nav aria-label="Other policies" className="mt-10 hidden lg:block">
            <p className="mb-3 text-[13px] font-medium text-muted-foreground">Other policies</p>
            <ul className="space-y-0.5 text-[14px]">
              {otherPolicies.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/legal/${p.slug}`}
                    className="flex min-h-9 items-center text-body hover:text-ink"
                  >
                    {p.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <article className="min-w-0">
          {doc.slug === 'guarantee' && ctx.guarantee ? (
            <div className="mb-12 max-w-[68ch]">
              <GuaranteeTerms policy={ctx.guarantee} />
            </div>
          ) : null}

          {doc.slug === 'grievance' ? (
            <dl className="mb-12 grid max-w-[68ch] gap-px overflow-hidden rounded-2xl bg-line-dark text-on-dark sm:grid-cols-2">
              <div className="bg-obsidian p-6">
                <dt className="text-[13px] text-on-dark-muted">{t('legal.grievance')}</dt>
                {/* TODO(client): grievance officer name and registered address — see docs/12 C (LEGAL_ENTITY) */}
                <dd className="mt-1.5 text-lg font-medium">{ctx.grievanceName}</dd>
              </div>
              <div className="bg-obsidian p-6">
                <dt className="text-[13px] text-on-dark-muted">Email</dt>
                <dd className="mt-1.5">
                  <a
                    href={`mailto:${SITE.grievanceOfficer.email}`}
                    className="inline-flex items-center gap-2 text-lg font-medium break-all underline decoration-steel underline-offset-[6px]"
                  >
                    <Mail className="size-4 shrink-0" aria-hidden />
                    {SITE.grievanceOfficer.email}
                  </a>
                </dd>
              </div>
              <div className="bg-obsidian p-6 sm:col-span-2">
                <dt className="text-[13px] text-on-dark-muted">Response times</dt>
                <dd className="mt-1.5">Acknowledged within 48 hours · resolved within one month</dd>
              </div>
            </dl>
          ) : null}

          <ContentBlocks blocks={doc.blocks} />

          <div className="mt-16 max-w-[68ch] border-t border-line pt-6 text-sm text-muted-foreground">
            <p>
              Last reviewed <time dateTime={doc.lastReviewed}>{formatContentDate(doc.lastReviewed)}</time>. If
              anything here is unclear, write to{' '}
              <a
                href={`mailto:${SITE.supportEmail}`}
                className="break-all text-ink underline decoration-steel underline-offset-4"
              >
                {SITE.supportEmail}
              </a>
              .
            </p>
            <nav aria-label="All policies" className="mt-6 lg:hidden">
              <p className="mb-2 font-medium text-ink">Other policies</p>
              <ul className="divide-y divide-line border-y border-line">
                {otherPolicies.map((p) => (
                  <li key={p.slug}>
                    <Link
                      href={`/legal/${p.slug}`}
                      className="flex min-h-12 items-center text-body hover:text-ink"
                    >
                      {p.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </article>
      </div>
    </>
  );
}
