'use client';

import { useState } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { formatINR } from '@/lib/money';
import { cn } from '@/lib/utils';
import { dateLabel, formatCount, formatINRCompact, formatPct } from './format';

/*
 * Restrained inline charts (no chart library — dataviz skill). Revenue uses a validated
 * single-hue ordinal ramp (consult → plan → reorder, light → dark, steel blue → obsidian);
 * every chart has a legend or direct labels, a hover/focus tooltip and a table view.
 */

export const REVENUE_COLORS = {
  consult: '#9FB0C2',
  plan: '#4E6378',
  reorder: '#121315',
} as const;

const SERIES = [
  { key: 'consultPaise', label: 'Consultations', color: REVENUE_COLORS.consult },
  { key: 'planPaise', label: 'Plans & products', color: REVENUE_COLORS.plan },
  { key: 'reorderPaise', label: 'Reorders', color: REVENUE_COLORS.reorder },
] as const;

export interface RevenuePoint {
  firstDate: string;
  lastDate: string;
  consultPaise: number;
  planPaise: number;
  reorderPaise: number;
}

function niceMax(value: number): number {
  if (value <= 0) return 100_000; // ₹1,000 empty-state scale
  const exp = Math.pow(10, Math.floor(Math.log10(value)));
  for (const m of [1, 2, 2.5, 5, 10]) if (m * exp >= value) return m * exp;
  return 10 * exp;
}

export function Legend({ items }: { items: { label: string; color: string }[] }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-body" aria-label="Legend">
      {items.map((i) => (
        <li key={i.label} className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-[3px]" style={{ background: i.color }} aria-hidden />
          {i.label}
        </li>
      ))}
    </ul>
  );
}

