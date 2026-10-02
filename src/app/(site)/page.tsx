import type { Metadata } from 'next';
import { BadgeCheck, CreditCard, Truck } from 'lucide-react';
import Link from 'next/link';
import { GuaranteeTerms } from '@/components/shared/pricing';
import { getConsultTerms } from '@/components/site/consult-fee';
import { ConcernList } from '@/components/site/concern-list';
import { CtaBand } from '@/components/site/cta-band';
import { DoctorCard } from '@/components/site/doctor-card';
import { FaqList, visibleFaqs } from '@/components/site/faq-list';
import { JsonLd } from '@/components/site/json-ld';
import { buildJourney, JourneySteps } from '@/components/site/journey-steps';
import { PhotoPlaceholder } from '@/components/site/photo-placeholder';
import { PlanLadder } from '@/components/site/plan-ladder';
import { pageMetadata } from '@/components/site/seo';
import { StoriesEmpty } from '@/components/site/stories-empty';
import { Button } from '@/components/ui/button';
import { t } from '@/i18n/en';
import { clientEnv } from '@/lib/env';
import { SITE } from '@/lib/site';
import { getConcerns, getDoctor, getFaqs, getGuarantee, getPlans, getProducts } from '@/server/catalog';

// Guarantee visibility and fees are live settings (admin can change them in the demo).
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

