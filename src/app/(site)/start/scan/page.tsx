import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { JourneyStepper } from '@/components/journey/journey-stepper';
import { ScanStudio } from '@/components/journey/scan-studio';
import { getSessionUser } from '@/lib/rbac';
import { getCustomer, listScans } from '@/server/live/scans';

export const metadata: Metadata = { title: 'Your scalp scan', robots: { index: false } };

export const dynamic = 'force-dynamic';

export default async function ScanPage() {
  const user = await getSessionUser();
  if (user?.role !== 'customer' || !user.customerId) redirect('/start');
  const [customer, scans] = await Promise.all([getCustomer(user.customerId), listScans(user.customerId)]);
  if (!customer) redirect('/start');
  const firstName = customer.name.split(' ')[0] ?? '';
  return (
    <div className="bg-hero-dark min-h-[calc(100dvh-4rem)] text-on-dark">
      <div className="container-yhc pt-6 pb-28 md:pt-8 md:pb-24">
        <JourneyStepper current="scan" tone="dark" className="mb-10 md:mb-14" />
        <ScanStudio firstName={firstName} hasResult={scans.some((s) => s.status === 'submitted')} />
      </div>
    </div>
  );
}
