import { Info, TriangleAlert } from 'lucide-react';
import { formatIst } from '@/lib/time';
import { cn } from '@/lib/utils';
import type { ContentBlock } from '@/server/content/types';

/** `2026-09-18` → `18 September 2026` (business date, IST). */
export function formatContentDate(isoDate: string): string {
  return formatIst(new Date(`${isoDate}T00:00:00+05:30`), 'd MMMM yyyy');
}

/**
 * Renders typed content blocks with a readable measure (~68ch). Headings carry ids for the
 * table of contents and a scroll margin that clears the sticky site header.
 */
export function ContentBlocks({ blocks, className }: { blocks: ContentBlock[]; className?: string }) {
  return (
    <div className={cn('max-w-[68ch] text-[17px] leading-[1.75] text-body', className)}>
      {blocks.map((block, i) => {
        const key = `${block.type}-${i}`;
        switch (block.type) {
          case 'heading':
            return (
              <h2
                key={key}
                id={block.id}
                className="mt-14 mb-4 scroll-mt-28 font-display text-[clamp(1.75rem,1.45rem+1vw,2.25rem)] leading-tight font-medium text-ink first:mt-0"
              >
                {block.text}
              </h2>
            );
          case 'subheading':
            return (
              <h3 key={key} className="mt-8 mb-2 text-lg font-semibold text-ink">
                {block.text}
              </h3>
            );
          case 'paragraph':
            return (
              <p key={key} className="mt-5 first:mt-0">
                {block.text}
              </p>
            );
          case 'list': {
            const List = block.ordered ? 'ol' : 'ul';
            return (
              <List key={key} className="mt-5 space-y-3">
                {block.items.map((item, n) => (
                  <li key={item} className="flex gap-4">
                    {block.ordered ? (
                      <span className="w-5 shrink-0 font-display text-xl leading-[1.4] text-steel">
                        {n + 1}
                      </span>
                    ) : (
                      <span className="mt-[0.85em] h-px w-4 shrink-0 bg-steel" aria-hidden />
                    )}
                    <span>{item}</span>
                  </li>
                ))}
              </List>
            );
          }
          case 'callout': {
            const caution = block.tone === 'caution';
            const Icon = caution ? TriangleAlert : Info;
            return (
              <aside
                key={key}
                className={cn(
                  'my-9 flex gap-4 border-l-2 py-1 pl-5',
                  caution ? 'border-warning' : 'border-steel',
                )}
              >
                <Icon
                  className={cn('mt-1 size-5 shrink-0', caution ? 'text-warning' : 'text-brand')}
                  aria-hidden
                />
                <div>
                  {block.title ? <p className="font-semibold text-ink">{block.title}</p> : null}
                  <p className={cn('text-[16px] leading-relaxed', block.title ? 'mt-1' : null)}>
                    {block.text}
                  </p>
                </div>
              </aside>
            );
          }
        }
      })}
    </div>
  );
}
