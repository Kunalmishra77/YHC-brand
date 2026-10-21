import { getConsultTerms } from '@/components/site/consult-fee';
import { SECTION_Y } from '@/components/site/section';
import { illustrativeNote } from '@/components/site/slot-note';
import { SLOTS } from '@/lib/slots';
import type { VisualSlot } from '@/lib/visual-slots';
import { JourneyStepper } from './how-it-works/journey-stepper';
import type { HowStep, StepImage } from './how-it-works/types';

/** Plain, serialisable copy of a slot for the client stepper. */
const stepImage = (s: VisualSlot): StepImage => ({
  src: s.src,
  width: s.width,
  height: s.height,
  alt: s.alt,
  ready: s.ready,
  note: illustrativeNote(s),
});

/**
 * Homepage section 6 · How it works — the real patient journey in its ADR-26 order, picture-led
 * (docs/20): steps as tabs, one big panel whose photo (slots H06–H12) crossfades with each step.
 * The fee and slot length come from settings (getConsultTerms), never constants.
 */
export function HowItWorksJourney() {
  const terms = getConsultTerms();

  const steps: HowStep[] = [
    {
      id: 'details',
      title: 'Your details',
      body: 'Your name and mobile number. We send a code to confirm it.',
      meta: 'About 1 minute',
      image: stepImage(SLOTS.H06),
    },
    {
      id: 'scan',
      title: '3D scalp scan',
      body: 'Your phone guides you to take photos of your scalp, at home.',
      meta: 'Free',
      image: stepImage(SLOTS.H07),
    },
    {
      id: 'assessment',
      title: 'Your result',
      body: 'See if treatment looks right for you, with the reasons.',
      meta: 'The doctor makes the final call',
      image: stepImage(SLOTS.H08),
    },
    {
      id: 'health',
      title: 'Health form',
      body: 'Tell us about your health, medicines and daily life. Your doctor reads it before the call.',
      image: stepImage(SLOTS.H09),
    },
    {
      id: 'slot',
      title: 'Book and pay',
      body: `Pick a time for a ${terms.slotMinutes}-minute video call with the doctor.`,
      meta: `Fee ${terms.fee}`,
      image: stepImage(SLOTS.H10),
    },
    {
      id: 'consult',
      title: 'Video call and plan',
      body: 'The doctor explains what is going on. You get a plan only if it will help.',
      image: stepImage(SLOTS.H11),
    },
    {
      id: 'followup',
      title: 'Follow-up',
      body: 'Regular check-ins and a review call. Your plan can change as you go.',
      after: true,
      image: stepImage(SLOTS.H12),
    },
  ];

  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-heading"
      className="scroll-mt-16 border-y border-line bg-card"
    >
      <div className={`container-yhc ${SECTION_Y}`}>
        <div className="mb-8 grid gap-4 md:mb-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end lg:gap-16">
          <div>
            <p className="eyebrow">How it works</p>
            <h2
              id="how-it-works-heading"
              className="display mt-4 text-[clamp(2.75rem,1.6rem+4.6vw,6rem)] leading-[0.95] tracking-[-0.01em] text-balance"
            >
              From scan to plan.
            </h2>
          </div>
          <p className="max-w-md leading-relaxed text-pretty text-body lg:justify-self-end lg:pb-3">
            6 simple steps, then follow-up. No medicine until a doctor has seen you.
          </p>
        </div>

        <JourneyStepper steps={steps} terms={{ fee: terms.fee, slotMinutes: terms.slotMinutes }} />
      </div>
    </section>
  );
}
