import { Clock, Mail, MessageCircle, Scale } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ContactForm } from '@/components/site/contact-form';
import { pageMetadata } from '@/components/site/seo';
import { Button } from '@/components/ui/button';
import { SITE } from '@/lib/site';

export const metadata: Metadata = pageMetadata({
  title: 'Contact us',
  description:
    'Reach Your Hair Company on WhatsApp or email for help with bookings, orders and delivery, or write to our grievance officer.',
  path: '/contact',
});

const ROUTES = [
  {
    need: 'A booking, an order or delivery',
    where: 'WhatsApp or email our support team',
    href: SITE.whatsappUrl,
    label: 'Message on WhatsApp',
    external: true,
  },
  {
    need: 'A question about your hair or treatment',
    where: 'A consultation — the support team cannot give medical advice',
    href: '/book',
    label: 'Book a consultation',
    external: false,
  },
  {
    need: 'A complaint that has not been resolved',
    where: 'Our grievance officer',
    href: '/legal/grievance',
    label: 'How grievances work',
    external: false,
  },
  {
    need: 'A copy, correction or deletion of your data',
    where: 'Our grievance officer, under the privacy policy',
    href: '/legal/privacy#your-rights',
    label: 'Your data rights',
    external: false,
  },
] as const;

export default function ContactPage() {
  return (
    <>
      <section className="border-b border-line">
        <div className="container-yhc grid gap-8 py-16 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:items-end md:py-24">
          <h1 className="display text-[clamp(2.5rem,1.7rem+3vw,4rem)] text-balance">Talk to a person</h1>
          <p className="max-w-xl text-lg leading-relaxed text-pretty text-body">
            Questions about a booking, an order or delivery? Message us — a member of the YHC team will reply.
          </p>
        </div>
      </section>

      <section className="container-yhc grid gap-14 py-16 md:py-24 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <div className="min-w-0 md:grid md:grid-cols-2 md:items-start md:gap-8 lg:block">
          {/* Fastest channel */}
          <div className="rounded-2xl bg-obsidian p-7 text-on-dark md:p-8">
            <MessageCircle className="size-6 text-brand-on-dark" aria-hidden />
            <h2 className="display mt-6 text-[clamp(1.75rem,1.45rem+1vw,2.25rem)] text-balance text-on-dark">
              WhatsApp is fastest
            </h2>
            <p className="mt-3 leading-relaxed text-on-dark-muted">
              Bookings, orders, delivery and tracking. Please don&apos;t send photos or medical details here —
              those belong in your consultation.
            </p>
            <Button
              asChild
              className="mt-7 h-12 w-full bg-[image:var(--yhc-silver)] px-6 text-base font-semibold text-obsidian hover:opacity-95 sm:w-auto"
            >
              <a href={SITE.whatsappUrl}>
                <MessageCircle className="size-4" aria-hidden />
                Message us on WhatsApp
              </a>
            </Button>
          </div>

          <dl className="mt-8 divide-y divide-line border-y border-line md:mt-0 lg:mt-8">
            <div className="flex gap-4 py-5">
              <Mail className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden />
              <div>
                <dt className="text-[13px] text-muted-foreground">Email</dt>
                <dd className="mt-0.5">
                  <a
                    href={`mailto:${SITE.supportEmail}`}
                    className="font-medium break-all text-ink underline decoration-steel underline-offset-[6px]"
                  >
                    {SITE.supportEmail}
                  </a>
                  <p className="mt-1 text-sm text-body">We reply within one working day.</p>
                </dd>
              </div>
            </div>
            <div className="flex gap-4 py-5">
              <Clock className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden />
              <div>
                <dt className="text-[13px] text-muted-foreground">Support hours</dt>
                {/* TODO(client): support hours and reply SLA — see docs/12 C */}
                <dd className="mt-0.5 font-medium text-ink">To be confirmed</dd>
                <dd className="mt-1 text-sm text-body">
                  Messages outside hours are answered the next working day.
                </dd>
              </div>
            </div>
            <div className="flex gap-4 py-5">
              <Scale className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden />
              <div>
                <dt className="text-[13px] text-muted-foreground">Grievance officer</dt>
                <dd className="mt-0.5 font-medium text-ink">{SITE.grievanceOfficer.name}</dd>
                <dd className="mt-0.5">
                  <a
                    href={`mailto:${SITE.grievanceOfficer.email}`}
                    className="text-sm break-all text-ink underline decoration-steel underline-offset-4"
                  >
                    {SITE.grievanceOfficer.email}
                  </a>
                </dd>
                <dd className="mt-1 text-sm text-body">
                  Acknowledged within 48 hours, resolved within one month.
                </dd>
              </div>
            </div>
          </dl>
        </div>

        <div className="min-w-0">
          <h2 className="display text-[clamp(2rem,1.5rem+2vw,2.75rem)] text-balance">Or send us a message</h2>
          <p className="mt-3 max-w-lg leading-relaxed text-body">
            Leave your number and we&apos;ll get back to you on WhatsApp or by phone.
          </p>
          <div className="mt-8 rounded-2xl border border-line bg-card p-5 shadow-card sm:p-6 md:p-8">
            <ContactForm />
          </div>
        </div>
      </section>

      {/* Who to contact for what */}
      <section className="border-t border-line bg-[#efeeeb]/60">
        <div className="container-yhc py-20 md:py-28">
          <h2 className="display text-[clamp(2.25rem,1.6rem+2.4vw,3.5rem)] text-balance">
            Who to contact for what
          </h2>
          <ul className="mt-12 border-t border-line">
            {ROUTES.map((r) => (
              <li
                key={r.need}
                className="grid gap-2 border-b border-line py-6 md:grid-cols-[minmax(0,5fr)_minmax(0,5fr)_auto] md:items-baseline md:gap-8"
              >
                <p className="text-lg font-semibold text-ink">{r.need}</p>
                <p className="text-body">{r.where}</p>
                {r.external ? (
                  <a
                    href={r.href}
                    className="inline-flex min-h-11 items-center text-sm font-medium whitespace-nowrap text-ink underline decoration-steel underline-offset-[6px]"
                  >
                    {r.label}
                  </a>
                ) : (
                  <Link
                    href={r.href}
                    className="inline-flex min-h-11 items-center text-sm font-medium whitespace-nowrap text-ink underline decoration-steel underline-offset-[6px]"
                  >
                    {r.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
