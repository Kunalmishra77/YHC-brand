import { FileBadge2 } from 'lucide-react';
import { CLAIMS, PATENT_PENDING_COPY, verifiedPatent } from '@/lib/claims';
import { cn } from '@/lib/utils';

/**
 * Patent claim slot (ADR-27). Shows the patent number/title only once `CLAIMS.patent` is verified;
 * until then a clearly labelled, deliberately quiet placeholder — never the word "patented".
 */
export function PatentSlot({
  tone = 'light',
  compact = false,
  className,
}: {
  tone?: 'light' | 'dark';
  compact?: boolean;
  className?: string;
}) {
  const patent = verifiedPatent(CLAIMS);
  const dark = tone === 'dark';

  if (compact) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5',
          patent ? null : 'italic',
          dark ? 'text-on-dark-muted' : 'text-muted-foreground',
          className,
        )}
      >
        <FileBadge2 className="size-3.5 shrink-0" aria-hidden />
        {patent ? `Patented formulation · No. ${patent.number}` : 'Patent details: pending verification'}
      </span>
    );
  }

  return (
    <div
      className={cn(
        'flex items-start gap-4 rounded-2xl p-5',
        patent
          ? dark
            ? 'bg-ink-2 ring-1 ring-line-dark'
            : 'bg-card ring-1 ring-line'
          : dark
            ? 'border border-dashed border-line-dark'
            : 'border border-dashed border-steel/60 bg-card/50',
        className,
      )}
    >
      <span
        className={cn(
          'flex size-10 shrink-0 items-center justify-center rounded-full',
          dark ? 'bg-graphite text-on-dark' : 'bg-mist text-ink',
        )}
      >
        <FileBadge2 className="size-5" aria-hidden />
      </span>
      <div className="min-w-0">
        <p
          className={cn(
            'text-[12px] font-semibold tracking-[0.12em] uppercase',
            dark ? 'text-brand-on-dark' : 'text-brand',
          )}
        >
          {patent ? 'Patented formulation' : 'Patent'}
        </p>
        {patent ? (
          <>
            <p className={cn('mt-1 font-medium', dark ? 'text-on-dark' : 'text-ink')}>
              Patent No. {patent.number}
            </p>
            {patent.title ? (
              <p className={cn('mt-0.5 text-sm', dark ? 'text-on-dark-muted' : 'text-body')}>
                {patent.title}
              </p>
            ) : null}
          </>
        ) : (
          <p className={cn('mt-1 text-sm', dark ? 'text-on-dark-muted' : 'text-body')}>
            {PATENT_PENDING_COPY}.
          </p>
        )}
      </div>
    </div>
  );
}
