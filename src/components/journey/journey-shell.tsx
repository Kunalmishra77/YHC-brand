import type { JourneyStep } from '@/lib/journey/types';
import { cn } from '@/lib/utils';
import { JourneyStepper } from './journey-stepper';

/**
 * Page frame for the light journey steps (/start/assessment, /details, /book). The stepper and page
 * title sit on the same dark stage as /start and /start/scan; the content then rises out of that band
 * as a card, so the switch from dark to light reads as one deliberate surface, not a hard seam.
 */
export function JourneyShell({
  current,
  eyebrow,
  title,
  lede,
  children,
  className,
}: {
  current: JourneyStep;
  eyebrow: string;
  title: string;
  lede?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="bg-pearl">
      <div className="bg-hero-dark relative isolate overflow-hidden text-on-dark print:bg-none print:text-ink">
        <div
          className="pointer-events-none absolute -top-48 -right-24 -z-10 size-[34rem] rounded-full bg-[radial-gradient(circle,rgba(201,204,209,0.14),transparent_65%)] print:hidden"
          aria-hidden
        />
        <div className="container-yhc pt-6 pb-20 md:pt-8 md:pb-28">
          <JourneyStepper current={current} tone="dark" className="print:hidden" />
          <div className="mx-auto mt-8 max-w-5xl md:mt-14">
            <p className="eyebrow text-brand-on-dark print:text-brand">{eyebrow}</p>
            <h1 className="display mt-3 text-[clamp(2.125rem,1.6rem+2.2vw,3.25rem)] text-balance text-on-dark print:text-ink">
              {title}
            </h1>
            {lede ? (
              <div className="mt-4 max-w-2xl text-[17px] leading-relaxed text-pretty text-on-dark-muted print:text-body">
                {lede}
              </div>
            ) : null}
          </div>
        </div>
      </div>
      <div className={cn('container-yhc relative -mt-12 pb-16 md:-mt-16 md:pb-24 print:mt-6', className)}>
        <div className="mx-auto max-w-5xl">{children}</div>
      </div>
    </div>
  );
}

/** The raised light card the journey content sits in (pairs with JourneyShell). */
export function JourneyCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'rounded-3xl bg-card p-5 shadow-raised ring-1 ring-line/80 sm:p-8 lg:p-10 print:shadow-none',
        className,
      )}
    >
      {children}
    </div>
  );
}
