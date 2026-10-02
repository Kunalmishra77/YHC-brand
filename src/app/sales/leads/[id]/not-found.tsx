import Link from 'next/link';
import { EmptyState } from '@/components/shared/states';

export default function LeadNotFound() {
  return (
    <EmptyState
      title="Lead not found"
      body="It may have been merged with another lead that has the same phone number."
      action={
        <Link
          href="/sales/leads"
          className="inline-flex h-11 items-center rounded-md bg-obsidian px-4 text-sm font-medium text-on-dark"
        >
          Back to leads
        </Link>
      }
      className="bg-card"
    />
  );
}
