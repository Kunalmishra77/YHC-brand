import { cn } from '@/lib/utils';

/**
 * Marketing layout system (docs/07): one vertical rhythm, one heading scale and one header pattern for
 * every site section, so edges, baselines and spacing line up from page to page.
 */

/** Vertical rhythm for a standard section. */
export const SECTION_Y = 'py-16 md:py-24 lg:py-28';
/** Rhythm for a quieter, secondary band (CTA strips, closing notes). */
export const SECTION_Y_SM = 'py-12 md:py-16';

/** Section heading (h2) scale. */
export const H2 = 'display text-balance text-[clamp(2rem,1.45rem+2.2vw,3.25rem)]';
/** Smaller h2 for secondary sections. */
export const H2_SM = 'display text-balance text-[clamp(1.75rem,1.4rem+1.5vw,2.5rem)]';
/** Page-level h1 for inner pages and dark heroes. */
export const H1 = 'display text-balance text-[clamp(2.5rem,1.75rem+3vw,4.25rem)] leading-[1.04]';

/** Body copy beside a heading — capped near 65ch. */
export const LEDE = 'max-w-[62ch] text-pretty text-lg leading-relaxed';

/** Quiet underlined text link with a 44 px tap target. */
export const TEXT_LINK =
  'inline-flex min-h-11 items-center gap-2 text-sm font-medium underline decoration-steel underline-offset-[6px] transition-colors hover:decoration-current';

/** Primary CTA on dark backgrounds (silver). Pair with <Button asChild>. */
export const CTA_SILVER =
  'h-12 bg-[image:var(--yhc-silver)] px-7 text-base font-semibold text-obsidian shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] hover:opacity-95';
/** Secondary CTA on dark backgrounds. */
export const CTA_GHOST_DARK =
  'h-12 border-line-dark bg-transparent px-7 text-base text-on-dark hover:bg-graphite hover:text-on-dark';

/**
 * Horizontal snap rail below `lg`, a three-column grid from `lg`. The rail bleeds into the side gutters
 * so cards scroll edge to edge on phones; use with RAIL_ITEM on each child.
 */
export const RAIL =
  '-mx-[var(--yhc-gutter)] flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain px-[var(--yhc-gutter)] py-1 scroll-px-[var(--yhc-gutter)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:mx-0 lg:grid lg:grid-cols-3 lg:gap-6 lg:overflow-visible lg:px-0 lg:py-0';
export const RAIL_ITEM = 'w-[82%] max-w-[22rem] shrink-0 snap-start sm:w-[46%] sm:max-w-none lg:w-auto';

/**
 * Section header: eyebrow + h2 on the left, an optional lede/action on the right from `md`, both sitting
 * on the same baseline. Stacks on phones.
 */
export function SectionHeader({
  id,
  eyebrow,
  title,
  lede,
  action,
  tone = 'light',
  size = 'lg',
  className,
}: {
  id?: string;
  eyebrow?: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  action?: React.ReactNode;
  tone?: 'light' | 'dark';
  size?: 'lg' | 'sm';
  className?: string;
}) {
  const dark = tone === 'dark';
  const aside = lede || action;
  return (
    <div
      className={cn(
        'mb-10 grid gap-5 md:mb-14',
        aside && 'md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:items-end md:gap-12',
        className,
      )}
    >
      <div className="max-w-2xl">
        {eyebrow ? <p className={cn('eyebrow', dark && 'text-brand-on-dark')}>{eyebrow}</p> : null}
        <h2 id={id} className={cn(size === 'lg' ? H2 : H2_SM, eyebrow && 'mt-4', dark && 'text-on-dark')}>
          {title}
        </h2>
      </div>
      {aside ? (
        <div className="md:justify-self-end md:pb-1.5">
          {lede ? (
            <p
              className={cn(
                'max-w-md leading-relaxed text-pretty',
                dark ? 'text-on-dark-muted' : 'text-body',
              )}
            >
              {lede}
            </p>
          ) : null}
          {action ? <div className={cn(lede && 'mt-3')}>{action}</div> : null}
        </div>
      ) : null}
    </div>
  );
}
