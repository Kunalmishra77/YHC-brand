import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getConsultTerms } from '@/components/site/consult-fee';
import { CtaBand } from '@/components/site/cta-band';
import { JsonLd } from '@/components/site/json-ld';
import { pageMetadata } from '@/components/site/seo';
import { t } from '@/i18n/en';
import { clientEnv } from '@/lib/env';
import { getConcern, getConcerns } from '@/server/catalog';

export const dynamic = 'force-dynamic';

export function generateStaticParams() {
  return getConcerns().map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<'/concerns/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  const concern = getConcern(slug);
  if (!concern) return { title: 'Concern not found' };
  return pageMetadata({
    title: concern.title,
    description: `${concern.summary} What it can mean, and how a consultation with Dr. Tyagi helps.`,
    path: `/concerns/${concern.slug}`,
  });
}

export default async function ConcernPage({ params }: PageProps<'/concerns/[slug]'>) {
  const { slug } = await params;
  const concern = getConcern(slug);
  if (!concern) notFound();
  const others = getConcerns().filter((c) => c.slug !== concern.slug);
  const terms = getConsultTerms();
  const base = clientEnv.NEXT_PUBLIC_SITE_URL;

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: base },
            { '@type': 'ListItem', position: 2, name: 'Hair concerns', item: `${base}/concerns` },
            {
              '@type': 'ListItem',
              position: 3,
              name: concern.title,
              item: `${base}/concerns/${concern.slug}`,
            },
          ],
        }}
      />
      <article>
        <header className="border-b border-line">
          <div className="container-yhc py-12 md:py-20">
            <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
              <Link href="/concerns" className="underline underline-offset-2 hover:text-ink">
                Hair concerns
              </Link>{' '}
              / <span className="text-body">{concern.title}</span>
            </nav>
            <h1 className="display mt-4 text-3xl">{concern.title}</h1>
            <p className="mt-4 max-w-2xl text-lg text-body">{concern.summary}</p>
          </div>
        </header>

        <div className="container-yhc grid gap-12 py-12 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:py-16">
          <div className="space-y-6 text-body">
            <p className="text-lg">{concern.body}</p>
            {/* TODO(client): full medically reviewed article per concern — see docs/12 (content) */}
            <h2 className="text-xl font-semibold text-ink">What happens at the consultation</h2>
            <p>
              Dr. Tyagi asks when you first noticed the change, looks at your scalp photos and history, and
              explains what may be behind it. If treatment is right for you, you receive a plan chosen for
              your pattern. {t('common.resultsVary')}
            </p>
            <p className="text-sm text-muted-foreground">{t('legal.disclaimer')}</p>
          </div>
          <aside className="h-fit rounded-xl border border-line bg-card p-6">
            <h2 className="font-semibold text-ink">Your next step</h2>
            <p className="mt-2 text-sm text-body">
              Book a {terms.slotMinutes}-minute video consultation, or take the free assessment first if
              you&apos;re unsure.
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <Link
                href="/book"
                className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                {terms.bookLabel}
              </Link>
              <Link
                href="/assessment"
                className="inline-flex h-12 items-center justify-center rounded-md border border-steel px-5 text-sm font-medium text-ink hover:bg-mist"
              >
                {t('common.freeAssessment')}
              </Link>
            </div>
          </aside>
        </div>
      </article>

      {others.length ? (
        <section className="container-yhc pb-14 md:pb-20">
          <h2 className="text-lg font-semibold text-ink">Other concerns</h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {others.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/concerns/${c.slug}`}
                  className="inline-flex min-h-11 items-center rounded-full border border-line px-4 text-sm text-ink hover:border-steel"
                >
                  {c.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <CtaBand
        bookLabel={terms.bookLabel}
        body={`${concern.title} has more than one possible cause. A consultation is how you find out which applies to you.`}
      />
    </>
  );
}
