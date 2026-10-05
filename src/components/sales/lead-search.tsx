import { TopbarSearch } from '@/components/shared/topbar-search';

/** Top-bar search: plain GET form to the leads list (?q=), works without JS. */
export function LeadSearch() {
  return (
    <TopbarSearch
      action="/sales/leads"
      id="sales-lead-search"
      label="Search leads by name or phone"
      placeholder="Search name or phone"
      className="sm:max-w-sm"
    />
  );
}
