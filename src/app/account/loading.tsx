import { Skeleton } from '@/components/ui/skeleton';
import { ListSkeleton } from '@/components/shared/states';

export default function AccountLoading() {
  return (
    <div className="space-y-6" aria-busy="true">
      <Skeleton className="h-40 w-full rounded-xl" />
      <ListSkeleton rows={4} />
    </div>
  );
}
