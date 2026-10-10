import type { Metadata } from 'next';
import { ArrowRight, Check, CircleHelp } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { BackgroundVideo } from '@/components/site/background-video';
import { EvidenceSection } from '@/components/site/evidence-section';
import { HairCycleDiagram } from '@/components/site/hair-cycle-diagram';
import { PatentSlot } from '@/components/site/patent-slot';
import { Reveal } from '@/components/site/reveal';
import { CTA_SILVER, H1, H2, LEDE, SECTION_Y, SectionHeader, TEXT_LINK } from '@/components/site/section';
import { pageMetadata } from '@/components/site/seo';
import { REGULATORY_LABEL } from '@/components/site/product-meta';
import { Button } from '@/components/ui/button';
import { t } from '@/i18n/en';
import { doctorClaimLabel } from '@/lib/claims';
import { CLINICAL, MEDIA, VIDEOS } from '@/lib/images';
import { getDoctor, getProducts } from '@/server/catalog';

export const metadata: Metadata = pageMetadata({
  title: 'The science',
  description:
    'How hair roots and the growth cycle work, what a prescribed plan aims to support, and an honest account of what is known and what is not.',
  path: '/science',
});

const CAUSES = [
  {
    title: 'Inherited pattern thinning',
    body: 'Follicles in certain areas gradually produce finer, shorter hairs. It is common and usually slow.',
  },
  {
    title: 'Shedding after a trigger',
    body: 'Illness, fever, stress, surgery or a crash diet can push many hairs into the resting phase at once.',
  },
  {
    title: 'Nutrition and health',
    body: 'Low iron, vitamin D or thyroid changes can play a part — which is why the doctor asks about them.',
  },
  {
    title: 'Scalp conditions',
    body: 'Dandruff, inflammation or irritation can affect comfort and the environment hair grows in.',
  },
];

const KNOWN = [
  'Hair grows in cycles, and a follicle needs to be alive to grow a new hair.',
  'Thinning has different causes, and the right approach depends on the cause.',
  'Change is gradual — it is measured over months, not days.',
  'Consistency matters: plans work best when followed as prescribed.',
];

const UNKNOWN = [
  'Exactly how any one person will respond — individual results vary.',
  'How much regrowth, if any, a given scalp will show.',
  'Whether a scan alone can explain every case — that is why a doctor reviews it.',
];

