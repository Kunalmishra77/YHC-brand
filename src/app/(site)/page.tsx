import type { Metadata } from 'next';
import { ArrowRight, BadgeCheck, Clock3, MessageCircle, ScanLine, Stethoscope } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { getConsultTerms } from '@/components/site/consult-fee';
import { DoctorCard } from '@/components/site/doctor-card';
import { EvidenceSection } from '@/components/site/evidence-section';
import { FaqList, visibleFaqs } from '@/components/site/faq-list';
import { GuaranteeVideoPanel, guaranteeStory } from '@/components/site/guarantee-panel';
import { HairCycleDiagram } from '@/components/site/hair-cycle-diagram';
import { HomeHero } from '@/components/site/home-hero';
import { JourneyTimeline, buildTrustJourney } from '@/components/site/journey-timeline';
import { JsonLd } from '@/components/site/json-ld';
import { PatentSlot } from '@/components/site/patent-slot';
import { ProductTile } from '@/components/site/product-tile';
import { ResultsGallery } from '@/components/site/results-gallery';
import { Reveal } from '@/components/site/reveal';
import { ScanVisual } from '@/components/site/scan-visual';
import {
  CTA_GHOST_DARK,
  CTA_SILVER,
  H2,
  RAIL,
  RAIL_ITEM,
  SECTION_Y,
  SectionHeader,
  TEXT_LINK,
} from '@/components/site/section';
import { pageMetadata } from '@/components/site/seo';
import { VideoLibrary, type StoryVideo } from '@/components/site/video-library';
import { Button } from '@/components/ui/button';
import { t } from '@/i18n/en';
import { doctorClaimLabel } from '@/lib/claims';
import { clientEnv } from '@/lib/env';
import { MEDIA, VIDEOS } from '@/lib/images';
import { SITE } from '@/lib/site';
import { getDoctor, getFaqs, getGuarantee, getProducts } from '@/server/catalog';
import { getPublishedResults } from '@/server/content/results';

// Guarantee visibility and fees are live settings (admin can change them in the demo).
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  ...pageMetadata({
    title: 'Science-first, doctor-led hair care',
    description:
      'Hair care begins with science, not with products. Start with a guided 3D scalp scan; a dermatologist decides whether treatment can help before anything is prescribed.',
    path: '/',
  }),
  title: { absolute: 'Your Hair Company — Hair care begins with science, not with products' },
};

const SHOWCASE = ['topical-hair-solution', 'scalp-serum', 'hair-nutrition-tablets'];

