import { ArrowRight, ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Reveal } from '@/components/site/reveal';
import { RAIL, RAIL_ITEM } from '@/components/site/section';
import { Button } from '@/components/ui/button';
import { SLOTS } from '@/lib/slots';
import type { VisualSlot } from '@/lib/visual-slots';
import { cn } from '@/lib/utils';
import { EVIDENCE } from '@/server/content/evidence';
import { SciencePinned, type PinnedFact } from './science/science-pinned';

/**
 * Homepage section 7 · The science behind Your Hair Company — visual first (docs/20): three
 * illustrated cards (slots H13–H15), each one plain sentence with its source, in a swipe rail on
 * phones. Ends in one action. The full story lives on /science. General education only; no claims
 * about YHC products. Cinematic pass (ADR-35): from lg with motion allowed the three pictures become a
 * pinned scroll story with labelled callouts (SciencePinned).
 */

const EXTERNAL = { target: '_blank', rel: 'noopener noreferrer' } as const;

interface KeyFact {
  id: string;
  /** Short callout label for the desktop scroll story. */
  label: string;
  title: string;
  body: string;
  citeId: string;
  image: VisualSlot;
}

const FACTS: KeyFact[] = [
  {
    id: 'follicle',
    label: 'A living root',
    title: 'Hair grows from a living root.',
    body: 'Each hair grows from a tiny root under the skin. While the root is alive, it can keep making hair.',
    citeId: 'scalp-hairs',
    image: SLOTS.H13,
  },
  {
    id: 'thinning',
    label: 'Roots shrink',
    title: 'Thinning often means smaller roots.',
    body: 'In pattern hair loss, roots slowly shrink and grow thinner, shorter hairs.',
    citeId: 'shaft-variability',
    image: SLOTS.H14,
  },
  {
    id: 'scan',
    label: 'Scarred roots can’t grow',
    title: 'Treatment can only help living roots.',
    body: 'A scarred root cannot grow hair again. So we check your roots first.',
    citeId: 'scarred-follicles',
    image: SLOTS.H15,
  },
];

export function ScienceStory() {
  const pinned: PinnedFact[] = FACTS.map((f) => {
    const source = EVIDENCE.find((e) => e.id === f.citeId)?.source;
    return {
      id: f.id,
      label: f.label,
      title: f.title,
      body: f.body,
      image: { src: f.image.src, alt: f.image.alt, ready: f.image.ready },
      source: source
        ? { name: source.name, url: source.url, ...(source.year ? { year: source.year } : {}) }
        : null,
    };
  });
  return (
    <section
      id="science"
      aria-labelledby="science-heading"
      className="relative scroll-mt-16 bg-obsidian text-on-dark"
    >
      <GridOverlay />
      <div className="container-yhc relative py-14 lg:py-20">
        <Reveal className="grid gap-5 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end lg:gap-16">
          <div>
            <p className="eyebrow text-brand-on-dark">The science behind Your Hair Company</p>
            <h2
              id="science-heading"
              className="display mt-4 text-[clamp(3rem,1.6rem+5.6vw,6rem)] leading-[0.92] tracking-[-0.01em] text-balance text-on-dark"
            >
              Roots first.
            </h2>
          </div>
          <p className="max-w-[40ch] text-lg leading-relaxed text-pretty text-on-dark-muted lg:justify-self-end lg:pb-2">
            Hair grows from living roots. Here is what that means for you.
          </p>
        </Reveal>

        {/* lg + motion: pinned "exploded" scroll story (200vh). Otherwise: the three cards. */}
        <div className="hidden lg:motion-safe:block">
          <SciencePinned facts={pinned} />
        </div>

        <ul className={cn(RAIL, 'mt-8 lg:mt-12 lg:motion-safe:hidden')}>
          {FACTS.map((f) => {
            const source = EVIDENCE.find((e) => e.id === f.citeId)?.source;
            return (
              <li
                key={f.id}
                className={cn(
                  RAIL_ITEM,
                  'group flex flex-col overflow-hidden rounded-[28px] bg-ink-2 ring-1 ring-line-dark transition-[transform,box-shadow] duration-500 hover:-translate-y-1 hover:shadow-[0_30px_60px_-30px_rgba(0,0,0,0.9)] motion-reduce:transition-none motion-reduce:hover:translate-y-0',
                )}
              >
                <div className="relative aspect-[3/2] overflow-hidden bg-obsidian">
                  <Image
                    src={f.image.src}
                    alt={f.image.alt}
                    fill
                    sizes="(min-width: 1024px) 31vw, (min-width: 640px) 46vw, 82vw"
                    className={cn(
                      'object-cover transition-transform duration-[1600ms] ease-out group-hover:scale-[1.05] motion-reduce:transition-none',
                      !f.image.ready && 'opacity-80 grayscale',
                    )}
                  />
                  <div
                    aria-hidden
                    className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink-2 to-transparent"
                  />
                </div>
                <div className="flex flex-1 flex-col p-6 pt-4 sm:p-7 sm:pt-5">
                  <h3 className="font-display text-[clamp(1.5rem,1.3rem+0.7vw,1.875rem)] leading-tight text-balance text-on-dark">
                    {f.title}
                  </h3>
                  <p className="mt-2 text-base leading-relaxed text-pretty text-on-dark-muted">{f.body}</p>
                  {source ? (
                    <a
                      href={source.url}
                      {...EXTERNAL}
                      className="mt-auto inline-flex min-h-11 items-center gap-1 pt-3 text-[13px] text-on-dark underline decoration-line-dark underline-offset-4 hover:decoration-on-dark"
                    >
                      Source: {source.name}
                      {source.year ? `, ${source.year}` : ''}
                      <ArrowUpRight className="size-3.5 shrink-0" aria-hidden />
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>

        <div className="mt-8 flex flex-col gap-4 border-t border-line-dark pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl text-sm leading-relaxed text-on-dark-muted">
            General facts from published skin and hair research. Not medical advice, and not a claim about our
            products.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/science"
              className="inline-flex min-h-12 items-center gap-2 text-sm font-medium text-on-dark underline decoration-steel underline-offset-[6px] hover:decoration-on-dark"
            >
              Read the science in full <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Button
              asChild
              className="h-12 bg-[image:var(--yhc-silver)] px-7 text-base font-semibold text-obsidian hover:opacity-95"
            >
              <Link href="/start">Begin my free 3D scan</Link>
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
