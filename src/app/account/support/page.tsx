import { Mail, MessageCircle, Scale } from 'lucide-react';
import Link from 'next/link';
import { ContactForm } from '@/components/account/contact-form';
import { ACCOUNT_LINKS } from '@/components/account/links';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { SITE } from '@/lib/site';

export const metadata = { title: 'Support' };

// TODO(client): business hours, support phone and grievance officer name — see docs/12 Business / D-P7.
export default function SupportPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Support"
        description="Questions about your routine, an order or a consultation — we are here."
      />

      <section className="bg-hero-dark flex flex-col gap-5 rounded-xl p-6 text-on-dark md:flex-row md:items-center md:justify-between md:p-8">
        <div>
          <p className="display text-[28px] text-on-dark">The quickest way is WhatsApp</p>
          <p className="mt-2 max-w-prose text-on-dark-muted">
            Message the care team from the number you signed up with, so we can find your account straight
            away. For a side effect, say so in your first message and we will bring in Dr. Tyagi.
          </p>
        </div>
        <Button asChild className="bg-silver h-12 shrink-0 px-6 text-obsidian hover:opacity-95">
          <a href={SITE.whatsappUrl} target="_blank" rel="noreferrer">
            <MessageCircle className="size-4" aria-hidden />
            Chat on WhatsApp
          </a>
        </Button>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <section aria-labelledby="s-form" className="rounded-xl border border-line bg-card p-5 md:p-6">
          <h2 id="s-form" className="text-base font-semibold text-ink">
            Write to us
          </h2>
          <p className="mt-1 mb-5 text-sm text-body">
            Prefer not to chat? Send a message and we will reply on WhatsApp.
          </p>
          <ContactForm />
        </section>

        <aside className="space-y-4">
          <div className="rounded-xl border border-line bg-card p-5">
            <div className="flex items-center gap-2">
              <Mail className="size-4 text-steel" aria-hidden />
              <h2 className="text-sm font-semibold text-ink">Email</h2>
            </div>
            <a
              href={`mailto:${SITE.supportEmail}`}
              className="mt-2 inline-flex min-h-11 items-center text-sm font-medium text-brand underline-offset-4 hover:underline"
            >
              {SITE.supportEmail}
            </a>
          </div>
          <div className="rounded-xl border border-line bg-card p-5">
            <div className="flex items-center gap-2">
              <Scale className="size-4 text-steel" aria-hidden />
              <h2 className="text-sm font-semibold text-ink">Grievance officer</h2>
            </div>
            <p className="mt-2 text-sm text-ink">{SITE.grievanceOfficer.name}</p>
            <a
              href={`mailto:${SITE.grievanceOfficer.email}`}
              className="inline-flex min-h-11 items-center text-sm font-medium text-brand underline-offset-4 hover:underline"
            >
              {SITE.grievanceOfficer.email}
            </a>
            <p className="text-[13px] text-muted-foreground">
              If we have not resolved a complaint to your satisfaction, write to the grievance officer.{' '}
              <Link href={ACCOUNT_LINKS.grievance} className="underline underline-offset-2">
                How grievances are handled
              </Link>
              .
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
