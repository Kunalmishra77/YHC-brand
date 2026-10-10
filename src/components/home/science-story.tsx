import { ArrowRight, ArrowUpRight, Plus } from 'lucide-react';
import Link from 'next/link';
import { BackgroundVideo } from '@/components/site/background-video';
import { PatentSlot } from '@/components/site/patent-slot';
import { Reveal } from '@/components/site/reveal';
import { t } from '@/i18n/en';
import { VIDEOS } from '@/lib/images';
import { getProducts } from '@/server/catalog';
import { EVIDENCE, keyEvidence, type EvidenceFact } from '@/server/content/evidence';
import { ScienceChapters } from './science/science-chapters';
import type { Chapter, ChapterCite, PlanTarget } from './science/types';

/**
 * Homepage section 7 · The science behind Your Hair Company (key section).
 * Editorial spread (client reference): huge serif title on pearl, a full-bleed b-roll band, then a five-chapter scroll narrative —
 * living follicle → hair cycle → miniaturisation → why we scan first → what a plan targets — with a
 * sticky, cross-fading specimen visual on desktop and inline visuals on phones. Closes with four cited
 * key figures as an accordion. General education only; no claims about YHC products.
 */

const EXTERNAL = { target: '_blank', rel: 'noopener noreferrer' } as const;

function cite(id: string): ChapterCite | undefined {
  const fact = EVIDENCE.find((f) => f.id === id);
  if (!fact) return undefined;
  return {
    stat: fact.stat,
    label: fact.label,
    source: fact.source.name,
    year: fact.source.year,
    url: fact.source.url,
  };
}

