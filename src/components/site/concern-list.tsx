import { ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { concernPath } from '@/lib/concern-path';
import type { Concern } from '@/lib/domain/types';
import { SLOTS } from '@/lib/slots';
import type { VisualSlot } from '@/lib/visual-slots';
import { cn } from '@/lib/utils';

/** Hero image per concern key (C01–C05, YHC_IMAGE_PROMPTS.md). */
const CONCERN_IMAGE: Record<string, VisualSlot> = {
  hair_fall: SLOTS.C01,
  thinning: SLOTS.C02,
  receding_hairline: SLOTS.C03,
  crown_thinning: SLOTS.C04,
  dandruff_scalp: SLOTS.C05,
};

export function concernImage(key: string): VisualSlot | undefined {
  return CONCERN_IMAGE[key];
}

/**
 * Picture-first concern cards: the image tells the story, one short line supports it. A swipe rail on
 * phones, a grid from `sm`. Each card links to the concern page.
 */
export function ConcernList({ concerns, className }: { concerns: Concern[]; className?: string }) {
  return (
    <ul
      className={cn(
        'relative -mx-[var(--yhc-gutter)] flex snap-x snap-mandatory scroll-px-[var(--yhc-gutter)] [scrollbar-width:none] gap-4 overflow-x-auto overscroll-x-contain px-[var(--yhc-gutter)] py-1 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:px-0 lg:grid-cols-3 [&::-webkit-scrollbar]:hidden',
        className,
      )}
    >
      {concerns.map((c) => {
        const img = concernImage(c.slug);
        return (
          <li key={c.slug} className="w-[80%] max-w-[22rem] shrink-0 snap-start sm:w-auto sm:max-w-none">
            <Link href={concernPath(c.slug)} className="group block h-full rounded-[28px]">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[28px] bg-obsidian shadow-card">
                {img ? (
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 80vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  />
                ) : null}
                <span
                  className="absolute right-4 bottom-4 flex size-11 items-center justify-center rounded-full bg-white/85 text-ink backdrop-blur transition-transform group-hover:-translate-y-0.5 motion-reduce:transition-none"
                  aria-hidden
                >
                  <ArrowUpRight className="size-5" />
                </span>
              </div>
              <p className="mt-4 text-lg font-semibold text-ink group-hover:text-brand">{c.title}</p>
              <p className="mt-1 text-sm text-pretty text-body">{c.summary}</p>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
