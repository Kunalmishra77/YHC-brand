import { cn } from '@/lib/utils';

/** "Day X of Y" with a slim metallic progress bar (FR-M4-2). */
export function PlanProgress({ day, total, className }: { day: number; total: number; className?: string }) {
  const pct = total > 0 ? Math.min(100, Math.max(0, Math.round((day / total) * 100))) : 0;
  const left = Math.max(0, total - day);
  return (
    <div className={className}>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-ink">
          <span className="price text-2xl">Day {day}</span>{' '}
          <span className="text-sm text-muted-foreground">of {total}</span>
        </p>
        <p className="text-sm text-muted-foreground">{left === 0 ? 'Last day' : `${left} days left`}</p>
      </div>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={day}
        aria-label={`Day ${day} of ${total}`}
        className="mt-3 h-2 w-full overflow-hidden rounded-full bg-mist"
      >
        <div
          className={cn('h-full rounded-full bg-gradient-to-r from-graphite to-steel')}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
