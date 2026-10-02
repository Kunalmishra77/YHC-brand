import type { Metadata } from 'next';
import Link from 'next/link';
import { PageIntro } from '@/components/site/page-intro';
import { pageMetadata } from '@/components/site/seo';
import { LEGAL_PAGES } from '@/lib/site';

export const metadata: Metadata = pageMetadata({
  title: 'Legal',
  description:
    'Privacy, terms, refunds, shipping, guarantee terms, medical disclaimer and grievance officer.',
  path: '/legal',
});

export default function LegalIndexPage() {
  return (
    <>
      <PageIntro title="Legal and policies" />
      <section className="container-yhc py-10 md:py-14">
        <ul className="max-w-2xl divide-y divide-line border-y border-line">
          {LEGAL_PAGES.map((p) => (
            <li key={p.slug}>
              <Link
                href={`/legal/${p.slug}`}
                className="flex min-h-14 items-center py-3 font-medium text-ink hover:text-brand"
              >
                {p.title}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
