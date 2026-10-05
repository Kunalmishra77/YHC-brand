import Link from 'next/link';
import { Logo } from '@/components/shared/logo';
import { t } from '@/i18n/en';
import type { Doctor } from '@/lib/domain/types';
import { LEGAL_PAGES, SITE } from '@/lib/site';
import { cn } from '@/lib/utils';
import { LEGAL_ENTITY } from '@/server/content/legal';

interface FooterLink {
  href: string;
  label: string;
}

const EXPLORE: FooterLink[] = [
  { href: '/science', label: t('nav.science') },
  { href: '/how-it-works', label: t('nav.howItWorks') },
  { href: '/results', label: t('nav.results') },
  { href: '/guarantee', label: t('nav.guarantee') },
  { href: '/concerns', label: t('nav.concerns') },
  { href: '/plans', label: t('nav.plans') },
  { href: '/products', label: t('nav.products') },
  { href: '/blog', label: 'Journal' },
  { href: '/about', label: 'About YHC' },
];

const PATIENTS: FooterLink[] = [
  { href: '/start', label: t('nav.beginScan') },
  { href: '/book', label: t('common.bookConsultation') },
  { href: '/doctor-tyagi', label: t('nav.doctor') },
  { href: '/account', label: t('nav.account') },
  { href: '/faqs', label: t('nav.faqs') },
  { href: '/contact', label: 'Contact us' },
];

const LEGAL: FooterLink[] = LEGAL_PAGES.map((p) => ({ href: `/legal/${p.slug}`, label: p.title }));

/** Row link: a 44 px tap row on phones, a compact list from md. */
const LINK =
  'inline-flex min-h-11 items-center text-sm text-on-dark-muted transition-colors hover:text-on-dark md:min-h-0 md:py-1.5';

/**
 * Footer: brand, doctor credentials and contact; Explore / Patients / Legal columns; the medical
 * disclaimer and grievance officer (FR-M1-9, FR-M14-6); then one bottom bar with the copyright line and
 * the key policies.
 */
export function SiteFooter({ doctor }: { doctor: Doctor }) {
  // TODO(client): grievance officer name — see docs/12 C (set LEGAL_ENTITY.grievanceOfficerName)
  const grievanceName = LEGAL_ENTITY.grievanceOfficerName;
  const primaryPolicies = LEGAL_PAGES.filter((p) => p.primary);
  return (
    <footer className="mt-auto bg-obsidian pb-[calc(6rem+env(safe-area-inset-bottom))] text-on-dark-muted md:pb-0">
      <div className="container-yhc grid grid-cols-2 gap-x-6 gap-y-10 pt-14 pb-10 md:grid-cols-3 md:gap-x-10 md:pt-20 md:pb-14 lg:grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(0,1fr))] lg:gap-x-12">
        {/* Brand + credentials + contact */}
        <div className="col-span-2 md:col-span-3 lg:col-span-1">
          <Logo tone="light" />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-pretty">
            Science-first hair care. A dermatologist reviews every case before anything is prescribed.
          </p>
          <dl className="mt-6 grid max-w-sm gap-3 border-t border-line-dark pt-5 text-sm">
            <div>
              <dt className="text-[12px] tracking-[0.08em] text-on-dark-muted/80 uppercase">Lead doctor</dt>
              <dd className="mt-0.5 text-on-dark">
                {doctor.name}, {doctor.qualifications}
              </dd>
            </div>
            <div>
              <dt className="text-[12px] tracking-[0.08em] text-on-dark-muted/80 uppercase">Registration</dt>
              <dd className="mt-0.5 text-on-dark">
                <span className="price">Reg. No. {doctor.registrationNo}</span> · {doctor.council}
              </dd>
            </div>
          </dl>
          <ul className="mt-5 flex flex-wrap gap-x-5 text-sm">
            <li>
              <a
                href={SITE.whatsappUrl}
                className="inline-flex min-h-11 items-center text-on-dark underline decoration-on-dark-muted/40 underline-offset-4 transition-colors hover:decoration-on-dark"
              >
                {t('common.whatsapp')}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${SITE.supportEmail}`}
                className="inline-flex min-h-11 items-center text-on-dark underline decoration-on-dark-muted/40 underline-offset-4 transition-colors hover:decoration-on-dark"
              >
                {SITE.supportEmail}
              </a>
            </li>
          </ul>
        </div>

        <FooterColumn title="Explore" links={EXPLORE} />
        <FooterColumn title="Patients" links={PATIENTS} />
        <FooterColumn
          title="Legal"
          links={LEGAL}
          className="col-span-2 md:col-span-1"
          listClassName="grid grid-cols-2 gap-x-6 md:grid-cols-1"
        />
      </div>

      {/* Medical disclaimer + grievance officer */}
      <div className="border-t border-line-dark">
        <div className="container-yhc grid gap-2 py-6 text-[13px] leading-relaxed md:grid-cols-[minmax(0,1fr)_auto] md:items-baseline md:gap-10">
          <p className="max-w-[80ch] text-pretty">{t('legal.disclaimer')}</p>
          <p>
            {t('legal.grievance')}
            {grievanceName ? `: ${grievanceName}` : ''} ·{' '}
            <a
              href={`mailto:${SITE.grievanceOfficer.email}`}
              className="underline decoration-on-dark-muted/40 underline-offset-4 transition-colors hover:text-on-dark hover:decoration-on-dark"
            >
              {SITE.grievanceOfficer.email}
            </a>
          </p>
        </div>
      </div>

      {/* Bottom bar: copyright · key policies */}
      <div className="border-t border-line-dark">
        <div className="container-yhc flex flex-col gap-3 py-5 text-[13px] md:flex-row md:items-center md:justify-between md:gap-10">
          <p className="text-pretty">
            <span className="text-on-dark">© 2026 All Rights Reserved</span>
            <span aria-hidden> · </span>
            Powering India&apos;s Automation Revolution, a product of Centure AI Private Limited.
          </p>
          <nav aria-label="Key policies" className="shrink-0">
            <ul className="flex flex-wrap items-center">
              {primaryPolicies.map((p, i) => (
                <li key={p.slug} className="flex items-center">
                  {i > 0 ? (
                    <span className="px-2.5 text-on-dark-muted/50" aria-hidden>
                      ·
                    </span>
                  ) : null}
                  <Link
                    href={`/legal/${p.slug}`}
                    className="inline-flex min-h-11 items-center text-on-dark transition-colors hover:text-on-dark-muted md:min-h-8"
                  >
                    {p.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
  className,
  listClassName,
}: {
  title: string;
  links: FooterLink[];
  className?: string;
  listClassName?: string;
}) {
  return (
    <nav aria-label={title} className={cn('min-w-0', className)}>
      <p className="text-[12px] font-semibold tracking-[0.14em] text-on-dark uppercase">{title}</p>
      <ul className={cn('mt-3 md:mt-4', listClassName)}>
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className={LINK}>
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
