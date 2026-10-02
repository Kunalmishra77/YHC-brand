import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import type { Concern } from '@/lib/domain/types';
import { cn } from '@/lib/utils';

/** Quiet editorial list with hairline rules — each row links to the concern page. */
export function ConcernList({ concerns, className }: { concerns: Concern[]; className?: string }) {
  return (
    <ul className={cn('divide-y divide-line border-y border-line', className)}>
      {concerns.map((c) => (
        <li key={c.slug}>
          <Link
            href={`/concerns/${c.slug}`}
            className="group grid min-h-16 grid-cols-[1fr_auto] items-center gap-x-6 gap-y-1 rounded-sm py-5 md:grid-cols-[minmax(0,4fr)_minmax(0,7fr)_auto]"
          >
            <span className="text-lg font-semibold text-ink group-hover:text-brand">{c.title}</span>
            <span className="col-start-1 row-start-2 text-sm text-body md:col-start-2 md:row-start-1 md:text-base">
              {c.summary}
            </span>
            <ArrowUpRight
              className="col-start-2 row-span-2 row-start-1 size-5 text-steel transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand motion-reduce:transition-none md:col-start-3 md:row-span-1"
              aria-hidden
            />
          </Link>
        </li>
      ))}
    </ul>
  );
}
