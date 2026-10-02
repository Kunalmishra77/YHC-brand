import type { Metadata } from 'next';
import { KanbanBoard } from '@/components/sales/kanban-board';
import { PageHeader } from '@/components/shared/page-header';
import { t } from '@/i18n/en';
import { LEAD_STAGES } from '@/lib/domain/types';
import { requireSales } from '@/server/sales/mutations';
import { listSalesLeads } from '@/server/sales/views';

export const metadata: Metadata = { title: 'Pipeline · Sales CRM' };

export default async function PipelinePage() {
  const user = await requireSales();
  const leads = listSalesLeads();
  const columns = LEAD_STAGES.map((stage) => ({ stage, label: t(`status.leadStage.${stage}`) }));
  const paidToday = leads.filter((l) => l.stage === 'payment_successful').length;
  const fresh = leads.filter((l) => l.stage === 'new').length;

  return (
    <>
      <PageHeader
        title="Pipeline"
        description={`${fresh} new ${fresh === 1 ? 'lead' : 'leads'} waiting for first contact · ${paidToday} at ₹500 paid. Drag or use Move to… for the first five stages and Lost; later stages move on their own.`}
      />
      <KanbanBoard leads={leads} columns={columns} currentUserId={user.id} />
    </>
  );
}
