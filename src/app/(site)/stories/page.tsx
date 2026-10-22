import { Camera, Clock, FileCheck2, Quote } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getConsultTerms } from '@/components/site/consult-fee';
import { CtaBand } from '@/components/site/cta-band';
import { PageIntro } from '@/components/site/page-intro';
import { Reveal } from '@/components/site/reveal';
import { SECTION_Y } from '@/components/site/section';
import { pageMetadata } from '@/components/site/seo';
import { StoriesEmpty } from '@/components/site/stories-empty';
import { t } from '@/i18n/en';
import { SLOTS } from '@/lib/slots';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = pageMetadata({
  title: 'Real stories',
  description:
    'Stories from Your Hair Company patients, shared only with their written consent, with unedited photos and a clear note that results vary.',
  path: '/stories',
});

const INCLUDES = [
  {
    icon: Quote,
    title: 'Their own words',
    body: 'What they noticed, why they booked and what the plan was like. We only shorten it. We never rewrite it to sound better.',
  },
  {
    icon: Clock,
    title: 'How long they used their plan',
    body: 'Shown clearly, so you see how much time it took — not just a headline.',
  },
  {
    icon: Camera,
    title: 'Unedited photos, only with a yes for photos',
    body: 'Taken the same way each month — same angle, same light. No filters, no editing. Photos need a separate yes.',
  },
  {
    icon: FileCheck2,
    title: 'A clear note that results vary',
    body: 'Every story says that individual results vary. One person’s result is not a promise of yours.',
  },
];

const STEPS = [
  {
    title: 'We ask. You never have to.',
    body: 'After a follow-up, we may ask if you want to share your story. Saying no changes nothing about your care.',
  },
  {
    title: 'You choose what to share',
    body: 'Words only, or words with photos. Your first name, your initials, or neither. You choose each one, and we record your yes.',
  },
  {
    title: 'You see it before anyone else',
    body: 'Nothing goes live until you read the final version and agree in writing.',
  },
  {
    title: 'You can take it down',
    body: 'Change your mind any time, from your account or by message. We remove your story and photos from the site.',
  },
];

export default function StoriesPage() {
  const terms = getConsultTerms();
  // FR-M1-6: only reviews with stored publication consent would be listed here. None exist yet.
  return (
    <>
      <PageIntro
        title="Real stories, only when patients want to share"
        image={SLOTS.H08}
        lede={
          <p>
            Hair is personal. We share a story only when the patient agrees in writing. Photos need a separate
            yes. We would rather show nothing than show something made up.
          </p>
        }
      />

      <section className={`container-yhc ${SECTION_Y}`}>
        <StoriesEmpty />
      </section>

      {/* What a published story will include */}
      <section className="container-yhc pb-14 lg:pb-20">
        <div className="grid gap-12 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-16">
          <div className="md:sticky md:top-28 md:self-start">
            <h2 className="display text-[clamp(2.25rem,1.6rem+2.4vw,3.5rem)] text-balance">
              What every story will include
            </h2>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-body">
              Every story will look the same way, so you can judge them fairly.
            </p>

            {/* Specimen layout, clearly labelled as such */}
            <figure
              className="mt-10 rounded-2xl border border-dashed border-platinum bg-card p-6"
              aria-hidden
            >
              <figcaption className="text-[12px] font-medium text-muted-foreground">
                Example layout — not a real story
              </figcaption>
              <div className="mt-5 grid grid-cols-2 gap-3">
                {['Month 1', 'Latest'].map((label) => (
                  <div
                    key={label}
                    className="flex aspect-square items-end rounded-lg bg-[#efeeeb] p-3 text-[12px] text-muted-foreground"
                  >
                    {label} · unedited
                  </div>
                ))}
              </div>
              <div className="mt-5 space-y-2">
                <div className="h-2.5 w-11/12 rounded-full bg-mist" />
                <div className="h-2.5 w-4/5 rounded-full bg-mist" />
                <div className="h-2.5 w-3/5 rounded-full bg-mist" />
              </div>
              <div className="mt-5 flex flex-wrap gap-2 text-[12px]">
                <span className="rounded-full border border-line px-2.5 py-1 text-body">
                  Plan used for · stated
                </span>
                <span className="rounded-full border border-line px-2.5 py-1 text-body">Consent on file</span>
                <span className="rounded-full border border-line px-2.5 py-1 text-body">Results vary</span>
              </div>
            </figure>
          </div>

          <ul className="border-t border-line">
            {INCLUDES.map(({ icon: Icon, title, body }, i) => (
              <Reveal as="li" key={title} delayMs={i * 80} className="flex gap-5 border-b border-line py-8">
                <Icon className="mt-1 size-5 shrink-0 text-brand" aria-hidden />
                <div>
                  <h3 className="text-lg font-semibold text-ink">{title}</h3>
                  <p className="mt-2 max-w-[56ch] leading-relaxed text-body">{body}</p>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* How patients can choose to share */}
      <section className="bg-obsidian text-on-dark">
        <div className={`container-yhc ${SECTION_Y}`}>
          <h2 className="display max-w-2xl text-[clamp(2.25rem,1.6rem+2.4vw,3.5rem)] text-balance text-on-dark">
            If you would like to share yours
          </h2>
          <ol className="mt-10 grid gap-px overflow-hidden rounded-2xl bg-line-dark sm:grid-cols-2 md:mt-14 lg:grid-cols-4">
            {STEPS.map((step, i) => (
              <Reveal
                as="li"
                key={step.title}
                delayMs={i * 90}
                className="flex flex-col bg-obsidian p-6 md:p-7 lg:min-h-64"
              >
                <span className="font-display text-5xl leading-none text-platinum/70">{i + 1}</span>
                <h3 className="mt-8 text-lg font-semibold text-on-dark lg:mt-auto">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-on-dark-muted">{step.body}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* Privacy promise */}
      <section className={`container-yhc ${SECTION_Y}`}>
        <div className="grid gap-10 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-16">
          <h2 className="display text-[clamp(2.25rem,1.6rem+2.4vw,3.5rem)] text-balance">
            Our privacy promise
          </h2>
          <div>
            <ul className="space-y-4 text-lg leading-relaxed text-body">
              {[
                'Your scalp photos are for your doctor. Using them in a story needs a separate yes, in writing.',
                'We never share your diagnosis, prescription or consultation notes.',
                'A story never shows your phone number, address or anything that could help someone contact you.',
                'If you change your mind, we take your story off the site.',
              ].map((line) => (
                <li key={line} className="flex gap-4">
                  <span className="mt-[0.8em] h-px w-5 shrink-0 bg-steel" aria-hidden />
                  {line}
                </li>
              ))}
            </ul>
            <p className="mt-8 text-sm text-muted-foreground">
              {t('common.resultsVary')} Read how we handle your data in the{' '}
              <Link href="/legal/privacy" className="text-ink underline decoration-steel underline-offset-4">
                privacy policy
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      <CtaBand
        id="stories-cta-heading"
        image={SLOTS.H18}
        imagePosition="50% 30%"
        align="right"
        bookLabel={terms.bookLabel}
        title="Every story starts with a consultation."
        body="Tell Dr. Tyagi what you are noticing. If a plan can help, we send it on WhatsApp after the call. You do not have to buy it."
      />
    </>
  );
}
