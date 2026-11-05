import { notFound } from 'next/navigation';
import { LeadScreen } from '@/components/sales-live/lead-screen';
import { WhoAreYou } from '@/components/sales-live/member-picker';
import { currentMember, getLead, getTeam } from '@/server/live/sales';

export const metadata = { title: 'Lead · Sales', robots: { index: false } };
export const dynamic = 'force-dynamic';

/** /sales/leads/[id] — everything about one lead and every action on it (ADR-36, ADR-37). */
export default async function LeadPage(props: PageProps<'/sales/leads/[id]'>) {
  const { id } = await props.params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const [team, member] = await Promise.all([getTeam(), currentMember()]);
  const me = member && team.includes(member) ? member : null;
  if (team.length && !me) return <WhoAreYou team={team} />;
  const lead = await getLead(id);
  if (!lead) notFound();
  return <LeadScreen lead={lead} me={me} team={team} now={new Date()} />;
}