export default function HomePage() {
  const doctor = getDoctor();
  const guarantee = getGuarantee();
  const terms = getConsultTerms();
  const products = getProducts();
  const showcase = SHOWCASE.map((slug) => products.find((p) => p.slug === slug)).filter(
    (p): p is NonNullable<typeof p> => Boolean(p),
  );
  const targets = products
    .filter((p) => p.requiresConsultation)
    .flatMap((p) => p.ingredients.slice(0, 2).map((ing) => ({ ...ing, product: p.name, slug: p.slug })));
  const faqs = visibleFaqs(getFaqs(), guarantee !== null).slice(0, 6);
  const journey = buildTrustJourney({ fee: terms.fee, slotMinutes: terms.slotMinutes });
  const results = getPublishedResults();

  const stories: StoryVideo[] = [
    {
      id: 'science',
      kicker: 'The science',
      title: 'How a hair root works',
      summary: 'Follicles, the dermal papilla and the three-phase growth cycle, in under a minute.',
      video: VIDEOS.science,
      captions: [
        { at: 0, text: 'Every hair grows from a follicle beneath the skin.' },
        { at: 4, text: 'At its base, the dermal papilla feeds the growing root.' },
        { at: 8, text: 'Hair moves through growth, transition and rest.' },
        { at: 12, text: 'While the root is alive, a new growth phase can begin.' },
      ],
    },
    {
      id: 'journey',
      kicker: 'The journey',
      title: 'From scan to plan',
      summary: 'What happens between your first details and your doctor’s plan.',
      video: VIDEOS.journey,
      captions: [
        { at: 0, text: 'Start with your basic details and a guided 3D scalp scan.' },
        { at: 4, text: 'A personalised assessment shows whether treatment looks suitable.' },
        { at: 8, text: 'A doctor reviews your health form and meets you on video.' },
        { at: 12, text: 'A plan is prescribed only if it is right for you — then followed up.' },
      ],
    },
    ...(guarantee ? [guaranteeStory(guarantee)] : []),
  ];

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'Your Hair Company',
          url: clientEnv.NEXT_PUBLIC_SITE_URL,
          email: SITE.supportEmail,
          description: 'Science-first, doctor-led hair care: scalp scan, video consultation and follow-up.',
          areaServed: 'IN',
        }}
      />

      {/* 1 · Hero — video, headline, glass start form */}
      <HomeHero
        doctorName={doctor.name}
        registrationNo={doctor.registrationNo}
        guaranteeOn={guarantee !== null}
      />

      {/* 2a · Credibility strip — facts only, no invented numbers */}
      <section
        id="credibility"
        aria-label="Credentials"
        className="scroll-mt-20 border-b border-line bg-card"
      >
        <div className="container-yhc py-8 md:py-10">
          <dl className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl bg-line ring-1 ring-line sm:grid-cols-2 lg:grid-cols-4">
            <Credential
              icon={<Clock3 className="size-5" aria-hidden />}
              term={`${terms.slotMinutes}-min consultation`}
            >
              One to one, on video, with {doctor.name}
            </Credential>
            <Credential
              icon={<Stethoscope className="size-5" aria-hidden />}
              term="Prescribed by a dermatologist"
            >
              Plans only after a one-to-one consultation
            </Credential>
            <Credential
              icon={<BadgeCheck className="size-5" aria-hidden />}
              term={`Reg. No. ${doctor.registrationNo}`}
            >
              {doctor.council}
            </Credential>
            <Credential icon={<ScanLine className="size-5" aria-hidden />} term="Scan before treatment">
              We treat only when viable roots are present
            </Credential>
          </dl>
        </div>
      </section>

      {/* 2b · The science */}
      <section
        id="science"
        className={`container-yhc scroll-mt-20 ${SECTION_Y}`}
        aria-labelledby="science-heading"
      >
        <div className="grid gap-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
          <Reveal>
            <p className="eyebrow">The science</p>
            <h2 id="science-heading" className={`${H2} mt-4`}>
              Hair grows from roots. So that is where we start.
            </h2>
            <p className="mt-6 max-w-[62ch] text-lg leading-relaxed text-pretty text-body">
              Each hair grows from a follicle, fed by a tiny structure at its base called the dermal papilla.
              Follicles cycle between growth, transition and rest. Thinning often means more follicles resting
              — or growing smaller, finer hairs — for reasons that differ from person to person.
            </p>
            <p className="mt-4 max-w-[62ch] leading-relaxed text-pretty text-body">
              A plan can only support follicles that are still alive. That is why we look at your roots first,
              and why a doctor — not a shopping cart — decides what, if anything, you use.
            </p>
            <PatentSlot className="mt-8" />
            <Link href="/science" className={`mt-6 text-ink ${TEXT_LINK}`}>
              Read the science in full <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Reveal>
          <Reveal delayMs={120}>
            <div className="rounded-3xl bg-card p-5 shadow-card ring-1 ring-line sm:p-8">
              <HairCycleDiagram />
            </div>
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-ink">What a prescribed plan aims to support</h3>
              <dl className="mt-4 grid gap-x-8 border-t border-line sm:grid-cols-2">
                {targets.map((ing) => (
                  <div key={`${ing.slug}-${ing.name}`} className="border-b border-line py-4">
                    <dt className="font-medium text-ink">{ing.role}</dt>
                    <dd className="mt-1 text-sm text-body">
                      {ing.name} ·{' '}
                      <Link
                        href={`/products/${ing.slug}`}
                        className="underline underline-offset-2 hover:text-ink"
                      >
                        {ing.product}
                      </Link>
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="mt-4 text-sm text-muted-foreground">
                Ingredients and strengths are chosen by the doctor for each person. {t('common.resultsVary')}
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 2b′ · What the research says (content workstream owns the block) */}
      <EvidenceSection variant="compact" />

      {/* 2c · Why we scan first */}
      <section id="scan" className="scroll-mt-20 bg-obsidian text-on-dark" aria-labelledby="scan-heading">
        <div className={`container-yhc grid items-center gap-12 lg:grid-cols-2 lg:gap-20 ${SECTION_Y}`}>
          <Reveal className="order-2 lg:order-1">
            <ScanVisual className="aspect-[4/5] sm:aspect-[16/11] lg:aspect-[4/5]" />
          </Reveal>
          <Reveal className="order-1 lg:order-2" delayMs={120}>
            <p className="eyebrow text-brand-on-dark">Why we scan first</p>
            <h2 id="scan-heading" className={`${H2} mt-4 text-on-dark`}>
              We only treat when there are roots to treat.
            </h2>
            <p className="mt-6 max-w-[62ch] text-lg leading-relaxed text-pretty text-on-dark-muted">
              A guided 3D scalp scan on your phone looks at where your roots are and how they are spread. If
              viable roots are present, a doctor builds on that. If they are not, we tell you honestly instead
              of selling you a plan.
            </p>
            <ol className="mt-8 space-y-5">
              {[
                [
                  'Scan',
                  'Follow on-screen guidance to capture your scalp from a few angles — at home, in minutes.',
                ],
                [
                  'Assess',
                  'You get a personalised assessment: suitable, needs a doctor’s review, or not suitable — with reasons.',
                ],
                [
                  'Decide',
                  'The doctor confirms everything at your consultation. Nothing is prescribed before that.',
                ],
              ].map(([title, body], i) => (
                <li key={title} className="flex gap-4">
                  <span className="price flex size-8 shrink-0 items-center justify-center rounded-full border border-line-dark text-sm text-on-dark">
                    {i + 1}
                  </span>
                  <div className="min-w-0 pt-1">
                    <p className="font-semibold text-on-dark">{title}</p>
                    <p className="mt-1 text-[15px] leading-relaxed text-on-dark-muted">{body}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                asChild
                className="h-12 bg-[image:var(--yhc-silver)] px-7 text-base font-semibold text-obsidian hover:opacity-95"
              >
                <Link href="/start">Begin my 3D scan</Link>
              </Button>
              <p className="text-[13px] text-on-dark-muted">Free · final assessment always by the doctor</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 2d · The journey */}
      <section className="border-b border-line bg-card" aria-labelledby="journey-heading">
        <div className={`container-yhc ${SECTION_Y}`}>
          <SectionHeader
            id="journey-heading"
            eyebrow="Your journey"
            title="Seven considered steps, one doctor"
            lede="Every step has a reason. You see where you stand after the scan, and you only book a doctor’s slot when it makes sense to."
          />
          <Reveal>
            <JourneyTimeline steps={journey} tone="light" />
          </Reveal>
        </div>
      </section>

      {/* 2e · Doctor-recommended — meet Dr. Tyagi */}
      <section className={`container-yhc ${SECTION_Y}`} aria-label={`Meet ${doctor.name}`}>
        <p className="eyebrow mb-8 md:mb-10">{doctorClaimLabel()} · Dermatologist-led</p>
        <DoctorCard doctor={doctor}>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button asChild className="h-12 px-6">
              <Link href="/start">Begin my 3D scan</Link>
            </Button>
            <Button asChild variant="outline" className="h-12 border-steel px-6">
              <Link href="/doctor-tyagi">About {doctor.name}</Link>
            </Button>
          </div>
        </DoctorCard>
      </section>

      {/* 2f · Before / after — consented results only */}
      <section className="border-y border-line bg-card" aria-labelledby="results-heading">
        <div className={`container-yhc ${SECTION_Y}`}>
          <SectionHeader
            id="results-heading"
            eyebrow="Results"
            title="Real results, shared with consent"
            lede="Before-and-after photos from patients who agreed in writing, with the time on plan stated. Individual results vary."
            action={
              <Link href="/results" className={`text-ink ${TEXT_LINK}`}>
                How we collect results <ArrowRight className="size-4" aria-hidden />
              </Link>
            }
          />
          <ResultsGallery results={results} layout="rail" />
        </div>
      </section>

      {/* 2g · Money-back guarantee (hidden while guarantee.enabled = false) */}
      {guarantee ? <GuaranteeVideoPanel guarantee={guarantee} /> : null}

      {/* 2h · Watch */}
      <section
        className="border-t border-line-dark bg-[#0d0e10] text-on-dark"
        aria-labelledby="watch-heading"
      >
        <div className={`container-yhc ${SECTION_Y}`}>
          <SectionHeader
            id="watch-heading"
            tone="dark"
            eyebrow="Watch"
            title={`The science, the journey${guarantee ? ', the guarantee' : ''} — explained`}
            lede="Short, silent explainers with captions over illustrative laboratory footage. No actors playing patients, no testimonials."
          />
          <VideoLibrary videos={stories} />
        </div>
      </section>

      {/* 2i · What a plan may include — secondary, quiet */}
      <section className={`container-yhc ${SECTION_Y}`} aria-labelledby="plan-heading">
        <SectionHeader
          id="plan-heading"
          size="sm"
          eyebrow="Prescribed, not sold"
          title="What a plan may include"
          lede="Only if the doctor decides treatment is right for you. Strength, dose and timing are set at your consultation."
        />
        <ul className={RAIL} aria-label="Products a plan may include">
          {showcase.map((p) => (
            <li key={p.id} className={RAIL_ITEM}>
              <ProductTile product={p} sizes="(min-width: 1024px) 30vw, (min-width: 640px) 46vw, 82vw" />
            </li>
          ))}
        </ul>
      </section>

      {/* 2j · FAQs */}
      <section className="border-t border-line bg-card" aria-labelledby="faq-heading">
        <div
          className={`container-yhc grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20 ${SECTION_Y}`}
        >
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="eyebrow">FAQs</p>
            <h2 id="faq-heading" className={`${H2} mt-4 max-w-md`}>
              Questions people ask first
            </h2>
            <p className="mt-5 max-w-sm leading-relaxed text-pretty text-body">
              Scans, consultations and what happens next — in plain words.
            </p>
            <Link href="/faqs" className={`mt-4 text-ink ${TEXT_LINK}`}>
              All FAQs <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
          <FaqList faqs={faqs} />
        </div>
      </section>

      {/* 2k · Final CTA */}
      <section
        className="relative isolate overflow-hidden bg-obsidian text-on-dark"
        aria-labelledby="final-heading"
      >
        <div className="absolute inset-y-0 right-0 -z-10 w-full md:w-1/2" aria-hidden>
          <Image
            src={MEDIA.dnaParticles.src}
            alt=""
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover opacity-40 md:opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-obsidian via-obsidian/70 to-transparent" />
        </div>
        <div className={`container-yhc ${SECTION_Y}`}>
          <div className="max-w-xl">
            <h2
              id="final-heading"
              className="display text-[clamp(2.5rem,1.7rem+3vw,4rem)] text-balance text-on-dark"
            >
              Start with your roots, not a product.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-pretty text-on-dark-muted">
              Begin with a free guided 3D scan. If treatment looks suitable, book a {terms.slotMinutes}-minute
              consultation with {doctor.name} — and decide only after you have spoken to a doctor.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button asChild className={CTA_SILVER}>
                <Link href="/start">Begin my 3D scan</Link>
              </Button>
              <Button asChild variant="outline" className={CTA_GHOST_DARK}>
                <a href={SITE.whatsappUrl}>
                  <MessageCircle className="size-4" aria-hidden />
                  Ask on WhatsApp
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function Credential({
  icon,
  term,
  children,
}: {
  icon: React.ReactNode;
  term: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full gap-4 bg-card p-5 md:p-6">
      <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full bg-mist text-ink">
        {icon}
      </span>
      <div>
        <dt className="font-semibold text-ink">{term}</dt>
        <dd className="mt-1 text-sm leading-snug text-body">{children}</dd>
      </div>
    </div>
  );
}
