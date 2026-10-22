import type { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { CtaBand } from '@/components/site/cta-band';
import { FaqList } from '@/components/site/faq-list';
import { GuaranteeConditionList, guaranteeStory, refundLine } from '@/components/site/guarantee-panel';
import { PageIntro } from '@/components/site/page-intro';
import { Reveal } from '@/components/site/reveal';
import { H2, LEDE, SECTION_Y, SectionHeader } from '@/components/site/section';
import { pageMetadata } from '@/components/site/seo';
import { VideoLibrary } from '@/components/site/video-library';
import { Button } from '@/components/ui/button';
import { SLOTS } from '@/lib/slots';
import { getFaqs, getGuarantee } from '@/server/catalog';

// Visibility follows the live `guarantee.enabled` setting.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = pageMetadata({
  title: 'Money-back guarantee',
  description:
    'How the Your Hair Company money-back guarantee works: the conditions, how to make a claim, and how a doctor checks every claim personally.',
  path: '/guarantee',
});

export default function GuaranteePage() {
  const guarantee = getGuarantee();

  if (!guarantee) {
    return (
      <PageIntro
        eyebrow="Guarantee"
        title="No guarantee is on offer right now"
        lede="When it comes back, we will show its full conditions here before anyone pays. You can still start with a free 3D scan and a doctor consultation."
      >
        <Button asChild className="h-12 px-6">
          <Link href="/start">Begin my free 3D scan</Link>
        </Button>
      </PageIntro>
    );
  }

  const faqs = getFaqs().filter((f) => f.category === 'guarantee');
  const steps = [
    {
      title: 'Follow your plan',
      body: `Use your plan every day, as your doctor set it, for at least ${guarantee.minPlanMonths} months in a row.`,
    },
    {
      title: 'Stay in touch',
      body: `Reply to at least ${guarantee.minCheckinResponsePct}% of weekly check-ins${guarantee.requireMonthlyPhotos ? ' and send monthly progress photos' : ''}.`,
    },
    {
      title: 'Make a claim',
      body: `No visible improvement? Claim from your account within ${guarantee.claimWindowDays} days of finishing the plan.`,
    },
    {
      title: 'Doctor check',
      body: 'A doctor checks your photos and check-ins against the written conditions, and explains the answer.',
    },
  ];

  return (
    <>
      <PageIntro
        eyebrow="Money-back guarantee"
        title="A guarantee with nothing hidden."
        tone="dark"
        image={SLOTS.H26}
        lede={
          <p>
            Hair changes slowly, and differently for everyone. {refundLine(guarantee)} if you use your plan as
            prescribed, meet every condition below, and a doctor confirms no visible improvement.
          </p>
        }
      />

      <section
        className={`container-yhc grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16 ${SECTION_Y}`}
        aria-labelledby="conditions-heading"
      >
        <div>
          <h2 id="conditions-heading" className={H2}>
            The conditions
          </h2>
          <p className={`mt-5 text-body ${LEDE}`}>
            You must meet all of them. They let us judge every claim fairly, on how the plan was really used.
          </p>
          <Link
            href="/legal/guarantee"
            className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-ink underline decoration-steel underline-offset-[6px]"
          >
            Read the full legal terms <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
        <Reveal delayMs={100} className="rounded-2xl bg-card p-6 shadow-card ring-1 ring-line/80 md:p-8">
          <GuaranteeConditionList guarantee={guarantee} tone="light" className="text-ink" />
        </Reveal>
      </section>

      <section className="border-y border-line bg-card" aria-labelledby="claim-heading">
        <div className={`container-yhc ${SECTION_Y}`}>
          <SectionHeader id="claim-heading" eyebrow="Step by step" title="How a claim works" />
          <ol className="grid gap-px overflow-hidden rounded-2xl bg-line ring-1 ring-line sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <Reveal as="li" key={s.title} delayMs={i * 90} className="bg-card p-6 md:p-7 lg:min-h-56">
                <span className="font-display text-5xl leading-none text-steel">{i + 1}</span>
                <h3 className="mt-6 text-lg font-semibold text-ink">{s.title}</h3>
                <p className="mt-2 max-w-[48ch] text-sm leading-relaxed text-pretty text-body">{s.body}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-[#0d0e10] text-on-dark" aria-labelledby="watch-guarantee-heading">
        <div
          className={`container-yhc grid items-center gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16 ${SECTION_Y}`}
        >
          <div>
            <p className="eyebrow text-brand-on-dark">Watch</p>
            <h2 id="watch-guarantee-heading" className={`${H2} mt-4 max-w-md text-on-dark`}>
              The guarantee in under a minute
            </h2>
            <p className="mt-4 max-w-md leading-relaxed text-pretty text-on-dark-muted">
              A short silent video with captions, over illustrative footage. Not a customer review.
            </p>
          </div>
          <VideoLibrary className="max-w-2xl lg:max-w-none" videos={[guaranteeStory(guarantee)]} />
        </div>
      </section>

      {faqs.length > 0 ? (
        <section
          className={`container-yhc grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20 ${SECTION_Y}`}
          aria-labelledby="guarantee-faq-heading"
        >
          <h2 id="guarantee-faq-heading" className={`${H2} max-w-md`}>
            Guarantee questions
          </h2>
          <FaqList faqs={faqs} />
        </section>
      ) : null}

      <CtaBand
        id="guarantee-cta-heading"
        image={SLOTS.H19}
        imagePosition="30% 35%"
        align="right"
        title="It all starts with a free 3D scan."
        body="The guarantee covers plans your doctor prescribes after a consultation."
        primary={{ href: '/start', label: 'Begin my free 3D scan' }}
        secondary={{ href: '/legal/guarantee', label: 'Read the full terms' }}
      />
    </>
  );
}
