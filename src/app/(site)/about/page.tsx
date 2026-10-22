import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { publicCredential } from '@/lib/credentials';
import { getConsultTerms } from '@/components/site/consult-fee';
import { CtaBand } from '@/components/site/cta-band';
import { buildJourney } from '@/components/site/journey-steps';
import motion from '@/components/site/motion.module.css';
import { Reveal } from '@/components/site/reveal';
import { H1, H2, IMG_HOVER_ZOOM, riseDelay, SECTION_Y, TEXT_LINK } from '@/components/site/section';
import { pageMetadata } from '@/components/site/seo';
import { t } from '@/i18n/en';
import { SLOTS } from '@/lib/slots';
import { getDoctor } from '@/server/catalog';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = pageMetadata({
  title: 'About Your Hair Company',
  description:
    'Why Your Hair Company starts every plan with a doctor: talk first, honest expectations, a prescription that is yours, and care that continues.',
  path: '/about',
});

const NEVER = [
  {
    title: 'Sell you a kit before asking a single question',
    body: 'You get prescription products only after a consultation. The doctor decides if treatment can help you — and sometimes the answer is no.',
  },
  {
    title: 'Pressure you to buy',
    body: 'A plan is advice, not a sales pitch. No fake discounts, no “today only” offers, and no one pushes you to decide on the call.',
  },
  {
    title: 'Keep your prescription from you',
    body: 'Your prescription is yours. Use it anywhere you like. You get it whether or not you buy from us.',
  },
  {
    title: 'Make up reviews or borrow before-and-after photos',
    body: 'We share a story only with the patient’s written consent. Photos are not edited. We say how long they used their plan, and that results vary.',
  },
  {
    title: 'Promise results or timelines',
    body: 'Hair changes slowly, and differently for everyone. We say so clearly. We judge progress with photos taken the same way, over months.',
  },
  {
    title: 'Use your health details for marketing',
    body: 'Your health details, photos and consultation notes are only for your doctor. Our sales and support team cannot see them.',
  },
];

