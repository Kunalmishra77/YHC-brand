import {
  CalendarClock,
  CalendarDays,
  ClipboardList,
  IndianRupee,
  Search,
  ShieldCheck,
  Stethoscope,
  Users,
} from 'lucide-react';
import { PortalShell, type PortalNavItem } from '@/components/shared/portal-shell';
import { Input } from '@/components/ui/input';
import { formatIst } from '@/lib/time';
import { getGuarantee } from '@/server/catalog';
import { requireDoctorPage } from '@/server/doctor/auth';
import { getFollowUps, guaranteeQueueCount } from '@/server/doctor/queries';

export default async function DoctorLayout({ children }: LayoutProps<'/doctor'>) {
  const user = await requireDoctorPage();
  const followUps = getFollowUps();
  const guaranteeOn = getGuarantee() !== null;

  const nav: PortalNavItem[] = [
    { href: '/doctor', label: 'Today', icon: <Stethoscope /> },
    { href: '/doctor/calendar', label: 'Calendar', icon: <CalendarDays /> },
    { href: '/doctor/patients', label: 'Patients', icon: <Users /> },
    {
      href: '/doctor/follow-ups',
      label: 'Follow-ups',
      icon: <ClipboardList />,
      count: followUps.attentionCount || undefined,
    },
    ...(guaranteeOn
      ? [
          {
            href: '/doctor/guarantee',
            label: 'Guarantee reviews',
            icon: <ShieldCheck />,
            count: guaranteeQueueCount() || undefined,
          },
        ]
      : []),
    { href: '/doctor/availability', label: 'Availability', icon: <CalendarClock /> },
    { href: '/doctor/revenue', label: 'Revenue', icon: <IndianRupee /> },
  ];

  return (
    <PortalShell
      portal="Doctor Portal"
      nav={nav}
      user={{ name: user.name, role: user.role === 'admin' ? 'Admin · viewing doctor portal' : 'Doctor' }}
      topbar={
        <>
          <form action="/doctor/patients" role="search" className="relative w-full max-w-md">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-steel"
              aria-hidden
            />
            <label htmlFor="doctor-search" className="sr-only">
              Search patients by name, phone or appointment code
            </label>
            <Input
              id="doctor-search"
              name="q"
              type="search"
              placeholder="Search name, phone or YHC-A-…"
              className="h-10 bg-card pl-9"
              autoComplete="off"
            />
          </form>
          <p className="ml-auto hidden shrink-0 text-sm text-muted-foreground sm:block">
            <span className="text-ink">{formatIst(new Date(), 'EEE d MMM yyyy')}</span> · IST
          </p>
        </>
      }
    >
      {children}
    </PortalShell>
  );
}
