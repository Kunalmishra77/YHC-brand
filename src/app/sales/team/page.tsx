import { TeamEditor } from '@/components/sales-live/team-editor';
import { PageHeader } from '@/components/shared/page-header';
import { getTeam } from '@/server/live/sales';

export const metadata = { title: 'Team · Sales', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function TeamPage() {
  const team = await getTeam();
  return (
    <div>
      <PageHeader
        title="Team"
        description="The people who share this login. Each person picks their name at the top of the page on their own phone or laptop, then takes leads."
      />
      <div className="mt-6">
        <TeamEditor initial={team} />
      </div>
    </div>
  );
}
