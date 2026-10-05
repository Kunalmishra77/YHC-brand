import {
  CalendarCheck,
  ClipboardList,
  HeartPulse,
  MessageSquareText,
  ScanLine,
  Stethoscope,
  UserRound,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface JourneyStep {
  title: string;
  body: string;
  icon: LucideIcon;
}

/** The patient journey in its ADR-26 order. Copy only; the fee is passed in from settings. */
export function buildTrustJourney({ fee, slotMinutes }: { fee: string; slotMinutes: number }): JourneyStep[] {
  return [
    { title: 'Basic details', body: 'Your name, mobile and address — under a minute.', icon: UserRound },
    {
      title: '3D scalp scan',
      body: 'A guided phone-camera scan of your scalp and roots, from home.',
      icon: ScanLine,
    },
    {
      title: 'Personalised assessment',
      body: 'Whether treatment looks suitable, needs a doctor’s review, or is not right — with reasons.',
      icon: ClipboardList,
    },
    {
      title: 'Health form',
      body: 'History, medicines and lifestyle, so the doctor has the full picture.',
      icon: HeartPulse,
    },
    {
      title: 'Doctor slot',
      body: `Pick a time for a ${slotMinutes}-minute video consultation · ${fee}.`,
      icon: CalendarCheck,
    },
    {
      title: 'Consultation & plan',
      body: 'The doctor explains what is likely going on and prescribes only if treatment is right.',
      icon: Stethoscope,
    },
    {
      title: 'Follow-up',
      body: 'Check-ins and a follow-up review, so the plan is adjusted as you go.',
      icon: MessageSquareText,
    },
  ];
}

export function JourneyTimeline({
  steps,
  tone = 'dark',
  className,
}: {
  steps: JourneyStep[];
  tone?: 'light' | 'dark';
  className?: string;
}) {
  const dark = tone === 'dark';
  return (
    <ol className={cn('relative grid max-w-2xl gap-0 lg:max-w-none lg:grid-cols-7 lg:gap-x-6', className)}>
      {steps.map((s, i) => {
        const Icon = s.icon;
        const last = i === steps.length - 1;
        return (
          <li key={s.title} className="relative flex gap-5 pb-9 last:pb-0 lg:flex-col lg:gap-0 lg:pb-0">
            {/* Connector to the next step: vertical below lg (icon centre line), horizontal from lg */}
            {!last ? (
              <span
                aria-hidden
                className={cn(
                  'absolute top-12 bottom-1 left-5 w-px -translate-x-1/2 lg:top-5 lg:right-[-1rem] lg:bottom-auto lg:left-12 lg:h-px lg:w-auto lg:translate-x-0',
                  dark ? 'bg-line-dark' : 'bg-line',
                )}
              />
            ) : null}
            <span
              className={cn(
                'relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full ring-4',
                dark ? 'bg-graphite text-on-dark ring-obsidian' : 'bg-card text-ink shadow-card ring-pearl',
                i === 1 && (dark ? 'bg-[image:var(--yhc-silver)] text-obsidian' : 'bg-obsidian text-on-dark'),
              )}
            >
              <Icon className="size-[18px]" aria-hidden />
            </span>
            <div className="min-w-0 pt-0.5 lg:mt-6 lg:pt-0">
              <p
                className={cn(
                  'price text-[12px] tracking-[0.12em] uppercase',
                  dark ? 'text-on-dark-muted' : 'text-muted-foreground',
                )}
              >
                Step {i + 1}
              </p>
              <h3
                className={cn(
                  'mt-1 text-[17px] leading-snug font-semibold text-balance lg:text-base xl:text-[17px]',
                  dark ? 'text-on-dark' : 'text-ink',
                )}
              >
                {s.title}
              </h3>
              <p
                className={cn(
                  'mt-1.5 max-w-[52ch] text-sm leading-relaxed text-pretty',
                  dark ? 'text-on-dark-muted' : 'text-body',
                )}
              >
                {s.body}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
