import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { GuaranteeLine } from '@/components/shared/pricing';
import { getConsultTerms } from '@/components/site/consult-fee';
import { CtaBand } from '@/components/site/cta-band';
import { buildJourney, JourneySteps } from '@/components/site/journey-steps';
import { PageIntro } from '@/components/site/page-intro';
import { Parallax } from '@/components/site/parallax';
import { Reveal } from '@/components/site/reveal';
import { H2, LEDE, SECTION_Y, SectionHeader, TEXT_LINK } from '@/components/site/section';
import { pageMetadata } from '@/components/site/seo';
import { CLINICAL } from '@/lib/images';
import { SLOTS } from '@/lib/slots';
import { getDoctor, getGuarantee } from '@/server/catalog';
import { getSetting } from '@/server/demo/store';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = pageMetadata({
  title: 'How it works',
  description:
    'Book, talk to the doctor, get your plan, get it delivered and stay in touch. Every step, with the fees.',
  path: '/how-it-works',
});

export default function HowItWorksPage() {
  const doctor = getDoctor();
  const guarantee = getGuarantee();
  const terms = getConsultTerms();
  const holdMinutes = getSetting('consult.hold_minutes');
  const linkHours = getSetting('recommendation.link_ttl_hours');

  const detail: { title: string; points: string[] }[] = [
    {
      title: 'Book',
      points: [
        `Pick a free time. We keep it for you for ${holdMinutes} minutes while you pay the ${terms.fee} fee.`,
        'Your booking is confirmed once your payment reaches us. We confirm it on WhatsApp.',
        'Then fill in your hair details and add 3 scalp photos: front hairline, crown and parting.',
      ],
    },
    {
      title: 'Consult',
      points: [
        `A ${terms.slotMinutes}-minute video call with ${doctor.name}, on your phone or laptop.`,
        'Sit somewhere quiet and bright. Keep your current products or medicines close by.',
        'Ask anything. You get a clear answer, not a sales pitch.',
      ],
    },
    {
      title: 'Plan',
      points: [
        'If treatment can help you, we send your plan and prescription on WhatsApp after the call.',
        `The payment link works for ${linkHours} hours. You choose 1, 2 or 3 months.`,
        terms.creditEnabled
          ? `Buy your plan within ${terms.creditWindowDays} days of your consultation and the ${terms.fee} fee comes off your first plan.`
          : 'You do not have to buy anything. Your prescription is yours either way.',
      ],
    },
    {
      title: 'Delivered',
      points: [
        'We pack your plan and ship it anywhere in India. You can track it on WhatsApp.',
        'When it arrives, you get a short guide to start your routine.',
      ],
    },
    {
      title: 'Follow-up',
      points: [
        'We check in on WhatsApp. Reply "going well", "I have a question", or tell us about a side effect.',
        'You take progress photos each month, so you can see change instead of guessing.',
        `${doctor.name} reviews your progress and adjusts your plan. We remind you before it runs out.`,
      ],
    },
  ];

  return (
    <>
      <PageIntro
        title="How it works"
        image={SLOTS.S02}
        lede={
          <p>
            5 simple steps, from booking to follow-up. You pay just {terms.fee} to start. You get a plan only
            if it can help you.
          </p>
        }
      >
        <JourneySteps steps={buildJourney(terms)} />
      </PageIntro>

      {/* Why photos matter — dark split band to break up the two text-led sections */}
      <section className="bg-obsidian text-on-dark" aria-labelledby="photos-heading">
        <div
          className={`container-yhc grid items-center gap-10 lg:grid-cols-[minmax(0,6fr)_minmax(0,6fr)] lg:gap-20 ${SECTION_Y}`}
        >
          <figure className="relative aspect-[3/2] overflow-hidden rounded-[28px] bg-ink-2 ring-1 ring-line-dark">
            <Parallax>
              <Image
                src={CLINICAL.scalpParting.src}
                alt={CLINICAL.scalpParting.alt}
                fill
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="object-cover"
              />
            </Parallax>
            <figcaption className="absolute bottom-4 left-4 rounded-full bg-black/55 px-3 py-1.5 text-xs font-medium text-on-dark backdrop-blur">
              Illustrative photo · scalp parting up close
            </figcaption>
          </figure>
          <div>
            <p className="eyebrow text-brand-on-dark">Before your call</p>
            <h2 id="photos-heading" className={`${H2} mt-4 text-on-dark`}>
              3 photos, taken the same way each time
            </h2>
            <p className={`${LEDE} mt-6 text-on-dark-muted`}>
              Clear photos let {doctor.name} see your roots before the call. Later, you compare new photos
              with them to see the change.
            </p>
            <ul className="mt-8 grid gap-px overflow-hidden rounded-2xl bg-line-dark ring-1 ring-line-dark sm:grid-cols-3">
              {[
                ['Front hairline', 'Push your hair back. Use soft daylight.'],
                ['Crown', 'Shoot from above. Ask someone to help.'],
                ['Parting', 'Part your hair in the middle. Hold the camera straight above.'],
              ].map(([title, body], i) => (
                <Reveal as="li" key={title} delayMs={i * 90} className="bg-obsidian p-5">
                  <p className="font-semibold text-on-dark">{title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-on-dark-muted">{body}</p>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className={`container-yhc ${SECTION_Y}`} aria-labelledby="detail-heading">
        <SectionHeader
          id="detail-heading"
          eyebrow="Step by step"
          title="Each step in detail"
          lede="What happens, what you do and what it costs. Know it all before you pay for anything."
        />
        <ol className="divide-y divide-line border-y border-line">
          {detail.map((step, i) => (
            <Reveal
              as="li"
              key={step.title}
              className="grid gap-4 py-8 md:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] md:gap-10 md:py-10"
            >
              <h3 className="flex items-baseline gap-3 text-xl font-semibold text-ink">
                <span className="price text-sm text-muted-foreground">Step {i + 1}</span>
                {step.title}
              </h3>
              <ul className="max-w-[62ch] space-y-3 leading-relaxed text-body">
                {step.points.map((p) => (
                  <li key={p} className="flex gap-3">
                    <span aria-hidden className="mt-[0.8em] h-px w-4 shrink-0 bg-steel" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </ol>
        {guarantee ? (
          <div className="mt-10 max-w-2xl">
            <GuaranteeLine policy={guarantee} />
          </div>
        ) : null}
        <p className="mt-8 flex flex-wrap items-center gap-x-3 text-body">
          Want to see prices first?
          <Link href="/plans" className={`text-ink ${TEXT_LINK}`}>
            Compare treatment plans
          </Link>
        </p>
      </section>

      <CtaBand
        id="how-cta-heading"
        image={SLOTS.H11}
        imagePosition="65% 55%"
        title="Ready for step one?"
        bookLabel={terms.bookLabel}
        body="Booking takes a few minutes. Then you fill in your hair details and add your scalp photos."
      />
    </>
  );
}
