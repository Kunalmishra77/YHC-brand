import { ArrowUpRight, Check } from 'lucide-react';
import Link from 'next/link';
import { ProgressRing } from '@/components/journey/meters';
import type { JourneyTrackerStep } from '@/lib/journey/types';
import { cn } from '@/lib/utils';

const STATUS_WORDS: Record<JourneyTrackerStep['status'], string> = {
  done: 'Done',
  current: 'Next',
  upcoming: 'Upcoming',
};

/**
 * "My journey" on the account overview (ADR-26), in the visual language of the assessment report:
 * a progress ring with the count, then a vertical stepper where the current step is highlighted.
 * Patient-facing: step labels, dates and notes only.
 */
export function JourneyProgress({ steps, className }: { steps: JourneyTrackerStep[]; className?: string }) {
  const done = steps.filter((s) => s.status === 'done').length;
  const current = steps.find((s) => s.status === 'current');
  const pct = steps.length ? Math.round((done / steps.length) * 100) : 0;
  return (
    <section
      aria-labelledby="journey-heading"
      className={cn('rounded-3xl bg-card p-5 shadow-card ring-1 ring-line/80 md:p-7', className)}
    >
      <div className="flex items-center gap-5">
        <ProgressRing
          value={pct}
          size={84}
          stroke={7}
          label={`${done} of ${steps.length} journey steps done`}
        >
          <span className="price text-[19px] leading-none text-ink">
            {done}
            <span className="text-[13px] font-normal text-muted-foreground">/{steps.length}</span>
          </span>
        </ProgressRing>
        <div className="min-w-0">
          <p className="eyebrow">My journey</p>
          <h2
            id="journey-heading"
            className="display mt-1.5 text-[clamp(1.5rem,1.3rem+0.8vw,1.875rem)] leading-[1.1] text-balance"
          >
            {done === steps.length
              ? 'Every step done'
              : current
                ? `Next: ${current.label}`
                : `${done} of ${steps.length} steps done`}
          </h2>
          <p className="mt-1 text-[13px] text-muted-foreground">
            {done} of {steps.length} steps done
          </p>
        </div>
      </div>

      <ol className="mt-6 border-t border-line pt-5">
        {steps.map((s, i) => {
          const last = i === steps.length - 1;
          const isCurrent = s.status === 'current';
          return (
            <li key={s.id} className="relative flex gap-3.5 pb-4 last:pb-0">
              {!last ? (
                <span
                  className={cn(
                    'absolute top-8 bottom-0 left-[15px] w-px',
                    s.status === 'done' ? 'bg-obsidian' : 'bg-line',
                  )}
                  aria-hidden
                />
              ) : null}
              <span
                className={cn(
                  'relative z-[1] flex size-8 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold',
                  s.status === 'done' && 'bg-obsidian text-on-dark',
                  isCurrent && 'bg-card text-ink ring-2 ring-brand ring-offset-2 ring-offset-card',
                  s.status === 'upcoming' && 'bg-mist text-muted-foreground',
                )}
                aria-hidden
              >
                {s.status === 'done' ? <Check className="size-4" /> : i + 1}
              </span>
              <div
                className={cn(
                  'min-w-0 flex-1',
                  isCurrent ? '-mt-1 rounded-2xl bg-mist/70 px-3.5 py-2.5' : 'pt-1',
                )}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                  <p
                    className={cn(
                      'text-[15px] font-medium',
                      s.status === 'upcoming' ? 'text-muted-foreground' : 'text-ink',
                    )}
                  >
                    {s.href && s.status !== 'upcoming' ? (
                      <Link
                        href={s.href}
                        className="inline-flex items-center gap-1 underline-offset-4 hover:underline"
                      >
                        {s.label}
                        <ArrowUpRight className="size-3.5 text-steel" aria-hidden />
                      </Link>
                    ) : (
                      s.label
                    )}
                  </p>
                  <p
                    className={cn(
                      'text-[12px] font-medium',
                      s.status === 'done'
                        ? 'text-success'
                        : isCurrent
                          ? 'text-brand'
                          : 'text-muted-foreground',
                    )}
                  >
                    {STATUS_WORDS[s.status]}
                    {s.at ? <span className="price font-normal text-muted-foreground"> · {s.at}</span> : null}
                  </p>
                </div>
                {s.note ? <p className="mt-0.5 text-[13px] leading-snug text-body">{s.note}</p> : null}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
