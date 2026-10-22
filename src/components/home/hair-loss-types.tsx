import { ScanLine } from 'lucide-react';
import Link from 'next/link';
import { SECTION_Y, TEXT_LINK } from '@/components/site/section';
import { Button } from '@/components/ui/button';
import { concernPath } from '@/lib/concern-path';
import type { HairConcern } from '@/lib/domain/types';
import { SLOTS } from '@/lib/slots';
import type { VisualSlot } from '@/lib/visual-slots';
import { getConcerns } from '@/server/catalog';
import { EVIDENCE } from '@/server/content/evidence';
import { HairLossExplorer } from './hair-loss/explorer';
import type { HairLossTypeView } from './hair-loss/types';

/*
 * General education only, in plain English, kept in line with AAD / NHS / DermNet / StatPearls (sources
 * in src/server/content/evidence.ts). Never a diagnosis, never a claim about YHC products.
 * TODO(client): Dr. Tyagi to review this copy before launch — see docs/12 (content).
 */
type TypeSeed = Omit<HairLossTypeView, 'fact' | 'links' | 'image'> & {
  slot: VisualSlot;
  factId?: string;
  concernSlugs: HairConcern[];
};

const TYPES: TypeSeed[] = [
  {
    id: 'male-pattern',
    pattern: 'male',
    slot: SLOTS.H20,
    name: 'Male pattern hair loss',
    aka: 'Androgenetic alopecia',
    cue: 'Temples and crown',
    short: 'The hairline moves back at the sides. The top of the head gets thin.',
    looksLike:
      'Hairs slowly get finer and shorter before they fall, so many men notice it late. It usually follows a clear pattern.',
    triggers: [
      'Genes. It often runs in families',
      'Male hormones acting on the hair roots',
      'It gets more common with age',
    ],
    helps:
      'Medical treatments exist and tend to work best when started early. Change is judged over months and varies from person to person. A doctor should confirm the pattern first.',
    urgent: false,
    illustrationAlt:
      'Head diagrams: hair thinned at both temples and at the crown, the typical male pattern.',
    factId: 'india-aga',
    concernSlugs: ['receding_hairline', 'crown_thinning'],
  },
  {
    id: 'female-pattern',
    pattern: 'female',
    slot: SLOTS.H21,
    name: 'Female pattern hair loss',
    aka: 'Pattern hair loss in women',
    cue: 'Wider parting',
    short: 'The parting slowly gets wider. The front hairline usually stays.',
    looksLike:
      'More scalp shows on top of the head. Because the hairline stays, it can go unnoticed for a long time.',
    triggers: [
      'Genes and hormones',
      'Pregnancy or menopause can make it show more',
      'Low iron or thyroid problems can add to it',
    ],
    helps:
      'A doctor first looks for things that add to it, like low iron or thyroid problems, and tests before any supplement. Treatment, if it suits you, is used every day and judged over many months.',
    urgent: false,
    illustrationAlt:
      'Head diagrams: a wider centre parting with thinner hair on both sides, the front hairline kept.',
    factId: 'women-by-age',
    concernSlugs: ['thinning'],
  },
  {
    id: 'telogen-effluvium',
    pattern: 'diffuse',
    slot: SLOTS.H22,
    name: 'Sudden shedding',
    aka: 'Telogen effluvium',
    cue: 'Hair fall all over',
    short: 'Much more hair falls than usual, from all over the head. No bald patches.',
    looksLike:
      'You see more hair on the pillow, comb or shower drain. It comes from all over the scalp, not one area.',
    triggers: [
      'An illness or high fever',
      'Childbirth or surgery',
      'A crash diet or fast weight loss',
      'A very stressful time',
    ],
    helps:
      'This hair fall often settles once the cause has passed. A doctor checks for causes that are still there, like low iron or thyroid problems, and whether an early pattern is showing too.',
    urgent: false,
    illustrationAlt: 'Head diagrams: hair evenly thinner across the whole scalp, with no patches.',
    factId: 'shedding-trigger',
    concernSlugs: ['hair_fall'],
  },
  {
    id: 'alopecia-areata',
    pattern: 'patches',
    slot: SLOTS.H23,
    name: 'Patchy hair loss',
    aka: 'Alopecia areata',
    cue: 'Round, smooth patches',
    short: 'Round, smooth bald patches, often coin-sized. They can appear suddenly.',
    looksLike: 'One or more smooth, round patches with no hair. It can also affect the beard or eyebrows.',
    triggers: [
      'The body’s defence system attacks the hair roots by mistake',
      'It sometimes runs in families',
      'It does not spread to others',
    ],
    helps:
      'A skin doctor should look at patches like these, confirm what they are and talk about treatment. Hair products alone are not the answer here.',
    urgent: false,
    illustrationAlt: 'Head diagrams: two round, completely bare patches with sharp edges.',
    concernSlugs: [],
  },
  {
    id: 'traction',
    pattern: 'traction',
    slot: SLOTS.H24,
    name: 'Hair loss from pulling',
    aka: 'Traction alopecia',
    cue: 'Along the hairline',
    short: 'Thinning at the hairline from tight hairstyles worn for a long time.',
    looksLike:
      'Thinning along the front and sides, or wherever hair is pulled hardest. It builds up slowly over months or years.',
    triggers: [
      'Tight ponytails, buns or braids',
      'Hair extensions or weaves',
      'Headwear tied tightly for long hours',
    ],
    helps:
      'Loosen the styles that pull, and get checked early. Pulling for years can scar the hair roots, and a scarred root cannot grow hair again.',
    urgent: false,
    illustrationAlt: 'Head diagrams: hair thinned in a band along the front hairline and temples.',
    concernSlugs: ['receding_hairline'],
  },
  {
    id: 'scarring',
    pattern: 'scarring',
    slot: SLOTS.H25,
    name: 'Scarring hair loss',
    aka: 'Scarring alopecia',
    cue: 'See a doctor soon',
    short: 'Smooth, shiny or red patches. The skin may itch, burn or feel sore.',
    looksLike:
      'The small openings that hairs grow from fade away in the patch. There may be flaking or tenderness.',
    triggers: [
      'A group of conditions that inflame and damage the hair roots',
      'The exact cause is often not known',
    ],
    helps:
      'Please see a skin doctor in person soon. Once a hair root scars it cannot grow hair again, so early care matters.',
    urgent: true,
    illustrationAlt: 'Head diagrams: an uneven bare patch with smooth skin and no hair openings.',
    factId: 'scarred-follicles',
    concernSlugs: [],
  },
];

