import { ListSkeleton } from '@/components/shared/states';
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div>
      <Skeleton className="mb-2 h-7 w-48" />
      <Skeleton className="mb-6 h-4 w-72 max-w-full" />
      <ListSkeleton rows={6} />
    </div>
  );
}
