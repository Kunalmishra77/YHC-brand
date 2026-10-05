import { Check } from 'lucide-react';
import { JOURNEY_STEPS, type JourneyStep } from '@/lib/journey/types';
import { cn } from '@/lib/utils';

/**
 * Journey stepper across /start/*: Details → 3D scan → Assessment → Health form → Book slot →
 * Consultation. Mobile: "Step 3 of 6 · Assessment" + segmented rail. Desktop: the full list.
 */
export function JourneyStepper({
  current,
  tone = 'light',
  className,
}: {
  current: JourneyStep;
  tone?: 'light' | 'dark';
  className?: string;
}) {
  const index = JOURNEY_STEPS.findIndex((s) => s.id === current);
  const dark = tone === 'dark';
  const active = JOURNEY_STEPS[index];
  return (
    <nav aria-label="Your journey" className={cn('w-full', className)}>
      <div className="md:hidden">
        <p className={cn('text-sm', dark ? 'text-on-dark-muted' : 'text-muted-foreground')}>
          Step {index + 1} of {JOURNEY_STEPS.length} ·{' '}
          <span className={cn('font-medium', dark ? 'text-on-dark' : 'text-ink')}>{active?.label}</span>
        </p>
        <div className="mt-2 flex gap-1" aria-hidden>
          {JOURNEY_STEPS.map((s, i) => (
            <span
              key={s.id}
              className={cn(
                'h-1 flex-1 rounded-full',
                i < index
                  ? dark
                    ? 'bg-platinum'
                    : 'bg-obsidian'
                  : i === index
                    ? dark
                      ? 'bg-silver'
                      : 'bg-brand'
                    : dark
                      ? 'bg-white/15'
                      : 'bg-mist',
              )}
            />
          ))}
        </div>
      </div>
      <ol className="hidden items-center gap-2 md:flex">
        {JOURNEY_STEPS.map((s, i) => {
          const done = i < index;
          const isActive = i === index;
          return (
            <li
              key={s.id}
              aria-current={isActive ? 'step' : undefined}
              className="flex min-w-0 flex-1 items-center gap-2"
            >
              <span
                className={cn(
                  'flex size-7 shrink-0 items-center justify-center rounded-full border text-[13px] font-semibold',
                  dark
                    ? done
                      ? 'border-platinum bg-platinum text-obsidian'
                      : isActive
                        ? 'border-white/70 bg-white/10 text-on-dark'
                        : 'border-white/20 text-on-dark-muted'
                    : done
                      ? 'border-obsidian bg-obsidian text-on-dark'
                      : isActive
                        ? 'border-brand bg-card text-brand'
                        : 'border-line bg-card text-muted-foreground',
                )}
              >
                {done ? <Check className="size-3.5" aria-hidden /> : i + 1}
              </span>
              <span
                className={cn(
                  'truncate text-sm',
                  dark
                    ? isActive
                      ? 'font-medium text-on-dark'
                      : 'text-on-dark-muted'
                    : isActive
                      ? 'font-medium text-ink'
                      : done
                        ? 'text-body'
                        : 'text-muted-foreground',
                )}
              >
                {s.label}
                {done ? <span className="sr-only"> (done)</span> : null}
              </span>
              {i < JOURNEY_STEPS.length - 1 ? (
                <span className={cn('h-px min-w-3 flex-1', dark ? 'bg-white/15' : 'bg-line')} aria-hidden />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
