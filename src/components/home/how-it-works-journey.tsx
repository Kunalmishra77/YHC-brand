import { getConsultTerms } from '@/components/site/consult-fee';
import { SECTION_Y } from '@/components/site/section';
import { JourneyStepper } from './how-it-works/journey-stepper';
import type { HowStep } from './how-it-works/types';

/**
 * Homepage section 6 · How it works — the real patient journey in its ADR-26 order.
 * One-viewport stepper at every size (audit UX-02): steps as tabs, one visual panel, the CTA beside
 * the steps. The fee and slot length come from settings (getConsultTerms), never constants.
 */
export function HowItWorksJourney() {
  const terms = getConsultTerms();

  const steps: HowStep[] = [
    {
      id: 'details',
      title: 'Basic details',
      body: 'Your name and mobile number, confirmed with a one-time code. Nothing else until you need it.',
      meta: 'Takes about a minute',
    },
    {
      id: 'scan',
      title: '3D scalp scan',
      body: 'Follow on-screen guidance to capture your scalp and roots from a few angles, on your phone, at home.',
      meta: 'Free · from home',
    },
    {
      id: 'assessment',
      title: 'Personalised assessment',
      body: 'See whether treatment looks suitable, needs a doctor’s review, or is not right for you — with the reasons.',
      meta: 'The final assessment is always by the doctor',
    },
    {
      id: 'health',
      title: 'Health form',
      body: 'Your history, medicines and lifestyle, so the doctor has the full picture before you meet.',
    },
    {
      id: 'slot',
      title: 'Book & pay',
      body: `Choose a time that suits you for a ${terms.slotMinutes}-minute video consultation.`,
      meta: `Consultation fee ${terms.fee}`,
    },
    {
      id: 'consult',
      title: 'Video consultation & plan',
      body: 'The doctor explains what is likely going on and prescribes a plan only if treatment is right for you.',
    },
    {
      id: 'followup',
      title: 'Follow-up',
      body: 'Regular check-ins and a follow-up review, so your plan can be adjusted as you go.',
      after: true,
    },
  ];

  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-heading"
      className="scroll-mt-16 border-y border-line bg-card"
    >
      <div className={`container-yhc ${SECTION_Y}`}>
        {/* Editorial header: very large serif words left, short lede right (asymmetric split) */}
        <div className="mb-10 grid gap-6 md:mb-14 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end lg:gap-16">
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
            Six steps to your consultation, then follow-up. Nothing is prescribed until a doctor has seen your
            scan, read your health form and spoken with you.
          </p>
        </div>

        <JourneyStepper steps={steps} terms={{ fee: terms.fee, slotMinutes: terms.slotMinutes }} />

      </div>
    </section>
  );
}
