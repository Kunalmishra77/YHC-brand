import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Booking / checkout stepper (docs/07 §5). Mobile: compact "Step 2 of 5 · Verify mobile" with a
 * segmented rail. Desktop: the full list.
 */
export function Stepper({
  steps,
  current,
  className,
}: {
  steps: readonly string[];
  /** 0-based index of the active step */
  current: number;
  className?: string;
}) {
  const active = steps[current] ?? '';
  return (
    <nav aria-label="Progress" className={cn('w-full', className)}>
      <div className="md:hidden">
        <p className="text-sm text-muted-foreground">
          Step {Math.min(current + 1, steps.length)} of {steps.length} ·{' '}
          <span className="font-medium text-ink">{active}</span>
        </p>
        <div className="mt-2 flex gap-1" aria-hidden>
          {steps.map((s, i) => (
            <span
              key={s}
              className={cn(
                'h-1 flex-1 rounded-full transition-colors duration-(--yhc-dur)',
                i < current ? 'bg-obsidian' : i === current ? 'bg-brand' : 'bg-mist',
              )}
            />
          ))}
        </div>
      </div>
      <ol className="hidden items-center gap-2 md:flex">
        {steps.map((s, i) => {
          const done = i < current;
          const isActive = i === current;
          return (
            <li
              key={s}
              aria-current={isActive ? 'step' : undefined}
              className="flex min-w-0 flex-1 items-center gap-2"
            >
              <span
                className={cn(
                  'flex size-7 shrink-0 items-center justify-center rounded-full border text-[13px] font-semibold',
                  done && 'border-obsidian bg-obsidian text-on-dark',
                  isActive && 'border-brand bg-card text-brand',
                  !done && !isActive && 'border-line bg-card text-muted-foreground',
                )}
              >
                {done ? <Check className="size-3.5" aria-hidden /> : i + 1}
              </span>
              <span
                className={cn(
                  'truncate text-sm',
                  isActive ? 'font-medium text-ink' : done ? 'text-body' : 'text-muted-foreground',
                )}
              >
                {s}
                {done ? <span className="sr-only"> (done)</span> : null}
              </span>
              {i < steps.length - 1 ? <span className="h-px min-w-4 flex-1 bg-line" aria-hidden /> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
