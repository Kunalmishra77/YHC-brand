import { Camera, Clock, FileCheck2, Quote } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getConsultTerms } from '@/components/site/consult-fee';
import { CtaBand } from '@/components/site/cta-band';
import { pageMetadata } from '@/components/site/seo';
import { StoriesEmpty } from '@/components/site/stories-empty';
import { t } from '@/i18n/en';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = pageMetadata({
  title: 'Real stories',
  description:
    'Experiences shared by Your Hair Company patients — published only with their written consent, unretouched, with a note that results vary.',
  path: '/stories',
});

const INCLUDES = [
  {
    icon: Quote,
    title: 'Their words, unedited for effect',
    body: 'What they noticed, why they booked and what following the plan was like — trimmed for length only, never rewritten to sound better.',
  },
  {
    icon: Clock,
    title: 'How long they used their plan',
    body: 'Stated plainly, so you can see the time involved rather than a headline result.',
  },
  {
    icon: Camera,
    title: 'Unretouched photos, only with photo consent',
    body: 'Taken the same way each month — same angles, same light. No filters, no editing, and only with a separate consent to use photos.',
  },
  {
    icon: FileCheck2,
    title: 'A clear note that results vary',
    body: 'Every story says that individual results vary. One person’s experience is not a promise about yours.',
  },
];

const STEPS = [
  {
    title: 'You are asked, never expected',
    body: 'Some patients may be invited to share their experience after a follow-up review. Saying no changes nothing about your care.',
  },
  {
    title: 'You choose what to share',
    body: 'Words only, or words with photos. Your first name, your initials, or neither. Each is a separate choice, recorded with your consent.',
  },
  {
    title: 'You see it before anyone else',
    body: 'Nothing is published until you have read the final version and agreed to it in writing.',
  },
  {
    title: 'You can take it down',
    body: 'Withdraw your consent at any time from your account or by message, and the story and photos are removed from the site.',
  },
];

export default function StoriesPage() {
  const terms = getConsultTerms();
  // FR-M1-6: only reviews with stored publication consent would be listed here. None exist yet.
  return (
    <>
      <section className="border-b border-line">
        <div className="container-yhc grid gap-8 py-16 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:items-end md:py-24">
          <h1 className="display text-[clamp(2.5rem,1.7rem+3vw,4rem)] text-balance">
            Real stories, only when patients choose to share them
          </h1>
          <p className="text-lg leading-relaxed text-body">
            Hair changes are personal. We publish a story only when the patient has agreed in writing, and
            photos only with a separate photo consent. We would rather show nothing than show something
            invented.
          </p>
        </div>
      </section>

      <section className="container-yhc py-16 md:py-24">
        <StoriesEmpty />
      </section>

      {/* What a published story will include */}
      <section className="container-yhc pb-20 md:pb-28">
        <div className="grid gap-12 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-16">
          <div className="md:sticky md:top-28 md:self-start">
            <h2 className="display text-[clamp(2.25rem,1.6rem+2.4vw,3.5rem)] text-balance">
              What every story will include
            </h2>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-body">
              When stories appear here, each one will follow the same format — so you can judge them fairly.
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
                    {label} · unretouched
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
            {INCLUDES.map(({ icon: Icon, title, body }) => (
              <li key={title} className="flex gap-5 border-b border-line py-8">
                <Icon className="mt-1 size-5 shrink-0 text-brand" aria-hidden />
                <div>
                  <h3 className="text-lg font-semibold text-ink">{title}</h3>
                  <p className="mt-2 max-w-[56ch] leading-relaxed text-body">{body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* How patients can choose to share */}
      <section className="bg-obsidian text-on-dark">
        <div className="container-yhc py-20 md:py-28">
          <h2 className="display max-w-2xl text-[clamp(2.25rem,1.6rem+2.4vw,3.5rem)] text-balance text-on-dark">
            If you would like to share yours
          </h2>
          <ol className="mt-14 grid gap-px overflow-hidden rounded-2xl bg-line-dark sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, i) => (
              <li key={step.title} className="flex flex-col bg-obsidian p-6 md:p-7 lg:min-h-72">
                <span className="font-display text-5xl leading-none text-platinum/70">{i + 1}</span>
                <h3 className="mt-8 text-lg font-semibold text-on-dark lg:mt-auto">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-on-dark-muted">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Privacy promise */}
      <section className="container-yhc py-20 md:py-28">
        <div className="grid gap-10 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-16">
          <h2 className="display text-[clamp(2.25rem,1.6rem+2.4vw,3.5rem)] text-balance">
            Our privacy promise
          </h2>
          <div>
            <ul className="space-y-4 text-lg leading-relaxed text-body">
              {[
                'Your scalp photos are for your doctor. Using them in a story needs a separate, written consent.',
                'We never publish your diagnosis, prescription or consultation notes.',
                'A story never shows your phone number, address or anything that could be used to contact you.',
                'Withdrawing consent removes your story from the site.',
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
        bookLabel={terms.bookLabel}
        title="Every story starts with a consultation."
        body="Talk to Dr. Tyagi about what you are noticing. If a plan is right for you, it is sent on WhatsApp after the call — with no obligation to buy it."
      />
    </>
  );
}
