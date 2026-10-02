import { Search } from 'lucide-react';

/** Top-bar search: plain GET form to the leads list (?q=), works without JS. */
export function LeadSearch() {
  return (
    <form action="/sales/leads" method="get" role="search" className="relative min-w-0 flex-1 sm:max-w-sm">
      <label htmlFor="sales-lead-search" className="sr-only">
        Search leads by name or phone
      </label>
      <Search
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-steel"
        aria-hidden
      />
      <input
        id="sales-lead-search"
        name="q"
        type="search"
        inputMode="search"
        placeholder="Search name or phone"
        className="h-10 w-full rounded-md border border-line bg-card pr-3 pl-9 text-sm text-ink placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:outline-none"
      />
    </form>
  );
}
