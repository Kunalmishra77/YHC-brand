import { ChartColumn, Columns3, HeartHandshake, ListChecks, Users } from 'lucide-react';
import { redirect } from 'next/navigation';
import { LeadSearch } from '@/components/sales/lead-search';
import { NewLeadDialog } from '@/components/sales/new-lead-dialog';
import { RealtimeAlerts } from '@/components/sales/realtime-alerts';
import { PortalShell } from '@/components/shared/portal-shell';
import type { SessionUser } from '@/lib/rbac';
import { requireSales } from '@/server/sales/mutations';
import { latestEventId, openTaskCount } from '@/server/sales/views';

export default async function SalesLayout({ children }: LayoutProps<'/sales'>) {
  let user: SessionUser;
  try {
    user = await requireSales();
  } catch {
    redirect('/demo?next=/sales');
  }

  const nav = [
    { href: '/sales', label: 'Pipeline', icon: <Columns3 /> },
    { href: '/sales/leads', label: 'Leads', icon: <Users /> },
    { href: '/sales/tasks', label: 'My tasks', icon: <ListChecks />, count: openTaskCount(user.id) },
    { href: '/sales/care', label: 'Care', icon: <HeartHandshake /> },
    { href: '/sales/performance', label: 'Performance', icon: <ChartColumn /> },
  ];

  return (
    <PortalShell
      portal="Sales CRM"
      nav={nav}
      user={{ name: user.name, role: user.role }}
      topbar={
        <>
          <LeadSearch />
          <div className="ml-auto flex items-center gap-2">
            <RealtimeAlerts initialLastId={latestEventId()} />
            <NewLeadDialog />
          </div>
        </>
      }
    >
      {children}
    </PortalShell>
  );
}
