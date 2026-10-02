import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata = { title: 'No access', robots: { index: false } };

export default function ForbiddenPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-pearl px-4">
      <div className="max-w-md text-center">
        <p className="price text-sm text-muted-foreground">403</p>
        <h1 className="display mt-2 text-3xl">This area isn’t part of your role</h1>
        <p className="mt-3 text-body">
          Your account doesn’t have access to this page. Sign in with a different role, or go back to the home
          page.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button asChild className="h-11">
            <Link href="/demo">Switch role</Link>
          </Button>
          <Button asChild variant="outline" className="h-11">
            <Link href="/">Home</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
