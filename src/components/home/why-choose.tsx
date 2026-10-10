import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { getConsultTerms } from '@/components/site/consult-fee';
import { guaranteeConditions, refundLine } from '@/components/site/guarantee-panel';
import { SECTION_Y } from '@/components/site/section';
import { t } from '@/i18n/en';
import { doctorClaimLabel } from '@/lib/claims';
import { CLINICAL, type SiteImage } from '@/lib/images';
import { cn } from '@/lib/utils';
import { getDoctor, getGuarantee } from '@/server/catalog';
import { TreatmentIndex, type TreatmentArea } from './doctor-feature/treatment-index';
import { CountUp, RiseTile, ScanRings } from './why-choose/motion';

/**
 * Homepage section 4 · Why choose Your Hair Company — editorial, after the client's "Hair Bureau"
 * reference: one oversized serif word, then full-bleed alternating splits (photograph | short text
 * block) for the two biggest differentiators, then a quiet accordion for the rest. Every figure is
 * true and settings-driven; the guarantee row appears only while a guarantee policy is active.
 */
export function WhyChoose() {
  const doctor = getDoctor();
  const guarantee = getGuarantee();
  const { slotMinutes } = getConsultTerms();

  const details: TreatmentArea[] = [
    {
      title: 'Prescribed only if suitable',
      body: 'A plan is prescribed only after the doctor decides treatment can help. Strength and dose are set for you, at your consultation — never a one-size-fits-all kit.',
    },
    {
      title: 'Followed up, not forgotten',
      body: 'Weekly check-ins, progress photos and a follow-up consultation, so your plan can be adjusted — or stopped — when that is the right call.',
    },
    {
      title: 'Results shared only with consent',
      body: `Before-and-after photos appear only with a patient’s written consent, with faces hidden. ${t('common.resultsVary')}`,
    },
    guarantee
      ? {
          title: 'Money-back guarantee, with conditions',
          body: (
            <>
              {refundLine(guarantee)} if you meet every condition and see no visible improvement — starting
              with: {guaranteeConditions(guarantee)[0]?.toLowerCase()}. A doctor reviews every claim.{' '}
              <Link
                href="/guarantee"
                className="inline-flex min-h-11 items-center gap-1.5 font-medium text-ink underline decoration-steel underline-offset-[6px] hover:decoration-current"
              >
                Read all the conditions <ArrowRight className="size-3.5" aria-hidden />
              </Link>
            </>
          ),
        }
      : {
          title: `${doctorClaimLabel()} care`,
          body: 'Anything in your plan is chosen by the doctor for your scalp and your history, and explained to you before you decide.',
        },
  ];

  return (
    <section aria-labelledby="why-heading" className="bg-card">
      {/* Oversized word, centred, generous air */}
      <div className={`container-yhc text-center ${SECTION_Y} pb-12 md:pb-16 lg:pb-20`}>
        <RiseTile>
          <p className="eyebrow">Why choose Your Hair Company</p>
          <h2 id="why-heading" className="mt-6">
            <span className="display block text-[clamp(4rem,2.2rem+8.5vw,9rem)] leading-[0.9] tracking-[-0.01em]">
              Considered.
            </span>
            <span className="mx-auto mt-5 block max-w-[26ch] font-display text-[clamp(1.75rem,1.4rem+1.2vw,2.375rem)] leading-tight font-medium text-body">
              Run like a good clinic — not like a shop.
            </span>
          </h2>
          <p className="mx-auto mt-6 max-w-[52ch] leading-relaxed text-pretty text-body">
            Most hair brands start with a product and look for a buyer. We start with your scalp and a doctor,
            and talk about treatment only if it can help.
          </p>
        </RiseTile>
      </div>

      {/* Split 1 · photograph | consultation */}
      <div className="grid border-t border-line lg:grid-cols-2">
        <SplitImage image={CLINICAL.consultNotes} caption="Illustrative image" />
        <div className="flex items-center bg-card px-[var(--yhc-gutter)] py-14 sm:py-16 lg:px-16 lg:py-20 xl:px-24">
          <RiseTile className="max-w-md">
            <p className="text-[12px] font-semibold tracking-[0.14em] text-brand uppercase">
              One to one · on video
            </p>
            <p className="mt-4 flex items-end gap-3 leading-none">
              <CountUp
                value={slotMinutes}
                className="font-display text-[clamp(6rem,4rem+7vw,9.5rem)] font-medium text-ink"
              />
              <span className="pb-3 font-display text-[clamp(1.75rem,1.4rem+1vw,2.25rem)] text-muted-foreground">
                minutes
              </span>
            </p>
            <h3 className="mt-4 font-display text-[clamp(1.75rem,1.45rem+1vw,2.25rem)] leading-tight font-medium">
              With {doctor.name}. Not a chatbot, not a sales call.
            </h3>
            <p className="mt-4 text-[15px] leading-relaxed text-body">
              He reads your history and scan before the call, explains what is likely going on in plain words,
              and answers your questions.
            </p>
          </RiseTile>
        </div>
      </div>

      {/* Split 2 · photograph then text on phones; text | photograph on desktop */}
      <div className="grid lg:grid-cols-2">
        <SplitImage image={CLINICAL.scalpExam} className="lg:order-last" />
        <div className="relative isolate flex items-center overflow-hidden bg-obsidian px-[var(--yhc-gutter)] py-14 text-on-dark sm:py-16 lg:px-16 lg:py-20 xl:px-24">
          <ScanRings className="absolute -right-24 -bottom-24 -z-10 size-[22rem] text-platinum/60 sm:size-[26rem]" />
          <RiseTile className="max-w-md">
            <p className="text-[12px] font-semibold tracking-[0.14em] text-brand-on-dark uppercase">
              Step zero
            </p>
            <h3 className="display mt-4 text-[clamp(3.5rem,2.4rem+4.5vw,6rem)] leading-[0.95] text-on-dark">
              Scalp first.
            </h3>
            <p className="mt-5 text-[15px] leading-relaxed text-on-dark-muted">
              We look at your scalp before anything else. If no viable roots are seen, we tell you honestly
              instead of selling you a plan.
            </p>
          </RiseTile>
        </div>
      </div>

      {/* The rest, quietly: an accordion */}
      <div className={`container-yhc ${SECTION_Y}`}>
        <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] lg:gap-16">
          <RiseTile>
            <p className="display text-[clamp(2rem,1.5rem+2vw,3rem)] leading-tight text-balance">
              The details, plainly.
            </p>
          </RiseTile>
          <TreatmentIndex items={details} tone="light" headingLevel="h3" />
        </div>
      </div>
    </section>
  );
}

function SplitImage({
  image,
  caption,
  className,
}: {
  image: SiteImage;
  caption?: string;
  className?: string;
}) {
  return (
    <figure
      className={cn(
        'group relative aspect-[4/3] overflow-hidden bg-obsidian sm:aspect-[16/10] lg:aspect-auto lg:min-h-[36rem]',
        className,
      )}
    >
      <Image
        src={image.src}
        alt={image.alt}
        fill
        sizes="(min-width: 1024px) 50vw, 100vw"
        className="object-cover grayscale transition-transform duration-[1600ms] ease-out group-hover:scale-[1.03]"
      />
      {caption ? (
        <figcaption className="absolute bottom-3 left-3 rounded-full bg-black/55 px-2.5 py-1 text-[12px] text-on-dark backdrop-blur">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
