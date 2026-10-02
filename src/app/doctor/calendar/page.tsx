import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { formatMinutes, WEEKDAYS_MON_FIRST } from '@/components/doctor/format';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { istDate } from '@/lib/time';
import { cn } from '@/lib/utils';
import { requireDoctorPage } from '@/server/doctor/auth';
import {
  dateShift,
  getCalendarWeek,
  mondayOf,
  type CalendarBlock,
  type CalendarDay,
  type CalendarKind,
} from '@/server/doctor/queries';

export const metadata: Metadata = { title: 'Calendar · Doctor Portal' };

const START = 9 * 60;
const END = 19 * 60;
const HOUR_PX = 56;
const HEIGHT = ((END - START) / 60) * HOUR_PX;

const STYLE: Record<CalendarKind, string> = {
  available: 'bg-card',
  busy: 'bg-platinum/50 text-ink [background-image:repeating-linear-gradient(135deg,transparent_0_6px,rgb(255_255_255/0.5)_6px_12px)]',
  unavailable:
    'bg-mist text-body [background-image:repeating-linear-gradient(135deg,transparent_0_6px,rgb(255_255_255/0.6)_6px_12px)]',
  held: 'border border-dashed border-steel bg-pearl text-ink',
  booked: 'border-l-[3px] border-info bg-info-bg text-info',
  completed: 'border-l-[3px] border-success bg-success-bg text-success',
  no_show: 'border-l-[3px] border-danger bg-danger-bg text-danger',
  cancelled: 'bg-mist text-muted-foreground line-through',
};

const LEGEND: { kind: CalendarKind; label: string }[] = [
  { kind: 'available', label: 'Available' },
  { kind: 'busy', label: 'Busy · Google Calendar' },
  { kind: 'unavailable', label: 'Unavailable / leave' },
  { kind: 'held', label: 'Held · awaiting payment' },
  { kind: 'booked', label: 'Booked · paid' },
  { kind: 'completed', label: 'Completed' },
  { kind: 'no_show', label: 'No-show' },
  { kind: 'cancelled', label: 'Cancelled / rescheduled' },
];

const isDate = (v: unknown): v is string => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v);

function place(b: CalendarBlock) {
  const start = Math.max(START, Math.min(END, b.startMin));
  const end = Math.max(start, Math.min(END, b.endMin));
  return { top: ((start - START) / 60) * HOUR_PX, height: ((end - start) / 60) * HOUR_PX };
}

function dayLabel(date: string) {
  const wd = WEEKDAYS_MON_FIRST.find((w) => w.day === new Date(`${date}T12:00:00Z`).getUTCDay());
  return { short: wd?.short ?? '', long: wd?.long ?? '', num: Number(date.slice(8, 10)) };
}

function monthRange(week: string) {
  const fmt = (d: string) =>
    new Date(`${d}T12:00:00Z`).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      timeZone: 'UTC',
    });
  return `${fmt(week)} – ${fmt(dateShift(week, 6))} ${dateShift(week, 6).slice(0, 4)}`;
}

