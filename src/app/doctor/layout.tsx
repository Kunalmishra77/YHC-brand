import {
  CalendarClock,
  CalendarDays,
  ClipboardList,
  IndianRupee,
  ShieldCheck,
  Stethoscope,
  Users,
} from 'lucide-react';
import { PortalShell, type PortalNavItem } from '@/components/shared/portal-shell';
import { TopbarSearch } from '@/components/shared/topbar-search';
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
          <TopbarSearch
            action="/doctor/patients"
            id="doctor-search"
            label="Search patients by name, phone or appointment code"
            placeholder="Search name, phone or YHC-A-…"
          />
          <p className="ml-auto truncate text-[13px] text-muted-foreground sm:hidden">
            <span className="text-ink">{formatIst(new Date(), 'EEE d MMM')}</span> · IST
          </p>
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
