'use client';

import { Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * Portal top-bar search: a plain GET form (works without JS). From `sm` up it is an inline field;
 * on phones it collapses to an icon that opens a full-width field over the top bar.
 */
export function TopbarSearch({
  action,
  id,
  label,
  placeholder,
  name = 'q',
  className,
}: {
  action: string;
  id: string;
  label: string;
  placeholder: string;
  name?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    input.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn('size-11 shrink-0 sm:hidden', open && 'invisible')}
        aria-label={label}
        aria-expanded={open}
        aria-controls={`${id}-form`}
        onClick={() => setOpen(true)}
      >
        <Search className="size-5" aria-hidden />
      </Button>
      <form
        id={`${id}-form`}
        action={action}
        method="get"
        role="search"
        className={cn(
          'min-w-0 items-center gap-2',
          open
            ? 'absolute inset-x-0 top-0 z-10 flex h-16 bg-pearl px-4 sm:static sm:h-auto sm:bg-transparent sm:px-0'
            : 'hidden sm:flex',
          'sm:w-full sm:max-w-md sm:flex-1',
          className,
        )}
      >
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-steel"
            aria-hidden
          />
          <label htmlFor={id} className="sr-only">
            {label}
          </label>
          <input
            ref={input}
            id={id}
            name={name}
            type="search"
            inputMode="search"
            autoComplete="off"
            placeholder={placeholder}
            className="h-10 w-full min-w-0 rounded-md border border-line bg-card pr-3 pl-9 text-sm text-ink shadow-xs transition-[border-color,box-shadow] placeholder:text-muted-foreground focus-visible:border-brand focus-visible:ring-[3px] focus-visible:ring-brand/20 focus-visible:outline-none"
          />
        </div>
        {open ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-10 shrink-0 sm:hidden"
            aria-label="Close search"
            onClick={() => setOpen(false)}
          >
            <X className="size-5" aria-hidden />
          </Button>
        ) : null}
      </form>
    </>
  );
}