/**
 * Homepage section 11 · Types of hair loss — a picture-led selector of six common patterns. Each type
 * shows its illustration (SLOTS.H20…H25) once it is ready; until then the line-art head diagrams stand in
 * (the temporary slot photos do not show these patterns, so they are never used here). Server component:
 * builds the content (cited facts, links only to concern pages that exist) for the client explorer.
 */
export function HairLossTypes() {
  const concerns = getConcerns();
  const concernBySlug = new Map(concerns.map((c) => [c.slug, c]));
  const scalpConcern = concernBySlug.get('dandruff_scalp');

  const types: HairLossTypeView[] = TYPES.map(({ factId, concernSlugs, slot, ...rest }) => {
    const fact = factId ? EVIDENCE.find((f) => f.id === factId) : undefined;
    return {
      ...rest,
      image: slot.ready ? { src: slot.src, alt: slot.alt } : null,
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
        return c ? [{ href: concernPath(c.slug), label: `About ${c.title.toLowerCase()}` }] : [];
      }),
    };
  });

  return (
    <section className="bg-pearl" aria-labelledby="hair-loss-types-heading">
      <div className={`container-yhc ${SECTION_Y}`}>
        <div className="mb-6 grid gap-4 md:mb-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-end md:gap-12">
          <h2
            id="hair-loss-types-heading"
            className="display text-[clamp(2.5rem,1.5rem+3.8vw,4.5rem)] leading-[0.98] tracking-[-0.01em] text-balance"
          >
            Not all hair loss is the same
          </h2>
          <p className="max-w-xs text-lg leading-snug text-pretty text-body md:pb-2 md:text-right">
            Six common types. Only a doctor can tell which one you have.
          </p>
        </div>

        <HairLossExplorer types={types} />

        <div className="mt-8 flex flex-col gap-5 border-t border-line pt-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="display text-[clamp(1.5rem,1.3rem+0.8vw,2rem)]">Not sure which? Take the scan.</p>
            <p className="mt-1 text-[13px] text-muted-foreground">
              General information, checked against published sources. Causes and results vary.
              {scalpConcern ? (
                <>
                  {' '}
                  Itchy or flaky scalp?{' '}
                  <Link
                    href={concernPath(scalpConcern.slug)}
                    className="text-ink underline decoration-steel underline-offset-4 hover:decoration-current"
                  >
                    Read about {scalpConcern.title.toLowerCase()}
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
                Begin my free 3D scan
              </Link>
            </Button>
            <Link href="/science" className={`text-ink ${TEXT_LINK}`}>
              How hair grows
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