export default function SciencePage() {
  const doctor = getDoctor();
  const products = getProducts();

  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-obsidian text-on-dark">
        <BackgroundVideo video={VIDEOS.science} priority className="-z-20" />
        <div
          className="absolute inset-0 -z-10 bg-gradient-to-r from-obsidian via-obsidian/80 to-obsidian/40"
          aria-hidden
        />
        <div className="container-yhc pt-20 pb-16 md:py-28 lg:py-32">
          <p className="eyebrow text-brand-on-dark">The science</p>
          <h1 className={`${H1} mt-4 max-w-3xl text-on-dark`}>
            Understand the root before you treat the hair.
          </h1>
          <p className={`${LEDE} mt-6 text-on-dark-muted`}>
            A plain-language guide to how hair grows, why it thins, and what a doctor-prescribed plan aims to
            support — including what nobody can promise.
          </p>
          <p className="mt-8 text-[13px] text-on-dark-muted">Background: illustrative laboratory footage.</p>
        </div>
      </section>

      {/* Patent + doctor-recommended */}
      <section className="border-b border-line bg-card">
        <div className="container-yhc grid gap-6 py-10 md:grid-cols-2 md:items-center md:gap-12 md:py-12">
          <PatentSlot />
          <p className="max-w-[62ch] leading-relaxed text-pretty text-body">
            <span className="font-semibold text-ink">{doctorClaimLabel()}.</span> Every product in a plan is
            chosen by {doctor.name} for one person, after a consultation — never sold on its own merits.
          </p>
        </div>
      </section>

      {/* Mechanism */}
      <section className={`container-yhc ${SECTION_Y}`} aria-labelledby="cycle-heading">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
          <Reveal>
            <p className="eyebrow">How hair grows</p>
            <h2 id="cycle-heading" className={`${H2} mt-4`}>
              A follicle, a papilla and a cycle
            </h2>
            <p className={`${LEDE} mt-6 text-body`}>
              Each hair grows from a follicle — a small pocket in the skin. At its base sits the dermal
              papilla, which supplies the growing root. Every follicle repeats a cycle: a long growth phase
              (anagen), a short transition (catagen) and a resting phase (telogen), after which the hair sheds
              and, if the root is healthy, a new one starts.
            </p>
            <p className="mt-4 max-w-[62ch] leading-relaxed text-pretty text-body">
              At any moment most of your hairs are growing. Losing some hair every day is normal; what matters
              is the balance — and whether follicles are still able to grow.
            </p>
          </Reveal>
          <Reveal delayMs={120} className="rounded-3xl bg-card p-5 shadow-card ring-1 ring-line sm:p-8">
            <HairCycleDiagram />
          </Reveal>
        </div>
      </section>

      {/* What the research says — cited facts (content workstream owns the block) */}
      <EvidenceSection />

      {/* Why hair thins */}
      <section className="bg-obsidian text-on-dark" aria-labelledby="causes-heading">
        <div
          className={`container-yhc grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16 ${SECTION_Y}`}
        >
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl ring-1 ring-line-dark sm:aspect-[16/9] lg:aspect-auto lg:min-h-[28rem]">
            <Image
              src={CLINICAL.scalpPartingPortrait.src}
              alt={CLINICAL.scalpPartingPortrait.alt}
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover"
            />
            <span className="absolute bottom-3 left-3 rounded-full bg-black/50 px-2.5 py-1 text-[11px] text-on-dark backdrop-blur">
              Illustrative photo · scalp parting under magnification
            </span>
          </div>
          <div>
            <p className="eyebrow text-brand-on-dark">Why hair thins</p>
            <h2 id="causes-heading" className={`${H2} mt-4 text-on-dark`}>
              Different causes, different answers
            </h2>
            <p className="mt-5 max-w-[62ch] leading-relaxed text-pretty text-on-dark-muted">
              Two people with the same-looking thinning can have different reasons for it. Finding yours is
              what the scan, the health form and the consultation are for. This is general education, not a
              diagnosis.
            </p>
            <dl className="mt-10 grid gap-px overflow-hidden rounded-2xl bg-line-dark sm:grid-cols-2">
              {CAUSES.map((c) => (
                <div key={c.title} className="bg-obsidian p-6 lg:p-7">
                  <dt className="font-semibold text-on-dark">{c.title}</dt>
                  <dd className="mt-2 text-sm leading-relaxed text-on-dark-muted">{c.body}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Formulation */}
      <section className={`container-yhc ${SECTION_Y}`} aria-labelledby="formulation-heading">
        <SectionHeader
          id="formulation-heading"
          eyebrow="The formulation"
          title="Every ingredient has a job"
          lede="What each product contains and why it is there. Strengths and combinations are set by the doctor; nothing is chosen because it sounds impressive."
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {products.map((p) => (
            <Reveal
              key={p.id}
              className="flex flex-col rounded-2xl bg-card p-6 shadow-card ring-1 ring-line md:p-7"
            >
              <p className="text-[12px] font-medium text-muted-foreground">
                {REGULATORY_LABEL[p.regulatoryCategory]} ·{' '}
                {p.requiresConsultation ? 'Prescribed after consultation' : 'Available directly'}
              </p>
              <h3 className="mt-2 text-lg font-semibold text-ink">
                <Link href={`/products/${p.slug}`} className="hover:text-brand">
                  {p.name}
                </Link>
              </h3>
              <dl className="mt-4 divide-y divide-line border-t border-line">
                {p.ingredients.map((ing) => (
                  <div key={ing.name} className="py-3">
                    <dt className="text-[15px] font-medium text-ink">{ing.name}</dt>
                    <dd className="mt-0.5 text-sm text-body">{ing.role}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          ))}
        </div>
        <p className="mt-6 text-sm text-muted-foreground">{t('common.resultsVary')}</p>
      </section>

      {/* Honesty */}
      <section className="border-y border-line bg-card" aria-labelledby="honesty-heading">
        <div className={`container-yhc ${SECTION_Y}`}>
          <SectionHeader
            id="honesty-heading"
            eyebrow="Evidence, honestly"
            title="What we know — and what we don’t"
          />
          <div className="grid gap-5 md:grid-cols-2 lg:gap-6">
            <div className="rounded-2xl bg-pearl p-6 ring-1 ring-line md:p-8">
              <h3 className="text-lg font-semibold text-ink">What we know</h3>
              <ul className="mt-5 space-y-3.5">
                {KNOWN.map((line) => (
                  <li key={line} className="flex gap-3 text-[15px] text-body">
                    <Check className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
                    {line}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl bg-pearl p-6 ring-1 ring-line md:p-8">
              <h3 className="text-lg font-semibold text-ink">What nobody can promise</h3>
              <ul className="mt-5 space-y-3.5">
                {UNKNOWN.map((line) => (
                  <li key={line} className="flex gap-3 text-[15px] text-body">
                    <CircleHelp className="mt-0.5 size-4 shrink-0 text-steel" aria-hidden />
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative isolate overflow-hidden bg-obsidian text-on-dark">
        <div className="absolute inset-0 -z-10" aria-hidden>
          <Image src={MEDIA.dnaHelix.src} alt="" fill sizes="100vw" className="object-cover opacity-35" />
          <div className="absolute inset-0 bg-gradient-to-r from-obsidian via-obsidian/80 to-obsidian/30" />
        </div>
        <div className={`container-yhc ${SECTION_Y}`}>
          <h2 className={`${H2} max-w-2xl text-on-dark`}>See what is happening at your roots.</h2>
          <p className={`${LEDE} mt-5 max-w-xl text-on-dark-muted`}>
            Start with a free guided 3D scan. A doctor reviews it before anything is prescribed.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
            <Button asChild className={CTA_SILVER}>
              <Link href="/start">Begin my 3D scan</Link>
            </Button>
            <Link href="/doctor-tyagi" className={`text-on-dark ${TEXT_LINK}`}>
              Meet {doctor.name} <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
