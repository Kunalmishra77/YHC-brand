import { Link2Off } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

/*
 * FUN-06: unknown, draft and expired plan links all return a real 404 (Next `notFound()` cannot send 410),
 * so this copy covers both cases. Links to /contact rather than WhatsApp until the business number is
 * known. TODO(client): WhatsApp business number — see docs/12 C (switch to SITE.whatsappUrl then).
 */
export default function PlanLinkNotFound() {
  return (
    <div className="container-yhc py-16 md:py-24">
      <div className="mx-auto max-w-lg text-center">
        <div className="flex justify-center">
          <Link2Off className="size-6 text-steel" aria-hidden />
        </div>
        <h1 className="display mt-4 text-[clamp(2rem,1.6rem+1.6vw,2.5rem)] text-balance">
          This plan link is invalid or has expired
        </h1>
        <p className="mt-3 text-pretty text-body">
          Plan links work for a limited time and must be opened exactly as sent. Your prescription is still
          yours — message us and our team will send you a fresh link, or book a consultation.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button asChild className="h-12 px-6">
            <Link href="/contact">Message us for a new link</Link>
          </Button>
          <Button asChild variant="outline" className="h-12 px-6">
            <Link href="/book">Book a consultation</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
