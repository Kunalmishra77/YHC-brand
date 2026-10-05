'use client';

import { CircleCheck } from 'lucide-react';
import Link from 'next/link';
import { useTransition } from 'react';
import { toast } from 'sonner';
import { completeTaskAction } from '@/app/sales/actions';
import { StatusChip } from '@/components/shared/status-chip';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { SalesTask } from '@/server/sales/views';

/** One open task with a complete button (FR-M7-9). */
export function TaskItem({
  task,
  showLead = true,
  showOwner = false,
}: {
  task: SalesTask;
  showLead?: boolean;
  showOwner?: boolean;
}) {
  const [pending, start] = useTransition();
  return (
    <li
      className={cn(
        'flex flex-col gap-3 rounded-xl bg-card p-4 shadow-card ring-1 sm:flex-row sm:items-center sm:gap-4',
        task.urgent ? 'ring-danger/40' : 'ring-line/80',
        pending && 'opacity-60',
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          {task.urgent ? <StatusChip tone="danger">Urgent · side-effect flag</StatusChip> : null}
          <StatusChip tone={task.overdue ? 'danger' : task.today ? 'warning' : 'pending'}>
            {task.dueLabel}
          </StatusChip>
        </div>
        <p className="mt-1.5 font-medium text-ink">{task.title}</p>
        <p className="mt-0.5 text-[13px] text-muted-foreground">
          {showLead ? (
            <Link
              href={`/sales/leads/${task.leadId}`}
              className="text-brand underline-offset-2 hover:underline"
            >
              {task.leadName}
            </Link>
          ) : null}
          {showLead && showOwner ? ' · ' : null}
          {showOwner ? task.ownerName : null}
        </p>
      </div>
      <Button
        variant="outline"
        className="h-11 shrink-0"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const res = await completeTaskAction(task.id);
            if (res.ok) toast.success('Task done');
            else toast.error(res.error.message);
          })
        }
      >
        <CircleCheck aria-hidden />
        {pending ? 'Saving…' : 'Mark done'}
      </Button>
    </li>
  );
}
