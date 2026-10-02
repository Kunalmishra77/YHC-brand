import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Native select — best on phones (OS picker), 44 px target, token styling. */
export function NativeSelect({ className, children, ...props }: React.ComponentProps<'select'>) {
  return (
    <div className={cn('relative', className)}>
      <select
        {...props}
        className="h-11 w-full appearance-none rounded-md border border-line bg-card pr-9 pl-3 text-sm text-ink focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-50"
      >
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-steel"
        aria-hidden
      />
    </div>
  );
}

export function FieldLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-ink">
      {children}
    </label>
  );
}

export const inputClass =
  'h-11 w-full rounded-md border border-line bg-card px-3 text-sm text-ink placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:outline-none';
