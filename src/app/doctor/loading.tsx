import { ListSkeleton } from '@/components/shared/states';
import { Skeleton } from '@/components/ui/skeleton';

export default function DoctorLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-56" />
      <div className="grid grid-cols-1 gap-3 min-[380px]:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
      <ListSkeleton rows={6} />
    </div>
  );
}
