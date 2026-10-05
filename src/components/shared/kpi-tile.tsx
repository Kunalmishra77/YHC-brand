import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

/**
 * KPI with value, label, delta in words and a metric definition tooltip (FR-M13-5).
 * Fills its grid cell (equal heights in a row); the delta sits on the bottom edge.
 */
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
  const dark = tone === 'dark';
  return (
    <div
      className={cn(
        'relative flex h-full min-w-0 flex-col overflow-hidden rounded-xl p-4 sm:p-5',
        dark ? 'bg-obsidian text-on-dark ring-1 ring-line-dark' : 'bg-card shadow-card ring-1 ring-line/80',
        className,
      )}
    >
      {dark ? (
        <div
          className="pointer-events-none absolute -top-16 -right-10 size-40 rounded-full bg-[radial-gradient(circle,rgba(201,204,209,0.18),transparent_70%)]"
          aria-hidden
        />
      ) : null}
      <div className="relative flex items-start justify-between gap-2">
        <p
          className={cn(
            'min-w-0 text-[13px] leading-snug font-medium',
            dark ? 'text-on-dark-muted' : 'text-muted-foreground',
          )}
        >
          {label}
        </p>
        {definition ? (
          <Tooltip>
            <TooltipTrigger
              aria-label={`How ${label} is measured`}
              className="-mt-1 -mr-1.5 flex size-6 shrink-0 items-center justify-center rounded-full"
            >
              <Info className="size-3.5 text-steel" aria-hidden />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">{definition}</TooltipContent>
          </Tooltip>
        ) : null}
      </div>
      <p
        className={cn(
          'price relative mt-3 text-[1.625rem] leading-none tracking-tight break-words sm:text-[2rem]',
          dark ? 'text-on-dark' : 'text-ink',
        )}
      >
        {value}
      </p>
      {delta ? (
        <p
          className={cn(
            'relative mt-auto pt-3 text-[13px] leading-snug text-pretty',
            dark ? 'text-on-dark-muted' : 'text-muted-foreground',
          )}
        >
          {delta}
        </p>
      ) : null}
    </div>
  );
}
