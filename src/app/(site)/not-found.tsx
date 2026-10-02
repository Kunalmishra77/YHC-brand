import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { t } from '@/i18n/en';

const SUGGESTIONS = [
  { href: '/concerns', label: 'Hair concerns' },
  { href: '/plans', label: 'Treatment plans' },
  { href: '/doctor-tyagi', label: 'Meet Dr. Tyagi' },
  { href: '/faqs', label: 'FAQs' },
];

export default function SiteNotFound() {
  return (
    <section className="container-yhc py-16 md:py-24">
      <p className="price text-sm text-muted-foreground">404</p>
      <h1 className="display mt-3 max-w-2xl text-3xl">We couldn&apos;t find that page.</h1>
      <p className="mt-4 max-w-xl text-body">
        The link may be old or mistyped. If you were trying to book, you can do that directly — or try one of
        these.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button asChild className="h-12 px-6 text-base">
          <Link href="/book">{t('common.bookConsultation')}</Link>
        </Button>
        <Button asChild variant="outline" className="h-12 border-steel px-6 text-base">
          <Link href="/">Go to the home page</Link>
        </Button>
      </div>
      <ul className="mt-10 max-w-md divide-y divide-line border-y border-line">
        {SUGGESTIONS.map((s) => (
          <li key={s.href}>
            <Link href={s.href} className="flex min-h-12 items-center py-2 text-ink hover:text-brand">
              {s.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
