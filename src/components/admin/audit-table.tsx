'use client';

import { ScrollText } from 'lucide-react';
import { useMemo, useState } from 'react';
import { EmptyState } from '@/components/shared/states';
import { StatusChip } from '@/components/shared/status-chip';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DataList } from './data-list';
import { istDateTime } from './format';
import { CsvButton } from './order-dialogs';

export interface AuditRow {
  id: string;
  actor: string;
  action: string;
  target: string;
  at: string;
}

const selectClass =
  'h-9 w-full rounded-md border border-input bg-card px-3 text-sm text-ink focus-visible:outline-2 focus-visible:outline-brand';

function tone(action: string) {
  if (action.startsWith('clinical.')) return 'warning' as const;
  if (action.includes('refund') || action.startsWith('price.') || action.startsWith('role.'))
    return 'info' as const;
  if (action.includes('deactivate') || action.includes('cancel')) return 'danger' as const;
  return 'neutral' as const;
}

/** FR-M12-10: who viewed or changed what. Filters run in the browser; export is audited. */
export function AuditTable({ rows }: { rows: AuditRow[] }) {
  const [action, setAction] = useState('');
  const [actor, setActor] = useState('');
  const [q, setQ] = useState('');
  const actions = useMemo(() => [...new Set(rows.map((r) => r.action))].sort(), [rows]);
  const actors = useMemo(() => [...new Set(rows.map((r) => r.actor))].sort(), [rows]);
  const filtered = rows.filter(
    (r) =>
      (!action || r.action === action) &&
      (!actor || r.actor === actor) &&
      (!q || r.target.toLowerCase().includes(q.toLowerCase())),
  );
  const csv = [
    ['Time (UTC)', 'Time (IST)', 'Actor', 'Action', 'Target'],
    ...filtered.map((r) => [r.at, istDateTime(r.at), r.actor, r.action, r.target]),
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-3 rounded-lg border border-line bg-card p-3 sm:grid-cols-[1fr_1fr_1.4fr_auto] sm:items-end">
        <div className="space-y-1">
          <Label htmlFor="au-action" className="text-[13px] font-normal text-muted-foreground">
            Action
          </Label>
          <select
            id="au-action"
            className={selectClass}
            value={action}
            onChange={(e) => setAction(e.target.value)}
          >
            <option value="">All actions</option>
            {actions.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="au-actor" className="text-[13px] font-normal text-muted-foreground">
            Actor
          </Label>
          <select
            id="au-actor"
            className={selectClass}
            value={actor}
            onChange={(e) => setActor(e.target.value)}
          >
            <option value="">Everyone</option>
            {actors.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="au-q" className="text-[13px] font-normal text-muted-foreground">
            Target contains
          </Label>
          <Input id="au-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. YHC-10002" />
        </div>
        <CsvButton rows={csv} filename="yhc-audit-log.csv" dataset="audit" />
      </div>
      <p className="text-[13px] text-muted-foreground" aria-live="polite">
        {filtered.length} of {rows.length} entries
      </p>
      <DataList<AuditRow>
        rows={filtered}
        rowKey={(r) => r.id}
        caption="Audit log"
        empty={<EmptyState icon={ScrollText} title="No entries match these filters" />}
        columns={[
          {
            header: 'Time (IST)',
            cell: (r) => <span className="text-sm whitespace-nowrap">{istDateTime(r.at)}</span>,
          },
          { header: 'Actor', cell: (r) => <span className="text-sm text-ink">{r.actor}</span> },
          { header: 'Action', cell: (r) => <StatusChip tone={tone(r.action)}>{r.action}</StatusChip> },
          {
            header: 'Target',
            className: 'max-w-md',
            cell: (r) => <span className="text-sm break-words">{r.target}</span>,
          },
        ]}
      />
    </div>
  );
}
