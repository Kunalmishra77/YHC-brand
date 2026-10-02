import { ListChecks } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { TaskItem } from '@/components/sales/task-item';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/states';
import { cn } from '@/lib/utils';
import { requireSales } from '@/server/sales/mutations';
import { listSalesTasks, type SalesTask } from '@/server/sales/views';

export const metadata: Metadata = { title: 'My tasks · Sales CRM' };

export default async function TasksPage({ searchParams }: PageProps<'/sales/tasks'>) {
  const user = await requireSales();
  const scope = (await searchParams).scope === 'all' ? 'all' : 'mine';
  const tasks = listSalesTasks(scope === 'mine' ? { ownerId: user.id } : {});
  const urgent = tasks.filter((x) => x.urgent);
  const rest = tasks.filter((x) => !x.urgent);
  const groups: { title: string; items: SalesTask[] }[] = [
    { title: 'Overdue', items: rest.filter((x) => x.overdue) },
    { title: 'Today', items: rest.filter((x) => !x.overdue && x.today) },
    { title: 'Upcoming', items: rest.filter((x) => !x.overdue && !x.today) },
  ];

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title={scope === 'mine' ? 'My tasks' : 'All open tasks'}
        description="Auto tasks come from the first-contact SLA, abandoned holds, unpaid plans, refills, missing intake and care flags."
        actions={
          <div
            role="group"
            aria-label="Whose tasks"
            className="inline-flex rounded-md border border-line bg-card p-1"
          >
            {(['mine', 'all'] as const).map((s) => (
              <Link
                key={s}
                href={s === 'mine' ? '/sales/tasks' : '/sales/tasks?scope=all'}
                aria-current={scope === s ? 'page' : undefined}
                className={cn(
                  'inline-flex h-9 items-center rounded px-3 text-sm font-medium',
                  scope === s ? 'bg-obsidian text-on-dark' : 'text-body hover:bg-mist',
                )}
              >
                {s === 'mine' ? 'Mine' : 'Everyone'}
              </Link>
            ))}
          </div>
        }
      />

      {tasks.length === 0 ? (
        <EmptyState
          icon={ListChecks}
          title="All caught up"
          body="New tasks appear here when a lead needs a call."
          className="bg-card"
        />
      ) : (
        <div className="space-y-6">
          {urgent.length > 0 ? (
            <section aria-labelledby="g-urgent">
              <h2 id="g-urgent" className="mb-2 text-sm font-semibold tracking-wide text-danger uppercase">
                Urgent · {urgent.length}
              </h2>
              <ul className="space-y-2">
                {urgent.map((task) => (
                  <TaskItem key={task.id} task={task} showOwner={scope === 'all'} />
                ))}
              </ul>
            </section>
          ) : null}
          {groups.map((g) => (
            <section key={g.title} aria-labelledby={`g-${g.title}`}>
              <h2
                id={`g-${g.title}`}
                className={cn(
                  'mb-2 text-sm font-semibold tracking-wide uppercase',
                  g.title === 'Overdue' && g.items.length > 0 ? 'text-danger' : 'text-muted-foreground',
                )}
              >
                {g.title} · {g.items.length}
              </h2>
              {g.items.length === 0 ? (
                <p className="rounded-lg border border-dashed border-line px-4 py-4 text-sm text-muted-foreground">
                  Nothing{' '}
                  {g.title === 'Overdue'
                    ? 'overdue'
                    : g.title === 'Today'
                      ? 'else due today'
                      : 'scheduled later'}
                  .
                </p>
              ) : (
                <ul className="space-y-2">
                  {g.items.map((task) => (
                    <TaskItem key={task.id} task={task} showOwner={scope === 'all'} />
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
