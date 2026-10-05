import { cn } from '@/lib/utils';

/** Portal page header: serif title (brand voice), one-line context, actions on the right. */
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
    <div className={cn('mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between', className)}>
      <div className="min-w-0">
        <h1 className="display text-[clamp(2rem,1.6rem+1.6vw,2.75rem)] leading-[1.05]">{title}</h1>
        {description ? <p className="mt-2 text-[15px] text-muted-foreground">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
