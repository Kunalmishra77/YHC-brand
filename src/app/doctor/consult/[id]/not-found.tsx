import Link from 'next/link';
import { EmptyState } from '@/components/shared/states';
import { Button } from '@/components/ui/button';

export default function ConsultNotFound() {
  return (
    <EmptyState
      title="Consultation not found"
      body="The appointment may have been rescheduled or the link is wrong."
      action={
        <Button asChild variant="outline">
          <Link href="/doctor">Back to Today</Link>
        </Button>
      }
    />
  );
}
