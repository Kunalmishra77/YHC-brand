import { cn } from '@/lib/utils';

export interface JourneyStep {
  title: string;
  body: string;
}

/** Book → Consult → Plan → Delivered → Follow-up, with the fee and length from settings. */
export function buildJourney({ fee, slotMinutes }: { fee: string; slotMinutes: number }): JourneyStep[] {
  return [
    {
      title: 'Book',
      body: `Pick a time and pay the ${fee} consultation fee. Then tell us about your hair and add a few scalp photos.`,
    },
    {
      title: 'Consult',
      body: `Talk to Dr. Tyagi on a ${slotMinutes}-minute video call. Just you and the doctor, going through your photos and questions.`,
    },
    {
      title: 'Plan',
      body: 'If treatment can help, Dr. Tyagi writes your plan. We send it on WhatsApp. You decide if you want it.',
    },
    {
      title: 'Delivered',
      body: 'We ship your plan anywhere in India. Track it on WhatsApp. Simple steps to start come with it.',
    },
    {
      title: 'Follow-up',
      body: 'We check in often. You take monthly photos. Your doctor reviews them and adjusts your plan.',
    },
  ];
}

/** The real five-step sequence (FR-M1-2). Numbered because order matters here. */
export function JourneySteps({ steps, className }: { steps: JourneyStep[]; className?: string }) {
  return (
    <ol
      className={cn(
        'relative grid gap-0 md:grid-cols-5 md:gap-6',
        // vertical rail on mobile, horizontal rail on desktop
        'before:absolute before:top-2 before:bottom-2 before:left-[15px] before:w-px before:bg-line md:before:top-[15px] md:before:right-0 md:before:bottom-auto md:before:left-0 md:before:h-px md:before:w-auto',
        className,
      )}
    >
      {steps.map((step, i) => (
        <li key={step.title} className="relative grid grid-cols-[32px_1fr] gap-4 pb-8 md:block md:pb-0">
          <span className="price relative z-10 flex size-8 items-center justify-center rounded-full border border-platinum bg-pearl text-sm text-ink">
            {i + 1}
          </span>
          <div className="md:mt-5">
            <h3 className="font-semibold text-ink">{step.title}</h3>
            <p className="mt-1.5 text-sm text-body">{step.body}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
