import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

/** KPI with value, label, delta in words and a metric definition tooltip (FR-M13-5). */
export function KpiTile({
  label,
  value,
  delta,
  definition,
  tone = 'light',
  className,
}: {
  label: string;
  value: string;
  delta?: string;
  definition?: string;
  tone?: 'light' | 'dark';
  className?: string;
}) {
  return (
    <div
      className={cn(
        'rounded-lg border p-4',
        tone === 'dark' ? 'border-line-dark bg-ink-2 text-on-dark' : 'border-line bg-card',
        className,
      )}
    >
      <div className="flex items-center gap-1.5">
        <p className={cn('text-sm', tone === 'dark' ? 'text-on-dark-muted' : 'text-muted-foreground')}>
          {label}
        </p>
        {definition ? (
          <Tooltip>
            <TooltipTrigger aria-label={`How ${label} is measured`} className="rounded-full">
              <Info className="size-3.5 text-steel" aria-hidden />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">{definition}</TooltipContent>
          </Tooltip>
        ) : null}
      </div>
      <p className={cn('price mt-1 text-2xl', tone === 'dark' ? 'text-on-dark' : 'text-ink')}>{value}</p>
      {delta ? (
        <p
          className={cn('mt-1 text-[13px]', tone === 'dark' ? 'text-on-dark-muted' : 'text-muted-foreground')}
        >
          {delta}
        </p>
      ) : null}
    </div>
  );
}
