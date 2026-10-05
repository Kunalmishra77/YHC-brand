import type { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { BackgroundVideo } from '@/components/site/background-video';
import { FaqList } from '@/components/site/faq-list';
import { GuaranteeConditionList, guaranteeStory, refundLine } from '@/components/site/guarantee-panel';
import { PageIntro } from '@/components/site/page-intro';
import { pageMetadata } from '@/components/site/seo';
import { VideoLibrary } from '@/components/site/video-library';
import { Button } from '@/components/ui/button';
import { t } from '@/i18n/en';
import { VIDEOS } from '@/lib/images';
import { getFaqs, getGuarantee } from '@/server/catalog';

// Visibility follows the live `guarantee.enabled` setting.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = pageMetadata({
  title: 'Money-back guarantee',
  description:
    'How the YHC money-back guarantee works: the conditions, how to claim and how a doctor reviews every claim.',
  path: '/guarantee',
});

export default function GuaranteePage() {
  const guarantee = getGuarantee();

  if (!guarantee) {
    return (
      <PageIntro
        eyebrow="Guarantee"
        title="The guarantee is not being offered right now"
        lede="When it is available, its full conditions will be published here before anyone is asked to pay. You can still start with a free 3D scan and a doctor consultation."
      >
        <Button asChild className="h-12 px-6">
          <Link href="/start">Begin my 3D scan</Link>
        </Button>
      </PageIntro>
    );
  }

  const faqs = getFaqs().filter((f) => f.category === 'guarantee');
  const steps = [
    {
      title: 'Follow your plan',
      body: `Use your prescribed plan continuously for at least ${guarantee.minPlanMonths} months, as the doctor set it.`,
    },
    {
      title: 'Stay in touch',
      body: `Reply to at least ${guarantee.minCheckinResponsePct}% of weekly check-ins${guarantee.requireMonthlyPhotos ? ' and share monthly progress photos' : ''}.`,
    },
    {
      title: 'Make a claim',
      body: `If you see no visible improvement, claim from your account within ${guarantee.claimWindowDays} days of finishing the plan.`,
    },
    {
      title: 'Doctor review',
      body: 'A doctor reviews your photos and check-ins against the published conditions and explains the decision.',
    },
  ];

  return (
    <>
      <section className="relative isolate overflow-hidden bg-obsidian text-on-dark">
        <BackgroundVideo video={VIDEOS.guarantee} priority className="-z-20" />
        <div className="absolute inset-0 -z-10 bg-obsidian/60" aria-hidden />
        <div
          className="absolute inset-0 -z-10 bg-gradient-to-r from-obsidian via-obsidian/70 to-transparent"
          aria-hidden
        />
        <div className="container-yhc py-20 md:py-32">
          <p className="eyebrow text-brand-on-dark">Money-back guarantee</p>
          <h1 className="display mt-4 max-w-3xl text-[clamp(2.5rem,1.7rem+3vw,4.25rem)] leading-[1.04] text-on-dark">
            A guarantee with its conditions in plain sight.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-on-dark-muted">
            Hair responds slowly and differently for everyone. {refundLine(guarantee)} if you follow your plan
            as prescribed, meet every condition below and a doctor confirms there has been no visible
            improvement.
          </p>
          {guarantee.isDraft ? (
            <p className="mt-4 text-[13px] text-on-dark-muted">{t('common.draftTerms')}</p>
          ) : null}
        </div>
      </section>

      <section
        className="container-yhc grid gap-12 py-20 md:grid-cols-2 md:gap-16 md:py-28"
        aria-labelledby="conditions-heading"
      >
        <div>
          <h2 id="conditions-heading" className="display text-[clamp(2.1rem,1.5rem+2.2vw,3.25rem)]">
            The conditions
          </h2>
          <p className="mt-4 max-w-md text-body">
            All of them apply. They exist so a claim can be judged fairly on how a plan was actually followed.
          </p>
          <Link
            href="/legal/guarantee"
            className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-ink underline decoration-steel underline-offset-[6px]"
          >
            Read the full legal terms <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
        <div className="rounded-2xl bg-card p-6 ring-1 ring-line md:p-8">
          <GuaranteeConditionList guarantee={guarantee} tone="light" className="text-ink" />
        </div>
      </section>

      <section className="border-y border-line bg-card" aria-labelledby="claim-heading">
        <div className="container-yhc py-20 md:py-28">
          <h2 id="claim-heading" className="display text-[clamp(2.1rem,1.5rem+2.2vw,3.25rem)]">
            How a claim works
          </h2>
          <ol className="mt-12 grid gap-px overflow-hidden rounded-2xl bg-line md:grid-cols-4">
            {steps.map((s, i) => (
              <li key={s.title} className="bg-card p-6 md:min-h-60 md:p-7">
                <span className="font-display text-5xl leading-none text-steel">{i + 1}</span>
                <h3 className="mt-6 text-lg font-semibold text-ink">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-body">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-[#0d0e10] text-on-dark" aria-labelledby="watch-guarantee-heading">
        <div className="container-yhc grid items-center gap-10 py-20 md:grid-cols-2 md:py-28">
          <div>
            <p className="eyebrow text-brand-on-dark">Watch</p>
            <h2
              id="watch-guarantee-heading"
              className="display mt-4 text-[clamp(2.1rem,1.5rem+2.2vw,3.25rem)] text-on-dark"
            >
              The guarantee in under a minute
            </h2>
            <p className="mt-4 max-w-md text-on-dark-muted">
              A silent explainer with captions over illustrative footage — not a testimonial.
            </p>
          </div>
          <VideoLibrary className="md:grid-cols-1" videos={[guaranteeStory(guarantee)]} />
        </div>
      </section>

      {faqs.length > 0 ? (
        <section className="container-yhc grid gap-12 py-20 md:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] md:py-28">
          <h2 className="display text-[clamp(2.1rem,1.5rem+2.2vw,3.25rem)]">Guarantee questions</h2>
          <FaqList faqs={faqs} />
        </section>
      ) : null}

      <section className="border-t border-line bg-card">
        <div className="container-yhc flex flex-col items-start gap-6 py-16 md:flex-row md:items-center md:justify-between">
          <p className="max-w-xl text-lg text-body">
            The guarantee applies to plans prescribed after a consultation. It starts with a free 3D scan.
          </p>
          <Button asChild className="h-12 px-6">
            <Link href="/start">Begin my 3D scan</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
