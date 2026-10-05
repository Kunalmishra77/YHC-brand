import { RefreshCw, Webhook, X } from 'lucide-react';
import Link from 'next/link';
import { ConfirmAction } from '@/components/admin/action-kit';
import { DataList } from '@/components/admin/data-list';
import { istShort, JOB_TONE } from '@/components/admin/format';
import { ActionButton } from '@/components/admin/order-dialogs';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/states';
import { StatusChip } from '@/components/shared/status-chip';
import { t } from '@/i18n/en';
import type { Job, JobStatus } from '@/lib/domain/types';
import { cn } from '@/lib/utils';
import { requireAdminPage } from '@/server/admin/guard';
import { db } from '@/server/demo/store';
import { cancelJobAction, retryJobAction } from './actions';

export const metadata = { title: 'Jobs' };

const FILTERS: (JobStatus | 'all')[] = ['all', 'pending', 'failed', 'done', 'cancelled'];

export default async function JobsPage({ searchParams }: PageProps<'/admin/jobs'>) {
  await requireAdminPage();
  const sp = await searchParams;
  const filter = FILTERS.find((f) => f === sp.status) ?? 'all';
  const jobs = [...db().jobs].sort((a, b) => b.runAt.localeCompare(a.runAt));
  const rows = filter === 'all' ? jobs : jobs.filter((j) => j.status === filter);
  const count = (f: JobStatus | 'all') =>
    f === 'all' ? jobs.length : jobs.filter((j) => j.status === f).length;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Jobs"
        description="Scheduled work: reminders, shipping, invoices, reconciliation. Every job has a dedupe key so it runs once."
      />

      <section className="space-y-3" aria-labelledby="queue-title">
        <h2 id="queue-title" className="sr-only">
          Job queue
        </h2>
        <nav
          aria-label="Job status"
          className="-mx-4 flex snap-x scroll-px-4 [scrollbar-width:none] gap-1.5 overflow-x-auto px-4 pb-1 md:-mx-8 md:scroll-px-8 md:px-8 lg:mx-0 lg:px-0"
        >
          {FILTERS.map((f) => (
            <Link
              key={f}
              href={f === 'all' ? '/admin/jobs' : `/admin/jobs?status=${f}`}
              aria-current={f === filter ? 'page' : undefined}
              className={cn(
                'inline-flex h-10 shrink-0 snap-start items-center gap-2 rounded-md border px-3 text-sm font-medium whitespace-nowrap transition-colors',
                f === filter
                  ? 'border-obsidian bg-obsidian text-on-dark'
                  : 'border-line bg-card text-body hover:bg-mist',
              )}
            >
              {f === 'all' ? 'All' : t(`status.job.${f}`)}
              <span className="price text-[12px] opacity-80">{count(f)}</span>
            </Link>
          ))}
        </nav>
        <DataList<Job>
          rows={rows}
          rowKey={(j) => j.id}
          caption="Job queue"
          empty={<EmptyState title="No jobs with this status" />}
          columns={[
            {
              header: 'Kind',
              cell: (j) => <code className="text-[13px] font-medium text-ink">{j.kind}</code>,
            },
            {
              header: 'Status',
              cell: (j) => <StatusChip tone={JOB_TONE[j.status]}>{t(`status.job.${j.status}`)}</StatusChip>,
            },
            { header: 'Run at (IST)', cell: (j) => <span className="text-sm">{istShort(j.runAt)}</span> },
            {
              header: 'Attempts',
              align: 'right',
              cell: (j) => <span className="price">{j.attempts} / 3</span>,
            },
            {
              header: 'Dedupe key',
              cell: (j) => <code className="text-[12px] break-all text-muted-foreground">{j.dedupeKey}</code>,
            },
            {
              header: 'Last error',
              className: 'max-w-xs',
              cell: (j) =>
                j.lastError ? (
                  <span className="text-[13px] text-danger">{j.lastError}</span>
                ) : (
                  <span className="text-[13px] text-muted-foreground">—</span>
                ),
            },
          ]}
          actions={(j) => (
            <>
              {j.status === 'failed' || j.status === 'cancelled' ? (
                <ActionButton
                  action={retryJobAction.bind(null, j.id)}
                  label="Retry"
                  icon={<RefreshCw className="size-4" aria-hidden />}
                />
              ) : null}
              {j.status === 'pending' || j.status === 'failed' ? (
                <ConfirmAction
                  action={cancelJobAction.bind(null, j.id)}
                  label="Cancel"
                  variant="ghost"
                  icon={<X className="size-4" aria-hidden />}
                  title={`Cancel ${j.kind}?`}
                  description={
                    <p>
                      The job will not run. Customer-facing reminders it would have sent are skipped. Key:{' '}
                      <code>{j.dedupeKey}</code>
                    </p>
                  }
                  confirmLabel="Cancel job"
                  destructive
                />
              ) : null}
            </>
          )}
        />
      </section>

      <section className="space-y-3" aria-labelledby="webhooks-title">
        <div>
          <h2 id="webhooks-title" className="text-base font-semibold text-ink">
            Webhook log
          </h2>
          <p className="text-[13px] text-muted-foreground">
            Provider, event ID, received at, processed status — deduplicated by (provider, event_id).
          </p>
        </div>
        <EmptyState
          icon={Webhook}
          title="No webhooks yet"
          body="Webhooks appear here once Razorpay/WhatsApp are connected."
        />
      </section>
    </div>
  );
}
