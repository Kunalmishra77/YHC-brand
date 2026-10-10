import { ScanLine } from 'lucide-react';
import Link from 'next/link';
import { SECTION_Y, SectionHeader, TEXT_LINK } from '@/components/site/section';
import { Button } from '@/components/ui/button';
import type { HairConcern } from '@/lib/domain/types';
import { getConcerns } from '@/server/catalog';
import { EVIDENCE } from '@/server/content/evidence';
import { HairLossExplorer } from './hair-loss/explorer';
import type { HairLossTypeView } from './hair-loss/types';

/*
 * General education only, worded conservatively to match AAD / NHS / DermNet / StatPearls (sources in
 * src/server/content/evidence.ts). Never a diagnosis, never a claim about YHC products.
 * TODO(client): Dr. Tyagi to review this copy before launch — see docs/12 (content).
 */
type TypeSeed = Omit<HairLossTypeView, 'fact' | 'links'> & {
  factId?: string;
  concernSlugs: HairConcern[];
};

const TYPES: TypeSeed[] = [
  {
    id: 'male-pattern',
    pattern: 'male',
    name: 'Male pattern hair loss',
    aka: 'Androgenetic alopecia',
    cue: 'Temples and crown',
    looksLike:
      'The hairline moves back at the temples and the crown thins, usually in a recognisable pattern. Hairs become gradually finer and shorter before they are lost, so it is often noticed late.',
    triggers: [
      'Genes — it often runs in families',
      'Hormones (androgens) acting on sensitive follicles',
      'Becomes more common with age',
    ],
    helps:
      'Medical treatments exist, and dermatologists note they tend to work best when started at the first signs. Results are judged over months of consistent use and vary from person to person. A doctor should confirm the pattern first.',
    urgent: false,
    illustrationAlt:
      'Top view of a head: hair thinned at both temples and at the crown, the typical male pattern.',
    factId: 'india-aga',
    concernSlugs: ['receding_hairline', 'crown_thinning'],
  },
  {
    id: 'female-pattern',
    pattern: 'female',
    name: 'Female pattern hair loss',
    aka: 'Pattern hair loss in women',
    cue: 'Widening parting',
    looksLike:
      'A parting that slowly widens, with more scalp showing over the top of the head. The front hairline usually stays where it was, which is why it can go unnoticed for a long time.',
    triggers: [
      'Genes and hormones',
      'Changes around pregnancy or menopause can make it more noticeable',
      'Low iron stores or thyroid changes can add to it',
    ],
    helps:
      'A doctor first looks for contributing causes such as low iron or thyroid problems, testing before any supplement. Treatment, when suitable, is used continuously and judged over many months.',
    urgent: false,
    illustrationAlt:
      'Top view of a head: a widening central parting with thinner hair on either side, the front hairline kept.',
    factId: 'women-by-age',
    concernSlugs: ['thinning'],
  },
  {
    id: 'telogen-effluvium',
    pattern: 'diffuse',
    name: 'Telogen effluvium',
    aka: 'Shedding after a trigger',
    cue: 'Shedding all over',
    looksLike:
      'More hair than usual on the pillow, comb or shower drain, coming out evenly from all over the scalp rather than from one area. There are no bald patches.',
    triggers: [
      'An illness or high fever',
      'Childbirth or surgery',
      'A crash diet or rapid weight loss',
      'A very stressful period',
    ],
    helps:
      'This kind of shedding often settles once the trigger has passed. A doctor checks for causes that are still active, such as low iron or thyroid changes, and whether the shedding is unmasking an early pattern.',
    urgent: false,
    illustrationAlt: 'Top view of a head: hair evenly thinner across the whole scalp, with no patches.',
    factId: 'shedding-trigger',
    concernSlugs: ['hair_fall'],
  },
  {
    id: 'alopecia-areata',
    pattern: 'patches',
    name: 'Alopecia areata',
    aka: 'Patchy hair loss',
    cue: 'Round, smooth patches',
    looksLike:
      'One or more smooth, round patches with no hair, often around the size of a coin, which can appear quite suddenly. It can also affect the beard or eyebrows.',
    triggers: [
      'The immune system mistakenly targets hair follicles',
      'It sometimes runs in families',
      'It is not contagious',
    ],
    helps:
      'Patches like these should be examined by a dermatologist, who can confirm what they are and discuss whether and how to treat them. Hair products alone are not the answer here.',
    urgent: false,
    illustrationAlt: 'Top view of a head: two round, completely bare patches with sharp edges.',
    concernSlugs: [],
  },
  {
    id: 'traction',
    pattern: 'traction',
    name: 'Traction alopecia',
    aka: 'Hair loss from pulling',
    cue: 'Along the hairline',
    looksLike:
      'Thinning along the front hairline and temples, or wherever the hair is pulled hardest. It builds up slowly over months or years of the same styles.',
    triggers: [
      'Tight ponytails, buns or braids worn for long periods',
      'Hair extensions or weaves',
      'Headwear tied tightly for long hours',
    ],
    helps:
      'Loosening the styles that pull is the first step, and an early check matters: long-standing tension can scar follicles, and a scarred follicle can no longer grow hair.',
    urgent: false,
    illustrationAlt: 'Top view of a head: hair thinned in a band along the front hairline and temples.',
    concernSlugs: ['receding_hairline'],
  },
  {
    id: 'scarring',
    pattern: 'scarring',
    name: 'Scarring alopecia',
    aka: 'Cicatricial alopecia',
    cue: 'Needs prompt in-person care',
    looksLike:
      'Patches where the skin can look smooth, shiny or red, sometimes with itching, burning, tenderness or scaling. The small openings where hairs grow fade away in the affected area.',
    triggers: [
      'A group of inflammatory conditions that damage hair follicles',
      'The exact cause is often not known',
    ],
    helps:
      'Please see a dermatologist in person promptly. Once a follicle scars it can no longer grow hair, so early diagnosis and treatment matter.',
    urgent: true,
    illustrationAlt: 'Top view of a head: an irregular bare patch with smooth skin and no hair openings.',
    factId: 'scarred-follicles',
    concernSlugs: [],
  },
];

