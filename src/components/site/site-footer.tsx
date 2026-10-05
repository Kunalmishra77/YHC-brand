import Link from 'next/link';
import { Logo } from '@/components/shared/logo';
import { t } from '@/i18n/en';
import type { Doctor } from '@/lib/domain/types';
import { LEGAL_PAGES, SITE, SITE_NAV } from '@/lib/site';
import { LEGAL_ENTITY } from '@/server/content/legal';

/** Footer: disclaimer, doctor registration and grievance officer on every page (FR-M1-9, FR-M14-6). */
export function SiteFooter({ doctor }: { doctor: Doctor }) {
  // TODO(client): grievance officer name — see docs/12 C (set LEGAL_ENTITY.grievanceOfficerName)
  const grievanceName = LEGAL_ENTITY.grievanceOfficerName;
  const primaryPolicies = LEGAL_PAGES.filter((p) => p.primary);
  return (
    <footer className="mt-auto bg-obsidian pb-24 text-on-dark-muted md:pb-0">
      <div className="container-yhc grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="space-y-4">
          <Logo tone="light" />
          <p className="max-w-sm text-sm">
            Consultations led by {doctor.name}, {doctor.qualifications}. Reg. No. {doctor.registrationNo},{' '}
            {doctor.council}.
          </p>
          <p className="text-sm">
            <a href={SITE.whatsappUrl} className="underline underline-offset-2 hover:text-on-dark">
              {t('common.whatsapp')}
            </a>{' '}
            ·{' '}
            <a
              href={`mailto:${SITE.supportEmail}`}
              className="underline underline-offset-2 hover:text-on-dark"
            >
              {SITE.supportEmail}
            </a>
          </p>
        </div>
        <nav aria-label="Footer" className="grid content-start gap-2 text-sm">
          {SITE_NAV.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-on-dark">
              {t(item.key)}
            </Link>
          ))}
          {[
            { href: '/how-it-works', label: t('nav.howItWorks') },
            { href: '/concerns', label: t('nav.concerns') },
            { href: '/plans', label: t('nav.plans') },
            { href: '/products', label: t('nav.products') },
            { href: '/assessment', label: t('common.freeAssessment') },
          ].map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-on-dark">
              {item.label}
            </Link>
          ))}
          <Link href="/blog" className="hover:text-on-dark">
            Journal
          </Link>
          <Link href="/about" className="hover:text-on-dark">
            About YHC
          </Link>
          <Link href="/contact" className="hover:text-on-dark">
            Contact
          </Link>
        </nav>
        <nav aria-label="Legal" className="grid content-start gap-2 text-sm">
          <p className="mb-1 text-[12px] font-medium tracking-[0.14em] text-on-dark uppercase">Legal</p>
          {LEGAL_PAGES.map((p) => (
            <Link
              key={p.slug}
              href={`/legal/${p.slug}`}
              className={p.primary ? 'text-on-dark/90 hover:text-on-dark' : 'hover:text-on-dark'}
            >
              {p.title}
            </Link>
          ))}
        </nav>
      </div>
      <div className="border-t border-line-dark">
        <div className="container-yhc space-y-2 py-6 text-[13px]">
          <p>{t('legal.disclaimer')}</p>
          <p>
            {t('legal.grievance')}
            {grievanceName ? `: ${grievanceName}` : ''} ·{' '}
            <a href={`mailto:${SITE.grievanceOfficer.email}`} className="underline underline-offset-2">
              {SITE.grievanceOfficer.email}
            </a>
          </p>
        </div>
      </div>
      <div className="border-t border-line-dark">
        <div className="container-yhc flex flex-col gap-5 py-6 text-[13px] md:flex-row-reverse md:items-end md:justify-between md:gap-10">
          <nav aria-label="Key policies">
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {primaryPolicies.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/legal/${p.slug}`}
                    className="inline-flex min-h-6 items-center font-medium text-on-dark underline decoration-on-dark-muted/50 underline-offset-4 hover:decoration-on-dark"
                  >
                    {p.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="space-y-1">
            <p className="text-on-dark">© 2026 All Rights Reserved.</p>
            <p>Powering India&apos;s Automation Revolution, a product of Centure AI Private Limited.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
