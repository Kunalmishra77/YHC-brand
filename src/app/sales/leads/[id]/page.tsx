import { addHours } from 'date-fns';
import { ArrowLeft, MessageCircle, Phone } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SOURCE_LABELS, stageTone } from '@/components/sales/labels';
import { LeadQuickActions, OwnerSelect, StageSelect } from '@/components/sales/lead-actions';
import { LeadTimeline } from '@/components/sales/lead-timeline';
import { PaymentCard } from '@/components/sales/payment-card';
import { TaskItem } from '@/components/sales/task-item';
import { StatusChip } from '@/components/shared/status-chip';
import { t } from '@/i18n/en';
import { LEAD_STAGES } from '@/lib/domain/types';
import { formatIst } from '@/lib/time';
import { requireSales } from '@/server/sales/mutations';
import { getSalesLeadDetail, salesHoldMinutes, salesReps, slotOptions } from '@/server/sales/views';

export const metadata: Metadata = { title: 'Lead · Sales CRM' };

export default async function LeadDetailPage({ params }: PageProps<'/sales/leads/[id]'>) {
  await requireSales();
  const { id } = await params;
  const detail = getSalesLeadDetail(id);
  if (!detail) notFound();
  const { lead } = detail;
  const hold = salesHoldMinutes();
  const stageOptions = LEAD_STAGES.map((stage) => ({ stage, label: t(`status.leadStage.${stage}`) }));
  const waNumber = lead.phone.replace(/^\+/, '');
  const prettyPhone = lead.phone.replace(/^\+91(\d{5})(\d{5})$/, '+91 $1 $2');

  return (
    <div className="mx-auto max-w-5xl">
      <Link
        href="/sales/leads"
        className="mb-3 inline-flex min-h-11 items-center gap-1.5 text-sm text-brand hover:underline"
      >
        <ArrowLeft className="size-4" aria-hidden />
        All leads
      </Link>

      <header className="rounded-lg border border-line bg-card p-4 md:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold text-ink md:text-2xl">{lead.name}</h1>
              <StatusChip tone={stageTone(lead.stage)}>{lead.stageLabel}</StatusChip>
              {lead.consultPaid ? <StatusChip tone="success">₹500 PAID</StatusChip> : null}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {SOURCE_LABELS[lead.source]}
              {lead.campaign ? ` · ${lead.campaign}` : ''} · Created {lead.createdLabel} · Updated{' '}
              {lead.updatedAgo}
            </p>
            {lead.stage === 'lost' && lead.lostReason ? (
              <p className="mt-1 text-sm text-danger">Lost · {lead.lostReason}</p>
            ) : null}
          </div>
          <div className="flex gap-2">
            <a
              href={`tel:${lead.phone}`}
              className="inline-flex h-11 items-center gap-2 rounded-md bg-obsidian px-4 text-sm font-medium text-on-dark hover:bg-obsidian/90"
            >
              <Phone className="size-4" aria-hidden />
              <span className="price">{prettyPhone}</span>
            </a>
            <a
              href={`https://wa.me/${waNumber}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 items-center gap-2 rounded-md border border-line bg-card px-4 text-sm font-medium text-ink hover:bg-mist"
            >
              <MessageCircle className="size-4" aria-hidden />
              {t('common.whatsapp')}
            </a>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-4">
          <OwnerSelect leadId={lead.id} ownerId={lead.ownerId} reps={salesReps()} />
          <StageSelect leadId={lead.id} stage={lead.stage} options={stageOptions} />
          {!lead.manual ? (
            <p className="text-[13px] text-muted-foreground">
              Stage moves automatically from bookings and payments.
            </p>
          ) : null}
          {lead.nextAction ? (
            <p
              className={`text-[13px] md:ml-auto ${lead.nextActionOverdue ? 'font-medium text-danger' : 'text-body'}`}
            >
              Next: {lead.nextAction}
              {lead.nextActionDue ? ` · ${lead.nextActionDue}` : ''}
            </p>
          ) : null}
        </div>
      </header>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <div className="space-y-4">
          <PaymentCard consults={detail.consults} orders={detail.orders} />

          <section aria-labelledby="qa-h" className="rounded-lg border border-line bg-card p-4">
            <h2 id="qa-h" className="mb-3 font-semibold text-ink">
              Quick actions
            </h2>
            <LeadQuickActions
              leadId={lead.id}
              leadName={lead.name}
              stage={lead.stage}
              slots={slotOptions()}
              holdMinutes={hold.minutes}
              holdFromSetting={hold.fromSetting}
              defaultDue={formatIst(addHours(new Date(), 2), "yyyy-MM-dd'T'HH:00")}
            />
          </section>

          <section aria-labelledby="tasks-h">
            <h2 id="tasks-h" className="mb-2 font-semibold text-ink">
              Open tasks
            </h2>
            {detail.openTasks.length === 0 ? (
              <p className="rounded-lg border border-dashed border-line px-4 py-5 text-sm text-muted-foreground">
                No open tasks for this lead.
              </p>
            ) : (
              <ul className="space-y-2">
                {detail.openTasks.map((task) => (
                  <TaskItem key={task.id} task={task} showLead={false} showOwner />
                ))}
              </ul>
            )}
          </section>
        </div>

        <section aria-labelledby="tl-h" className="rounded-lg border border-line bg-card p-4">
          <div className="mb-4 flex items-baseline justify-between gap-2">
            <h2 id="tl-h" className="font-semibold text-ink">
              Timeline
            </h2>
            <p className="text-[12px] text-muted-foreground">No clinical details are shown to sales</p>
          </div>
          <LeadTimeline items={detail.timeline} />
        </section>
      </div>
    </div>
  );
}