/**
 * Homepage section 11 · Types of hair loss — an illustrated, selectable atlas of six common patterns.
 * Server component: builds the content (cited facts, links only to concern pages that exist) and hands it
 * to the client explorer.
 */
export function HairLossTypes() {
  const concerns = getConcerns();
  const concernBySlug = new Map(concerns.map((c) => [c.slug, c]));
  const scalpConcern = concernBySlug.get('dandruff_scalp');

  const types: HairLossTypeView[] = TYPES.map(({ factId, concernSlugs, ...rest }) => {
    const fact = factId ? EVIDENCE.find((f) => f.id === factId) : undefined;
    return {
      ...rest,
      fact: fact
        ? {
            ...(fact.stat ? { stat: fact.stat } : {}),
            label: fact.label,
            detail: fact.detail,
            sourceName: fact.source.name,
            sourceUrl: fact.source.url,
          }
        : null,
      links: concernSlugs.flatMap((slug) => {
        const c = concernBySlug.get(slug);
        return c ? [{ href: `/concerns/${c.slug}`, label: `About ${c.title.toLowerCase()}` }] : [];
      }),
    };
  });

  return (
    <section className="bg-pearl" aria-labelledby="hair-loss-types-heading">
      <div className={`container-yhc ${SECTION_Y}`}>
        <SectionHeader
          id="hair-loss-types-heading"
          eyebrow="Types of hair loss"
          title="Not all hair loss is the same"
          lede="Six common patterns, in plain words. A guide, not a diagnosis: only a doctor who examines your scalp can say which one you have."
        />

        <HairLossExplorer types={types} />

        <div className="mt-14 flex flex-col gap-6 border-t border-line pt-10 md:mt-20 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            <p className="display text-[clamp(1.75rem,1.5rem+1vw,2.25rem)]">Not sure which? Take the scan.</p>
            <p className="mt-2 text-pretty text-body">
              Start with the guided scalp scan. A dermatologist reviews it before anything is recommended.
              {scalpConcern ? (
                <>
                  {' '}
                  Flaking or an itchy scalp is a scalp condition rather than hair loss —{' '}
                  <Link
                    href={`/concerns/${scalpConcern.slug}`}
                    className="text-ink underline decoration-steel underline-offset-4 hover:decoration-current"
                  >
                    read about {scalpConcern.title.toLowerCase()}
                  </Link>
                  .
                </>
              ) : null}
            </p>
          </div>
          <div className="flex flex-col gap-x-6 gap-y-1 sm:flex-row sm:items-center">
            <Button asChild className="h-12 w-full px-7 text-base sm:w-auto">
              <Link href="/start">
                <ScanLine className="size-4" aria-hidden />
                Take the scan
              </Link>
            </Button>
            <Link href="/science" className={`text-ink ${TEXT_LINK}`}>
              The science
            </Link>
          </div>
        </div>
        <p className="mt-6 text-[13px] text-muted-foreground">
          General information checked against published sources. Individual causes and results vary.
        </p>
      </div>
    </section>
  );
}
