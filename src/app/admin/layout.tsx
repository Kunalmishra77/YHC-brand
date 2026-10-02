import {
  CalendarClock,
  FileText,
  LayoutDashboard,
  ListChecks,
  MessageSquare,
  Package,
  ScrollText,
  Settings,
  ShieldCheck,
  ShoppingBag,
  UserCog,
  Users,
} from 'lucide-react';
import { redirect } from 'next/navigation';
import { PortalShell, type PortalNavItem } from '@/components/shared/portal-shell';
import { t } from '@/i18n/en';
import { AppError } from '@/lib/errors';
import { requireRole, type SessionUser } from '@/lib/rbac';
import { db } from '@/server/demo/store';

export const metadata = { title: { default: 'Admin', template: '%s · Admin · YHC' } };

async function sessionOrRedirect(): Promise<SessionUser> {
  try {
    return await requireRole(['admin', 'ops']);
  } catch (e) {
    if (e instanceof AppError) return redirect('/demo?next=/admin');
    throw e;
  }
}

export default async function AdminLayout({ children }: LayoutProps<'/admin'>) {
  const user = await sessionOrRedirect();
  const s = db();
  const toPack = s.orders.filter((o) => o.status === 'paid').length;
  const failedJobs = s.jobs.filter((j) => j.status === 'failed').length;

  const orders: PortalNavItem = {
    href: '/admin/orders',
    label: 'Orders',
    icon: <Package />,
    count: toPack,
  };
  // Ops sees Orders (to pack, shipments, exceptions) only (FR-M9-4); admin sees everything.
  const nav: PortalNavItem[] =
    user.role === 'ops'
      ? [orders]
      : [
          { href: '/admin', label: 'Dashboard', icon: <LayoutDashboard /> },
          orders,
          { href: '/admin/appointments', label: 'Appointments', icon: <CalendarClock /> },
          { href: '/admin/customers', label: 'Customers', icon: <Users /> },
          { href: '/admin/catalog', label: 'Catalog', icon: <ShoppingBag /> },
          { href: '/admin/messaging', label: 'Messaging', icon: <MessageSquare /> },
          { href: '/admin/jobs', label: 'Jobs', icon: <ListChecks />, count: failedJobs },
          { href: '/admin/guarantee', label: 'Guarantee', icon: <ShieldCheck /> },
          { href: '/admin/content', label: 'Content', icon: <FileText /> },
          { href: '/admin/users', label: 'Users', icon: <UserCog /> },
          { href: '/admin/settings', label: 'Settings', icon: <Settings /> },
          { href: '/admin/audit', label: 'Audit log', icon: <ScrollText /> },
        ];

  return (
    <PortalShell
      portal={user.role === 'ops' ? 'Operations' : 'Admin'}
      nav={nav}
      user={{ name: user.name, role: user.role }}
      topbar={
        <div className="flex w-full items-center justify-between gap-3">
          <p className="truncate text-sm font-medium text-ink">
            {user.role === 'ops' ? 'Fulfilment' : 'Management'}
          </p>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-line bg-card px-2.5 py-1 text-[12px] text-muted-foreground">
            <span className="size-1.5 rounded-full bg-steel" aria-hidden />
            {t('common.demoBadge')} · sample data
          </span>
        </div>
      }
    >
      {children}
    </PortalShell>
  );
}
