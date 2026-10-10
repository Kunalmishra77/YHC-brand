import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { getConsultTerms } from '@/components/site/consult-fee';
import { SECTION_Y } from '@/components/site/section';
import { Button } from '@/components/ui/button';
import { JourneyStepper } from './how-it-works/journey-stepper';
import type { HowStep } from './how-it-works/types';

/**
 * Homepage section 6 · How it works — the real patient journey in its ADR-26 order.
 * Desktop: a sticky, scroll-driven stepper (step list with a filling progress rail + a visual panel that
 * cross-fades per step). Phones/tablets and reduced motion: a vertical timeline with a compact visual per
 * step. The fee and slot length come from settings (getConsultTerms), never constants.
 */
export function HowItWorksJourney() {
  const terms = getConsultTerms();

  const steps: HowStep[] = [
    {
      id: 'details',
      title: 'Basic details',
      body: 'Your name, mobile number and address, so we know who we are looking after.',
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
      title: 'Book a doctor slot',
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
        <div className="mb-12 grid gap-6 md:mb-20 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end lg:gap-16">
          <div>
            <p className="eyebrow">How it works</p>
            <h2
              id="how-it-works-heading"
              className="display mt-4 text-[clamp(3rem,1.7rem+5.4vw,6.25rem)] leading-[0.95] tracking-[-0.01em] text-balance"
            >
              From scan to plan.
            </h2>
          </div>
          <p className="max-w-md leading-relaxed text-pretty text-body lg:justify-self-end lg:pb-3">
            Seven steps, in the order you take them. Nothing is prescribed until a doctor has seen your scan,
            read your health form and spoken with you.
          </p>
        </div>

        <JourneyStepper steps={steps} terms={{ fee: terms.fee, slotMinutes: terms.slotMinutes }} />

        <div className="mt-12 flex flex-col gap-4 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between md:mt-16">
          <p className="max-w-xl text-sm leading-relaxed text-body">
            Starting is free. You only pay the {terms.fee} consultation fee when you book a doctor slot.
          </p>
          <Button asChild className="h-12 px-7 text-base">
            <Link href="/start">
              Start with your details <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
