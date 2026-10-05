import type { Metadata } from 'next';
import Link from 'next/link';
import { GuaranteeLine } from '@/components/shared/pricing';
import { getConsultTerms } from '@/components/site/consult-fee';
import { CtaBand } from '@/components/site/cta-band';
import { buildJourney, JourneySteps } from '@/components/site/journey-steps';
import { PageIntro } from '@/components/site/page-intro';
import { pageMetadata } from '@/components/site/seo';
import { IMAGES } from '@/lib/images';
import { getDoctor, getGuarantee } from '@/server/catalog';
import { getSetting } from '@/server/demo/store';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = pageMetadata({
  title: 'How it works',
  description:
    'Book, consult, receive your plan, get it delivered and keep in touch at follow-up. Every step of the Your Hair Company journey, with fees.',
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
        `Choose an open slot. We hold it for ${holdMinutes} minutes while you pay the ${terms.fee} fee.`,
        'Your booking is confirmed only when the payment reaches us — you get the confirmation on WhatsApp.',
        'Then complete your hair profile and upload three scalp photos: front hairline, crown and parting.',
      ],
    },
    {
      title: 'Consult',
      points: [
        `A ${terms.slotMinutes}-minute video call with ${doctor.name}, from your phone or laptop.`,
        'Join from a quiet, well-lit place. Have your current products or medicines nearby.',
        'Ask anything. You will get a plain explanation, not a sales pitch.',
      ],
    },
    {
      title: 'Plan',
      points: [
        'If treatment is right for you, your plan and prescription are shared on WhatsApp after the call.',
        `The payment link stays valid for ${linkHours} hours. You choose 1, 2 or 3 months.`,
        terms.creditEnabled
          ? `${terms.fee} consultation fee is credited against your first plan if you buy within ${terms.creditWindowDays} days of your consultation (pending confirmation).`
          : 'There is no obligation to buy. Your prescription is yours either way.',
      ],
    },
    {
      title: 'Delivered',
      points: [
        'Your plan is packed and shipped across India, with tracking on WhatsApp.',
        'Once it arrives, you get a short guide to starting your routine.',
      ],
    },
    {
      title: 'Follow-up',
      points: [
        'Regular check-ins on WhatsApp — reply "going well", "I have a question" or report a side effect.',
        'Monthly progress photos, so changes can be seen over time rather than guessed.',
        `A follow-up review with ${doctor.name} to adjust your plan, and a reminder before it runs out.`,
      ],
    },
  ];

  return (
    <>
      <PageIntro
        title="How it works"
        image={IMAGES.textureDrop}
        lede={
          <p>
            Five steps, from booking to follow-up. You only pay {terms.fee} to start; a plan is prescribed
            only if it is right for you.
          </p>
        }
      >
        <JourneySteps steps={buildJourney(terms)} />
      </PageIntro>

      <section className="container-yhc py-16 md:py-24">
        <h2 className="display text-[clamp(2rem,1.5rem+2vw,3rem)] text-balance">Each step in detail</h2>
        <ol className="mt-10 divide-y divide-line border-y border-line">
          {detail.map((step, i) => (
            <li
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
            </li>
          ))}
        </ol>
        {guarantee ? (
          <div className="mt-10 max-w-2xl">
            <GuaranteeLine policy={guarantee} />
          </div>
        ) : null}
        <p className="mt-8 text-body">
          Want to see prices first?{' '}
          <Link href="/plans" className="text-brand underline underline-offset-4">
            Compare treatment plans
          </Link>
          .
        </p>
      </section>

      <CtaBand
        title="Ready for step one?"
        bookLabel={terms.bookLabel}
        body="Booking takes a few minutes. Next, you'll complete your hair profile and upload your scalp photos."
      />
    </>
  );
}
