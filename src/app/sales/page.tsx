import { LeadsScreen } from '@/components/sales-live/leads-screen';
import { WhoAreYou } from '@/components/sales-live/member-picker';
import { LEAD_VIEWS, type LeadView, currentMember, getTeam, listLeads, salesDashboard } from '@/server/live/sales';

export const metadata = { title: 'Leads · Sales', robots: { index: false } };
export const dynamic = 'force-dynamic';

/** /sales — today's work first: calls due, new leads, my leads (ADR-36, ADR-37). */
export default async function SalesLeadsPage(props: PageProps<'/sales'>) {
  const [team, member] = await Promise.all([getTeam(), currentMember()]);
  const me = member && team.includes(member) ? member : null;
  if (team.length && !me) return <WhoAreYou team={team} />;

  const sp = await props.searchParams;
  const dash = await salesDashboard(me);
  const fallback: LeadView = dash.overdue || dash.dueToday ? 'today' : dash.newUnclaimed ? 'new' : 'mine';
  const view = (LEAD_VIEWS as readonly string[]).includes(String(sp.view)) ? (sp.view as LeadView) : fallback;
  const q = typeof sp.q === 'string' ? sp.q.slice(0, 80) : '';
  const leads = await listLeads(view, q, me);
  return <LeadsScreen dash={dash} view={view} q={q} leads={leads} me={me} now={new Date()} />;
}