function DayColumn({ day }: { day: CalendarDay }) {
  return (
    <div
      className={cn(
        'relative border-l border-line',
        'bg-mist/50 [background-image:repeating-linear-gradient(135deg,transparent_0_7px,rgb(255_255_255/0.55)_7px_14px)]',
      )}
      style={{ height: HEIGHT }}
    >
      {/* availability + busy background */}
      {day.background.map((b, i) => {
        const { top, height } = place(b);
        if (height <= 0) return null;
        return (
          <div
            key={`bg-${i}`}
            className={cn('absolute inset-x-0', STYLE[b.kind])}
            style={{ top, height }}
            title={`${b.title} · ${formatMinutes(b.startMin)}–${formatMinutes(b.endMin)}`}
          >
            {b.kind !== 'available' ? (
              <span className="block truncate px-1.5 pt-1 text-[11px] font-medium">{b.title}</span>
            ) : null}
          </div>
        );
      })}
      {/* hour lines */}
      {Array.from({ length: (END - START) / 60 }, (_, h) => (
        <div
          key={h}
          aria-hidden
          className="pointer-events-none absolute inset-x-0 border-t border-line/70"
          style={{ top: h * HOUR_PX }}
        />
      ))}
      {day.leave ? (
        <div className="absolute inset-x-1 top-2 rounded-md bg-card px-2 py-1.5 text-center text-[12px] font-medium text-body shadow-card">
          On leave
        </div>
      ) : null}
      {day.appointments.map((b, i) => {
        const { top, height } = place(b);
        if (height <= 0) return null;
        return (
          <Link
            key={`ap-${i}`}
            href={b.href ?? '#'}
            className={cn(
              'absolute inset-x-1 overflow-hidden rounded-[6px] px-1.5 py-1 text-[12px] leading-tight shadow-card transition-shadow hover:shadow-raised focus-visible:ring-2 focus-visible:ring-ring',
              STYLE[b.kind],
            )}
            style={{ top: top + 1, height: Math.max(22, height - 2) }}
            title={`${formatMinutes(b.startMin)} · ${b.title} · ${b.sub ?? ''}`}
          >
            <span className="block truncate font-semibold">
              <span className="price">{formatMinutes(b.startMin)}</span> {b.title}
            </span>
            {height >= 40 ? <span className="block truncate opacity-90">{b.sub}</span> : null}
            <span className="sr-only">{b.sub}</span>
          </Link>
        );
      })}
    </div>
  );
}

function TimeGutter() {
  return (
    <div className="relative" style={{ height: HEIGHT }} aria-hidden>
      {Array.from({ length: (END - START) / 60 + 1 }, (_, h) => (
        <span
          key={h}
          className="price absolute right-2 -translate-y-1/2 text-[11px] text-muted-foreground"
          style={{ top: h * HOUR_PX }}
        >
          {formatMinutes(START + h * 60)}
        </span>
      ))}
    </div>
  );
}

