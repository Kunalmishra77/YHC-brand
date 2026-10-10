import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Reveal } from '@/components/site/reveal';
import { resultDurationLabel } from '@/components/site/results-gallery';
import { SECTION_Y, TEXT_LINK } from '@/components/site/section';
import { getPublishedResults } from '@/server/content/results';
import { RESULT_DISCLAIMER } from './results/copy';
import { ResultsCarousel, type ResultCardData } from './results/results-carousel';

/**
 * Homepage section 8 · What happened when they used it — editorial "Results" spread: a very large serif
 * word, a single line of copy, then a seamless, slowly drifting gallery of consented, face-free
 * before/after pairs (ADR-27). Each card opens the drag-to-compare slider. Without published results it
 * says so plainly — never stock or AI imagery standing in for a patient.
 */
export function ResultsMarquee() {
  const results: ResultCardData[] = getPublishedResults().map((r) => ({
    id: r.id,
    patientLabel: r.patientLabel,
    concern: r.concern,
    view: r.view,
    before: { src: r.before.src, alt: r.before.alt },
    after: { src: r.after.src, alt: r.after.alt },
    duration: resultDurationLabel(r.months),
    note: r.note,
  }));

  return (
    <section
      id="results"
      aria-labelledby="results-heading"
      className={`relative scroll-mt-20 overflow-x-clip bg-pearl ${SECTION_Y}`}
    >
      <Reveal className="container-yhc text-center">
        <p className="eyebrow">Before &amp; after</p>
        <h2 id="results-heading" className="mt-5">
          <span className="display block text-[clamp(4.5rem,2.4rem+9vw,10rem)] leading-[0.88] tracking-[-0.015em]">
            Results
          </span>
          <span className="sr-only">: </span>
          <span className="display mt-5 block text-[clamp(1.75rem,1.5rem+1vw,2.25rem)] font-normal text-body italic">
            What happened when they used it?
          </span>
        </h2>
        <p className="mx-auto mt-5 max-w-md text-[15px] leading-relaxed text-pretty text-body">
          Real patients, photographed before starting and at a later visit, after a plan prescribed by the
          doctor. Tap a photo to compare.
        </p>
      </Reveal>

      <div className="mt-12 md:mt-16">
        {results.length > 0 ? (
          <ResultsCarousel results={results} />
        ) : (
          <p className="container-yhc text-center text-body">
            Consented patient results will appear here once they are published.
          </p>
        )}
      </div>

      <div className="container-yhc mt-8 flex flex-col items-center gap-2 text-center md:mt-10">
        <p className="max-w-xl text-[13px] leading-relaxed text-pretty text-muted-foreground">
          {RESULT_DISCLAIMER}
        </p>
        <Link href="/results" className={`text-ink ${TEXT_LINK}`}>
          See all results <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
    </section>
  );
}
