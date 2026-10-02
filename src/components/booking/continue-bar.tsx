import { cn } from '@/lib/utils';

/**
 * Sticky bottom action bar on mobile (thumb reach, docs/07 §1); inline on ≥ md.
 * Sits above the site's WhatsApp/Book bar (z-50 vs z-40) so the flow's own next step wins.
 */
export function ContinueBar({
  children,
  summary,
  className,
}: {
  children: React.ReactNode;
  /** short context shown left of the button on mobile, e.g. the chosen time */
  summary?: React.ReactNode;
  className?: string;
}) {
  return (
    <>
      <div
        className={cn(
          'fixed inset-x-0 bottom-0 z-50 border-t border-line bg-pearl/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur',
          'md:static md:z-auto md:mt-8 md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none',
          className,
        )}
      >
        <div className="flex items-center gap-3">
          {summary ? <div className="min-w-0 flex-1 text-sm leading-tight md:hidden">{summary}</div> : null}
          <div className={cn('flex gap-2', summary ? 'shrink-0' : 'flex-1 md:flex-none')}>{children}</div>
        </div>
      </div>
      {/* keeps the last content clear of the fixed bar on mobile */}
      <div className="h-24 md:hidden" aria-hidden />
    </>
  );
}
