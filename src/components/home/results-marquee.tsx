import { ArrowRight, Check } from 'lucide-react';
import Link from 'next/link';
import { BeforeAfterSlider } from '@/components/site/before-after-slider';
import { Reveal } from '@/components/site/reveal';
import { resultDurationLabel } from '@/components/site/results-gallery';
import { SECTION_Y, TEXT_LINK } from '@/components/site/section';
import { Button } from '@/components/ui/button';
import { getPublishedResults } from '@/server/content/results';
import { RESULT_DISCLAIMER, RESULT_LINE, plainConcern, plainView } from './results/copy';
import { ResultsCarousel, type ResultCardData } from './results/results-carousel';

/** Beside the featured pair: what is true of every photo shown (ADR-27), and the honest caveat. */
const FEATURE_CHECKS = [
  'Shared with written permission',
  'Face hidden, photos not edited',
  'Results vary from person to person',
];

/**
 * Homepage section 8 · Results — the most visual section: a big serif word, one honest line, then a
 * slow wall of large, consented, face-free before/after pairs (ADR-27). Each pair opens the
 * drag-to-compare slider. Without published results it says so plainly — never stock or AI imagery
 * standing in for a patient. Cinematic pass (ADR-35): the first real pair is featured large as a
 * drag-to-compare frame (dewlab) above the marquee.
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

  const featured = results[0];

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
          <p className="mt-1.5 text-sm text-body">Drag the line to compare.</p>
        </div>
      </Reveal>

      {featured ? (
        // Featured pair (dewlab "drag before/after"): one big frame with a checklist beside it.
        <div className="container-yhc mt-8 md:mt-10">
          <div className="relative isolate grid gap-6 overflow-hidden rounded-[32px] bg-card p-3 ring-1 ring-line sm:p-4 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-center lg:gap-12 lg:p-5">
            <div
              aria-hidden
              className="pointer-events-none absolute -top-1/3 -right-1/4 -z-10 size-[40rem] rounded-full bg-[radial-gradient(circle,rgba(217,167,102,0.14),transparent_65%)]"
            />
            <Reveal>
              <BeforeAfterSlider
                before={featured.before}
                after={featured.after}
                label={`Compare before and after: ${featured.patientLabel}, ${plainView(featured.view).toLowerCase()}`}
                sizes="(min-width: 1024px) 40rem, 100vw"
                className="aspect-[4/5] rounded-[24px] sm:aspect-[5/4] lg:aspect-[6/5]"
              />
            </Reveal>
            <Reveal delayMs={120} className="px-3 pb-4 sm:px-4 lg:px-0 lg:pr-6 lg:pb-0">
              <p className="text-sm font-medium text-brand">{featured.patientLabel}</p>
              <h3 className="display mt-2 text-[clamp(2rem,1.6rem+1.6vw,3rem)] leading-[1.02] text-balance">
                {plainConcern(featured.concern)}
              </h3>
              <p className="mt-2 text-base text-body">
                {plainView(featured.view)}
                {featured.duration ? `. ${featured.duration}` : ''}
              </p>
              <ul className="mt-6 space-y-3 border-t border-line pt-5">
                {FEATURE_CHECKS.map((line) => (
                  <li key={line} className="flex items-start gap-3 text-[15px] leading-snug text-ink">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-obsidian text-on-dark">
                      <Check className="size-3" aria-hidden />
                    </span>
                    {line}
                  </li>
                ))}
              </ul>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
                <Button asChild className="h-12 rounded-full px-7 text-base">
                  <Link href="/start">
                    Begin my free 3D scan <ArrowRight className="size-4" aria-hidden />
                  </Link>
                </Button>
                <p className="text-[13px] text-muted-foreground">
                  More patients below. Tap any pair to compare.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      ) : null}

      <div className="mt-8 md:mt-10">
        {results.length > 0 ? (
          <ResultsCarousel results={results} />
        ) : (
          <p className="container-yhc text-center text-body">
            Real patient photos will appear here once patients agree to share them.
          </p>
        )}
      </div>

      <div className="container-yhc mt-4 flex flex-col items-center gap-1 text-center">
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