export default async function CalendarPage({ searchParams }: PageProps<'/doctor/calendar'>) {
  await requireDoctorPage('/doctor/calendar');
  const sp = await searchParams;
  const now = new Date();
  const today = istDate(now);
  const week = mondayOf(isDate(sp.week) ? sp.week : today);
  const days = getCalendarWeek(week, now);
  const selected =
    isDate(sp.day) && days.some((d) => d.date === sp.day)
      ? sp.day
      : (days.find((d) => d.isToday)?.date ?? week);
  const selectedDay = days.find((d) => d.date === selected) ?? days[0];
  const counts = days.reduce(
    (acc, d) => {
      for (const a of d.appointments) acc[a.kind] = (acc[a.kind] ?? 0) + 1;
      return acc;
    },
    {} as Partial<Record<CalendarKind, number>>,
  );

  const nav = (
    <div className="flex items-center gap-1.5">
      <Button variant="outline" size="icon" className="size-10" asChild>
        <Link href={`/doctor/calendar?week=${dateShift(week, -7)}`} aria-label="Previous week">
          <ChevronLeft />
        </Link>
      </Button>
      <Button variant="outline" className="h-10" asChild>
        <Link href="/doctor/calendar">This week</Link>
      </Button>
      <Button variant="outline" size="icon" className="size-10" asChild>
        <Link href={`/doctor/calendar?week=${dateShift(week, 7)}`} aria-label="Next week">
          <ChevronRight />
        </Link>
      </Button>
    </div>
  );

  return (
    <>
      <PageHeader
        title="Calendar"
        description={`${monthRange(week)} · ${counts.booked ?? 0} booked, ${counts.completed ?? 0} completed, ${counts.held ?? 0} held · times IST`}
        actions={nav}
      />

      <ul className="mb-4 flex flex-wrap gap-x-4 gap-y-2" aria-label="Legend">
        {LEGEND.map((l) => (
          <li key={l.kind} className="flex items-center gap-1.5 text-[13px] text-body">
            <span
              aria-hidden
              className={cn('inline-block size-3.5 rounded-[4px] border border-line', STYLE[l.kind])}
            />
            {l.label}
          </li>
        ))}
      </ul>

      {/* Mobile: day view */}
      <div className="md:hidden">
        <div className="-mx-4 mb-3 flex gap-1.5 overflow-x-auto px-4 pb-1" role="tablist" aria-label="Day">
          {days.map((d) => {
            const l = dayLabel(d.date);
            const active = d.date === selectedDay?.date;
            return (
              <Link
                key={d.date}
                role="tab"
                aria-selected={active}
                href={`/doctor/calendar?week=${week}&day=${d.date}`}
                className={cn(
                  'flex min-h-14 min-w-12 flex-col items-center justify-center rounded-md border px-2 text-[13px]',
                  active ? 'border-obsidian bg-obsidian text-on-dark' : 'border-line bg-card text-body',
                )}
              >
                <span>{l.short}</span>
                <span className="price text-base font-semibold">{l.num}</span>
                {d.appointments.length ? (
                  <span className="sr-only">{d.appointments.length} appointments</span>
                ) : null}
              </Link>
            );
          })}
        </div>
        {selectedDay ? (
          <div className="overflow-hidden rounded-lg border border-line bg-card">
            <p className="border-b border-line px-3 py-2 text-sm font-medium text-ink">
              {dayLabel(selectedDay.date).long} {dayLabel(selectedDay.date).num}
              {selectedDay.isToday ? ' · Today' : ''} · {selectedDay.appointments.length} appointment
              {selectedDay.appointments.length === 1 ? '' : 's'}
            </p>
            <div className="grid grid-cols-[56px_1fr] pt-3 pb-2">
              <TimeGutter />
              <DayColumn day={selectedDay} />
            </div>
          </div>
        ) : null}
      </div>

      {/* Desktop: week view */}
      <div className="hidden overflow-x-auto rounded-lg border border-line bg-card md:block">
        <div className="min-w-[760px]">
          <div className="sticky top-0 z-10 grid grid-cols-[60px_repeat(7,minmax(0,1fr))] border-b border-line bg-card">
            <span />
            {days.map((d) => {
              const l = dayLabel(d.date);
              return (
                <Link
                  key={d.date}
                  href={`/doctor/calendar?week=${week}&day=${d.date}`}
                  className={cn('border-l border-line px-2 py-2.5 text-center', d.isToday && 'bg-mist/60')}
                >
                  <span className="block text-[13px] text-muted-foreground">{l.short}</span>
                  <span
                    className={cn(
                      'price mx-auto mt-0.5 flex size-8 items-center justify-center rounded-full text-base font-semibold',
                      d.isToday ? 'bg-obsidian text-on-dark' : 'text-ink',
                    )}
                  >
                    {l.num}
                  </span>
                  <span className="mt-0.5 block text-[12px] text-muted-foreground">
                    {d.leave ? 'Leave' : d.appointments.length ? `${d.appointments.length} appt` : 'No appts'}
                  </span>
                </Link>
              );
            })}
          </div>
          <div className="grid grid-cols-[60px_repeat(7,minmax(0,1fr))] pt-3 pb-3">
            <TimeGutter />
            {days.map((d) => (
              <DayColumn key={d.date} day={d} />
            ))}
          </div>
        </div>
      </div>
      <p className="mt-3 text-[13px] text-muted-foreground">
        Hatched areas are outside your working hours. Edit hours and leave in{' '}
        <Link href="/doctor/availability" className="text-brand underline underline-offset-2">
          Availability
        </Link>
        . Click an appointment to open its workspace.
      </p>
    </>
  );
}
