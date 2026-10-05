'use client';

import { Ellipsis, GripVertical, Lock } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useOptimistic, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { moveLeadStageAction } from '@/app/sales/actions';
import { EmptyState } from '@/components/shared/states';
import { StatusChip } from '@/components/shared/status-chip';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { LeadSource, LeadStage } from '@/lib/domain/types';
import type { SalesLeadCard } from '@/server/sales/views';
import { cn } from '@/lib/utils';
import { LEAD_SOURCES, MANUAL_STAGE_SET, SOURCE_LABELS, SYSTEM_STAGE_HINT, initials } from './labels';
import { LostDialog } from './lost-dialog';
import { NativeSelect } from './native-select';

export interface StageColumn {
  stage: LeadStage;
  label: string;
}

/** FR-M7-2..4 pipeline. Drag (desktop) and "Move to" (everywhere) only between manual stages. */
export function KanbanBoard({
  leads,
  columns,
  currentUserId,
}: {
  leads: SalesLeadCard[];
  columns: StageColumn[];
  currentUserId: string;
}) {
  const [owner, setOwner] = useState<'all' | 'mine'>('all');
  const [source, setSource] = useState<'all' | LeadSource>('all');
  const [dragging, setDragging] = useState<string | null>(null);
  const [overStage, setOverStage] = useState<LeadStage | null>(null);
  const [lostFor, setLostFor] = useState<SalesLeadCard | null>(null);
  const [pending, start] = useTransition();
  const [optimistic, applyMove] = useOptimistic(leads, (state, move: { id: string; stage: LeadStage }) =>
    state.map((l) => (l.id === move.id ? { ...l, stage: move.stage } : l)),
  );

  const filtered = useMemo(
    () =>
      optimistic.filter(
        (l) => (owner === 'all' || l.ownerId === currentUserId) && (source === 'all' || l.source === source),
      ),
    [optimistic, owner, source, currentUserId],
  );
  const byStage = useMemo(() => {
    const map = new Map<LeadStage, SalesLeadCard[]>();
    for (const l of filtered) map.set(l.stage, [...(map.get(l.stage) ?? []), l]);
    return map;
  }, [filtered]);

  const labelOf = (stage: LeadStage) => columns.find((c) => c.stage === stage)?.label ?? stage;
  const draggingLead = dragging ? optimistic.find((l) => l.id === dragging) : undefined;

  function move(lead: SalesLeadCard, stage: LeadStage, reason?: string) {
    if (lead.stage === stage) return;
    if (stage === 'lost' && !reason) {
      setLostFor(lead);
      return;
    }
    start(async () => {
      applyMove({ id: lead.id, stage });
      const res = await moveLeadStageAction({ leadId: lead.id, stage, reason });
      if (res.ok) {
        toast.success(`${lead.name} · ${labelOf(stage)}`);
        setLostFor(null);
      } else toast.error(res.error.message);
    });
  }

  const canDrop = (stage: LeadStage) =>
    draggingLead !== undefined &&
    MANUAL_STAGE_SET.has(draggingLead.stage) &&
    MANUAL_STAGE_SET.has(stage) &&
    draggingLead.stage !== stage;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div
          role="group"
          aria-label="Owner"
          className="inline-flex h-11 items-center rounded-md border border-line bg-card p-1"
        >
          {(['all', 'mine'] as const).map((o) => (
            <button
              key={o}
              type="button"
              onClick={() => setOwner(o)}
              aria-pressed={owner === o}
              className={cn(
                'h-full min-w-16 rounded px-3 text-sm font-medium transition-colors',
                owner === o ? 'bg-obsidian text-on-dark' : 'text-body hover:bg-mist',
              )}
            >
              {o === 'all' ? 'All leads' : 'Mine'}
            </button>
          ))}
        </div>
        <div className="min-w-0 flex-1 sm:w-44 sm:flex-none">
          <label htmlFor="kb-source" className="sr-only">
            Source
          </label>
          <NativeSelect
            id="kb-source"
            value={source}
            onChange={(e) => setSource(e.target.value as 'all' | LeadSource)}
          >
            <option value="all">All sources</option>
            {LEAD_SOURCES.map((s) => (
              <option key={s} value={s}>
                {SOURCE_LABELS[s]}
              </option>
            ))}
          </NativeSelect>
        </div>
        <p className="w-full text-sm text-muted-foreground sm:w-auto" aria-live="polite">
          {filtered.length} {filtered.length === 1 ? 'lead' : 'leads'}
        </p>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No leads match these filters"
          body="Switch to All leads or another source."
          className="bg-card"
        />
      ) : (
        <div className="-mx-4 flex snap-x snap-mandatory scroll-px-4 [scrollbar-width:thin] gap-3 overflow-x-auto overscroll-x-contain px-4 pb-4 md:-mx-8 md:scroll-px-8 md:px-8 lg:snap-none">
          {columns.map((col) => {
            const items = byStage.get(col.stage) ?? [];
            const manual = MANUAL_STAGE_SET.has(col.stage);
            const droppable = canDrop(col.stage);
            return (
              <section
                key={col.stage}
                aria-label={`${col.label}, ${items.length} leads`}
                onDragOver={(e) => {
                  if (!droppable) return;
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                  setOverStage(col.stage);
                }}
                onDragLeave={() => setOverStage((s) => (s === col.stage ? null : s))}
                onDrop={(e) => {
                  e.preventDefault();
                  setOverStage(null);
                  const lead = optimistic.find((l) => l.id === e.dataTransfer.getData('text/plain'));
                  setDragging(null);
                  if (lead && canDropLead(lead, col.stage)) move(lead, col.stage);
                }}
                className={cn(
                  'flex w-[calc(100vw-4.5rem)] max-w-[296px] shrink-0 snap-start flex-col rounded-xl border bg-mist/60 transition-colors sm:w-[280px]',
                  col.stage === 'lost' ? 'border-dashed border-line' : 'border-transparent',
                  droppable && 'border-brand/40 bg-mist',
                  overStage === col.stage && droppable && 'border-brand bg-info-bg',
                  draggingLead && !droppable && 'opacity-60',
                )}
              >
                <header className="flex items-center gap-2 px-3 pt-3 pb-2">
                  <h2 className="min-w-0 flex-1 truncate text-sm font-semibold text-ink">{col.label}</h2>
                  {!manual ? (
                    <Tooltip>
                      <TooltipTrigger
                        className="inline-flex size-6 items-center justify-center rounded text-steel"
                        aria-label={SYSTEM_STAGE_HINT}
                      >
                        <Lock className="size-3.5" aria-hidden />
                      </TooltipTrigger>
                      <TooltipContent>{SYSTEM_STAGE_HINT}</TooltipContent>
                    </Tooltip>
                  ) : null}
                  <span className="price rounded-full bg-card px-2 py-0.5 text-[12px] text-ink">
                    {items.length}
                  </span>
                </header>
                <ol className="flex min-h-24 flex-1 flex-col gap-2 px-2 pb-2">
                  {items.length === 0 ? (
                    <li className="rounded-md border border-dashed border-platinum px-3 py-6 text-center text-[13px] text-muted-foreground">
                      {droppable ? 'Drop here' : 'No leads'}
                    </li>
                  ) : (
                    items.map((lead) => (
                      <LeadCard
                        key={lead.id}
                        lead={lead}
                        mine={lead.ownerId === currentUserId}
                        dragging={dragging === lead.id}
                        columns={columns}
                        disabled={pending}
                        onDragStart={(id) => setDragging(id)}
                        onDragEnd={() => {
                          setDragging(null);
                          setOverStage(null);
                        }}
                        onMove={(stage) => move(lead, stage)}
                      />
                    ))
                  )}
                </ol>
              </section>
            );
          })}
        </div>
      )}

      {lostFor ? (
        <LostDialog
          leadName={lostFor.name}
          open
          pending={pending}
          onOpenChange={(o) => (o ? null : setLostFor(null))}
          onConfirm={(reason) => move(lostFor, 'lost', reason)}
        />
      ) : null}
    </div>
  );
}

