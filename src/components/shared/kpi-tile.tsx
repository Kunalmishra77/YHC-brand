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
  const dark = tone === 'dark';
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl p-5',
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
      <div className="relative flex items-center gap-1.5">
        <p className={cn('text-[13px] font-medium', dark ? 'text-on-dark-muted' : 'text-muted-foreground')}>
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
      <p
        className={cn(
          'price relative mt-3 text-[2rem] leading-none tracking-tight',
          dark ? 'text-on-dark' : 'text-ink',
        )}
      >
        {value}
      </p>
      {delta ? (
        <p
          className={cn(
            'relative mt-3 text-[13px] leading-snug',
            dark ? 'text-on-dark-muted' : 'text-muted-foreground',
          )}
        >
          {delta}
        </p>
      ) : null}
    </div>
  );
}
