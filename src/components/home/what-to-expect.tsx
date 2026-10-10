import { Reveal } from '@/components/site/reveal';
import { SECTION_Y } from '@/components/site/section';
import { EVIDENCE } from '@/server/content/evidence';
import { ExpectTimeline, type ExpectPhase, type PhaseSource } from './expect/expect-timeline';

function source(id: string): PhaseSource[] {
  const fact = EVIDENCE.find((f) => f.id === id);
  return fact ? [{ name: fact.source.name, title: fact.source.title, url: fact.source.url }] : [];
}

/**
 * The experience of a plan, month by month — what you do, what we check and when it is fair to judge.
 * Ranges describe the routine and published guidance on hair cycles, never promised outcomes.
 * TODO(client): Dr. Tyagi to review this wording and the usual follow-up timing — see docs/12 (content).
 */
const PHASES: ExpectPhase[] = [
  {
    id: 'setup',
    when: 'First weeks',
    title: 'Your routine is set up',
    body: 'Your plan arrives with clear how-to-use steps from the doctor. WhatsApp check-ins begin, so questions, missed doses or any scalp irritation are picked up early.',
    range: [0, 1],
    mark: 'solid',
    sources: [],
  },
  {
    id: 'shedding',
    when: 'Early months',
    title: 'Shedding may change first',
    body: 'Hair grows in slow cycles: a hair that enters its resting phase stays for about three months before it sheds. So shedding may change before anything else does, and a few weeks is too early to judge.',
    range: [0.5, 3.5],
    mark: 'soft',
    sources: source('growth-phase'),
  },
  {
    id: 'photos',
    when: 'Every month',
    title: 'Progress photos',
    body: 'A short photo set each month, taken the same way — same light, same angles — so change is judged against your own starting point, not memory or the mirror.',
    range: [1, 12],
    mark: 'dots',
    sources: [],
  },
  {
    id: 'review',
    when: 'At follow-up',
    title: 'Review with the doctor',
    body: 'The doctor looks at your photos and check-in replies together and asks how the routine is going. The timing of your follow-up is set by your doctor.',
    range: [2, 6],
    mark: 'dashed',
    sources: [],
  },
  {
    id: 'judge',
    when: 'Around 6–12 months',
    title: 'A fair time to judge',
    body: 'For pattern hair loss, dermatologists advise about 6 to 12 months of steady use before judging how well a treatment works. Any improvement usually takes at least 4 to 6 months to notice, and some people do not respond.',
    range: [6, 12],
    mark: 'gradient',
    sources: [...source('ongoing-use'), ...source('treatment-timeline')],
  },
  {
    id: 'adjust',
    when: 'Ongoing',
    title: 'Adjusted, not abandoned',
    body: 'Based on what the photos and check-ins show, the doctor may change the strength, combination or routine. Benefits usually last only while treatment continues, so a routine you can keep up matters most.',
    range: [3, 12],
    mark: 'arrow',
    sources: [],
  },
];

/**
 * Homepage section 9 · What can you expect — editorial asymmetric split: a large serif statement on the
 * left (sticky on desktop), a month-marked axis and an accordion of phases on the right. It describes the
 * experience (routine, check-ins, monthly photos, doctor review, adjustments) — no outcome promises.
 */
export function WhatToExpect() {
  return (
    <section
      id="what-to-expect"
      aria-labelledby="expect-heading"
      className="relative scroll-mt-20 overflow-x-clip border-t border-line bg-card"
    >
      <div
        className={`container-yhc grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20 ${SECTION_Y}`}
      >
        <Reveal className="lg:sticky lg:top-28 lg:self-start">
          <p className="eyebrow">What to expect</p>
          <h2
            id="expect-heading"
            className="display mt-5 text-[clamp(2.75rem,1.6rem+4.4vw,5.25rem)] leading-[0.95] tracking-[-0.01em] text-balance"
          >
            What can you expect?
          </h2>
          <p className="mt-6 max-w-sm leading-relaxed text-pretty text-body">
            An honest picture of the months ahead — what you will do, what we will check, and when it is fair
            to judge. A guide to the experience, not a promise of results.
          </p>
          <p className="mt-6 max-w-sm text-[13px] leading-relaxed text-pretty text-muted-foreground">
            Individual results vary. Timings describe the experience of a plan and published guidance on hair
            cycles; they are not promised outcomes. Your doctor sets your follow-up schedule.
          </p>
        </Reveal>

        <ExpectTimeline phases={PHASES} />
      </div>
    </section>
  );
}
