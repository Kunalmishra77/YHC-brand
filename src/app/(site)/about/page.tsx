import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { getConsultTerms } from '@/components/site/consult-fee';
import { CtaBand } from '@/components/site/cta-band';
import { buildJourney } from '@/components/site/journey-steps';
import { pageMetadata } from '@/components/site/seo';
import { t } from '@/i18n/en';
import { IMAGES } from '@/lib/images';
import { getDoctor } from '@/server/catalog';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = pageMetadata({
  title: 'About Your Hair Company',
  description:
    'Why Your Hair Company starts every plan with a doctor: consultation first, honest expectations, your prescription is yours, and follow-up care.',
  path: '/about',
});

const NEVER = [
  {
    title: 'Sell you a kit before anyone has asked a question',
    body: 'Prescription products are only supplied after a consultation. The doctor decides whether treatment is right for you — and sometimes the answer is no.',
  },
  {
    title: 'Pressure you to buy',
    body: 'A plan is a recommendation, not a sales pitch. No invented discounts or “today only” offers, and no one will push you to decide on the call.',
  },
  {
    title: 'Keep your prescription from you',
    body: 'Your prescription is yours. You are free to use it wherever you prefer, and you get it whether or not you buy from us.',
  },
  {
    title: 'Invent reviews or borrow before-and-after photos',
    body: 'Stories appear only with a patient’s written consent, unretouched, with how long they used their plan and a note that results vary.',
  },
  {
    title: 'Promise results or timelines',
    body: 'Hair responds slowly and differently for everyone. We say so plainly, and we judge progress with consistent photos over months.',
  },
  {
    title: 'Use your health details for marketing',
    body: 'Your history, photos and consultation notes are kept for your doctor. Our sales and support team cannot see them.',
  },
];

const VALUES = [
  {
    title: 'Clinical before commercial',
    body: 'The consultation comes first, and the doctor’s judgement is never overruled by a sales target.',
  },
  {
    title: 'Plain words',
    body: 'We explain what is likely going on, what a product is for, and what it will not do — without jargon or hype.',
  },
  {
    title: 'Care that continues',
    body: 'Check-ins, progress photos and follow-up reviews are part of every plan, not an upsell.',
  },
  {
    title: 'Privacy as a default',
    body: 'Clinical data is separated from everything else, access to it is logged, and it never appears in messages or marketing.',
  },
];

