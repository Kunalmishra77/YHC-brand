import { Mail, MessageCircle } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ContactForm } from '@/components/site/contact-form';
import { PageIntro } from '@/components/site/page-intro';
import { pageMetadata } from '@/components/site/seo';
import { SITE } from '@/lib/site';

export const metadata: Metadata = pageMetadata({
  title: 'Contact us',
  description: 'Reach Your Hair Company on WhatsApp or email for help with bookings, orders and delivery.',
  path: '/contact',
});

export default function ContactPage() {
  return (
    <>
      <PageIntro
        title="Contact us"
        lede={<p>Questions about a booking, an order or delivery? We&apos;re happy to help.</p>}
      />
      <section className="container-yhc grid gap-12 py-12 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:py-16">
        <div>
          <h2 className="text-xl font-semibold text-ink">Fastest: WhatsApp</h2>
          <ul className="mt-5 divide-y divide-line border-y border-line">
            <li>
              <a
                href={SITE.whatsappUrl}
                className="flex min-h-14 items-center gap-3 py-4 text-ink hover:text-brand"
              >
                <MessageCircle className="size-5 text-brand" aria-hidden />
                <span>
                  <span className="block font-medium">Message us on WhatsApp</span>
                  <span className="text-sm text-muted-foreground">Bookings, orders and delivery</span>
                </span>
              </a>
            </li>
            <li>
              <a
                href={`mailto:${SITE.supportEmail}`}
                className="flex min-h-14 items-center gap-3 py-4 text-ink hover:text-brand"
              >
                <Mail className="size-5 text-brand" aria-hidden />
                <span>
                  <span className="block font-medium">{SITE.supportEmail}</span>
                  <span className="text-sm text-muted-foreground">We reply within one working day</span>
                </span>
              </a>
            </li>
          </ul>
          {/* TODO(client): support hours and SLA — see docs/12 C */}
          <p className="mt-6 text-sm text-body">
            For a complaint, write to our{' '}
            <Link href="/legal/grievance" className="text-brand underline underline-offset-4">
              grievance officer
            </Link>
            . For questions about your hair, the right place is a{' '}
            <Link href="/book" className="text-brand underline underline-offset-4">
              consultation
            </Link>
            .
          </p>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-ink">Or send us a message</h2>
          <div className="mt-5">
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
