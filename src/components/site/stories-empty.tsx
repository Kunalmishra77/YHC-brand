import { Quote } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * FR-M1-6: reviews appear only with stored publication consent; photos only with photo-marketing
 * consent. Until consented stories exist we say so, rather than inventing any.
 */
export function StoriesEmpty({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex flex-col items-start gap-4 rounded-xl border border-dashed border-platinum px-6 py-10 md:flex-row md:items-center md:gap-8 md:px-10',
        className,
      )}
    >
      <Quote className="size-8 shrink-0 text-steel" aria-hidden />
      <div>
        <p className="font-semibold text-ink">
          Stories appear here only with each patient&apos;s written consent.
        </p>
        <p className="mt-1.5 max-w-2xl text-body">
          We don&apos;t publish invented reviews or borrowed before-and-after photos. When patients choose to
          share their experience, it will appear here unretouched, with the duration they used their plan and
          a clear note that individual results vary.
        </p>
      </div>
    </div>
  );
}
