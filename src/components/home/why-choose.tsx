import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { getConsultTerms } from '@/components/site/consult-fee';
import { guaranteeConditions, refundLine } from '@/components/site/guarantee-panel';
import { SECTION_Y } from '@/components/site/section';
import { illustrativeNote } from '@/components/site/slot-note';
import { t } from '@/i18n/en';
import { doctorClaimLabel } from '@/lib/claims';
import { SLOTS } from '@/lib/slots';
import { getDoctor, getGuarantee } from '@/server/catalog';
import { TreatmentIndex, type TreatmentArea } from './doctor-feature/treatment-index';
import { CountUp, RiseTile, ScanRings } from './why-choose/motion';

/**
 * Homepage section 4 · Why choose Your Hair Company — visual first (docs/20): a two-tile photo bento
 * (H04 video consultation · H05 scalp first) with the words laid on the pictures, then a closed
 * accordion for the details. On phones the tiles are a swipe rail. Every figure is true and
 * settings-driven; the guarantee row appears only while a guarantee policy is active.
 */
export function WhyChoose() {
  const doctor = getDoctor();
  const guarantee = getGuarantee();
  const { slotMinutes } = getConsultTerms();
  const consult = SLOTS.H04;
  const scalp = SLOTS.H05;
  const consultNote = illustrativeNote(consult);

  const details: TreatmentArea[] = [
    {
      title: 'Medicine only if you need it',
      body: 'Your doctor decides if you need treatment. The dose is set for you. No one-size-fits-all kit.',
    },
    {
      title: 'We stay with you',
      body: 'Weekly check-ins, progress photos and a follow-up call. Your plan can change, or stop, when needed.',
    },
    {
      title: 'Real results, shared with consent',
      body: `We show before-and-after photos only with written consent, with faces hidden. ${t('common.resultsVary')}`,
    },
    guarantee
      ? {
          title: 'Money back, if you meet the conditions',
          body: (
            <>
              {refundLine(guarantee)} if you meet every condition and see no visible change. The first
              condition: {guaranteeConditions(guarantee)[0]?.toLowerCase()}. A doctor checks every claim.{' '}
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
          body: 'Your doctor picks everything in your plan for your scalp, and explains it before you decide.',
        },
  ];

  return (
    <section aria-labelledby="why-heading" className={`bg-card ${SECTION_Y}`}>
      <div className="container-yhc">
        <RiseTile className="grid gap-5 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end lg:gap-16">
          <div>
            <p className="eyebrow">Why choose Your Hair Company</p>
            <h2 id="why-heading" className="mt-4">
              <span className="display block text-[clamp(3rem,1.8rem+5vw,6rem)] leading-[0.92] tracking-[-0.01em]">
                Considered.
              </span>
              <span className="mt-3 block max-w-[26ch] font-display text-[clamp(1.5rem,1.25rem+1vw,2.125rem)] leading-tight font-medium text-body">
                Like a good clinic, not a shop.
              </span>
            </h2>
          </div>
          <p className="max-w-[40ch] text-base leading-relaxed text-pretty text-body lg:justify-self-end lg:pb-2">
            Most brands sell first. We check your scalp first, and treat only if it will help.
          </p>
        </RiseTile>

        {/* Photo bento — a swipe rail on phones, two tiles side by side from lg */}
        <div
          tabIndex={0}
          role="region"
          aria-label="Why choose us (swipe for more)"
          className="relative -mx-[var(--yhc-gutter)] mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain scroll-px-[var(--yhc-gutter)] px-[var(--yhc-gutter)] py-1 [scrollbar-width:none] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand lg:mx-0 lg:mt-14 lg:grid lg:grid-cols-12 lg:gap-5 lg:overflow-visible lg:px-0 lg:py-0 [&::-webkit-scrollbar]:hidden"
        >
          {/* H04 · one-to-one video consultation */}
          <RiseTile className="w-[86%] shrink-0 snap-start sm:w-[62%] lg:col-span-8 lg:w-auto">
            <figure className="group relative isolate aspect-square overflow-hidden rounded-[28px] bg-obsidian text-on-dark sm:aspect-[4/3] lg:aspect-auto lg:h-[28rem]">
              <Image
                src={consult.src}
                alt={consult.alt}
                fill
                sizes="(min-width: 1024px) 62vw, 86vw"
                className="-z-10 object-cover grayscale transition-transform duration-[1600ms] ease-out group-hover:scale-[1.04] motion-reduce:transition-none"
              />
              <div
                aria-hidden
                className="absolute inset-0 -z-10 bg-gradient-to-t from-obsidian/95 via-obsidian/35 to-transparent lg:bg-gradient-to-r lg:from-obsidian/90 lg:via-obsidian/30"
              />
              {consultNote ? (
                <span className="absolute top-3 right-3 rounded-full bg-black/55 px-2.5 py-1 text-[12px] backdrop-blur">
                  {consultNote}
                </span>
              ) : null}
              <figcaption className="absolute inset-x-0 bottom-0 p-6 sm:p-8 lg:max-w-[28rem] lg:p-10">
                <p className="flex items-end gap-3 leading-none">
                  <CountUp
                    value={slotMinutes}
                    className="font-display text-[clamp(4rem,3rem+3vw,5.75rem)] font-medium text-on-dark"
                  />
                  <span className="pb-2 font-display text-[clamp(1.5rem,1.3rem+0.8vw,2rem)] text-on-dark-muted">
                    minutes
                  </span>
                </p>
                <h3 className="mt-3 font-display text-[clamp(1.5rem,1.3rem+0.8vw,2rem)] leading-tight font-medium text-on-dark">
                  On video with {doctor.name}.
                </h3>
                <p className="mt-2 text-base leading-relaxed text-on-dark-muted">
                  A real doctor. Not a chatbot, not a sales call.
                </p>
              </figcaption>
            </figure>
          </RiseTile>

          {/* H05 · scalp first — the photo seen through the scan rings */}
          <RiseTile order={1} className="w-[86%] shrink-0 snap-start sm:w-[62%] lg:col-span-4 lg:w-auto">
            <figure className="group relative isolate aspect-[4/5] overflow-hidden rounded-[28px] bg-obsidian text-on-dark sm:aspect-[4/3] lg:aspect-auto lg:h-[28rem]">
              <Image
                src={scalp.src}
                alt={scalp.alt}
                fill
                sizes="(min-width: 1024px) 31vw, 86vw"
                className="-z-10 object-cover opacity-80 grayscale transition-transform duration-[1600ms] ease-out group-hover:scale-[1.06] motion-reduce:transition-none"
              />
              <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-obsidian via-obsidian/40 to-obsidian/10" />
              <ScanRings className="absolute top-6 left-1/2 size-[13rem] -translate-x-1/2 text-platinum/80 sm:top-8" />
              <figcaption className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                <h3 className="display text-[clamp(2.5rem,2rem+2vw,3.5rem)] leading-[0.95] text-on-dark">Scalp first.</h3>
                <p className="mt-3 text-base leading-relaxed text-on-dark-muted">
                  If treatment can’t help your roots, we tell you. No hard sell.
                </p>
              </figcaption>
            </figure>
          </RiseTile>
        </div>

        {/* The details, tap to open */}
        <div className="mx-auto mt-12 grid max-w-5xl gap-6 lg:mt-14 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] lg:gap-16">
          <RiseTile>
            <p className="display text-[clamp(1.75rem,1.4rem+1.6vw,2.75rem)] leading-tight text-balance">
              Good to know.
            </p>
            <p className="mt-2 text-[15px] text-muted-foreground">Tap a line to read more.</p>
          </RiseTile>
          <TreatmentIndex items={details} tone="light" headingLevel="h3" defaultOpen={-1} />
        </div>
      </div>
    </section>
  );
}
