import { Check, Route } from 'lucide-react';
import Link from 'next/link';
import type { JourneyTrackerStep } from '@/lib/journey/types';
import { cn } from '@/lib/utils';

/** "My journey" card on the patient portal overview — each step with status words and dates. */
export function JourneyTracker({ steps, className }: { steps: JourneyTrackerStep[]; className?: string }) {
  const doneCount = steps.filter((s) => s.status === 'done').length;
  return (
    <section
      aria-labelledby="journey-heading"
      className={cn('rounded-xl border border-line bg-card p-5 md:p-6', className)}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow">My journey</p>
          <h2 id="journey-heading" className="mt-1.5 text-lg font-semibold text-ink">
            {doneCount} of {steps.length} steps done
          </h2>
        </div>
        <Route className="mt-1 size-5 text-steel" aria-hidden />
      </div>
      <ol className="mt-5">
        {steps.map((s, i) => {
          const last = i === steps.length - 1;
          return (
            <li key={s.id} className="relative flex gap-3 pb-5 last:pb-0">
              {!last ? (
                <span
                  className={cn(
                    'absolute top-7 left-[13px] h-[calc(100%-1.5rem)] w-px',
                    s.status === 'done' ? 'bg-obsidian' : 'bg-line',
                  )}
                  aria-hidden
                />
              ) : null}
              <span
                className={cn(
                  'relative flex size-7 shrink-0 items-center justify-center rounded-full border text-[12px] font-semibold',
                  s.status === 'done' && 'border-obsidian bg-obsidian text-on-dark',
                  s.status === 'current' && 'border-brand bg-card text-brand',
                  s.status === 'upcoming' && 'border-line bg-card text-muted-foreground',
                )}
                aria-hidden
              >
                {s.status === 'done' ? <Check className="size-3.5" /> : i + 1}
              </span>
              <div className="min-w-0 flex-1 pt-0.5">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                  <p
                    className={cn(
                      'text-sm font-medium',
                      s.status === 'upcoming' ? 'text-muted-foreground' : 'text-ink',
                    )}
                  >
                    {s.href && s.status !== 'upcoming' ? (
                      <Link href={s.href} className="underline-offset-4 hover:underline">
                        {s.label}
                      </Link>
                    ) : (
                      s.label
                    )}
                    <span
                      className={cn(
                        'ml-2 text-[12px] font-normal',
                        s.status === 'done'
                          ? 'text-success'
                          : s.status === 'current'
                            ? 'text-brand'
                            : 'text-muted-foreground',
                      )}
                    >
                      {s.status === 'done' ? 'Done' : s.status === 'current' ? 'Next' : 'Upcoming'}
                    </span>
                  </p>
                  {s.at ? (
                    <p className="price text-[12px] font-normal text-muted-foreground">{s.at}</p>
                  ) : null}
                </div>
                {s.note ? <p className="mt-0.5 text-[13px] text-body">{s.note}</p> : null}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
