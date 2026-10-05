import { cn } from '@/lib/utils';
import type { TocEntry } from '@/server/content/types';

/**
 * "On this page" navigation. Sticky beside the text on desktop; a collapsible list above it on mobile.
 * Plain anchor links — no scroll-spy script.
 */
export function TableOfContents({
  entries,
  title = 'On this page',
  className,
}: {
  entries: TocEntry[];
  title?: string;
  className?: string;
}) {
  if (entries.length === 0) return null;
  const list = (
    <ol className="space-y-0.5 text-[14px]">
      {entries.map((e, i) => (
        <li key={e.id}>
          <a
            href={`#${e.id}`}
            className="group flex min-h-10 items-baseline gap-3 py-1.5 text-body hover:text-ink"
          >
            <span className="w-5 shrink-0 text-[12px] text-muted-foreground tabular-nums">
              {String(i + 1).padStart(2, '0')}
            </span>
            <span className="min-w-0 text-pretty underline decoration-transparent underline-offset-4 group-hover:decoration-steel">
              {e.text}
            </span>
          </a>
        </li>
      ))}
    </ol>
  );
  return (
    <nav aria-label={title} className={className}>
      <details className="group/toc border-y border-line lg:hidden">
        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between text-sm font-medium text-ink [&::-webkit-details-marker]:hidden">
          {title}
          <span
            className="text-lg leading-none text-muted-foreground transition-transform group-open/toc:rotate-45 motion-reduce:transition-none"
            aria-hidden
          >
            +
          </span>
        </summary>
        <div className="max-h-[60vh] overflow-y-auto overscroll-contain pb-4">{list}</div>
      </details>
      <div className={cn('hidden lg:block')}>
        <p className="mb-3 text-[13px] font-medium text-muted-foreground">{title}</p>
        <div className="border-l border-line pl-4">{list}</div>
      </div>
    </nav>
  );
}
