import { ArrowRight, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { BackgroundVideo } from '@/components/site/background-video';
import { Reveal } from '@/components/site/reveal';
import { Button } from '@/components/ui/button';
import { VIDEOS } from '@/lib/images';
import { EVIDENCE } from '@/server/content/evidence';

/**
 * Homepage section 7 · The science behind Your Hair Company — compact (audit UX-03): the editorial
 * title, a short b-roll card and three cited key facts, ending in one action. The full five-chapter
 * story lives on /science. General education only; no claims about YHC products.
 */

const EXTERNAL = { target: '_blank', rel: 'noopener noreferrer' } as const;

interface KeyFact {
  id: string;
  kicker: string;
  title: string;
  body: string;
  citeId: string;
}

const FACTS: KeyFact[] = [
  {
    id: 'follicle',
    kicker: 'A living root',
    title: 'Every hair grows from a living follicle.',
    body: 'At the base of each follicle, a small cluster of cells signals the root to grow. While that root is alive, it can keep producing hair.',
    citeId: 'scalp-hairs',
  },
  {
    id: 'thinning',
    kicker: 'Why thinning happens',
    title: 'Thinning is often follicles growing smaller.',
    body: 'In pattern hair loss the growth phase shortens and hairs grow finer. Shedding after illness or stress is a different process — so the cause comes first.',
    citeId: 'shaft-variability',
  },
  {
    id: 'scan',
    kicker: 'Why we scan first',
    title: 'Treatment can only support roots that are still alive.',
    body: 'A scarred follicle can no longer grow hair. The scan looks at your roots first, a doctor confirms what it shows — and if a plan is unlikely to help, we tell you.',
    citeId: 'scarred-follicles',
  },
];

export function ScienceStory() {
  return (
    <section id="science" aria-labelledby="science-heading" className="relative scroll-mt-16 bg-obsidian text-on-dark">
      <GridOverlay />
      <div className="container-yhc relative py-14 lg:py-20">
        <Reveal className="grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end lg:gap-16">
          <div>
            <p className="eyebrow text-brand-on-dark">The science behind Your Hair Company</p>
            <h2
              id="science-heading"
              className="display mt-4 text-[clamp(3rem,1.6rem+5.6vw,6rem)] leading-[0.92] tracking-[-0.01em] text-balance text-on-dark"
            >
              Roots first.
            </h2>
          </div>
          <p className="max-w-[44ch] text-lg leading-relaxed text-pretty text-on-dark-muted lg:justify-self-end lg:pb-2">
            Hair grows from living roots. Three things to know before anything is prescribed.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-5 lg:mt-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-8">
          {/* Short b-roll card (lazy, pausable — see BackgroundVideo) */}
          <figure className="relative min-h-[18rem] overflow-hidden rounded-[1.75rem] ring-1 ring-line-dark lg:min-h-0">
            <BackgroundVideo video={VIDEOS.science} controlsPosition="top-right" />
            <div
              aria-hidden
              className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,19,21,0.05)_40%,rgba(18,19,21,0.85)_100%)]"
            />
            <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 sm:p-6">
              <span className="price text-[12px] tracking-[0.18em] text-on-dark uppercase">Under the microscope</span>
              <span className="text-[12px] tracking-[0.12em] text-on-dark-muted uppercase">Illustrative footage</span>
            </figcaption>
          </figure>

          {/* Three cited facts */}
          <ol className="grid gap-px overflow-hidden rounded-[1.75rem] bg-line-dark ring-1 ring-line-dark">
            {FACTS.map((f, i) => {
              const source = EVIDENCE.find((e) => e.id === f.citeId)?.source;
              return (
                <li key={f.id} className="bg-ink-2 p-6 sm:p-7">
                  <p className="flex items-center gap-3 text-[12px] font-semibold tracking-[0.16em] text-brand-on-dark uppercase">
                    <span className="price">{String(i + 1).padStart(2, '0')}</span>
                    {f.kicker}
                  </p>
                  <h3 className="mt-3 font-display text-[clamp(1.5rem,1.25rem+0.9vw,2rem)] leading-tight text-balance text-on-dark">
                    {f.title}
                  </h3>
                  <p className="mt-2 max-w-[60ch] text-base leading-relaxed text-pretty text-on-dark-muted">{f.body}</p>
                  {source ? (
                    <a
                      href={source.url}
                      {...EXTERNAL}
                      className="mt-3 inline-flex min-h-11 items-center gap-1 text-[13px] text-on-dark underline decoration-line-dark underline-offset-4 hover:decoration-on-dark"
                    >
                      Source: {source.name}
                      {source.year ? `, ${source.year}` : ''}
                      <ArrowUpRight className="size-3.5 shrink-0" aria-hidden />
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  ) : null}
                </li>
              );
            })}
          </ol>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-line-dark pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl text-sm leading-relaxed text-on-dark-muted">
            General information from published dermatology sources — not medical advice or a claim about our
            products.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/science"
              className="inline-flex min-h-12 items-center gap-2 text-sm font-medium text-on-dark underline decoration-steel underline-offset-[6px] hover:decoration-on-dark"
            >
              Read the science in full <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Button asChild className="h-12 bg-[image:var(--yhc-silver)] px-7 text-base font-semibold text-obsidian hover:opacity-95">
              <Link href="/start">Begin my 3D scan</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function GridOverlay() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{
        opacity: 0.6,
        backgroundImage:
          'linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)',
        backgroundSize: '64px 64px',
        maskImage: 'radial-gradient(ellipse at 50% 40%, black 30%, transparent 80%)',
        WebkitMaskImage: 'radial-gradient(ellipse at 50% 40%, black 30%, transparent 80%)',
      }}
    />
  );
}