export function ScienceStory() {
  const planProducts = getProducts().filter((p) => p.requiresConsultation);
  const targets: PlanTarget[] = planProducts.map((p) => ({
    slug: p.slug,
    product: p.name,
    roles: p.ingredients.slice(0, 2).map((ing) => ({ name: ing.name, role: ing.role })),
  }));
  const figures = keyEvidence();

  const chapters: Chapter[] = [
    {
      id: 'follicle',
      kicker: 'A living root',
      title: 'Every hair grows from a living follicle.',
      body: 'Beneath the skin, each hair grows from a follicle. At its base sits the dermal papilla — a small cluster of cells, fed by fine blood vessels, that signals the root to grow. While that root is alive, it can keep producing hair.',
      cite: cite('scalp-hairs'),
    },
    {
      id: 'cycle',
      kicker: 'The hair cycle',
      title: 'Hair grows in cycles, not in a straight line.',
      body: 'Each follicle moves through growth (anagen), a short transition (catagen) and rest (telogen), then sheds the old hair so a new one can start. Losing some hair every day is part of that rhythm — and because hair grows slowly, changes take months to judge.',
      cite: cite('growth-rate'),
    },
    {
      id: 'thinning',
      kicker: 'Why thinning happens',
      title: 'Thinning is often follicles growing smaller.',
      body: 'In pattern hair loss, the growth phase gets shorter and follicles gradually miniaturise, producing shorter, finer hairs. It happens slowly, so it is often noticed late. Heavy shedding after illness or stress is a different process — which is why finding the cause comes first.',
      cite: cite('shaft-variability'),
      secondary: cite('miniaturisation'),
    },
    {
      id: 'scan',
      kicker: 'Why we scan first',
      title: 'Treatment can only support roots that are still alive.',
      body: 'Once a follicle is replaced by scar tissue, it can no longer grow hair. So before any plan, a guided 3D scalp scan looks at your roots and how they are spread, and a doctor confirms what it shows. If a plan is unlikely to help, we tell you.',
      cite: cite('scarred-follicles'),
    },
    {
      id: 'plan',
      kicker: 'What a plan targets',
      title: 'A doctor-prescribed plan supports what is still there.',
      body: 'If treatment is right for you, the doctor decides what to use and at what strength. Each part of a plan has a specific job:',
      extra: (
        <>
          <dl className="mt-6 divide-y divide-line-dark border-y border-line-dark">
            {targets.map((tg, i) => (
              <div key={tg.slug} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3 py-4">
                <dt className="price pt-0.5 text-[13px] text-brand-on-dark">
                  {String(i + 1).padStart(2, '0')}
                </dt>
                <dd className="min-w-0">
                  <Link
                    href={`/products/${tg.slug}`}
                    className="font-medium text-on-dark underline decoration-line-dark underline-offset-4 hover:decoration-platinum"
                  >
                    {tg.product}
                  </Link>
                  <ul className="mt-1.5 space-y-1 text-sm leading-relaxed text-on-dark-muted">
                    {tg.roles.map((r) => (
                      <li key={r.name}>
                        <span className="text-on-dark">{r.role}</span> · {r.name}
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-[13px] leading-relaxed text-on-dark-muted">
            Ingredients and strengths are chosen by the doctor for each person. {t('common.resultsVary')}
          </p>
          <PatentSlot tone="dark" className="mt-6" />
        </>
      ),
    },
  ];

  return (
    <section id="science" aria-labelledby="science-heading" className="relative scroll-mt-16">
      {/* Opening — editorial: small kicker, very large serif word, a short lede, generous whitespace */}
      <div className="bg-pearl">
        <div className="container-yhc pt-20 pb-14 text-center md:pt-28 md:pb-20 lg:pt-32">
          <Reveal>
            <p className="eyebrow">The science behind Your Hair Company</p>
            <h2
              id="science-heading"
              className="display mx-auto mt-5 max-w-5xl text-[clamp(3.5rem,1.6rem+8vw,8.5rem)] leading-[0.92] tracking-[-0.01em] text-balance"
            >
              Roots first.
            </h2>
            <p className="mx-auto mt-7 max-w-[46ch] text-lg leading-relaxed text-pretty text-body">
              Hair grows from living roots. Five short chapters on how it grows, why it thins, and why a
              doctor looks at your roots before anything is prescribed.
            </p>
          </Reveal>
          <ol
            aria-label="Chapters"
            className="mx-auto mt-10 flex max-w-3xl flex-wrap justify-center gap-x-6 gap-y-2 text-[13px] text-muted-foreground"
          >
            {chapters.map((c, i) => (
              <li key={c.id} className="flex items-center gap-2">
                <span className="price text-brand">{String(i + 1).padStart(2, '0')}</span>
                {c.kicker}
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Cinematic band — full-bleed science b-roll with thin lab lines */}
      <div className="relative h-[52svh] min-h-[300px] overflow-hidden bg-obsidian md:h-[68svh] md:max-h-[760px]">
        <BackgroundVideo video={VIDEOS.science} />
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,19,21,0.15)_0%,rgba(18,19,21,0.25)_60%,#121315_100%)]"
        />
        <GridOverlay />
        <div className="absolute inset-x-0 bottom-0">
          <div className="container-yhc flex items-end justify-between gap-6 pb-6 md:pb-8">
            <p className="price text-[11px] tracking-[0.18em] text-on-dark uppercase">
              Fig. 00 — Under the microscope
            </p>
            <p className="text-[11px] tracking-[0.18em] text-on-dark-muted uppercase">Illustrative footage</p>
          </div>
        </div>
      </div>

      {/* Chapters — dark, layered */}
      <div className="relative bg-obsidian text-on-dark">
        <GridOverlay faint />
        <div className="container-yhc relative pt-10 md:pt-16">
          <ScienceChapters chapters={chapters} targets={targets} />
        </div>
      </div>

      {/* Research — asymmetric split: big serif title | accordion of cited key figures */}
      <div className="relative border-t border-line-dark bg-obsidian text-on-dark">
        <div className="container-yhc grid gap-10 py-16 md:py-24 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
          <div>
            <p className="eyebrow text-brand-on-dark">What the research says</p>
            <h3 className="display mt-4 text-[clamp(2.5rem,1.6rem+3.6vw,4.5rem)] leading-[0.98] text-on-dark">
              Biology, cited.
            </h3>
            <p className="mt-5 max-w-[40ch] leading-relaxed text-pretty text-on-dark-muted">
              Hair follows biology, not marketing. Each figure comes from a published dermatology source.
            </p>
            <Link
              href="/science"
              className="mt-6 inline-flex min-h-12 items-center gap-2 text-sm font-medium text-on-dark underline decoration-steel underline-offset-[6px] hover:decoration-on-dark"
            >
              Read the science in full <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
          <div>
            <ul className="divide-y divide-line-dark border-y border-line-dark">
              {figures.map((f) => (
                <ResearchItem key={f.id} fact={f} />
              ))}
            </ul>
            <p className="mt-6 text-[13px] leading-relaxed text-on-dark-muted">
              Facts are general information from published sources; they are not claims about our products.
              This is not medical advice — only a doctor who has assessed you can say what applies to your
              hair.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/** One cited figure: stat + label + source always visible; the source's detail opens below. */
function ResearchItem({ fact }: { fact: EvidenceFact }) {
  return (
    <li>
      <details className="group">
        <summary className="grid min-h-12 cursor-pointer list-none grid-cols-[minmax(0,1fr)_auto] items-center gap-4 py-5 [&::-webkit-details-marker]:hidden">
          <span className="grid min-w-0 gap-x-6 gap-y-1 sm:grid-cols-[9.5rem_minmax(0,1fr)] sm:items-baseline">
            <span className="bg-[image:var(--yhc-silver)] bg-clip-text font-display text-[clamp(2.25rem,1.9rem+1.4vw,3rem)] leading-none font-medium text-transparent">
              {fact.stat}
            </span>
            <span className="min-w-0">
              <span className="block leading-snug font-medium text-on-dark">{fact.label}</span>
              <span className="mt-1 block text-[13px] text-on-dark-muted">
                {fact.source.name}
                {fact.source.year ? `, ${fact.source.year}` : ''}
              </span>
            </span>
          </span>
          <Plus
            className="size-5 shrink-0 text-steel transition-transform duration-300 group-open:rotate-45 motion-reduce:transition-none"
            aria-hidden
          />
        </summary>
        <div className="pb-6 sm:pl-[11rem]">
          <p className="max-w-prose text-[15px] leading-relaxed text-on-dark-muted">{fact.detail}</p>
          <a
            href={fact.source.url}
            {...EXTERNAL}
            className="mt-2 inline-flex min-h-12 items-center gap-1 text-[13px] text-on-dark underline decoration-line-dark underline-offset-4 hover:decoration-on-dark"
          >
            Source: {fact.source.title}
            <ArrowUpRight className="size-3.5 shrink-0" aria-hidden />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </div>
      </details>
    </li>
  );
}

function GridOverlay({ faint = false }: { faint?: boolean }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{
        opacity: faint ? 0.5 : 0.8,
        backgroundImage:
          'linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)',
        backgroundSize: '64px 64px',
        maskImage: 'radial-gradient(ellipse at 50% 40%, black 30%, transparent 80%)',
        WebkitMaskImage: 'radial-gradient(ellipse at 50% 40%, black 30%, transparent 80%)',
      }}
    />
  );
}
