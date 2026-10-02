'use client';

import { CalendarX2 } from 'lucide-react';
import { useId, useMemo } from 'react';
import { cn } from '@/lib/utils';
import type { SlotDayView, SlotView } from './types';

/**
 * Slot picker (FR-M3-1, docs/07 §5): day tabs (Today / Tomorrow / dates), IST time chips grouped by
 * part of day, "x left" when ≤ 3, disabled days with a message. Selection is controlled by the parent.
 */
export function SlotPicker({
  days,
  day,
  onDayChange,
  selected,
  onSelect,
}: {
  days: SlotDayView[];
  day: string;
  onDayChange: (date: string) => void;
  selected: string | null;
  onSelect: (slot: SlotView, date: string) => void;
}) {
  const baseId = useId();
  const current = days.find((d) => d.date === day) ?? days[0];
  const groups = useMemo(() => {
    const out: { period: SlotView['period']; slots: SlotView[] }[] = [];
    for (const s of current?.slots ?? []) {
      const g = out.find((x) => x.period === s.period);
      if (g) g.slots.push(s);
      else out.push({ period: s.period, slots: [s] });
    }
    return out;
  }, [current]);
  const nextOpen = days.find((d) => d.date > (current?.date ?? '') && d.slots.length > 0);

  if (days.length === 0 || days.every((d) => d.slots.length === 0)) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-line px-6 py-10 text-center">
        <CalendarX2 className="size-6 text-steel" aria-hidden />
        <p className="font-medium text-ink">No times are open this week</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Dr. Tyagi&apos;s calendar is full for now. Message us on WhatsApp and our team will find you the
          next opening.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div
        role="tablist"
        aria-label="Choose a day"
        className="-mx-4 flex snap-x [scrollbar-width:none] gap-2 overflow-x-auto px-4 pb-2 md:mx-0 md:flex-wrap md:px-0"
        onKeyDown={(e) => {
          if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
          e.preventDefault();
          const i = days.findIndex((d) => d.date === current?.date);
          const next = days[(i + (e.key === 'ArrowRight' ? 1 : days.length - 1)) % days.length];
          if (next) {
            onDayChange(next.date);
            document.getElementById(`${baseId}-tab-${next.date}`)?.focus();
          }
        }}
      >
        {days.map((d) => {
          const isActive = d.date === current?.date;
          const closed = d.slots.length === 0;
          return (
            <button
              key={d.date}
              id={`${baseId}-tab-${d.date}`}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`${baseId}-panel`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onDayChange(d.date)}
              className={cn(
                'flex min-h-14 min-w-[92px] shrink-0 snap-start flex-col items-start justify-center rounded-md border px-3 py-2 text-left transition-colors',
                isActive
                  ? 'border-obsidian bg-obsidian text-on-dark'
                  : 'border-line bg-card text-ink hover:border-steel',
              )}
            >
              <span className="text-sm font-medium">{d.tab}</span>
              <span
                className={cn(
                  'text-[13px]',
                  isActive ? 'text-on-dark-muted' : closed ? 'text-muted-foreground' : 'text-body',
                  !isActive && !closed && d.remaining <= 3 && 'font-medium text-warning',
                )}
              >
                {closed ? 'Full' : d.remaining <= 3 ? `${d.remaining} left` : `${d.remaining} times`}
              </span>
            </button>
          );
        })}
      </div>

      <div
        id={`${baseId}-panel`}
        role="tabpanel"
        aria-label={current ? `Times on ${current.long}` : undefined}
        className="mt-5"
      >
        {current && current.slots.length === 0 ? (
          <div className="rounded-lg border border-dashed border-line px-5 py-8 text-center">
            <p className="font-medium text-ink">No times left on {current.long}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {nextOpen ? `The next opening is on ${nextOpen.long}.` : 'Please try another day.'}
            </p>
            {nextOpen ? (
              <button
                type="button"
                onClick={() => onDayChange(nextOpen.date)}
                className="mt-3 inline-flex min-h-11 items-center rounded-md px-3 text-sm font-medium text-brand underline underline-offset-4"
              >
                See {nextOpen.tab}
              </button>
            ) : null}
          </div>
        ) : (
          <div className="space-y-5">
            {groups.map((g) => (
              <fieldset key={g.period}>
                <legend className="mb-2 text-sm text-muted-foreground">{g.period}</legend>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {g.slots.map((s) => {
                    const isSel = selected === s.startsAt;
                    return (
                      <button
                        key={s.startsAt}
                        type="button"
                        aria-pressed={isSel}
                        onClick={() => current && onSelect(s, current.date)}
                        className={cn(
                          'price min-h-12 rounded-md border text-[15px] transition-colors',
                          isSel
                            ? 'border-brand bg-brand text-white shadow-card'
                            : 'border-line bg-card text-ink hover:border-obsidian',
                        )}
                      >
                        {s.time}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            ))}
            <p className="text-[13px] text-muted-foreground">All times are India Standard Time (IST).</p>
          </div>
        )}
      </div>
    </div>
  );
}
