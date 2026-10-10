import { ArrowRight, ArrowUpRight, Plus } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  EVIDENCE,
  REFERENCES,
  keyEvidence,
  referenceNumber,
  type EvidenceFact,
} from '@/server/content/evidence';

/**
 * "What the research says" — cited facts about hair loss and hair biology.
 * CONTRACT: `<EvidenceSection variant?: 'full' | 'compact' />` (server component). The content-research
 * workstream owns this file and src/server/content/evidence.ts; page owners only place it.
 * 'full' (/science#evidence): every fact with numbered citations and the reference list.
 * 'compact' (homepage): four key figures, each with its source, plus a link to the full section.
 */

const NOTE = 'Facts are general information from published sources; they are not claims about our product.';

const H2 = 'display text-[clamp(2.25rem,1.6rem+2.4vw,3.5rem)]';

const EXTERNAL = { target: '_blank', rel: 'noopener noreferrer' } as const;

export function EvidenceSection({ variant = 'full' }: { variant?: 'full' | 'compact' }) {
  return variant === 'compact' ? <CompactEvidence /> : <FullEvidence />;
}

function FullEvidence() {
  const figures = EVIDENCE.filter((f) => f.stat);
  const principles = EVIDENCE.filter((f) => !f.stat);

  return (
    <section
      id="evidence"
      aria-labelledby="evidence-heading"
      className="scroll-mt-20 border-y border-line bg-card"
    >
      <div className="container-yhc py-20 md:py-28">
        <div className="max-w-3xl">
          <p className="eyebrow">What the research says</p>
          <h2 id="evidence-heading" className={`${H2} mt-4`}>
            Hair follows biology, not marketing.
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-body">
            A few well-established facts explain why we look at your roots first, why a doctor decides on
            treatment, and why any honest plan is judged over months rather than weeks. Each one is cited to
            the dermatology source it comes from.
          </p>
        </div>

        <ul
          className="mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-3xl bg-line ring-1 ring-line sm:grid-cols-2 xl:grid-cols-4"
          aria-label="Key figures"
        >
          {figures.map((fact) => (
            <li key={fact.id} className="flex min-w-0 flex-col bg-pearl p-6 sm:p-8">
              <FigureBody fact={fact} cite={referenceNumber(fact.source.url)} />
            </li>
          ))}
        </ul>

        <div className="mt-20 grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
          <div>
            <h3 className="display text-[clamp(1.75rem,1.4rem+1.4vw,2.5rem)]">What this means in practice</h3>
            <p className="mt-4 leading-relaxed text-body">
              Shedding, thinning and scarring hair loss look alike in a mirror but behave very differently.
              Treatment can only support follicles that are still alive — so an assessment of the roots, and a
              doctor&apos;s judgement, come before any plan.
            </p>
          </div>
          <ul className="divide-y divide-line border-y border-line">
            {principles.map((fact) => (
              <li key={fact.id}>
                <details className="group">
                  <summary className="flex min-h-14 cursor-pointer list-none items-start justify-between gap-4 py-4 text-left font-medium text-ink [&::-webkit-details-marker]:hidden">
                    <span className="min-w-0">
                      {fact.label}
                      <Cite n={referenceNumber(fact.source.url)} />
                    </span>
                    <Plus
                      className="mt-0.5 size-5 shrink-0 text-steel transition-transform duration-200 group-open:rotate-45 motion-reduce:transition-none"
                      aria-hidden
                    />
                  </summary>
                  <p className="max-w-prose pb-5 leading-relaxed text-body">{fact.detail}</p>
                </details>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-20 border-t border-line pt-10">
          <h3 id="evidence-references" className="text-sm font-semibold tracking-[0.12em] text-ink uppercase">
            References
          </h3>
          <ol className="mt-6 grid gap-x-10 gap-y-4 text-sm md:grid-cols-2">
            {REFERENCES.map((ref) => (
              <li key={ref.url} id={`ref-${ref.n}`} className="flex min-w-0 scroll-mt-24 gap-3">
                <span className="price w-6 shrink-0 text-steel">{ref.n}.</span>
                <span className="min-w-0 break-words">
                  <a
                    href={ref.url}
                    {...EXTERNAL}
                    className="font-medium text-ink underline decoration-steel underline-offset-4 hover:decoration-ink"
                  >
                    {ref.name}
                    {ref.year ? ` (${ref.year})` : ''}
                    <ArrowUpRight className="ml-0.5 inline size-3.5 align-[-2px]" aria-hidden />
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                  <span className="block text-muted-foreground">{ref.title}</span>
                </span>
              </li>
            ))}
          </ol>
          <p className="mt-8 max-w-3xl text-[13px] text-muted-foreground">
            {NOTE} Figures vary between studies and populations. This is not medical advice; only a doctor who
            has assessed you can say what applies to your hair.
          </p>
        </div>
      </div>
    </section>
  );
}

function CompactEvidence() {
  const facts = keyEvidence();

  return (
    <section aria-labelledby="evidence-compact-heading" className="border-y border-line bg-card">
      <div className="container-yhc py-16 md:py-24">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="eyebrow">What the research says</p>
            <h2 id="evidence-compact-heading" className={`${H2} mt-4`}>
              Hair follows biology, not marketing.
            </h2>
          </div>
          <Link
            href="/science#evidence"
            className="inline-flex min-h-11 shrink-0 items-center gap-2 text-sm font-medium text-ink underline decoration-steel underline-offset-[6px] hover:decoration-ink"
          >
            See all the research <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>

        <ul className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-3xl bg-line ring-1 ring-line sm:grid-cols-2 lg:grid-cols-4">
          {facts.map((fact) => (
            <li key={fact.id} className="flex min-w-0 flex-col bg-pearl p-6">
              <FigureBody fact={fact} compact />
            </li>
          ))}
        </ul>

        <p className="mt-6 text-[13px] text-muted-foreground">{NOTE}</p>
      </div>
    </section>
  );
}

function FigureBody({ fact, cite, compact }: { fact: EvidenceFact; cite?: number; compact?: boolean }) {
  return (
    <>
      <p
        className={cn(
          'price leading-none tracking-tight text-ink',
          compact ? 'text-[clamp(2.25rem,1.9rem+1.4vw,3rem)]' : 'text-[clamp(2.5rem,2rem+2vw,3.5rem)]',
        )}
      >
        {fact.stat}
      </p>
      <p className="mt-4 font-medium text-ink">
        {fact.label}
        {cite ? <Cite n={cite} /> : null}
      </p>
      {compact ? (
        <a
          href={fact.source.url}
          {...EXTERNAL}
          className="mt-auto inline-flex items-center gap-1 pt-5 text-[13px] text-muted-foreground underline decoration-line underline-offset-4 hover:text-ink"
        >
          {fact.source.name}
          {fact.source.year ? `, ${fact.source.year}` : ''}
          <ArrowUpRight className="size-3.5" aria-hidden />
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      ) : (
        <details className="group mt-auto pt-5">
          <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-2 text-sm font-medium text-ink [&::-webkit-details-marker]:hidden">
            <Plus
              className="size-4 text-steel transition-transform duration-200 group-open:rotate-45 motion-reduce:transition-none"
              aria-hidden
            />
            <span className="group-open:hidden">Read more</span>
            <span className="hidden group-open:inline">Show less</span>
          </summary>
          <p className="mt-2 text-sm leading-relaxed text-body">{fact.detail}</p>
        </details>
      )}
    </>
  );
}

/** Numbered citation marker linking to the reference list. */
function Cite({ n }: { n: number }) {
  if (!n) return null;
  return (
    <sup className="ml-0.5">
      <a
        href={`#ref-${n}`}
        aria-label={`Source ${n}`}
        className="price rounded-sm px-0.5 text-[11px] text-brand no-underline hover:underline"
      >
        [{n}]
      </a>
    </sup>
  );
}
