import { ListSkeleton } from '@/components/shared/states';
import { Skeleton } from '@/components/ui/skeleton';

export function SiteLoading() {
  return (
    <div className="container-yhc space-y-6 py-12 md:py-20">
      <Skeleton className="h-10 w-2/3 max-w-md" />
      <Skeleton className="h-5 w-full max-w-xl" />
      <ListSkeleton rows={4} />
    </div>
  );
}
