import { cn } from '@/lib/utils';

/**
 * Portal page header: serif title (brand voice), one-line context, actions on the right.
 * On phones the actions drop below the title as a full-width row whose items share the width.
 */
export function PageHeader({
  title,
  description,
  actions,
  className,
}: {
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'mb-7 flex flex-col gap-4 md:mb-8 md:flex-row md:items-end md:justify-between md:gap-6',
        className,
      )}
    >
      <div className="min-w-0">
        <h1 className="display text-[clamp(2rem,1.6rem+1.6vw,2.75rem)] leading-[1.05] text-balance break-words">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-3xl text-[15px] leading-relaxed text-pretty text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2 md:shrink-0 md:justify-end max-md:[&>*]:min-w-0 max-md:[&>*]:flex-1">
          {actions}
        </div>
      ) : null}
    </div>
  );
}