export function RevenueChart({ points, weekly }: { points: RevenuePoint[]; weekly: boolean }) {
  const [active, setActive] = useState<number | null>(null);
  const totals = points.map((p) => p.consultPaise + p.planPaise + p.reorderPaise);
  const max = niceMax(Math.max(0, ...totals));
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * max);
  const every = Math.max(1, Math.ceil(points.length / 6));
  const bucketLabel = (p: RevenuePoint) =>
    weekly && p.firstDate !== p.lastDate
      ? `${dateLabel(p.firstDate)} – ${dateLabel(p.lastDate)}`
      : dateLabel(p.firstDate);
  const activePoint = active === null ? null : points[active];

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <Legend items={SERIES.map((s) => ({ label: s.label, color: s.color }))} />
        <p className="min-h-5 text-[13px] text-muted-foreground" aria-live="polite">
          {activePoint
            ? `${bucketLabel(activePoint)} · ${formatINR(totals[active ?? 0] ?? 0)}`
            : `${weekly ? 'Weekly' : 'Daily'} totals · hover a bar for detail`}
        </p>
      </div>
      <div className="relative h-56 pl-12">
        {/* gridlines + y ticks */}
        {ticks.map((v) => (
          <div
            key={v}
            className="pointer-events-none absolute right-0 left-12 border-t border-line"
            style={{ bottom: `${(v / max) * 100}%` }}
          >
            <span className="price absolute -top-2 -left-12 w-10 text-right text-[11px] text-muted-foreground">
              {formatINRCompact(v)}
            </span>
          </div>
        ))}
        <div className="absolute inset-y-0 right-0 left-12 flex items-end gap-[2px]">
          {points.map((p, i) => {
            const total = totals[i] ?? 0;
            const segs = SERIES.map((s) => ({ ...s, value: p[s.key] })).filter((s) => s.value > 0);
            return (
              <Tooltip key={p.firstDate}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      'group flex h-full min-w-0 flex-1 flex-col items-center justify-end rounded-sm outline-offset-0',
                      active === i && 'bg-mist/50',
                    )}
                    onMouseEnter={() => setActive(i)}
                    onMouseLeave={() => setActive(null)}
                    onFocus={() => setActive(i)}
                    onBlur={() => setActive(null)}
                    aria-label={`${bucketLabel(p)}: ${formatINR(total)} — ${SERIES.map((s) => `${s.label} ${formatINR(p[s.key])}`).join(', ')}`}
                  >
                    <span
                      className="flex w-full max-w-6 flex-col-reverse gap-[2px]"
                      style={{ height: `${(total / max) * 100}%` }}
                    >
                      {segs.map((s, k) => (
                        <span
                          key={s.key}
                          className={cn('block w-full', k === segs.length - 1 && 'rounded-t-[4px]')}
                          style={{ background: s.color, flexGrow: s.value, flexBasis: 0, minHeight: 2 }}
                        />
                      ))}
                    </span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-[13px]">
                  <p className="font-medium">{bucketLabel(p)}</p>
                  {SERIES.map((s) => (
                    <p key={s.key} className="flex items-center gap-1.5">
                      <span className="size-2 rounded-[2px]" style={{ background: s.color }} aria-hidden />
                      {s.label}: <span className="price">{formatINR(p[s.key])}</span>
                    </p>
                  ))}
                  <p className="mt-0.5 font-medium">
                    Total <span className="price">{formatINR(total)}</span>
                  </p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </div>
      <div className="mt-1.5 flex gap-[2px] pl-12" aria-hidden>
        {points.map((p, i) => (
          <span key={p.firstDate} className="min-w-0 flex-1 text-center text-[11px] text-muted-foreground">
            {i % every === 0 || i === points.length - 1 ? dateLabel(p.firstDate) : ''}
          </span>
        ))}
      </div>
      <details className="mt-4 text-sm">
        <summary className="cursor-pointer text-brand">Show as table</summary>
        <div className="mt-2 max-h-64 overflow-auto rounded-md border border-line">
          <table className="w-full text-[13px]">
            <thead className="sticky top-0 bg-mist text-left text-ink">
              <tr>
                <th className="px-3 py-2 font-medium">{weekly ? 'Week' : 'Day'}</th>
                {SERIES.map((s) => (
                  <th key={s.key} className="px-3 py-2 text-right font-medium">
                    {s.label}
                  </th>
                ))}
                <th className="px-3 py-2 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody className="price">
              {points.map((p, i) => (
                <tr key={p.firstDate} className="border-t border-line">
                  <td className="px-3 py-1.5">{bucketLabel(p)}</td>
                  {SERIES.map((s) => (
                    <td key={s.key} className="px-3 py-1.5 text-right">
                      {formatINR(p[s.key])}
                    </td>
                  ))}
                  <td className="px-3 py-1.5 text-right font-medium text-ink">{formatINR(totals[i] ?? 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}

export interface FunnelDatum {
  key: string;
  label: string;
  count: number;
  conversion: number | null;
}

/** Ordered funnel: one hue, bar length = share of the first step, step conversion on the right. */
export function FunnelChart({ steps }: { steps: FunnelDatum[] }) {
  const top = steps[0]?.count ?? 0;
  return (
    <ol className="space-y-2.5">
      {steps.map((s, i) => {
        const share = top === 0 ? 0 : s.count / top;
        return (
          <li key={s.key}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  tabIndex={0}
                  className="grid grid-cols-[6.5rem_1fr_4.5rem] items-center gap-3 rounded-md px-1 py-1 outline-offset-2 hover:bg-mist/50 sm:grid-cols-[8rem_1fr_6.5rem]"
                  aria-label={`${s.label}: ${s.count}${s.conversion === null ? '' : `, ${formatPct(s.conversion)} of previous step`}`}
                >
                  <span className="truncate text-sm text-body">{s.label}</span>
                  <span className="flex items-center gap-2">
                    <span className="relative h-5 flex-1">
                      <span
                        className="absolute inset-y-0 left-0 rounded-r-[4px] bg-obsidian"
                        style={{ width: `${Math.max(share * 100, s.count > 0 ? 1.5 : 0)}%` }}
                      />
                    </span>
                    <span className="price w-8 shrink-0 text-sm font-medium text-ink">
                      {formatCount(s.count)}
                    </span>
                  </span>
                  <span className="price text-right text-[13px] text-muted-foreground">
                    {i === 0 ? 'cohort' : formatPct(s.conversion)}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-[13px]">
                <p className="font-medium">{s.label}</p>
                <p>
                  {formatCount(s.count)} of {formatCount(top)} leads ({formatPct(top ? share : null)})
                </p>
                {i > 0 ? <p>Step conversion: {formatPct(s.conversion)}</p> : null}
              </TooltipContent>
            </Tooltip>
          </li>
        );
      })}
    </ol>
  );
}

/** Meter: steel-blue fill on a lighter track of the same hue; words beside it. */
export function Meter({ value, label }: { value: number | null; label: string }) {
  const pct = value === null ? 0 : Math.min(1, Math.max(0, value));
  return (
    <div>
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-[#DCE2E8]"
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pct * 100)}
      >
        <div className="h-full rounded-full bg-brand" style={{ width: `${pct * 100}%` }} />
      </div>
    </div>
  );
}

/** Inline magnitude bar for breakdown tables (single series → one colour). */
export function InlineBar({ value, max }: { value: number; max: number }) {
  const pct = max <= 0 ? 0 : value / max;
  return (
    <span className="block h-1.5 w-full max-w-32 rounded-full bg-mist" aria-hidden>
      <span
        className="block h-full rounded-full bg-brand"
        style={{ width: `${Math.max(pct * 100, value > 0 ? 3 : 0)}%` }}
      />
    </span>
  );
}