export default function HomePage() {
  const doctor = getDoctor();
  const plans = getPlans();
  const guarantee = getGuarantee();
  const terms = getConsultTerms();
  const faqs = visibleFaqs(getFaqs(), guarantee !== null).slice(0, 5);

  const ingredients = getProducts()
    .flatMap((p) => p.ingredients.map((ing) => ({ ...ing, product: p.name, slug: p.slug })))
    .filter((ing, i, all) => all.findIndex((x) => x.name === ing.name) === i)
    .slice(0, 8);

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

      {/* 1 · Hero */}
      <section className="bg-hero-dark sheen-sweep text-on-dark">
        <div className="container-yhc grid items-center gap-10 py-14 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:py-24">
          <div>
            <p className="text-sm font-medium text-brand-on-dark">{t('brand.tagline')} · India</p>
            <h1 className="display mt-4 text-hero text-on-dark">
              Hair care that begins with a doctor, not a product.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-on-dark-muted">
              A {terms.slotMinutes}-minute video consultation with {doctor.name}, a plan chosen for your
              pattern and history, and steady follow-up while you use it.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                className="h-12 bg-[image:var(--yhc-silver)] px-6 text-base text-obsidian hover:opacity-90"
              >
                <Link href="/book">{terms.bookLabel}</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-12 border-line-dark bg-transparent px-6 text-base text-on-dark hover:bg-graphite hover:text-on-dark"
              >
                <Link href="/assessment">{t('common.freeAssessment')}</Link>
              </Button>
            </div>
            <p className="mt-4 text-sm text-on-dark-muted">
              The assessment takes about 2 minutes and is not a diagnosis.
            </p>
          </div>
          <PhotoPlaceholder
            caption="Photo: Dr. Tyagi — to be supplied"
            className="mx-auto aspect-[4/5] w-full max-w-[320px] md:max-w-none"
          />
        </div>
      </section>

      {/* 2 · Trust strip */}
      <section aria-label="Why you can trust YHC" className="border-b border-line bg-card">
        <ul className="container-yhc grid divide-y divide-line md:grid-cols-3 md:divide-x md:divide-y-0">
          <li className="flex items-start gap-3 py-5 md:px-6 md:first:pl-0">
            <BadgeCheck className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden />
            <p className="text-sm text-body">
              <span className="font-semibold text-ink">{doctor.name}</span>, Reg. No.{' '}
              <span className="price">{doctor.registrationNo}</span>
              <br />
              {doctor.council}
            </p>
          </li>
          <li className="flex items-start gap-3 py-5 md:px-6">
            <CreditCard className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden />
            <p className="text-sm text-body">
              <span className="font-semibold text-ink">Encrypted payments via Razorpay</span>
              <br />
              UPI, cards and netbanking
            </p>
          </li>
          <li className="flex items-start gap-3 py-5 md:px-6">
            <Truck className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden />
            <p className="text-sm text-body">
              <span className="font-semibold text-ink">Delivery across India</span>
              <br />
              Tracking shared on WhatsApp
            </p>
          </li>
        </ul>
      </section>

      {/* 3 · Hair concerns */}
      <section className="container-yhc py-16 md:py-24">
        <div className="grid gap-10 md:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]">
          <div>
            <h2 className="display text-3xl">What are you noticing?</h2>
            <p className="mt-4 text-body">
              Start with what you see. Each concern has more than one possible cause — that is what the
              consultation is for.
            </p>
            <Link
              href="/concerns"
              className="mt-6 inline-flex min-h-11 items-center text-sm font-medium text-brand underline underline-offset-4"
            >
              All hair concerns
            </Link>
          </div>
          <ConcernList concerns={getConcerns()} />
        </div>
      </section>

      {/* 4 · How it works */}
      <section className="border-y border-line bg-mist/40">
        <div className="container-yhc py-16 md:py-24">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <h2 className="display max-w-xl text-3xl">How it works</h2>
            <Link
              href="/how-it-works"
              className="inline-flex min-h-11 items-center text-sm font-medium text-brand underline underline-offset-4"
            >
              The full journey, step by step
            </Link>
          </div>
          <JourneySteps steps={buildJourney(terms)} className="mt-12" />
        </div>
      </section>

      {/* 5 · Meet Dr. Tyagi */}
      <section className="container-yhc py-16 md:py-24">
        <p className="eyebrow mb-6">Meet your doctor</p>
        <DoctorCard doctor={doctor}>
          <Button asChild variant="outline" className="h-11 border-steel px-5">
            <Link href="/doctor-tyagi">About {doctor.name}</Link>
          </Button>
        </DoctorCard>
      </section>

      {/* 6 · Treatment plans */}
      <section className="bg-pearl">
        <div className="container-yhc pb-16 md:pb-24">
          <div className="mb-10 grid gap-4 border-t border-line pt-16 md:grid-cols-2 md:items-end md:pt-24">
            <h2 className="display text-3xl">Treatment plans</h2>
            <p className="text-body">
              Plans are prescribed after your consultation — you can&apos;t buy one before Dr. Tyagi has seen
              your history. Longer plans cost less per month. {t('common.inclGst')}.
            </p>
          </div>
          <PlanLadder plans={plans} guarantee={guarantee} creditLine={terms.creditLine} />
          <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <Button asChild className="h-12 px-6 text-base">
              <Link href="/book">Book consultation first · {terms.fee}</Link>
            </Button>
            <Link
              href="/plans"
              className="inline-flex min-h-11 items-center text-sm font-medium text-brand underline underline-offset-4"
            >
              Compare plans in detail
            </Link>
          </div>
        </div>
      </section>

      {/* 7 · Money-back guarantee (hidden while guarantee.enabled = false) */}
      {guarantee ? (
        <section className="bg-silver">
          <div className="container-yhc grid gap-8 py-16 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:py-20">
            <div>
              <h2 className="display text-3xl">A guarantee with clear conditions</h2>
              <p className="mt-4 text-ink/80">
                Hair responds slowly and differently for everyone. If you do your part for the full period and
                see no visible improvement, you can claim a refund. A doctor reviews every claim.
              </p>
            </div>
            <GuaranteeTerms policy={guarantee} />
          </div>
        </section>
      ) : null}

      {/* 8 · Ingredients & science */}
      <section className="container-yhc py-16 md:py-24">
        <div className="grid gap-10 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <div>
            <h2 className="display text-3xl">Ingredients, and why they are there</h2>
            <p className="mt-4 text-body">
              Every product lists what is in it and what each ingredient does. Prescription items are dosed by
              Dr. Tyagi for you; nothing is chosen because it sounds impressive.
            </p>
            <p className="mt-4 text-sm text-muted-foreground">{t('common.resultsVary')}</p>
            <Link
              href="/products"
              className="mt-6 inline-flex min-h-11 items-center text-sm font-medium text-brand underline underline-offset-4"
            >
              See all products
            </Link>
          </div>
          <dl className="grid divide-y divide-line border-y border-line sm:grid-cols-2 sm:divide-y-0">
            {ingredients.map((ing) => (
              <div key={ing.name} className="border-line py-4 sm:border-b sm:odd:pr-6 sm:even:pl-6">
                <dt className="font-semibold text-ink">{ing.name}</dt>
                <dd className="mt-1 text-sm text-body">{ing.role}</dd>
                <dd className="mt-1 text-[13px] text-muted-foreground">
                  In{' '}
                  <Link href={`/products/${ing.slug}`} className="underline underline-offset-2">
                    {ing.product}
                  </Link>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* 9 · Real stories (consent-gated, FR-M1-6) */}
      <section className="container-yhc pb-16 md:pb-24">
        <h2 className="display mb-6 text-3xl">Real stories</h2>
        <StoriesEmpty />
      </section>

      {/* 10 · FAQs */}
      <section className="border-t border-line bg-card">
        <div className="container-yhc grid gap-10 py-16 md:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] md:py-24">
          <div>
            <h2 className="display text-3xl">Questions people ask first</h2>
            <Link
              href="/faqs"
              className="mt-6 inline-flex min-h-11 items-center text-sm font-medium text-brand underline underline-offset-4"
            >
              All FAQs
            </Link>
          </div>
          <FaqList faqs={faqs} />
        </div>
      </section>

      {/* 11 · Final CTA */}
      <CtaBand
        bookLabel={terms.bookLabel}
        body={`Pick a time, pay ${terms.fee}, and talk to ${doctor.name}. If a plan is right for you, you'll receive it on WhatsApp after the call, with no obligation to buy it.`}
      />
    </>
  );
}
