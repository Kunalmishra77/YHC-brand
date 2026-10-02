import { Skeleton } from '@/components/ui/skeleton';

export default function SalesLoading() {
  return (
    <div aria-busy="true" aria-label="Loading">
      <Skeleton className="mb-2 h-7 w-48" />
      <Skeleton className="mb-6 h-4 w-80 max-w-full" />
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="w-[280px] shrink-0 space-y-2 rounded-lg bg-mist/60 p-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
