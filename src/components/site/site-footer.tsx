import Link from 'next/link';
import { Logo } from '@/components/shared/logo';
import { t } from '@/i18n/en';
import type { Doctor } from '@/lib/domain/types';
import { LEGAL_PAGES, SITE, SITE_NAV } from '@/lib/site';

/** Footer: disclaimer, doctor registration and grievance officer on every page (FR-M1-9, FR-M14-6). */
export function SiteFooter({ doctor }: { doctor: Doctor }) {
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
          <Link href="/assessment" className="hover:text-on-dark">
            {t('common.freeAssessment')}
          </Link>
          <Link href="/contact" className="hover:text-on-dark">
            Contact
          </Link>
        </nav>
        <nav aria-label="Legal" className="grid content-start gap-2 text-sm">
          {LEGAL_PAGES.map((p) => (
            <Link key={p.slug} href={`/legal/${p.slug}`} className="hover:text-on-dark">
              {p.title}
            </Link>
          ))}
        </nav>
      </div>
      <div className="border-t border-line-dark">
        <div className="container-yhc space-y-2 py-6 text-[13px]">
          <p>{t('legal.disclaimer')}</p>
          <p>
            {t('legal.grievance')}: {SITE.grievanceOfficer.name} ·{' '}
            <a href={`mailto:${SITE.grievanceOfficer.email}`} className="underline underline-offset-2">
              {SITE.grievanceOfficer.email}
            </a>
          </p>
          <p>© {new Date().getFullYear()} Your Hair Company</p>
        </div>
      </div>
    </footer>
  );
}