const canDropLead = (lead: SalesLeadCard, stage: LeadStage) =>
  MANUAL_STAGE_SET.has(lead.stage) && MANUAL_STAGE_SET.has(stage) && lead.stage !== stage;

function LeadCard({
  lead,
  mine,
  dragging,
  columns,
  disabled,
  onDragStart,
  onDragEnd,
  onMove,
}: {
  lead: SalesLeadCard;
  mine: boolean;
  dragging: boolean;
  columns: StageColumn[];
  disabled: boolean;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  onMove: (stage: LeadStage) => void;
}) {
  const manual = MANUAL_STAGE_SET.has(lead.stage);
  const targets = columns.filter((c) => MANUAL_STAGE_SET.has(c.stage) && c.stage !== lead.stage);
  return (
    <li
      draggable={manual}
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', lead.id);
        e.dataTransfer.effectAllowed = 'move';
        onDragStart(lead.id);
      }}
      onDragEnd={onDragEnd}
      className={cn(
        'group relative rounded-md border border-line bg-card p-3 shadow-[0_1px_0_rgba(18,19,21,0.04)] transition-shadow hover:shadow-sm',
        manual && 'cursor-grab active:cursor-grabbing',
        dragging && 'opacity-40',
      )}
    >
      <div className="flex items-start gap-2">
        {manual ? (
          <GripVertical
            className="mt-0.5 hidden size-4 shrink-0 text-platinum group-hover:text-steel lg:block"
            aria-hidden
          />
        ) : null}
        <div className="min-w-0 flex-1">
          <Link
            href={`/sales/leads/${lead.id}`}
            className="block truncate font-medium text-ink after:absolute after:inset-0 after:content-[''] hover:underline focus-visible:underline"
            draggable={false}
          >
            {lead.name}
          </Link>
          <p className="mt-0.5 truncate text-[13px] text-muted-foreground">
            {lead.sourceLabel}
            {lead.campaign ? ` · ${lead.campaign}` : ''}
          </p>
        </div>
        <span
          title={lead.ownerName}
          aria-label={`Owner ${lead.ownerName}`}
          className={cn(
            'relative z-10 inline-flex size-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold',
            mine ? 'bg-obsidian text-on-dark' : 'bg-mist text-ink',
          )}
        >
          {initials(lead.ownerName)}
        </span>
      </div>

      {lead.consultPaid ? (
        <StatusChip tone="success" className="mt-2">
          ₹500 PAID
        </StatusChip>
      ) : null}

      {lead.nextAction ? (
        <p
          className={cn(
            'mt-2 text-[13px] leading-snug',
            lead.nextActionOverdue ? 'font-medium text-danger' : 'text-body',
          )}
        >
          {lead.nextAction}
          {lead.nextActionDue ? <span className="block text-[12px]">{lead.nextActionDue}</span> : null}
        </p>
      ) : null}

      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="text-[12px] text-muted-foreground">Updated {lead.updatedAgo}</span>
        {manual ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative z-10 -my-1 -mr-1 size-9"
                aria-label={`Move ${lead.name} to another stage`}
                disabled={disabled}
              >
                <Ellipsis className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Move to…</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {targets.map((c) => (
                <DropdownMenuItem
                  key={c.stage}
                  className={cn('min-h-10', c.stage === 'lost' && 'text-danger')}
                  onSelect={() => onMove(c.stage)}
                >
                  {c.stage === 'lost' ? 'Mark lost…' : c.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <span
            className="relative z-10 inline-flex items-center gap-1 text-[12px] text-steel"
            title={SYSTEM_STAGE_HINT}
          >
            <Lock className="size-3" aria-hidden />
            Auto
          </span>
        )}
      </div>
    </li>
  );
}
