import { Skeleton } from '@/components/ui/skeleton';

export default function WorkspaceLoading() {
  return (
    <div aria-busy="true" aria-label="Loading consultation">
      <Skeleton className="mb-2 h-4 w-20" />
      <Skeleton className="mb-6 h-8 w-72" />
      <div className="grid gap-4 xl:grid-cols-[0.92fr_1.2fr_1fr]">
        <Skeleton className="h-[480px] rounded-lg" />
        <Skeleton className="hidden h-[480px] rounded-lg xl:block" />
        <Skeleton className="hidden h-[480px] rounded-lg xl:block" />
      </div>
    </div>
  );
}
