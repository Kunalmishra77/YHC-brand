import type { Metadata } from 'next';
import Link from 'next/link';
import { getConsultTerms } from '@/components/site/consult-fee';
import { CtaBand } from '@/components/site/cta-band';
import { PageIntro } from '@/components/site/page-intro';
import { PhotoPlaceholder } from '@/components/site/photo-placeholder';
import { pageMetadata } from '@/components/site/seo';
import { getDoctor } from '@/server/catalog';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = pageMetadata({
  title: 'About Your Hair Company',
  description:
    'Why Your Hair Company starts every plan with a doctor: consultation first, honest expectations and follow-up care.',
  path: '/about',
});

const BELIEFS = [
  {
    title: 'A doctor first',
    body: 'Hair loss has many causes. Nobody should be sold a kit before someone qualified has looked at their history.',
  },
  {
    title: 'Honest expectations',
    body: 'Hair changes slowly and results vary from person to person. We say so plainly, and we never promise outcomes.',
  },
  {
    title: 'Care continues after delivery',
    body: 'Check-ins, progress photos and follow-up reviews are part of the plan, not an upsell.',
  },
  {
    title: 'Your data stays clinical',
    body: 'Your health details and photos are kept for your doctor. Our support team helps with bookings and orders and cannot see them.',
  },
];

export default function AboutPage() {
  const doctor = getDoctor();
  const terms = getConsultTerms();
  return (
    <>
      <PageIntro
        eyebrow="About YHC"
        title="We built Your Hair Company around one conversation."
        lede={
          <p>
            Most hair products are sold before anyone asks a single question. At YHC, every plan begins with a
            video consultation with {doctor.name}, and is reviewed as you go.
          </p>
        }
      />

      <section className="container-yhc grid gap-10 py-14 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:py-20">
        <div className="space-y-5 text-body">
          <h2 className="display text-3xl">Why we started</h2>
          {/* TODO(client): founding story in the client's words — see docs/12 C */}
          <p>
            People with thinning hair often spend months trying products chosen by advertising rather than by
            their own history. We wanted the opposite: a doctor who listens, a routine chosen for you, and
            someone checking in while you follow it.
          </p>
          <p>
            YHC handles everything around the consultation — booking, delivery, reminders and support — so{' '}
            {doctor.name} can spend the time on you.
          </p>
          <p className="text-sm text-muted-foreground">
            Founding story placeholder — to be replaced with the client&apos;s approved text.
          </p>
        </div>
        <PhotoPlaceholder
          caption="Photo: consultation at the desk — to be supplied"
          tone="light"
          className="aspect-[4/3] w-full md:aspect-[4/5]"
        />
      </section>

      <section className="border-t border-line bg-card">
        <div className="container-yhc py-14 md:py-20">
          <h2 className="display text-3xl">What we hold ourselves to</h2>
          <dl className="mt-10 divide-y divide-line border-y border-line">
            {BELIEFS.map((b) => (
              <div key={b.title} className="grid gap-2 py-6 md:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]">
                <dt className="text-lg font-semibold text-ink">{b.title}</dt>
                <dd className="text-body">{b.body}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-8 text-body">
            Read more about{' '}
            <Link href="/doctor-tyagi" className="text-brand underline underline-offset-4">
              {doctor.name}
            </Link>{' '}
            or{' '}
            <Link href="/how-it-works" className="text-brand underline underline-offset-4">
              how it works
            </Link>
            .
          </p>
        </div>
      </section>

      <CtaBand
        bookLabel={terms.bookLabel}
        body="The first step is a consultation. If treatment isn't right for you, Dr. Tyagi will say so."
      />
    </>
  );
}