const VALUES = [
  {
    title: 'Health before sales',
    body: 'The consultation comes first. A sales target never overrules the doctor.',
  },
  {
    title: 'Plain words',
    body: 'We tell you what is likely going on, what a product is for, and what it will not do. No jargon, no hype.',
  },
  {
    title: 'Care that continues',
    body: 'Check-ins, progress photos and follow-up reviews come with every plan. They are not extras.',
  },
  {
    title: 'Private by default',
    body: 'Your health details are kept apart from everything else. Every look at them is logged. They never appear in messages or ads.',
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
        <div
          className={`container-yhc grid gap-10 md:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] md:items-center md:gap-12 lg:gap-16 ${SECTION_Y}`}
        >
          <div className="min-w-0">
            <h1 className={`${motion.rise} ${H1}`}>Hair care that starts with a conversation.</h1>
            <p
              style={riseDelay(120)}
              className={`${motion.rise} mt-6 max-w-xl text-lg leading-relaxed text-body`}
            >
              Most hair products are sold before anyone asks you a single question. We do the opposite. Every
              plan starts with a one-to-one video call with {doctor.name}, and we check on it as you go.
            </p>
            <div style={riseDelay(220)} className={`${motion.rise} mt-8 flex flex-wrap gap-x-8 gap-y-3`}>
              <Link href="/how-it-works" className={`text-ink ${TEXT_LINK}`}>
                How it works
              </Link>
              <Link href="/doctor-tyagi" className={`text-ink ${TEXT_LINK}`}>
                About {doctor.name}
              </Link>
            </div>
          </div>
          <figure>
            <div className="group relative aspect-[4/3] overflow-hidden rounded-[28px] bg-obsidian shadow-card lg:aspect-[5/4]">
              <Image
                src={SLOTS.S05.src}
                alt={SLOTS.S05.alt}
                fill
                priority
                sizes="(min-width: 768px) 42vw, 100vw"
                className={`${motion.kenburns} object-cover ${IMG_HOVER_ZOOM}`}
              />
            </div>
            <figcaption className="mt-3 text-[12px] text-muted-foreground">
              Illustrative image — not our lab, clinic, staff or Dr. Tyagi.
            </figcaption>
          </figure>
        </div>
      </section>

      {/* 2 · Why doctor-led */}
      <section className={`container-yhc ${SECTION_Y}`}>
        <div className="grid gap-10 md:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] md:gap-16">
          <h2 className={`${H2} md:sticky md:top-28 md:self-start`}>Why doctor-led</h2>
          <div className="max-w-[62ch] space-y-5 text-lg leading-relaxed text-body">
            {/* TODO(client): founding story in the client's own words — see docs/12 C */}
            <p>
              Thin hair has many causes — family genes, hormones, illness, food, stress, medicines. Often more
              than one at once. Two people who look the same may need very different care.
            </p>
            <p>
              Yet most people spend months on products picked by ads, not by their own health. They stop and
              start. They cannot tell what helps. They lose hope, and money.
            </p>
            <p>
              We wanted the opposite: a doctor who listens first, a routine picked just for you, and someone
              checking in while you use it. YHC does everything around the consultation — booking, delivery,
              reminders and support — so {doctor.name} can spend the time on you.
            </p>
            <p className="text-base text-muted-foreground">{t('common.resultsVary')}</p>
          </div>
        </div>
      </section>

      {/* 3 · How YHC works */}
      <section className="bg-obsidian text-on-dark">
        <div className={`container-yhc ${SECTION_Y}`}>
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <h2 className={`${H2} max-w-xl text-on-dark`}>How YHC works</h2>
            <Link href="/how-it-works" className={`text-on-dark ${TEXT_LINK}`}>
              Each step in detail
            </Link>
          </div>
          <ol className="mt-10 grid gap-px overflow-hidden rounded-2xl bg-line-dark sm:grid-cols-2 md:mt-14 lg:grid-cols-5">
            {journey.map((step, i) => (
              <Reveal
                as="li"
                key={step.title}
                delayMs={i * 80}
                className="flex flex-col bg-obsidian p-6 sm:last:odd:col-span-2 md:p-7 lg:min-h-72 lg:last:odd:col-span-1"
              >
                <span className="font-display text-5xl leading-none text-platinum/70">{i + 1}</span>
                <h3 className="mt-8 text-lg font-semibold text-on-dark lg:mt-auto">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-on-dark-muted">{step.body}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* 4 · What we will never do */}
      <section className={`container-yhc ${SECTION_Y}`}>
        <div className="grid gap-6 md:grid-cols-2 md:items-end">
          <h2 className={H2}>What we will never do</h2>
          <p className="max-w-md text-body md:justify-self-end">
            Trust is hard to earn and easy to lose. These are the lines we never cross — in how we work, not
            just in what we say.
          </p>
        </div>
        <ol className="mt-12 grid border-t border-line md:grid-cols-2 md:gap-x-16">
          {NEVER.map((item, i) => (
            <Reveal
              as="li"
              key={item.title}
              delayMs={(i % 2) * 90}
              className="flex gap-5 border-b border-line py-7"
            >
              <span className="w-8 shrink-0 font-display text-2xl leading-none text-steel">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div>
                <h3 className="text-lg font-semibold text-ink">{item.title}</h3>
                <p className="mt-2 leading-relaxed text-body">{item.body}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </section>

      {/* 5 · Values */}
      <section className="border-t border-line bg-[#efeeeb]/60">
        <div
          className={`container-yhc grid gap-12 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-16 ${SECTION_Y}`}
        >
          <div>
            <h2 className={H2}>What we hold ourselves to</h2>
            <div className="group relative mt-10 aspect-[16/10] overflow-hidden rounded-[28px] shadow-card">
              <Image
                src={SLOTS.S06.src}
                alt={SLOTS.S06.alt}
                fill
                sizes="(min-width: 768px) 40vw, 100vw"
                className={`object-cover ${IMG_HOVER_ZOOM}`}
              />
              <span className="absolute top-4 left-4 rounded-full bg-black/55 px-3 py-1.5 text-xs font-medium text-on-dark backdrop-blur">
                {t('common.illustrativeImage')}
              </span>
            </div>
          </div>
          <dl className="divide-y divide-line border-y border-line md:self-end">
            {VALUES.map((v, i) => (
              <Reveal key={v.title} delayMs={i * 80} className="py-7">
                <dt className="font-display text-[clamp(1.75rem,1.45rem+1vw,2.25rem)] leading-tight font-medium text-ink">
                  {v.title}
                </dt>
                <dd className="mt-2 max-w-[56ch] leading-relaxed text-body">{v.body}</dd>
              </Reveal>
            ))}
          </dl>
        </div>
      </section>

      {/* 6 · Team */}
      <section className={`container-yhc ${SECTION_Y}`}>
        <div className="grid gap-10 md:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] md:gap-16">
          <div>
            <h2 className={H2}>The people behind it</h2>
            <p className="mt-5 max-w-sm leading-relaxed text-body">
              A small team around one doctor: care, packing and delivery, and support.
            </p>
          </div>
          <div className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
            <div className="bg-card p-7">
              <p className="text-[13px] text-muted-foreground">Lead doctor</p>
              <p className="mt-3 font-display text-[2rem] leading-tight text-ink">{doctor.name}</p>
              <p className="mt-1.5 text-sm text-body">
                {publicCredential(doctor.qualifications) ?? 'Dermatologist'}
              </p>
              {publicCredential(doctor.registrationNo) ? (
                <p className="mt-1 text-sm text-muted-foreground">Registration {doctor.registrationNo}</p>
              ) : null}
              <Link href="/doctor-tyagi" className={`mt-6 text-ink ${TEXT_LINK}`}>
                Read the full profile
              </Link>
            </div>
            {/* TODO(client): team names, roles and photos (with consent) — see docs/12 C */}
            <div className="flex flex-col justify-between bg-card p-7">
              <div>
                <p className="text-[13px] text-muted-foreground">Care and support team</p>
                <p className="mt-3 font-display text-[2rem] leading-tight text-ink">
                  Introductions coming soon
                </p>
                <p className="mt-3 text-sm leading-relaxed text-body">
                  Soon you will meet the team who answer your WhatsApp messages and pack your orders. They
                  help with bookings, orders and delivery. They cannot see your health details.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CtaBand
        id="about-cta-heading"
        image={SLOTS.J08}
        imagePosition="60% 50%"
        bookLabel={terms.bookLabel}
        body={`The first step is a consultation. If treatment cannot help you, ${doctor.name} will tell you.`}
      />
    </>
  );
}