export default function AboutPage() {
  const doctor = getDoctor();
  const terms = getConsultTerms();
  const journey = buildJourney(terms);

  return (
    <>
      {/* 1 · Opening */}
      <section className="border-b border-line">
        <div className="container-yhc grid gap-10 py-14 md:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] md:items-center md:gap-12 md:py-24 lg:gap-16">
          <div className="min-w-0">
            <h1 className="display text-[clamp(2.5rem,1.7rem+3.2vw,4.25rem)] text-balance">
              Hair care that starts with a conversation.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-body">
              Most hair products are sold before anyone asks a single question. Your Hair Company works the
              other way round: every plan begins with a one-to-one video consultation with {doctor.name}, and
              is reviewed as you go.
            </p>
            <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
              <Link
                href="/how-it-works"
                className="inline-flex min-h-11 items-center text-sm font-medium text-ink underline decoration-steel underline-offset-[6px] hover:decoration-ink"
              >
                How it works
              </Link>
              <Link
                href="/doctor-tyagi"
                className="inline-flex min-h-11 items-center text-sm font-medium text-ink underline decoration-steel underline-offset-[6px] hover:decoration-ink"
              >
                About {doctor.name}
              </Link>
            </div>
          </div>
          <figure>
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-obsidian">
              <Image
                src={IMAGES.heroPortrait.src}
                alt={IMAGES.heroPortrait.alt}
                fill
                priority
                sizes="(min-width: 768px) 42vw, 100vw"
                className="object-cover object-[50%_65%]"
              />
            </div>
            <figcaption className="mt-3 text-[12px] text-muted-foreground">
              Concept still life of the YHC range — not a treatment result.
            </figcaption>
          </figure>
        </div>
      </section>

      {/* 2 · Why doctor-led */}
      <section className="container-yhc py-20 md:py-28">
        <div className="grid gap-10 md:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] md:gap-16">
          <h2 className="display text-[clamp(2.25rem,1.6rem+2.4vw,3.5rem)] text-balance md:sticky md:top-28 md:self-start">
            Why doctor-led
          </h2>
          <div className="max-w-[62ch] space-y-5 text-lg leading-relaxed text-body">
            {/* TODO(client): founding story in the client's own words — see docs/12 C */}
            <p>
              Thinning hair has many possible causes — genetics, hormones, illness, nutrition, stress,
              medicines — and often more than one at once. Two people with the same-looking change can need
              quite different things.
            </p>
            <p>
              Yet most people spend months on products chosen by advertising rather than by their own history.
              They stop and start, cannot tell what is helping, and lose confidence along with their money.
            </p>
            <p>
              We wanted the opposite: a doctor who listens first, a routine chosen for one person, and someone
              checking in while you follow it. YHC handles everything around the consultation — booking,
              delivery, reminders and support — so {doctor.name} can spend the time on you.
            </p>
            <p className="text-base text-muted-foreground">{t('common.resultsVary')}</p>
          </div>
        </div>
      </section>

      {/* 3 · How YHC works */}
      <section className="bg-obsidian text-on-dark">
        <div className="container-yhc py-20 md:py-28">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <h2 className="display max-w-xl text-[clamp(2.25rem,1.6rem+2.4vw,3.5rem)] text-balance text-on-dark">
              How YHC works
            </h2>
            <Link
              href="/how-it-works"
              className="inline-flex min-h-11 items-center text-sm font-medium text-on-dark underline decoration-steel underline-offset-[6px]"
            >
              Each step in detail
            </Link>
          </div>
          <ol className="mt-14 grid gap-px overflow-hidden rounded-2xl bg-line-dark sm:grid-cols-2 lg:grid-cols-5">
            {journey.map((step, i) => (
              <li
                key={step.title}
                className="flex flex-col bg-obsidian p-6 sm:last:odd:col-span-2 md:p-7 lg:min-h-72 lg:last:odd:col-span-1"
              >
                <span className="font-display text-5xl leading-none text-platinum/70">{i + 1}</span>
                <h3 className="mt-8 text-lg font-semibold text-on-dark lg:mt-auto">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-on-dark-muted">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 4 · What we will never do */}
      <section className="container-yhc py-20 md:py-28">
        <div className="grid gap-6 md:grid-cols-2 md:items-end">
          <h2 className="display text-[clamp(2.25rem,1.6rem+2.4vw,3.5rem)] text-balance">
            What we will never do
          </h2>
          <p className="max-w-md text-body md:justify-self-end">
            Trust in hair care is hard to earn and easy to lose. These are the lines we hold, in the product
            itself — not only in our copy.
          </p>
        </div>
        <ol className="mt-12 grid border-t border-line md:grid-cols-2 md:gap-x-16">
          {NEVER.map((item, i) => (
            <li key={item.title} className="flex gap-5 border-b border-line py-7">
              <span className="w-8 shrink-0 font-display text-2xl leading-none text-steel">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div>
                <h3 className="text-lg font-semibold text-ink">{item.title}</h3>
                <p className="mt-2 leading-relaxed text-body">{item.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* 5 · Values */}
      <section className="border-t border-line bg-[#efeeeb]/60">
        <div className="container-yhc grid gap-12 py-20 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-16 md:py-28">
          <div>
            <h2 className="display text-[clamp(2.25rem,1.6rem+2.4vw,3.5rem)] text-balance">
              What we hold ourselves to
            </h2>
            <div className="relative mt-10 aspect-[16/10] overflow-hidden rounded-2xl">
              <Image
                src={IMAGES.textureDrop.src}
                alt={IMAGES.textureDrop.alt}
                fill
                sizes="(min-width: 768px) 40vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>
          <dl className="divide-y divide-line border-y border-line md:self-end">
            {VALUES.map((v) => (
              <div key={v.title} className="py-7">
                <dt className="font-display text-[clamp(1.75rem,1.45rem+1vw,2.25rem)] leading-tight font-medium text-ink">
                  {v.title}
                </dt>
                <dd className="mt-2 max-w-[56ch] leading-relaxed text-body">{v.body}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* 6 · Team */}
      <section className="container-yhc py-20 md:py-28">
        <div className="grid gap-10 md:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] md:gap-16">
          <div>
            <h2 className="display text-[clamp(2.25rem,1.6rem+2.4vw,3.5rem)] text-balance">
              The people behind it
            </h2>
            <p className="mt-5 max-w-sm leading-relaxed text-body">
              A small team built around one doctor’s consultations: care coordination, packing and delivery,
              and support.
            </p>
          </div>
          <div className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
            <div className="bg-card p-7">
              <p className="text-[13px] text-muted-foreground">Lead doctor</p>
              <p className="mt-3 font-display text-3xl leading-tight text-ink">{doctor.name}</p>
              <p className="mt-1.5 text-sm text-body">{doctor.qualifications}</p>
              <p className="mt-1 text-sm text-muted-foreground">Registration {doctor.registrationNo}</p>
              <Link
                href="/doctor-tyagi"
                className="mt-6 inline-flex min-h-11 items-center text-sm font-medium text-ink underline decoration-steel underline-offset-[6px]"
              >
                Read the full profile
              </Link>
            </div>
            {/* TODO(client): team names, roles and photos (with consent) — see docs/12 C */}
            <div className="flex flex-col justify-between bg-card p-7">
              <div>
                <p className="text-[13px] text-muted-foreground">Care and support team</p>
                <p className="mt-3 font-display text-3xl leading-tight text-ink">Introductions coming soon</p>
                <p className="mt-3 text-sm leading-relaxed text-body">
                  The team who answer your WhatsApp messages and pack your orders will be introduced here.
                  They help with bookings, orders and delivery — they cannot see your clinical information.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CtaBand
        bookLabel={terms.bookLabel}
        body={`The first step is a consultation. If treatment isn't right for you, ${doctor.name} will say so.`}
      />
    </>
  );
}
