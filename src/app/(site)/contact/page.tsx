import { Clock, Mail, MessageCircle, Scale } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ContactForm } from '@/components/site/contact-form';
import { CtaBand } from '@/components/site/cta-band';
import { PageIntro } from '@/components/site/page-intro';
import { Reveal } from '@/components/site/reveal';
import { SECTION_Y } from '@/components/site/section';
import { pageMetadata } from '@/components/site/seo';
import { Button } from '@/components/ui/button';
import { SITE } from '@/lib/site';
import { SLOTS } from '@/lib/slots';

export const metadata: Metadata = pageMetadata({
  title: 'Contact us',
  description:
    'Reach Your Hair Company on WhatsApp or email for help with bookings, orders and delivery. Or write to our grievance officer if a problem is not solved.',
  path: '/contact',
});

const ROUTES = [
  {
    need: 'A booking, an order or a delivery',
    where: SITE.whatsappAvailable ? 'WhatsApp or email our support team' : 'Email our support team',
    href: SITE.whatsappAvailable ? SITE.whatsappUrl : `mailto:${SITE.supportEmail}`,
    label: SITE.whatsappAvailable ? 'Message on WhatsApp' : 'Email support',
    external: true,
  },
  {
    need: 'A question about your hair or treatment',
    where: 'Book a consultation. Our support team cannot give medical advice.',
    href: '/book',
    label: 'Book a consultation',
    external: false,
  },
  {
    need: 'A complaint that is still not solved',
    where: 'Our grievance officer',
    href: '/legal/grievance',
    label: 'How grievances work',
    external: false,
  },
  {
    need: 'A copy of your data, or to fix or delete it',
    where: 'Our grievance officer, as the privacy policy explains',
    href: '/legal/privacy#your-rights',
    label: 'Your data rights',
    external: false,
  },
] as const;

export default function ContactPage() {
  return (
    <>
      <PageIntro
        title="Talk to a real person"
        image={SLOTS.H27}
        lede={
          <p>
            Questions about a booking, an order or a delivery? Message us. Someone from the YHC team will
            reply.
          </p>
        }
      />

      <section
        className={`container-yhc grid gap-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16 ${SECTION_Y}`}
      >
        <div className="min-w-0 md:grid md:grid-cols-2 md:items-start md:gap-8 lg:block">
          {/* Fastest channel */}
          <Reveal className="relative isolate overflow-hidden rounded-2xl bg-obsidian p-7 text-on-dark md:p-8">
            <div
              aria-hidden
              className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_90%_0%,rgba(214,158,92,0.22),transparent_60%)]"
            />
            {SITE.whatsappAvailable ? (
              <MessageCircle className="size-6 text-brand-on-dark" aria-hidden />
            ) : (
              <Mail className="size-6 text-brand-on-dark" aria-hidden />
            )}
            <h2 className="display mt-6 text-[clamp(1.75rem,1.45rem+1vw,2.25rem)] text-balance text-on-dark">
              {SITE.whatsappAvailable ? 'WhatsApp is fastest' : 'Write to the care team'}
            </h2>
            <p className="mt-3 leading-relaxed text-on-dark-muted">
              Bookings, orders, delivery and tracking. Please don&apos;t send photos or health details here.
              Keep those for your consultation.
            </p>
            <Button
              asChild
              className="mt-7 h-12 w-full bg-[image:var(--yhc-silver)] px-6 text-base font-semibold text-obsidian hover:opacity-95 sm:w-auto"
            >
              {SITE.whatsappAvailable ? (
                <a href={SITE.whatsappUrl}>
                  <MessageCircle className="size-4" aria-hidden />
                  Message us on WhatsApp
                </a>
              ) : (
                <a href={`mailto:${SITE.supportEmail}`}>
                  <Mail className="size-4" aria-hidden />
                  Email the care team
                </a>
              )}
            </Button>
          </Reveal>

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
                </dd>
              </div>
            </div>
            {SITE.supportHours ? (
              <div className="flex gap-4 py-5">
                <Clock className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden />
                <div>
                  <dt className="text-[13px] text-muted-foreground">Support hours</dt>
                  <dd className="mt-0.5 font-medium text-ink">{SITE.supportHours}</dd>
                </div>
              </div>
            ) : null}
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
                  We reply within 48 hours and solve it within 1 month.
                </dd>
              </div>
            </div>
          </dl>
        </div>

        <div className="min-w-0">
          <h2 className="display text-[clamp(2rem,1.5rem+2vw,2.75rem)] text-balance">Or send us a message</h2>
          <p className="mt-3 max-w-lg leading-relaxed text-body">
            Leave your number. We will get back to you on WhatsApp or by phone.
          </p>
          <Reveal
            delayMs={120}
            className="mt-8 rounded-2xl border border-line bg-card p-5 shadow-card sm:p-6 md:p-8"
          >
            <ContactForm />
          </Reveal>
        </div>
      </section>

      {/* Who to contact for what */}
      <section className="border-t border-line bg-[#efeeeb]/60">
        <div className={`container-yhc ${SECTION_Y}`}>
          <h2 className="display text-[clamp(2.25rem,1.6rem+2.4vw,3.5rem)] text-balance">
            Who to contact for what
          </h2>
          <ul className="mt-8 border-t border-line md:mt-12">
            {ROUTES.map((r, i) => (
              <Reveal
                as="li"
                key={r.need}
                delayMs={i * 70}
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
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <CtaBand
        id="contact-cta-heading"
        image={SLOTS.H06}
        imagePosition="60% 50%"
        title="A question about your hair?"
        body="Our support team cannot give medical advice. The doctor can, at your consultation."
        primary={{ href: '/book', label: 'Book a consultation' }}
        whatsapp={false}
      />
    </>
  );
}
