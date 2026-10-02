import { FileWarning } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { GuaranteeTerms } from '@/components/shared/pricing';
import { pageMetadata } from '@/components/site/seo';
import { t } from '@/i18n/en';
import { LEGAL_PAGES, SITE } from '@/lib/site';
import { getGuarantee } from '@/server/catalog';

export const dynamic = 'force-dynamic';

type LegalSlug = (typeof LEGAL_PAGES)[number]['slug'];

// TODO(client): counsel-approved legal text for every page — see docs/12 (legal) and docs/09
const SUMMARY: Record<LegalSlug, string[]> = {
  privacy: [
    'What we collect: your contact details, booking and order history, and — for your consultation only — your health details and scalp photos.',
    'Health details and photos are kept for your doctor. Our sales and support team cannot see them, and they are never used in marketing messages.',
    'You can ask for a copy of your data, or for it to be corrected or deleted, by writing to the grievance officer.',
  ],
  terms: [
    'Your Hair Company provides online consultations with a registered doctor and sells the products they prescribe.',
    'Treatment is prescribed only after a consultation. Consultations are for adults aged 18 and over.',
    'Information on this site is general education and is not a substitute for medical advice.',
  ],
  'refund-cancellation': [
    'Consultation fee: rescheduling and refund rules are being finalised and will be listed here.',
    'Orders: what can be cancelled or returned before and after dispatch will be listed here.',
    'Refunds go back to the original payment method.',
  ],
  shipping: [
    'We deliver across India through our courier partners. Tracking is shared on WhatsApp as soon as your order ships.',
    'Delivery time depends on your PIN code; the confirmed service levels will be listed here.',
  ],
  guarantee: [
    'The money-back guarantee applies only when every condition in the active terms is met. A doctor reviews every claim.',
  ],
  'medical-disclaimer': [
    t('legal.disclaimer'),
    'Hair responds slowly and differently for everyone. We do not promise specific outcomes or timelines.',
    'If you have a medical emergency, contact your nearest hospital — this service is not for emergencies.',
  ],
  grievance: [
    'If something has gone wrong and our support team has not resolved it, you can write to our grievance officer.',
    'We acknowledge every grievance and share a reference number.',
  ],
};

export function generateStaticParams() {
  return LEGAL_PAGES.map((p) => ({ slug: p.slug }));
}

function findPage(slug: string) {
  return LEGAL_PAGES.find((p) => p.slug === slug) ?? null;
}

export async function generateMetadata({ params }: PageProps<'/legal/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  const page = findPage(slug);
  if (!page) return { title: 'Page not found' };
  return pageMetadata({
    title: page.title,
    description: `${page.title} for Your Hair Company — doctor-led hair care.`,
    path: `/legal/${page.slug}`,
  });
}

export default async function LegalPage({ params }: PageProps<'/legal/[slug]'>) {
  const { slug } = await params;
  const page = findPage(slug);
  if (!page) notFound();
  const guarantee = page.slug === 'guarantee' ? getGuarantee() : null;

  return (
    <div className="container-yhc grid gap-10 py-12 md:grid-cols-[220px_minmax(0,1fr)] md:py-16">
      <nav aria-label="Legal pages" className="order-last md:order-first">
        <ul className="divide-y divide-line border-y border-line text-sm md:sticky md:top-24">
          {LEGAL_PAGES.map((p) => (
            <li key={p.slug}>
              <Link
                href={`/legal/${p.slug}`}
                aria-current={p.slug === page.slug ? 'page' : undefined}
                className="flex min-h-11 items-center py-2 text-body hover:text-ink aria-[current=page]:font-semibold aria-[current=page]:text-ink"
              >
                {p.title}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <article className="max-w-3xl">
        <h1 className="display text-3xl">{page.title}</h1>
        <p
          role="note"
          className="mt-5 flex items-start gap-2 rounded-md bg-warning-bg px-4 py-3 text-sm text-warning"
        >
          <FileWarning className="mt-0.5 size-4 shrink-0" aria-hidden />
          Draft — to be replaced with counsel-approved text.
        </p>

        <div className="mt-8 space-y-4 text-body">
          {SUMMARY[page.slug].map((para) => (
            <p key={para}>{para}</p>
          ))}
        </div>

        {page.slug === 'guarantee' ? (
          <div className="mt-8">
            {guarantee ? (
              <GuaranteeTerms policy={guarantee} />
            ) : (
              <p className="rounded-lg border border-line bg-card p-5 text-body">
                No money-back guarantee is currently offered. If one is introduced, its full conditions will
                be published here first.
              </p>
            )}
          </div>
        ) : null}

        {page.slug === 'grievance' ? (
          <dl className="mt-8 divide-y divide-line border-y border-line">
            <div className="grid gap-1 py-4 sm:grid-cols-[180px_1fr]">
              <dt className="text-sm text-muted-foreground">{t('legal.grievance')}</dt>
              <dd className="font-medium text-ink">{SITE.grievanceOfficer.name}</dd>
            </div>
            <div className="grid gap-1 py-4 sm:grid-cols-[180px_1fr]">
              <dt className="text-sm text-muted-foreground">Email</dt>
              <dd>
                <a
                  href={`mailto:${SITE.grievanceOfficer.email}`}
                  className="font-medium text-brand underline underline-offset-4"
                >
                  {SITE.grievanceOfficer.email}
                </a>
              </dd>
            </div>
          </dl>
        ) : null}

        <p className="mt-10 text-sm text-muted-foreground">
          Questions about this page? Email{' '}
          <a href={`mailto:${SITE.supportEmail}`} className="underline underline-offset-2">
            {SITE.supportEmail}
          </a>
          .
        </p>
      </article>
    </div>
  );
}
