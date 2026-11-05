import { ArrowRight, PhoneCall, ScanFace } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { OutcomeCard } from '@/components/journey/scan-result';
import { getSessionUser } from '@/lib/rbac';
import { getCustomer, listScans } from '@/server/live/scans';

export const dynamic = 'force-dynamic';

/** /account — overview (ADR-36): latest result, what happens next, contact details. */
export default async function AccountOverview() {
  const user = await getSessionUser();
  if (user?.role !== 'customer' || !user.customerId) redirect('/start');
  const [customer, scans] = await Promise.all([getCustomer(user.customerId), listScans(user.customerId)]);
  if (!customer) redirect('/start');
  const latest = scans.find((s) => s.status === 'submitted');
  const open = scans.find((s) => s.status === 'in_progress');
  const phone = customer.phone.replace(/^\+91/, '+91 ');

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="min-w-0">
        {latest?.outcome ? (
          <>
            <OutcomeCard outcome={latest.outcome} reasons={latest.reasons} phone={phone} />
            <Link
              href="/account/scan"
              className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-ink underline underline-offset-4"
            >
              See your photos area by area
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </>
        ) : (
          <section className="rounded-[28px] bg-white p-6 ring-1 ring-line sm:p-8">
            <ScanFace className="size-8 text-steel" aria-hidden />
            <h2 className="mt-4 font-display text-[28px] leading-tight font-medium text-ink">
              {open ? 'Finish your scalp scan' : 'Take your free scalp scan'}
            </h2>
            <p className="mt-2 max-w-xl text-body">
              It takes a few minutes with your phone camera. You see your result straight away.
            </p>
            <Link
              href="/start/scan"
              className="mt-6 inline-flex h-12 items-center gap-2 rounded-xl bg-obsidian px-6 text-[15px] font-semibold text-pearl hover:opacity-95"
            >
              {open ? 'Continue my scan' : 'Start my scan'}
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </section>
        )}
      </div>

      <aside className="space-y-4">
        <section className="rounded-2xl bg-white p-5 ring-1 ring-line">
          <h2 className="font-semibold text-ink">Your details</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div>
              <dt className="text-muted-foreground">Name</dt>
              <dd className="text-ink">{customer.name}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Mobile</dt>
              <dd className="price text-ink">{phone}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Email</dt>
              <dd className="break-all text-ink">{customer.email ?? '—'}</dd>
            </div>
          </dl>
          <p className="mt-3 text-[13px] text-muted-foreground">
            Need to change something? Email care@yourhaircompany.com.
          </p>
        </section>
        <section className="rounded-2xl bg-mist p-5">
          <PhoneCall className="size-5 text-ink" aria-hidden />
          <p className="mt-2 text-sm leading-relaxed text-ink">
            Our hair-care team calls you after your scan, during working hours. The scan and the call are free.
          </p>
        </section>
      </aside>
    </div>
  );
}
