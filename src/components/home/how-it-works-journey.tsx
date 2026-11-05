import { getConsultTerms } from '@/components/site/consult-fee';
import { illustrativeNote } from '@/components/site/slot-note';
import { SLOTS } from '@/lib/slots';
import type { VisualSlot } from '@/lib/visual-slots';
import { JourneyPinned } from './how-it-works/journey-pinned';
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
 * Slot terms still come from settings (getConsultTerms) for the visuals' props. Cinematic pass
 * (ADR-35): from lg with motion allowed the section pins into a scroll-driven "ritual" (JourneyPinned).
 */
export function HowItWorksJourney() {
  const terms = getConsultTerms();

  // 2026-11-05 client decision: free scan → instant result → our team calls you back. No health form,
  // paid slot or doctor video call for now (the 'health' / 'slot' visuals stay for later).
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
      title: 'Scalp scan',
      body: 'Your phone guides you to take photos of your scalp, at home.',
      meta: 'Free',
      image: stepImage(SLOTS.H07),
    },
    {
      id: 'assessment',
      title: 'Your result',
      body: 'See straight away if our hair care looks suitable for you, with the reasons.',
      meta: 'A quick check, not a diagnosis',
      image: stepImage(SLOTS.H08),
    },
    {
      id: 'consult',
      title: 'We call you back',
      body: 'Our hair-care team calls you to talk through your result, your questions and your options.',
      meta: 'No payment needed',
      image: stepImage(SLOTS.H27),
    },
    {
      id: 'followup',
      title: 'Follow-up',
      body: 'If you start a plan, we check in regularly so you stay on track.',
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
      <div className="container-yhc pt-14 lg:pt-20">
        <div className="mb-8 grid gap-4 md:mb-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end lg:gap-16">
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
            4 simple steps, then follow-up. The scan is free and you see your result straight away.
          </p>
        </div>
      </div>

      {/* lg + motion: pinned scroll story (200vh). Otherwise: the tab/swipe stepper. */}
      <div className="hidden pb-4 lg:motion-safe:block">
        <JourneyPinned steps={steps} terms={{ fee: terms.fee, slotMinutes: terms.slotMinutes }} />
      </div>
      <div className="container-yhc pb-14 lg:pb-20 lg:motion-safe:hidden">
        <JourneyStepper steps={steps} terms={{ fee: terms.fee, slotMinutes: terms.slotMinutes }} />
      </div>
    </section>
  );
}
