import type { Metadata } from 'next';
import { Check, MessageCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { ConcernList } from '@/components/site/concern-list';
import { getConsultTerms } from '@/components/site/consult-fee';
import { DoctorCard } from '@/components/site/doctor-card';
import { FaqList, visibleFaqs } from '@/components/site/faq-list';
import { HomeHero } from '@/components/site/home-hero';
import { JsonLd } from '@/components/site/json-ld';
import { buildJourney } from '@/components/site/journey-steps';
import { getNextSlotLabel } from '@/components/site/next-slot';
import { PlanLadder } from '@/components/site/plan-ladder';
import { ProductTile } from '@/components/site/product-tile';
import { pageMetadata } from '@/components/site/seo';
import { StoriesEmpty } from '@/components/site/stories-empty';
import { Button } from '@/components/ui/button';
import { t } from '@/i18n/en';
import { clientEnv } from '@/lib/env';
import { IMAGES } from '@/lib/images';
import { SITE } from '@/lib/site';
import { getConcerns, getDoctor, getFaqs, getGuarantee, getPlans, getProducts } from '@/server/catalog';

// Guarantee visibility, fees and the next free slot are live (admin can change them in the demo).
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  ...pageMetadata({
    title: 'Doctor-led hair care, online',
    description:
      'Book a video consultation with Dr. Tyagi, get a hair plan chosen for your pattern and history, delivered across India with follow-up care.',
    path: '/',
  }),
  title: { absolute: 'Your Hair Company — Doctor-led hair care with Dr. Tyagi' },
};

const SHOWCASE = ['topical-hair-solution', 'scalp-serum', 'hair-nutrition-tablets'];

