'use client';

import { ArrowUpDown, ChevronDown, ChevronUp, Download, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { EmptyState } from '@/components/shared/states';
import { StatusChip } from '@/components/shared/status-chip';
import { Button } from '@/components/ui/button';
import type { LeadSource, LeadStage } from '@/lib/domain/types';
import { cn } from '@/lib/utils';
import type { SalesLeadCard } from '@/server/sales/views';
import { LEAD_SOURCES, SOURCE_LABELS, initials, stageTone } from './labels';
import { NativeSelect, inputClass } from './native-select';

type SortKey = 'name' | 'stage' | 'owner' | 'created' | 'updated' | 'next';
type Due = 'any' | 'overdue' | 'today' | 'none';

export interface LeadFilters {
  q: string;
  stage: 'all' | LeadStage;
  owner: string; // 'all' | 'mine' | staff id
  source: 'all' | LeadSource;
  campaign: string;
  from: string;
  to: string;
  due: Due;
}

/** FR-M7-4 list view + FR-M12-11-style CSV export of the filtered, sales-safe fields. */
export function LeadsTable({
  leads,
  stages,
  reps,
  currentUserId,
  initial,
}: {
  leads: SalesLeadCard[];
  stages: { stage: LeadStage; label: string; rank: number }[];
  reps: { id: string; name: string }[];
  currentUserId: string;
  initial: LeadFilters;
}) {
  const [f, setF] = useState<LeadFilters>(initial);
  const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' }>({ key: 'updated', dir: 'desc' });
  const set = <K extends keyof LeadFilters>(k: K, v: LeadFilters[K]) => setF((p) => ({ ...p, [k]: v }));

  const campaigns = useMemo(
    () => [...new Set(leads.map((l) => l.campaign).filter((c): c is string => c !== null))].sort(),
    [leads],
  );
  const rank = useMemo(() => new Map(stages.map((s) => [s.stage, s.rank])), [stages]);

  const rows = useMemo(() => {
    const q = f.q.trim().toLowerCase();
    const digits = q.replace(/\D/g, '');
    const list = leads.filter((l) => {
      if (
        q &&
        !l.name.toLowerCase().includes(q) &&
        !(digits.length >= 3 && l.phone.includes(digits)) &&
        l.id !== q
      )
        return false;
      if (f.stage !== 'all' && l.stage !== f.stage) return false;
      if (f.owner === 'mine' && l.ownerId !== currentUserId) return false;
      if (f.owner !== 'all' && f.owner !== 'mine' && l.ownerId !== f.owner) return false;
      if (f.source !== 'all' && l.source !== f.source) return false;
      if (f.campaign !== 'all' && f.campaign !== '' && l.campaign !== f.campaign) return false;
      if (f.from && l.createdOn < f.from) return false;
      if (f.to && l.createdOn > f.to) return false;
      if (f.due === 'overdue' && !l.nextActionOverdue) return false;
      if (f.due === 'today' && !(l.nextActionToday || l.nextActionOverdue)) return false;
      if (f.due === 'none' && l.nextAction) return false;
      return true;
    });
    const dir = sort.dir === 'asc' ? 1 : -1;
    const val = (l: SalesLeadCard): string | number => {
      switch (sort.key) {
        case 'name':
          return l.name.toLowerCase();
        case 'stage':
          return rank.get(l.stage) ?? 0;
        case 'owner':
          return l.ownerName;
        case 'created':
          return l.createdAt;
        case 'updated':
          return l.updatedAt;
        case 'next':
          return l.nextActionAt ?? '9999';
      }
    };
    return [...list].sort((a, b) => {
      const x = val(a);
      const y = val(b);
      return (x < y ? -1 : x > y ? 1 : 0) * dir;
    });
  }, [leads, f, sort, rank, currentUserId]);

  const active =
    f.q !== '' ||
    f.stage !== 'all' ||
    f.owner !== 'all' ||
    f.source !== 'all' ||
    (f.campaign !== 'all' && f.campaign !== '') ||
    f.from !== '' ||
    f.to !== '' ||
    f.due !== 'any';

  function toggleSort(key: SortKey) {
    setSort((s) =>
      s.key === key
        ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: key === 'name' ? 'asc' : 'desc' },
    );
  }

  function exportCsv() {
    const header = [
      'Lead ID',
      'Name',
      'Phone',
      'Source',
      'Campaign',
      'Stage',
      'Owner',
      'Created (IST)',
      'Updated',
      'Next action',
      'Next action due',
      '₹500 paid',
    ];
    const esc = (v: string) => (/[",\n]/.test(v) ? `"${v.replaceAll('"', '""')}"` : v);
    const lines = rows.map((l) =>
      [
        l.id,
        l.name,
        l.phone,
        l.sourceLabel,
        l.campaign ?? '',
        l.stageLabel,
        l.ownerName,
        l.createdLabel,
        l.updatedAgo,
        l.nextAction ?? '',
        l.nextActionDue ?? '',
        l.consultPaid ? 'Yes' : 'No',
      ]
        .map(esc)
        .join(','),
    );
    // BOM so Excel reads ₹ correctly
    const blob = new Blob([`﻿${[header.join(','), ...lines].join('\n')}`], {
      type: 'text/csv;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `yhc-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="grid gap-3 rounded-lg border border-line bg-card p-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
        <div className="sm:col-span-2 lg:col-span-2">
          <label htmlFor="lf-q" className="sr-only">
            Search
          </label>
          <input
            id="lf-q"
            type="search"
            value={f.q}
            onChange={(e) => set('q', e.target.value)}
            placeholder="Name or phone"
            className={inputClass}
          />
        </div>
        <Filter id="lf-stage" label="Stage">
          <NativeSelect
            id="lf-stage"
            value={f.stage}
            onChange={(e) => set('stage', e.target.value as LeadFilters['stage'])}
          >
            <option value="all">All stages</option>
            {stages.map((s) => (
              <option key={s.stage} value={s.stage}>
                {s.label}
              </option>
            ))}
          </NativeSelect>
        </Filter>
        <Filter id="lf-owner" label="Owner">
          <NativeSelect id="lf-owner" value={f.owner} onChange={(e) => set('owner', e.target.value)}>
            <option value="all">All owners</option>
            <option value="mine">Mine</option>
            {reps.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </NativeSelect>
        </Filter>
        <Filter id="lf-source" label="Source">
          <NativeSelect
            id="lf-source"
            value={f.source}
            onChange={(e) => set('source', e.target.value as LeadFilters['source'])}
          >
            <option value="all">All sources</option>
            {LEAD_SOURCES.map((s) => (
              <option key={s} value={s}>
                {SOURCE_LABELS[s]}
              </option>
            ))}
          </NativeSelect>
        </Filter>
        <Filter id="lf-campaign" label="Campaign">
          <NativeSelect
            id="lf-campaign"
            value={f.campaign || 'all'}
            onChange={(e) => set('campaign', e.target.value)}
          >
            <option value="all">All campaigns</option>
            {campaigns.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </NativeSelect>
        </Filter>
        <Filter id="lf-due" label="Next action">
          <NativeSelect id="lf-due" value={f.due} onChange={(e) => set('due', e.target.value as Due)}>
            <option value="any">Any next action</option>
            <option value="overdue">Overdue</option>
            <option value="today">Due today</option>
            <option value="none">No next action</option>
          </NativeSelect>
        </Filter>
        <div className="grid grid-cols-2 gap-2 sm:col-span-2 lg:col-span-2 xl:col-span-2">
          <div>
            <label htmlFor="lf-from" className="mb-1 block text-[12px] text-muted-foreground">
              Created from
            </label>
            <input
              id="lf-from"
              type="date"
              value={f.from}
              onChange={(e) => set('from', e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="lf-to" className="mb-1 block text-[12px] text-muted-foreground">
              Created to
            </label>
            <input
              id="lf-to"
              type="date"
              value={f.to}
              onChange={(e) => set('to', e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      <div className="mt-3 mb-3 flex flex-wrap items-center gap-2">
        <p className="mr-auto text-sm text-muted-foreground" aria-live="polite">
          {rows.length} of {leads.length} leads
        </p>
        {active ? (
          <Button
            variant="ghost"
            className="h-11"
            onClick={() =>
              setF({
                q: '',
                stage: 'all',
                owner: 'all',
                source: 'all',
                campaign: 'all',
                from: '',
                to: '',
                due: 'any',
              })
            }
          >
            <RotateCcw aria-hidden />
            Clear filters
          </Button>
        ) : null}
        <Button variant="outline" className="h-11" onClick={exportCsv} disabled={rows.length === 0}>
          <Download aria-hidden />
          Export CSV
        </Button>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title={leads.length === 0 ? 'No leads yet' : 'No leads match these filters'}
          body={
            leads.length === 0
              ? 'New leads from ads, WhatsApp and the website appear here.'
              : 'Clear a filter or search for a different name.'
          }
          className="bg-card"
        />
      ) : (
        <>
          {/* mobile cards */}
          <ul className="space-y-2 md:hidden">
            {rows.map((l) => (
              <li key={l.id}>
                <Link
                  href={`/sales/leads/${l.id}`}
                  className="block rounded-lg border border-line bg-card p-3 active:bg-mist"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-ink">{l.name}</p>
                      <p className="price text-[13px] text-muted-foreground">{l.phone}</p>
                    </div>
                    <StatusChip tone={stageTone(l.stage)}>{l.stageLabel}</StatusChip>
                  </div>
                  <p className="mt-2 text-[13px] text-body">
                    {l.sourceLabel}
                    {l.campaign ? ` · ${l.campaign}` : ''} · {l.ownerName}
                  </p>
                  {l.nextAction ? (
                    <p
                      className={cn(
                        'mt-1 text-[13px]',
                        l.nextActionOverdue ? 'font-medium text-danger' : 'text-muted-foreground',
                      )}
                    >
                      {l.nextAction}
                      {l.nextActionDue ? ` · ${l.nextActionDue}` : ''}
                    </p>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>

          {/* desktop table */}
          <div className="hidden overflow-x-auto rounded-lg border border-line bg-card md:block">
            <table className="w-full text-sm">
              <thead className="bg-mist text-left text-[13px] text-ink">
                <tr>
                  <SortTh label="Lead" k="name" sort={sort} onSort={toggleSort} />
                  <th className="px-3 py-2 font-medium">Source</th>
                  <SortTh label="Stage" k="stage" sort={sort} onSort={toggleSort} />
                  <SortTh label="Owner" k="owner" sort={sort} onSort={toggleSort} />
                  <SortTh label="Next action" k="next" sort={sort} onSort={toggleSort} />
                  <SortTh label="Created" k="created" sort={sort} onSort={toggleSort} />
                  <SortTh label="Updated" k="updated" sort={sort} onSort={toggleSort} />
                </tr>
              </thead>
              <tbody>
                {rows.map((l) => (
                  <tr key={l.id} className="border-t border-line hover:bg-pearl">
                    <td className="px-3 py-2.5">
                      <Link href={`/sales/leads/${l.id}`} className="font-medium text-ink hover:underline">
                        {l.name}
                      </Link>
                      <p className="price text-[12px] text-muted-foreground">{l.phone}</p>
                    </td>
                    <td className="px-3 py-2.5 text-body">
                      {l.sourceLabel}
                      {l.campaign ? <p className="text-[12px] text-muted-foreground">{l.campaign}</p> : null}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex flex-wrap gap-1">
                        <StatusChip tone={stageTone(l.stage)}>{l.stageLabel}</StatusChip>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-body">
                      <span className="inline-flex items-center gap-2">
                        <span
                          aria-hidden
                          className={cn(
                            'inline-flex size-6 items-center justify-center rounded-full text-[10px] font-semibold',
                            l.ownerId === currentUserId ? 'bg-obsidian text-on-dark' : 'bg-mist text-ink',
                          )}
                        >
                          {initials(l.ownerName)}
                        </span>
                        {l.ownerName}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      {l.nextAction ? (
                        <>
                          <p className="text-body">{l.nextAction}</p>
                          <p
                            className={cn(
                              'text-[12px]',
                              l.nextActionOverdue ? 'font-medium text-danger' : 'text-muted-foreground',
                            )}
                          >
                            {l.nextActionDue}
                          </p>
                        </>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-body">{l.createdLabel}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-muted-foreground">{l.updatedAgo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function Filter({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      {children}
    </div>
  );
}

function SortTh({
  label,
  k,
  sort,
  onSort,
}: {
  label: string;
  k: SortKey;
  sort: { key: SortKey; dir: 'asc' | 'desc' };
  onSort: (k: SortKey) => void;
}) {
  const active = sort.key === k;
  const Icon = !active ? ArrowUpDown : sort.dir === 'asc' ? ChevronUp : ChevronDown;
  return (
    <th
      className="px-1 py-1 font-medium"
      aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}
    >
      <button
        type="button"
        onClick={() => onSort(k)}
        className="inline-flex h-10 items-center gap-1 rounded px-2 hover:bg-platinum/40"
      >
        {label}
        <Icon className={cn('size-3.5', active ? 'text-ink' : 'text-steel')} aria-hidden />
      </button>
    </th>
  );
}
