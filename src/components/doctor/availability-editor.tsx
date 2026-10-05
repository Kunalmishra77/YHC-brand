'use client';

import { Loader2, Plus, Trash2 } from 'lucide-react';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { updateAvailabilityAction } from '@/app/doctor/actions';
import { WEEKDAYS_MON_FIRST } from '@/components/doctor/format';
import { availabilitySchema, type AvailabilityForm } from '@/components/doctor/validation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { formatIst } from '@/lib/time';
import { cn } from '@/lib/utils';

type Range = { start: string; end: string };
type Exception = AvailabilityForm['exceptions'][number];

export function AvailabilityEditor({ initial, minDate }: { initial: AvailabilityForm; minDate: string }) {
  const [rules, setRules] = useState<Record<string, Range[]>>(() => {
    const r: Record<string, Range[]> = {};
    for (const d of WEEKDAYS_MON_FIRST)
      r[String(d.day)] = (initial.weeklyRules[String(d.day)] ?? []).map((x) => ({ ...x }));
    return r;
  });
  const [exceptions, setExceptions] = useState<Exception[]>(initial.exceptions.map((e) => ({ ...e })));
  const [errors, setErrors] = useState<string[]>([]);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [pending, startTransition] = useTransition();

  const change = () => {
    setDirty(true);
    setErrors([]);
  };

  function setRange(day: string, i: number, patch: Partial<Range>) {
    change();
    setRules((r) => ({ ...r, [day]: (r[day] ?? []).map((x, k) => (k === i ? { ...x, ...patch } : x)) }));
  }

  function setException(i: number, patch: Partial<Exception>) {
    change();
    setExceptions((list) => list.map((e, k) => (k === i ? { ...e, ...patch } : e)));
  }

  function save() {
    const payload: AvailabilityForm = { weeklyRules: rules, exceptions };
    const parsed = availabilitySchema.safeParse(payload);
    if (!parsed.success) {
      const messages = parsed.error.issues.map((issue) => {
        const [first, second] = issue.path;
        if (first === 'weeklyRules') {
          const wd = WEEKDAYS_MON_FIRST.find((d) => String(d.day) === String(second));
          return `${wd?.long ?? 'A day'}: ${issue.message}`;
        }
        if (first === 'exceptions' && typeof second === 'number')
          return `Leave / exception ${second + 1}: ${issue.message}`;
        return issue.message;
      });
      setErrors([...new Set(messages)]);
      return;
    }
    startTransition(async () => {
      const res = await updateAvailabilityAction(parsed.data);
      if (res.ok) {
        setSavedAt(res.data.savedAt);
        setDirty(false);
        toast.success('Availability saved', { description: 'New bookings use these hours right away.' });
      } else {
        setErrors([res.error.message]);
        toast.error(res.error.message);
      }
    });
  }

  return (
    <div className="space-y-6">
      <section aria-labelledby="weekly" className="rounded-xl bg-card shadow-card ring-1 ring-line/80">
        <div className="border-b border-line px-4 py-3 md:px-5">
          <h2 id="weekly" className="text-base font-semibold text-ink">
            Weekly hours
          </h2>
          <p className="text-[13px] text-muted-foreground">IST. Add a second range for a lunch break.</p>
        </div>
        <ul className="divide-y divide-line">
          {WEEKDAYS_MON_FIRST.map((d) => {
            const key = String(d.day);
            const ranges = rules[key] ?? [];
            const on = ranges.length > 0;
            return (
              <li
                key={key}
                className="grid gap-3 px-4 py-3.5 md:grid-cols-[150px_1fr] md:items-start md:px-5"
              >
                <div className="flex min-h-10 items-center gap-3">
                  <Switch
                    id={`day-${key}`}
                    checked={on}
                    onCheckedChange={(v) => {
                      change();
                      setRules((r) => ({ ...r, [key]: v ? [{ start: '10:00', end: '13:00' }] : [] }));
                    }}
                    aria-label={`${d.long} working`}
                  />
                  <label htmlFor={`day-${key}`} className="text-sm font-medium text-ink">
                    {d.long}
                  </label>
                </div>
                <div className="space-y-2">
                  {on ? (
                    ranges.map((r, i) => (
                      <div
                        key={i}
                        className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto] items-center gap-2 sm:max-w-sm"
                      >
                        <Input
                          type="time"
                          value={r.start}
                          step={300}
                          aria-label={`${d.long} range ${i + 1} start`}
                          onChange={(e) => setRange(key, i, { start: e.target.value })}
                          className="h-10 w-full min-w-0 bg-pearl/60"
                        />
                        <span className="text-center text-sm text-muted-foreground">to</span>
                        <Input
                          type="time"
                          value={r.end}
                          step={300}
                          aria-label={`${d.long} range ${i + 1} end`}
                          onChange={(e) => setRange(key, i, { end: e.target.value })}
                          className="h-10 w-full min-w-0 bg-pearl/60"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-10 text-muted-foreground hover:text-danger"
                          aria-label={`Remove ${d.long} range ${i + 1}`}
                          onClick={() => {
                            change();
                            setRules((all) => ({
                              ...all,
                              [key]: (all[key] ?? []).filter((_, k) => k !== i),
                            }));
                          }}
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className="flex h-10 items-center text-sm text-muted-foreground">Not working</p>
                  )}
                  {on && ranges.length < 6 ? (
                    <Button
                      type="button"
                      variant="link"
                      className="h-8 px-0 text-brand"
                      onClick={() => {
                        change();
                        const last = ranges.at(-1);
                        setRules((all) => ({
                          ...all,
                          [key]: [
                            ...(all[key] ?? []),
                            {
                              start: last?.end && last.end < '18:00' ? bump(last.end) : '14:00',
                              end: '18:00',
                            },
                          ],
                        }));
                      }}
                    >
                      <Plus aria-hidden />
                      Add range
                    </Button>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="leave" className="rounded-xl bg-card shadow-card ring-1 ring-line/80">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3 md:px-5">
          <div>
            <h2 id="leave" className="text-base font-semibold text-ink">
              Leave, holidays and extra hours
            </h2>
            <p className="text-[13px] text-muted-foreground">
              Exceptions override the weekly hours on that date.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="h-10"
            onClick={() => {
              change();
              setExceptions((list) => [...list, { date: minDate, kind: 'unavailable', range: null }]);
            }}
          >
            <Plus aria-hidden />
            Add date
          </Button>
        </div>
        {exceptions.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-muted-foreground md:px-5">
            No leave or holidays planned. Add a date to block it, or to open extra hours.
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {exceptions.map((e, i) => (
              <li key={i} className="flex flex-wrap items-center gap-2 px-4 py-3.5 md:px-5">
                <Input
                  type="date"
                  value={e.date}
                  min={minDate}
                  aria-label={`Exception ${i + 1} date`}
                  onChange={(ev) => setException(i, { date: ev.target.value })}
                  className="h-10 min-w-0 flex-1 bg-pearl/60 sm:w-40 sm:flex-none"
                />
                <select
                  value={e.kind}
                  aria-label={`Exception ${i + 1} type`}
                  onChange={(ev) => {
                    const kind = ev.target.value === 'extra' ? 'extra' : 'unavailable';
                    setException(i, {
                      kind,
                      range: kind === 'extra' ? (e.range ?? { start: '18:00', end: '20:00' }) : e.range,
                    });
                  }}
                  className="h-10 min-w-0 flex-1 rounded-md border border-line bg-card px-3 text-sm text-ink sm:flex-none"
                >
                  <option value="unavailable">Unavailable</option>
                  <option value="extra">Extra hours</option>
                </select>
                {e.kind === 'unavailable' ? (
                  <label className="flex h-10 items-center gap-2 text-sm text-ink">
                    <Switch
                      checked={e.range === null}
                      onCheckedChange={(v) =>
                        setException(i, { range: v ? null : { start: '10:00', end: '13:00' } })
                      }
                    />
                    Whole day
                  </label>
                ) : null}
                {e.range ? (
                  <span className="grid w-full grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:w-auto sm:min-w-64">
                    <Input
                      type="time"
                      value={e.range.start}
                      aria-label={`Exception ${i + 1} start`}
                      onChange={(ev) =>
                        setException(i, { range: { start: ev.target.value, end: e.range?.end ?? '' } })
                      }
                      className="h-10 w-full min-w-0 bg-pearl/60"
                    />
                    <span className="text-sm text-muted-foreground">to</span>
                    <Input
                      type="time"
                      value={e.range.end}
                      aria-label={`Exception ${i + 1} end`}
                      onChange={(ev) =>
                        setException(i, { range: { start: e.range?.start ?? '', end: ev.target.value } })
                      }
                      className="h-10 w-full min-w-0 bg-pearl/60"
                    />
                  </span>
                ) : null}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="ml-auto size-10 text-muted-foreground hover:text-danger"
                  aria-label={`Remove exception ${i + 1}`}
                  onClick={() => {
                    change();
                    setExceptions((list) => list.filter((_, k) => k !== i));
                  }}
                >
                  <Trash2 />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="sticky bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-10 flex flex-col gap-3 rounded-xl bg-card/95 p-3 shadow-raised ring-1 ring-line/80 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between sm:pl-5">
        <div aria-live="polite" className="min-w-0">
          {errors.length ? (
            <ul role="alert" className="space-y-0.5 text-[13px] text-danger">
              {errors.slice(0, 4).map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          ) : (
            <p className={cn('text-[13px]', dirty ? 'text-body' : 'text-muted-foreground')}>
              {dirty
                ? 'Unsaved changes'
                : savedAt
                  ? `Saved · ${formatIst(new Date(savedAt), 'HH:mm:ss')}`
                  : 'Changes apply to new bookings only; existing appointments stay as booked.'}
            </p>
          )}
        </div>
        <Button
          type="button"
          className="h-11 w-full shrink-0 sm:w-auto sm:min-w-40"
          disabled={pending}
          onClick={save}
        >
          {pending ? <Loader2 className="animate-spin" aria-hidden /> : null}
          {pending ? 'Saving…' : 'Save availability'}
        </Button>
      </div>
    </div>
  );
}

function bump(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  const total = Math.min(23 * 60, (h ?? 0) * 60 + (m ?? 0) + 60);
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}