export default function HomePage() {
  const doctor = getDoctor();
  const plans = getPlans();
  const guarantee = getGuarantee();
  const terms = getConsultTerms();
  const products = getProducts();
  const showcase = SHOWCASE.map((slug) => products.find((p) => p.slug === slug)).filter(
    (p): p is NonNullable<typeof p> => Boolean(p),
  );
  const faqs = visibleFaqs(getFaqs(), guarantee !== null).slice(0, 5);
  const journey = buildJourney(terms);
  const ingredients = products
    .flatMap((p) => p.ingredients.map((ing) => ({ ...ing, product: p.name, slug: p.slug })))
    .filter((ing, i, all) => all.findIndex((x) => x.name === ing.name) === i)
    .slice(0, 6);

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'Your Hair Company',
          url: clientEnv.NEXT_PUBLIC_SITE_URL,
          email: SITE.supportEmail,
          description: 'Doctor-led hair care: video consultations, personalised plans and follow-up care.',
          areaServed: 'IN',
        }}
      />

      {/* 1 · Hero (+ trust facts rail, FR-M1-2) */}
      <HomeHero
        bookLabel={terms.bookLabel}
        slotMinutes={terms.slotMinutes}
        fee={terms.fee}
        creditNote={terms.creditEnabled ? 'credited to your first plan*' : null}
        nextSlot={getNextSlotLabel()}
        doctorName={doctor.name}
        registrationNo={doctor.registrationNo}
      />

      {/* 2 · Hair concerns */}
      <section id="concerns" className="container-yhc scroll-mt-20 py-20 md:py-28">
        <div className="grid gap-12 md:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]">
          <div className="md:sticky md:top-28 md:self-start">
            <h2 className="display text-[clamp(2.25rem,1.6rem+2.4vw,3.5rem)]">What are you noticing?</h2>
            <p className="mt-5 max-w-sm text-lg leading-relaxed text-body">
              Start with what you see. Most concerns have more than one possible cause — finding yours is what
              the consultation is for.
            </p>
            <Link
              href="/assessment"
              className="mt-7 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-ink underline decoration-steel underline-offset-[6px] hover:decoration-ink"
            >
              Not sure? Take the 3-minute assessment
            </Link>
          </div>
          <ConcernList concerns={getConcerns()} />
        </div>
      </section>

      {/* 3 · What a plan can include */}
      <section className="border-t border-line bg-[#efeeeb]/60">
        <div className="container-yhc py-20 md:py-28">
          <div className="grid gap-6 md:grid-cols-2 md:items-end">
            <h2 className="display text-[clamp(2.25rem,1.6rem+2.4vw,3.5rem)]">What a plan can include</h2>
            <p className="max-w-md text-body md:justify-self-end">
              Every plan is put together by {doctor.name} for one person. These are the products it draws on —
              strength, dose and timing are set at your consultation.
            </p>
          </div>
          <div className="mt-12 grid gap-x-6 gap-y-12 md:grid-cols-3">
            {showcase.map((p) => (
              <ProductTile key={p.id} product={p} />
            ))}
          </div>
          <p className="mt-10 text-sm text-body">
            Also in the range: a gentle shampoo and conditioner you can buy without a consultation.{' '}
            <Link href="/products" className="font-medium text-ink underline underline-offset-4">
              See all products
            </Link>
          </p>
        </div>
      </section>

      {/* 4 · How it works — a real sequence, so it is numbered */}
      <section className="relative overflow-hidden bg-obsidian text-on-dark">
        <div className="container-yhc py-20 md:py-28">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <h2 className="display max-w-xl text-[clamp(2.25rem,1.6rem+2.4vw,3.5rem)] text-on-dark">
              From first call to follow-up
            </h2>
            <Link
              href="/how-it-works"
              className="inline-flex min-h-11 items-center text-sm font-medium text-on-dark underline decoration-steel underline-offset-[6px]"
            >
              The full journey, step by step
            </Link>
          </div>
          <ol className="mt-14 grid gap-px overflow-hidden rounded-2xl bg-line-dark md:grid-cols-5">
            {journey.map((step, i) => (
              <li key={step.title} className="flex flex-col bg-obsidian p-6 md:min-h-72 md:p-7">
                <span className="font-display text-5xl leading-none text-platinum/70">{i + 1}</span>
                <h3 className="mt-8 text-lg font-semibold text-on-dark md:mt-auto">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-on-dark-muted">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 5 · Meet Dr. Tyagi */}
      <section className="container-yhc py-20 md:py-28">
        <DoctorCard doctor={doctor}>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild className="h-12 px-6">
              <Link href="/book">Book with {doctor.name}</Link>
            </Button>
            <Button asChild variant="outline" className="h-12 border-steel px-6">
              <Link href="/doctor-tyagi">About {doctor.name}</Link>
            </Button>
          </div>
        </DoctorCard>
      </section>

      {/* 6 · Treatment plans */}
      <section className="border-t border-line bg-card">
        <div className="container-yhc py-20 md:py-28">
          <div className="mb-14 grid gap-6 md:grid-cols-2 md:items-end">
            <h2 className="display text-[clamp(2.25rem,1.6rem+2.4vw,3.5rem)]">Treatment plans</h2>
            <p className="max-w-md text-body md:justify-self-end">
              Plans are prescribed after your consultation, never sold before it. Longer plans cost less per
              month. {t('common.inclGst')}.
            </p>
          </div>
          <PlanLadder plans={plans} guarantee={guarantee} creditLine={terms.creditLine} />
          <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <Button asChild className="h-12 px-6 text-base">
              <Link href="/book">Start with a consultation · {terms.fee}</Link>
            </Button>
            <Link
              href="/plans"
              className="inline-flex min-h-11 items-center text-sm font-medium text-ink underline decoration-steel underline-offset-[6px]"
            >
              Compare plans in detail
            </Link>
          </div>
        </div>
      </section>

      {/* 7 · Money-back guarantee (hidden while guarantee.enabled = false) */}
      {guarantee ? (
        <section className="bg-obsidian text-on-dark">
          <div className="grid md:grid-cols-2">
            <div className="relative min-h-80 md:min-h-[560px]">
              <Image src={IMAGES.heroStage.src} alt="" fill sizes="50vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian/80 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-obsidian" />
            </div>
            <div className="container-yhc flex flex-col justify-center py-16 md:max-w-xl md:px-14 md:py-24">
              <h2 className="display text-[clamp(2.25rem,1.6rem+2.4vw,3.25rem)] text-on-dark">
                A guarantee, with its conditions in plain sight
              </h2>
              <p className="mt-5 leading-relaxed text-on-dark-muted">
                Hair responds slowly and differently for everyone. If you follow your plan for the full period
                and see no visible improvement, you can claim a refund. A doctor reviews every claim.
              </p>
              <ul className="mt-8 space-y-3.5 text-[15px]">
                {[
                  `Follow your plan continuously for at least ${guarantee.minPlanMonths} months`,
                  `Reply to at least ${guarantee.minCheckinResponsePct}% of weekly check-ins`,
                  ...(guarantee.requireMonthlyPhotos ? ['Share progress photos every month'] : []),
                  ...(guarantee.requireFollowupConsult ? ['Attend your follow-up consultation'] : []),
                  `Claim within ${guarantee.claimWindowDays} days of finishing the plan`,
                ].map((line) => (
                  <li key={line} className="flex gap-3">
                    <Check className="mt-0.5 size-4 shrink-0 text-brand-on-dark" aria-hidden />
                    {line}
                  </li>
                ))}
              </ul>
              <p className="mt-8 text-sm text-on-dark-muted">
                {guarantee.isDraft ? `${t('common.draftTerms')}. ` : ''}
                <Link href="/legal/guarantee" className="text-on-dark underline underline-offset-4">
                  Read the full terms
                </Link>
              </p>
            </div>
          </div>
        </section>
      ) : null}

      {/* 8 · Ingredients & science */}
      <section className="container-yhc py-20 md:py-28">
        <div className="relative overflow-hidden rounded-2xl">
          <Image
            src={IMAGES.textureDrop.src}
            alt={IMAGES.textureDrop.alt}
            width={IMAGES.textureDrop.width}
            height={IMAGES.textureDrop.height}
            sizes="(min-width: 1200px) 1168px, 100vw"
            className="h-64 w-full object-cover md:h-96"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-pearl/90 via-pearl/40 to-transparent" />
          <div className="absolute inset-y-0 left-0 flex max-w-lg flex-col justify-center p-6 md:p-12">
            <h2 className="display text-[clamp(2rem,1.5rem+2vw,3.25rem)]">
              Ingredients, and why they are there
            </h2>
            <p className="mt-4 hidden text-body sm:block">
              Every product lists what is in it and what each part does. Nothing is chosen because it sounds
              impressive.
            </p>
          </div>
        </div>
        <dl className="mt-10 grid gap-x-10 border-t border-line sm:grid-cols-2 lg:grid-cols-3">
          {ingredients.map((ing) => (
            <div key={ing.name} className="border-b border-line py-6">
              <dt className="font-semibold text-ink">{ing.name}</dt>
              <dd className="mt-1.5 text-body">{ing.role}</dd>
              <dd className="mt-2 text-[13px] text-muted-foreground">
                In{' '}
                <Link href={`/products/${ing.slug}`} className="underline underline-offset-2 hover:text-ink">
                  {ing.product}
                </Link>
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-6 text-sm text-muted-foreground">{t('common.resultsVary')}</p>
      </section>

      {/* 9 · Real stories (consent-gated, FR-M1-6) */}
      <section className="container-yhc pb-20 md:pb-28">
        <h2 className="display mb-8 text-[clamp(2rem,1.5rem+2vw,3rem)]">Real stories</h2>
        <StoriesEmpty />
      </section>

      {/* 10 · FAQs */}
      <section className="border-t border-line bg-card">
        <div className="container-yhc grid gap-12 py-20 md:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] md:py-28">
          <div>
            <h2 className="display text-[clamp(2.25rem,1.6rem+2.4vw,3.5rem)]">Questions people ask first</h2>
            <Link
              href="/faqs"
              className="mt-7 inline-flex min-h-11 items-center text-sm font-medium text-ink underline decoration-steel underline-offset-[6px]"
            >
              All FAQs
            </Link>
          </div>
          <FaqList faqs={faqs} />
        </div>
      </section>

      {/* 11 · Final CTA */}
      <section className="relative isolate overflow-hidden bg-obsidian text-on-dark">
        <div className="absolute inset-y-0 right-0 -z-10 hidden w-1/2 md:block" aria-hidden>
          <Image
            src={IMAGES.heroPortrait.src}
            alt=""
            fill
            sizes="50vw"
            className="object-cover object-[50%_65%]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-obsidian to-transparent" />
        </div>
        <div className="container-yhc py-20 md:py-32">
          <div className="max-w-xl">
            <h2 className="display text-[clamp(2.5rem,1.7rem+3vw,4rem)] text-on-dark">
              Start with a conversation, not a product.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-on-dark-muted">
              Pick a time, pay {terms.fee} and talk to {doctor.name}. If a plan is right for you, it arrives
              on WhatsApp after the call — with no obligation to buy it.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                className="h-13 bg-[image:var(--yhc-silver)] px-7 text-base font-semibold text-obsidian hover:opacity-95"
              >
                <Link href="/book">{terms.bookLabel}</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-13 border-line-dark bg-transparent px-7 text-base text-on-dark hover:bg-graphite hover:text-on-dark"
              >
                <a href={SITE.whatsappUrl}>
                  <MessageCircle className="size-4" aria-hidden />
                  Ask on WhatsApp
                </a>
              </Button>
            </div>
            {terms.creditLine ? (
              <p className="mt-8 text-[13px] text-on-dark-muted">* {terms.creditLine}</p>
            ) : null}
          </div>
        </div>
      </section>
    </>
  );
}
