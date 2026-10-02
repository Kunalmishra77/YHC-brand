import 'server-only';

import { addDays } from 'date-fns';
import { fromZonedTime } from 'date-fns-tz';
import { IST, istDate } from '@/lib/time';

/** A daily working range in IST wall-clock time, e.g. `{ start: '10:00', end: '13:00' }`. */
export interface TimeRange {
  start: string;
  end: string;
}

export interface AvailabilityInput {
  /** weekday (0 = Sunday … 6 = Saturday, IST) → working ranges */
  weeklyRules: Record<number, TimeRange[]>;
  /** IST date → extra ranges / unavailable ranges (null range = whole day off) */
  exceptions: { date: string; kind: 'extra' | 'unavailable'; range: TimeRange | null }[];
  busyBlocks: { startsAt: Date; endsAt: Date }[];
  /** held (unexpired) and booked appointments */
  taken: { startsAt: Date; endsAt: Date }[];
  slotMinutes: number;
  bufferMinutes: number;
  minNoticeMinutes: number;
  maxPerDay: number;
  windowDays: number;
  now: Date;
}

export interface Slot {
  startsAt: Date;
  endsAt: Date;
}

export interface DayAvailability {
  date: string; // IST YYYY-MM-DD
  slots: Slot[];
  remaining: number;
}

interface Interval {
  start: number;
  end: number;
}

const MINUTE = 60_000;

function istInterval(date: string, range: TimeRange): Interval {
  return {
    start: fromZonedTime(`${date}T${range.start}:00`, IST).getTime(),
    end: fromZonedTime(`${date}T${range.end}:00`, IST).getTime(),
  };
}

function subtract(windows: Interval[], cut: Interval): Interval[] {
  return windows.flatMap((w) => {
    if (cut.end <= w.start || cut.start >= w.end) return [w];
    const parts: Interval[] = [];
    if (cut.start > w.start) parts.push({ start: w.start, end: cut.start });
    if (cut.end < w.end) parts.push({ start: cut.end, end: w.end });
    return parts;
  });
}

const overlaps = (a: Interval, b: Interval) => a.start < b.end && b.start < a.end;

/** TRD §6.1 — pure; the caller loads rules, exceptions, busy blocks and live appointments. */
export function computeAvailability(input: AvailabilityInput): DayAvailability[] {
  const days: DayAvailability[] = [];
  const earliest = input.now.getTime() + input.minNoticeMinutes * MINUTE;
  const step = (input.slotMinutes + input.bufferMinutes) * MINUTE;
  const length = input.slotMinutes * MINUTE;

  for (let i = 0; i < input.windowDays; i++) {
    const date = istDate(addDays(input.now, i));
    const weekday = new Date(`${date}T12:00:00Z`).getUTCDay();
    const dayExceptions = input.exceptions.filter((e) => e.date === date);

    let windows = (input.weeklyRules[weekday] ?? []).map((r) => istInterval(date, r));
    for (const e of dayExceptions) {
      if (e.kind === 'extra' && e.range) windows.push(istInterval(date, e.range));
    }
    for (const e of dayExceptions) {
      if (e.kind !== 'unavailable') continue;
      windows = e.range ? subtract(windows, istInterval(date, e.range)) : [];
    }
    for (const b of input.busyBlocks) {
      windows = subtract(windows, { start: b.startsAt.getTime(), end: b.endsAt.getTime() });
    }

    const taken = input.taken.map((t) => ({ start: t.startsAt.getTime(), end: t.endsAt.getTime() }));
    const takenToday = input.taken.filter((t) => istDate(t.startsAt) === date).length;

    const candidates: Interval[] = [];
    for (const w of windows.sort((a, b) => a.start - b.start)) {
      for (let t = w.start; t + length <= w.end; t += step) {
        const slot = { start: t, end: t + length };
        if (slot.start < earliest) continue;
        if (taken.some((x) => overlaps(x, slot))) continue;
        candidates.push(slot);
      }
    }

    const capacity = Math.max(0, input.maxPerDay - takenToday);
    const slots = candidates
      .slice(0, capacity)
      .map((c) => ({ startsAt: new Date(c.start), endsAt: new Date(c.end) }));
    days.push({ date, slots, remaining: slots.length });
  }
  return days;
}
