import type { Metadata } from 'next';
import { LeadsTable, type LeadFilters } from '@/components/sales/leads-table';
import { PageHeader } from '@/components/shared/page-header';
import { t } from '@/i18n/en';
import { LEAD_STAGES, type LeadStage } from '@/lib/domain/types';
import { requireSales } from '@/server/sales/mutations';
import { listSalesLeads, salesReps } from '@/server/sales/views';

export const metadata: Metadata = { title: 'Leads · Sales CRM' };

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? '';

export default async function LeadsPage({ searchParams }: PageProps<'/sales/leads'>) {
  const user = await requireSales();
  const sp = await searchParams;
  const stageParam = one(sp.stage);
  const initial: LeadFilters = {
    q: one(sp.q).slice(0, 80),
    stage: (LEAD_STAGES as readonly string[]).includes(stageParam) ? (stageParam as LeadStage) : 'all',
    owner: one(sp.owner) || 'all',
    source: 'all',
    campaign: 'all',
    from: '',
    to: '',
    due: one(sp.due) === 'overdue' ? 'overdue' : 'any',
  };
  const stages = LEAD_STAGES.map((stage, rank) => ({ stage, rank, label: t(`status.leadStage.${stage}`) }));

  return (
    <>
      <PageHeader
        title="Leads"
        description="Every lead with source, stage, owner and next action. No clinical details are shown here."
      />
      <LeadsTable
        key={JSON.stringify(initial)}
        leads={listSalesLeads()}
        stages={stages}
        reps={salesReps()}
        currentUserId={user.id}
        initial={initial}
      />
    </>
  );
}
