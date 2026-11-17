import { cn } from '@/lib/utils';

export interface JourneyStep {
  title: string;
  body: string;
}

/** Scan → Result → Call → Delivered → Follow-up (2026-11-05: no paid consultation for now). */
export function buildJourney(): JourneyStep[] {
  return [
    {
      title: 'Scan',
      body: 'Take a free scalp scan with your phone camera, at home. Add your name, mobile and email.',
    },
    {
      title: 'Result',
      body: 'See your result straight away: whether our hair care looks suitable for you or not. It is a quick check, not a diagnosis.',
    },
    {
      title: 'Call',
      body: 'Our hair-care team calls you back to talk through your result, answer your questions and explain your options.',
    },
    {
      title: 'Delivered',
      body: 'If you choose a plan, we ship it anywhere in India. Track it on WhatsApp. Simple steps to start come with it.',
    },
    {
      title: 'Follow-up',
      body: 'We check in often and help you stay on track with your routine.',
    },
  ];
}

/** The real five-step sequence (FR-M1-2). Numbered because order matters here. */
export function JourneySteps({ steps, className }: { steps: JourneyStep[]; className?: string }) {
  return (
    <ol
      className={cn(
        'relative grid gap-0 lg:grid-cols-5 lg:gap-6',
        // vertical rail on mobile, horizontal rail on desktop
        'before:absolute before:top-2 before:bottom-2 before:left-[15px] before:w-px before:bg-line lg:before:top-[15px] lg:before:right-0 lg:before:bottom-auto lg:before:left-0 lg:before:h-px lg:before:w-auto',
        className,
      )}
    >
      {steps.map((step, i) => (
        <li key={step.title} className="relative grid grid-cols-[32px_1fr] gap-4 pb-8 lg:block lg:pb-0">
          <span className="price relative z-10 flex size-8 items-center justify-center rounded-full border border-platinum bg-pearl text-sm text-ink">
            {i + 1}
          </span>
          <div className="lg:mt-5">
            <h3 className="font-semibold text-ink">{step.title}</h3>
            <p className="mt-1.5 text-sm text-body">{step.body}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
