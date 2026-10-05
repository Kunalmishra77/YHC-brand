import { CalendarCheck2, RefreshCw } from 'lucide-react';
import type { Metadata } from 'next';
import { AvailabilityEditor } from '@/components/doctor/availability-editor';
import { PageHeader } from '@/components/shared/page-header';
import { StatusChip } from '@/components/shared/status-chip';
import { Button } from '@/components/ui/button';
import { formatIst, istDate } from '@/lib/time';
import { getAvailabilityConfig, getSetting, getSlots } from '@/server/demo/store';
import { requireDoctorPage } from '@/server/doctor/auth';

export const metadata: Metadata = { title: 'Availability · Doctor Portal' };

const SETTINGS: { key: string; label: string; unit: (v: string) => string }[] = [
  { key: 'consult.slot_minutes', label: 'Slot length', unit: (v) => `${v} minutes` },
  { key: 'consult.buffer_minutes', label: 'Buffer between consults', unit: (v) => `${v} minutes` },
  { key: 'consult.max_per_day', label: 'Maximum per day', unit: (v) => `${v} consultations` },
  { key: 'consult.booking_window_days', label: 'Booking window', unit: (v) => `${v} days ahead` },
  {
    key: 'consult.min_notice_minutes',
    label: 'Minimum notice',
    unit: (v) => (Number(v) % 60 === 0 ? `${Number(v) / 60} hour${v === '60' ? '' : 's'}` : `${v} minutes`),
  },
];

export default async function AvailabilityPage() {
  await requireDoctorPage('/doctor/availability');
  const now = new Date();
  const cfg = getAvailabilityConfig();
  const preview = getSlots(now).slice(0, 3);
  const initial = {
    weeklyRules: Object.fromEntries(
      Object.entries(cfg.weeklyRules).map(([k, v]) => [k, v.map((r) => ({ ...r }))]),
    ),
    exceptions: cfg.exceptions.map((e) => ({ ...e, range: e.range ? { ...e.range } : null })),
  };
  const busyCount = cfg.busyBlocks.filter((b) => new Date(b.endsAt) > now).length;

  return (
    <>
      <PageHeader
        title="Availability"
        description="When patients can book you. Times are IST. Google Calendar busy time is blocked automatically."
      />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,1fr)]">
        <AvailabilityEditor initial={initial} minDate={istDate(now)} />

        <aside className="space-y-5">
          <section
            aria-labelledby="preview"
            className="rounded-xl bg-card p-4 shadow-card ring-1 ring-line/80 md:p-5"
          >
            <h2 id="preview" className="text-base font-semibold text-ink">
              Bookable slots · next 3 days
            </h2>
            <p className="text-[13px] text-muted-foreground">
              What patients see right now, after bookings and busy time.
            </p>
            <div className="mt-4 space-y-4">
              {preview.map((d) => (
                <div key={d.date}>
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-ink">
                      {formatIst(new Date(`${d.date}T06:30:00Z`), 'EEE d MMM')}
                      {d.date === istDate(now) ? ' · Today' : ''}
                    </p>
                    <StatusChip tone={d.remaining ? 'success' : 'neutral'}>
                      {d.remaining ? `${d.remaining} open` : 'No open slots'}
                    </StatusChip>
                  </div>
                  {d.slots.length ? (
                    <ul className="flex flex-wrap gap-1.5">
                      {d.slots.map((s) => (
                        <li
                          key={s.startsAt.toISOString()}
                          className="price rounded-md border border-line bg-pearl px-2 py-1 text-[13px] text-ink"
                        >
                          {formatIst(s.startsAt, 'h:mm aaa')}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-[13px] text-muted-foreground">
                      Fully booked, off, or past the notice time.
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section
            aria-labelledby="rules"
            className="rounded-xl bg-card p-4 shadow-card ring-1 ring-line/80 md:p-5"
          >
            <h2 id="rules" className="text-base font-semibold text-ink">
              Booking rules
            </h2>
            <dl className="mt-3 divide-y divide-line text-sm">
              {SETTINGS.map((s) => (
                <div key={s.key} className="flex justify-between gap-3 py-2">
                  <dt className="text-body">{s.label}</dt>
                  <dd className="text-ink">{s.unit(getSetting(s.key))}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-2 text-[13px] text-muted-foreground">
              Read-only here — edit in Admin › Settings.
            </p>
          </section>

          <section
            aria-labelledby="gcal"
            className="rounded-xl bg-card p-4 shadow-card ring-1 ring-line/80 md:p-5"
          >
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-mist text-ink">
                <CalendarCheck2 className="size-5" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <h2 id="gcal" className="text-base font-semibold text-ink">
                  Google Calendar
                </h2>
                <p className="mt-0.5">
                  <StatusChip tone="success">Connected · last sync 2 min ago</StatusChip>
                </p>
                <p className="mt-2 text-[13px] text-body">
                  Two-way sync: your busy events block booking ({busyCount} upcoming), and consultations
                  appear in your calendar as “YHC consultation” — no patient details.
                </p>
              </div>
            </div>
            {/* TODO(client): Google Cloud OAuth client + doctor's Google account consent — see docs/12 */}
            <div className="mt-3 flex flex-wrap gap-2">
              <Button type="button" variant="outline" className="h-10" disabled>
                <RefreshCw aria-hidden />
                Sync now
              </Button>
              <Button type="button" variant="ghost" className="h-10" disabled>
                Disconnect
              </Button>
            </div>
            <p className="mt-2 text-[12px] text-muted-foreground">
              Demo state. Real OAuth connect arrives with Phase 05.
            </p>
          </section>
        </aside>
      </div>
    </>
  );
}
