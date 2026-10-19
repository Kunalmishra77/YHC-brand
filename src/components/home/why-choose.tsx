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
 * Homepage section 4 · Why choose Your Hair Company — editorial ("Hair Bureau" reference), compacted
 * for the audit (UX-01): oversized word + lede, a three-tile bento (photograph · consultation · scalp
 * first), then a quiet accordion for the rest. Every figure is
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
    <section aria-labelledby="why-heading" className={`bg-card ${SECTION_Y}`}>
      <div className="container-yhc">
        {/* Header: oversized word left, lede right (compact — audit UX-01) */}
        <RiseTile className="grid gap-5 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end lg:gap-16">
          <div>
            <p className="eyebrow">Why choose Your Hair Company</p>
            <h2 id="why-heading" className="mt-4">
              <span className="display block text-[clamp(3rem,1.8rem+5vw,6rem)] leading-[0.92] tracking-[-0.01em]">
                Considered.
              </span>
              <span className="mt-3 block max-w-[26ch] font-display text-[clamp(1.5rem,1.25rem+1vw,2.125rem)] leading-tight font-medium text-body">
                Run like a good clinic — not like a shop.
              </span>
            </h2>
          </div>
          <p className="max-w-[46ch] text-base leading-relaxed text-pretty text-body lg:justify-self-end lg:pb-2">
            Most hair brands start with a product and look for a buyer. We start with your scalp and a doctor,
            and talk about treatment only if it can help.
          </p>
        </RiseTile>

        {/* Bento: photograph · consultation · scalp first */}
        <div className="mt-10 grid gap-4 lg:mt-14 lg:grid-cols-12 lg:gap-5">
          <SplitImage image={CLINICAL.consultNotes} caption="Illustrative image" className="lg:col-span-5" />
          <RiseTile
            order={1}
            className="flex flex-col justify-center rounded-[1.75rem] bg-pearl p-7 ring-1 ring-line sm:p-9 lg:col-span-4"
          >
            <p className="text-[12px] font-semibold tracking-[0.14em] text-brand uppercase">One to one · on video</p>
            <p className="mt-3 flex items-end gap-3 leading-none">
              <CountUp value={slotMinutes} className="font-display text-[clamp(4rem,3rem+3vw,5.5rem)] font-medium text-ink" />
              <span className="pb-2 font-display text-[clamp(1.5rem,1.3rem+0.8vw,2rem)] text-muted-foreground">minutes</span>
            </p>
            <h3 className="mt-3 font-display text-[clamp(1.5rem,1.3rem+0.8vw,2rem)] leading-tight font-medium">
              With {doctor.name}. Not a chatbot, not a sales call.
            </h3>
            <p className="mt-3 text-base leading-relaxed text-body md:text-[15px]">
              He reads your history and scan before the call, explains what is likely going on in plain words, and
              answers your questions.
            </p>
          </RiseTile>
          <RiseTile
            order={2}
            className="relative isolate flex flex-col justify-end overflow-hidden rounded-[1.75rem] bg-obsidian p-7 text-on-dark sm:p-9 lg:col-span-3"
          >
            <ScanRings className="absolute -top-16 -right-16 -z-10 size-[18rem] text-platinum/50" />
            <p className="text-[12px] font-semibold tracking-[0.14em] text-brand-on-dark uppercase">Step zero</p>
            <h3 className="display mt-3 text-[clamp(2.5rem,2rem+2vw,3.5rem)] leading-[0.95] text-on-dark">Scalp first.</h3>
            <p className="mt-3 text-base leading-relaxed text-on-dark-muted md:text-[15px]">
              If no viable roots are seen, we tell you honestly instead of selling you a plan.
            </p>
          </RiseTile>
        </div>

        {/* The rest, quietly: an accordion */}
        <div className="mx-auto mt-12 grid max-w-5xl gap-8 lg:mt-16 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] lg:gap-16">
          <RiseTile>
            <p className="display text-[clamp(1.75rem,1.4rem+1.6vw,2.75rem)] leading-tight text-balance">
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
        'group relative aspect-[16/10] overflow-hidden rounded-[1.75rem] bg-obsidian lg:aspect-auto lg:min-h-[24rem]',
        className,
      )}
    >
      <Image
        src={image.src}
        alt={image.alt}
        fill
        sizes="(min-width: 1024px) 40vw, 100vw"
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
