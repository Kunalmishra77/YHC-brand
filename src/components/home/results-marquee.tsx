import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Reveal } from '@/components/site/reveal';
import { resultDurationLabel } from '@/components/site/results-gallery';
import { SECTION_Y, TEXT_LINK } from '@/components/site/section';
import { getPublishedResults } from '@/server/content/results';
import { RESULT_DISCLAIMER, RESULT_LINE } from './results/copy';
import { ResultsCarousel, type ResultCardData } from './results/results-carousel';

/**
 * Homepage section 8 · Results — the most visual section: a big serif word, one honest line, then a
 * slow wall of large, consented, face-free before/after pairs (ADR-27). Each pair opens the
 * drag-to-compare slider. Without published results it says so plainly — never stock or AI imagery
 * standing in for a patient.
 */
export function ResultsMarquee() {
  const results: ResultCardData[] = getPublishedResults().map((r) => ({
    id: r.id,
    patientLabel: r.patientLabel,
    concern: r.concern,
    view: r.view,
    before: { src: r.before.src, alt: r.before.alt },
    after: { src: r.after.src, alt: r.after.alt },
    duration: resultDurationLabel(r.months) ?? '',
    note: r.note,
  }));

  return (
    <section
      id="results"
      aria-labelledby="results-heading"
      className={`relative scroll-mt-20 overflow-x-clip bg-pearl ${SECTION_Y}`}
    >
      <Reveal className="container-yhc grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end md:gap-12">
        <h2
          id="results-heading"
          className="display text-[clamp(3.25rem,2rem+5.5vw,6rem)] leading-[0.9] tracking-[-0.015em]"
        >
          Real results
        </h2>
        <div className="max-w-xs md:pb-3 md:text-right">
          <p className="text-lg leading-snug text-pretty text-ink">{RESULT_LINE}</p>
          <p className="mt-1.5 text-sm text-body">Tap a photo to compare.</p>
        </div>
      </Reveal>

      <div className="mt-10 md:mt-12">
        {results.length > 0 ? (
          <ResultsCarousel results={results} />
        ) : (
          <p className="container-yhc text-center text-body">
            Real patient photos will appear here once patients agree to share them.
          </p>
        )}
      </div>

      <div className="container-yhc mt-6 flex flex-col items-center gap-1 text-center">
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
