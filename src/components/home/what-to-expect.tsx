import { ScanLine } from 'lucide-react';
import Link from 'next/link';
import { Reveal } from '@/components/site/reveal';
import { SECTION_Y } from '@/components/site/section';
import { illustrativeNote } from '@/components/site/slot-note';
import { Button } from '@/components/ui/button';
import { SLOTS } from '@/lib/slots';
import { EVIDENCE } from '@/server/content/evidence';
import { ExpectTimeline, type ExpectStage, type StageSource } from './expect/expect-timeline';

function source(id: string): StageSource[] {
  const fact = EVIDENCE.find((f) => f.id === id);
  return fact ? [{ name: fact.source.name, title: fact.source.title, url: fact.source.url }] : [];
}

/**
 * The routine of a plan in four pictures — what you do, what we check, when the doctor reviews. It shows
 * the routine (H16–H19 show daily life, never hair "results"); timings are the routine and published
 * guidance on hair growth, not promised outcomes.
 * TODO(client): Dr. Tyagi to review this wording and the usual review timing — see docs/12 (content).
 */
function stages(): ExpectStage[] {
  return [
    {
      id: 'start',
      when: 'First weeks',
      title: 'Your routine starts',
      line: 'Your plan comes with simple steps. We check in on WhatsApp.',
      detail:
        'Your doctor gives you clear steps for each product. We check in on WhatsApp, so questions, missed doses or an itchy scalp are caught early.',
      image: SLOTS.H16,
      note: illustrativeNote(SLOTS.H16),
      sources: [],
    },
    {
      id: 'daily',
      when: 'Every day',
      title: 'A small daily habit',
      line: 'A few minutes a day. Keep going, even when change is slow.',
      detail:
        'Hair grows slowly. In the first months, hair fall may change before anything else. A few weeks is too early to judge.',
      image: SLOTS.H17,
      note: illustrativeNote(SLOTS.H17),
      sources: source('growth-phase'),
    },
    {
      id: 'photos',
      when: 'Every month',
      title: 'One photo set a month',
      line: 'Same light, same angles. You compare with your own start.',
      detail:
        'Each month you take a few photos the same way. So change is judged against your own start, not against memory or the mirror.',
      image: SLOTS.H18,
      note: illustrativeNote(SLOTS.H18),
      sources: [],
    },
    {
      id: 'review',
      when: 'At your review',
      title: 'Your doctor checks in',
      line: 'Your doctor looks at your photos and may change the plan.',
      detail:
        'Your doctor sets the review date. Doctors usually advise 6 to 12 months of steady use before judging a treatment. Some people do not respond. Any benefit usually lasts only while you keep using it.',
      image: SLOTS.H19,
      note: illustrativeNote(SLOTS.H19),
      sources: [...source('ongoing-use'), ...source('treatment-timeline')],
    },
  ];
}

/**
 * Homepage section 9 · What can you expect — a picture-led timeline: four square photos on a thin line,
 * a short title and one line each, the detail behind a tap. Describes the routine, not results.
 */
export function WhatToExpect() {
  return (
    <section
      id="what-to-expect"
      aria-labelledby="expect-heading"
      className={`relative scroll-mt-20 overflow-x-clip border-t border-line bg-card ${SECTION_Y}`}
    >
      <div className="container-yhc">
        <Reveal className="mb-8 grid gap-4 md:mb-10 md:grid-cols-[minmax(0,1fr)_auto] md:items-end md:gap-12">
          <h2
            id="expect-heading"
            className="display text-[clamp(2.75rem,1.6rem+4.4vw,5.25rem)] leading-[0.95] tracking-[-0.01em] text-balance"
          >
            What to expect
          </h2>
          <p className="max-w-xs text-lg leading-snug text-pretty text-body md:pb-2 md:text-right">
            The months ahead, in pictures. A guide, not a promise.
          </p>
        </Reveal>

        <ExpectTimeline stages={stages()} />

        <div className="mt-8 flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-md text-[13px] leading-relaxed text-pretty text-muted-foreground">
            Individual results vary. This shows the routine, not a promise of results. Your doctor sets your
            review dates.
          </p>
          <Button asChild className="h-12 w-full px-7 text-base sm:w-auto">
            <Link href="/start">
              <ScanLine className="size-4" aria-hidden />
              Begin my free 3D scan
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
