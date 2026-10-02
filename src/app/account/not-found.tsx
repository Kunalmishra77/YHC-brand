import Link from 'next/link';
import { EmptyState } from '@/components/shared/states';
import { Button } from '@/components/ui/button';

export default function AccountNotFound() {
  return (
    <EmptyState
      title="We couldn't find that"
      body="It may belong to a different account, or the link is out of date."
      action={
        <Button asChild className="h-11 px-5">
          <Link href="/account">Back to my account</Link>
        </Button>
      }
    />
  );
}
