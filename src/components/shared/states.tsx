import Image from 'next/image';
import { AlertCircle, Inbox, type LucideIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { t } from '@/i18n/en';
import { cn } from '@/lib/utils';

/** Every list has empty, loading and error states (CLAUDE.md). */
export function EmptyState({
  title = t('common.emptyTitle'),
  body,
  action,
  icon: Icon = Inbox,
  illustration,
  className,
}: {
  title?: string;
  body?: string;
  action?: React.ReactNode;
  icon?: LucideIcon;
  /** Optional line illustration (slots E01–E03) shown instead of the icon. */
  illustration?: { src: string; width: number; height: number };
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-2 rounded-lg border border-dashed border-line px-6 py-10 text-center',
        className,
      )}
    >
      {illustration ? (
        <Image src={illustration.src} width={illustration.width} height={illustration.height} alt="" sizes="160px" className="size-36 object-contain" />
      ) : (
        <Icon className="size-6 text-steel" aria-hidden />
      )}
      <p className="font-medium text-ink">{title}</p>
      {body ? <p className="max-w-sm text-sm text-muted-foreground">{body}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}

export function ErrorState({
  title = t('common.errorTitle'),
  body = t('common.errorBody'),
  action,
}: {
  title?: string;
  body?: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-2 rounded-lg bg-danger-bg px-6 py-10 text-center"
    >
      <AlertCircle className="size-6 text-danger" aria-hidden />
      <p className="font-medium text-danger">{title}</p>
      <p className="max-w-sm text-sm text-body">{body}</p>
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}

export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2" aria-busy="true" aria-label={t('common.loading')}>
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} className="h-14 w-full rounded-md" />
      ))}
    </div>
  );
}
