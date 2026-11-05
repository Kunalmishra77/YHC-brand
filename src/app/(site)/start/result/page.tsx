import { ArrowRight, RotateCcw } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { JourneyShell } from '@/components/journey/journey-shell';
import { OutcomeCard, ZoneGrid } from '@/components/journey/scan-result';
import { getSessionUser } from '@/lib/rbac';
import { getCustomer, getScan } from '@/server/live/scans';

export const metadata: Metadata = { title: 'Your scan result', robots: { index: false } };

export const dynamic = 'force-dynamic';

/** /start/result — the latest finished scan of the signed-in customer (ADR-36). */
export default async function ResultPage() {
  const user = await getSessionUser();
  if (user?.role !== 'customer' || !user.customerId) redirect('/start');
  const customer = await getCustomer(user.customerId);
  if (!customer) redirect('/start');
  const scan = await getScan(customer.id, { id: user.id, role: 'customer' });
  if (!scan?.outcome) redirect('/start/scan');

  const firstName = customer.name.split(' ')[0] ?? '';
  return (
    <JourneyShell
      current="assessment"
      eyebrow="Free scalp scan"
      title={firstName ? `${firstName}, here is your result` : 'Here is your result'}
      lede="Based on the photos you took just now."
    >
      <OutcomeCard outcome={scan.outcome} reasons={scan.reasons} phone={customer.phone.replace(/^\+91/, '+91 ')} />
      <ZoneGrid zones={scan.zones} teamVisible={scan.teamVisible} />
      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/account"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-obsidian px-6 text-[15px] font-semibold text-pearl hover:opacity-95"
        >
          Go to my account
          <ArrowRight className="size-4" aria-hidden />
        </Link>
        <Link
          href="/start/scan"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl px-6 text-[15px] font-semibold text-ink ring-1 ring-line hover:bg-mist"
        >
          <RotateCcw className="size-4" aria-hidden />
          Scan again
        </Link>
      </div>
    </JourneyShell>
  );
}
