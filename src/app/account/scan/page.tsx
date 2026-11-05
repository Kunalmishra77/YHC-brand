import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { OutcomeCard, ZoneGrid } from '@/components/journey/scan-result';
import { istDateTime } from '@/components/sales-live/lead-bits';
import { getSessionUser } from '@/lib/rbac';
import { getCustomer, getScan, listScans } from '@/server/live/scans';

export const dynamic = 'force-dynamic';

/** /account/scan — the customer's scans, newest first; ?id= picks one (ADR-36). */
export default async function AccountScans(props: PageProps<'/account/scan'>) {
  const user = await getSessionUser();
  if (user?.role !== 'customer' || !user.customerId) redirect('/start');
  const sp = await props.searchParams;
  const pick = typeof sp.id === 'string' && /^[0-9a-f-]{36}$/i.test(sp.id) ? sp.id : undefined;
  const [customer, scans] = await Promise.all([getCustomer(user.customerId), listScans(user.customerId)]);
  if (!customer) redirect('/start');
  const done = scans.filter((s) => s.status === 'submitted');
  const scan = done.length ? await getScan(customer.id, { id: user.id, role: 'customer' }, pick ?? done[0]?.id) : null;

  if (!scan?.outcome)
    return (
      <div className="rounded-[28px] bg-white p-6 ring-1 ring-line sm:p-8">
        <h2 className="font-display text-[28px] font-medium text-ink">No finished scans yet</h2>
        <p className="mt-2 text-body">Take your free scalp scan to see your result here.</p>
        <Link href="/start/scan" className="mt-6 inline-flex h-12 items-center gap-2 rounded-xl bg-obsidian px-6 text-[15px] font-semibold text-pearl">
          Start my scan
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
    );

  return (
    <div>
      {done.length > 1 ? (
        <nav aria-label="Your scans" className="mb-6 flex flex-wrap gap-2">
          {done.map((s) => (
            <Link
              key={s.id}
              href={`/account/scan?id=${s.id}`}
              aria-current={s.id === scan.id ? 'page' : undefined}
              className={
                s.id === scan.id
                  ? 'inline-flex min-h-10 items-center rounded-full bg-obsidian px-4 text-sm font-semibold text-pearl'
                  : 'inline-flex min-h-10 items-center rounded-full px-4 text-sm text-ink ring-1 ring-line hover:bg-mist'
              }
            >
              {istDateTime(s.submittedAt ?? s.createdAt)}
            </Link>
          ))}
        </nav>
      ) : null}
      <OutcomeCard outcome={scan.outcome} reasons={scan.reasons} phone={customer.phone.replace(/^\+91/, '+91 ')} />
      <ZoneGrid zones={scan.zones} />
      <Link href="/start/scan" className="mt-8 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-ink underline underline-offset-4">
        Scan again to track changes
        <ArrowRight className="size-4" aria-hidden />
      </Link>
    </div>
  );
}
