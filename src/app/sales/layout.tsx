import { Users, UsersRound } from 'lucide-react';
import { redirect } from 'next/navigation';
import { MemberPicker } from '@/components/sales-live/member-picker';
import { PortalShell } from '@/components/shared/portal-shell';
import { getSessionUser } from '@/lib/rbac';
import { currentMember, getTeam, leadCounts } from '@/server/live/sales';

/** Sales portal (ADR-36): one shared login for the team; each person picks their name per device. */
export default async function SalesLayout({ children }: LayoutProps<'/sales'>) {
  const user = await getSessionUser();
  if (!user || (user.role !== 'sales' && user.role !== 'admin')) redirect('/auth/login?next=/sales');
  const [team, member, counts] = await Promise.all([getTeam(), currentMember(), leadCounts()]);

  const nav = [
    { href: '/sales', label: 'Leads', icon: <Users />, count: counts.newCount },
    { href: '/sales/team', label: 'Team', icon: <UsersRound /> },
  ];

  return (
    <PortalShell
      portal="Sales"
      nav={nav}
      user={{ name: member ?? user.name, role: user.role }}
      topbar={
        <div className="ml-auto">
          <MemberPicker team={team} current={member && team.includes(member) ? member : null} />
        </div>
      }
    >
      {children}
    </PortalShell>
  );
}
