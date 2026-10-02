import { Camera, ChevronLeft, ClipboardCheck, MessageCircle, Package, Stethoscope } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { genderLabel, initials, maskPhone } from '@/components/doctor/format';
import { PhotoPanel } from '@/components/doctor/photo-panel';
import { EmptyState } from '@/components/shared/states';
import { StatusChip } from '@/components/shared/status-chip';
import { formatIst } from '@/lib/time';
import { t } from '@/i18n/en';
import { recordAudit } from '@/server/demo/store';
import { requireDoctorPage } from '@/server/doctor/auth';
import { getPatientFile, type TimelineEntry } from '@/server/doctor/queries';

export const metadata: Metadata = { title: 'Patient file · Doctor Portal' };

const ICON: Record<TimelineEntry['kind'], React.ReactNode> = {
  consult: <Stethoscope className="size-4" aria-hidden />,
  recommendation: <ClipboardCheck className="size-4" aria-hidden />,
  order: <Package className="size-4" aria-hidden />,
  checkin: <MessageCircle className="size-4" aria-hidden />,
  photos: <Camera className="size-4" aria-hidden />,
};

export default async function PatientFilePage({ params }: PageProps<'/doctor/patients/[customerId]'>) {
  const { customerId } = await params;
  const user = await requireDoctorPage(`/doctor/patients/${customerId}`);
  const file = getPatientFile(customerId);
  if (!file) notFound();
  const { customer } = file;
  const latestCode = file.consults[0]?.appt.code ?? customer.id;
  recordAudit(user.name, 'clinical.view', `Patient file · ${latestCode}`);

  const dateLabel = (d: string) => formatIst(new Date(`${d}T06:30:00Z`), 'd MMM yyyy');
  const sets = [...file.photos]
    .reverse()
    .map((p) => ({ id: p.id, label: p.label, takenOn: dateLabel(p.takenOn) }));
  const current = sets.at(-1) ?? null;
  const upcoming = file.consults.find((c) => c.appt.status === 'booked');

  return (
    <>
      <Link
        href="/doctor/patients"
        className="mb-2 inline-flex min-h-8 items-center gap-1 text-[13px] text-muted-foreground hover:text-ink"
      >
        <ChevronLeft className="size-4" aria-hidden />
        Patients
      </Link>
      <div className="mb-6 flex flex-col gap-4 rounded-lg border border-line bg-card p-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <span
            aria-hidden
            className="flex size-14 shrink-0 items-center justify-center rounded-full bg-obsidian text-lg font-semibold text-on-dark"
          >
            {initials(customer.name)}
          </span>
          <div>
            <h1 className="text-xl font-semibold text-ink md:text-2xl">{customer.name}</h1>
            <p className="text-sm text-body">
              {customer.age} · {genderLabel(customer.gender)} · {customer.city} ·{' '}
              <span className="price">{maskPhone(customer.phone)}</span>
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusChip tone={file.plan.tone}>{file.plan.label}</StatusChip>
          {file.leadStage ? (
            <StatusChip tone="neutral">{t(`status.leadStage.${file.leadStage}`)}</StatusChip>
          ) : null}
          {upcoming ? (
            <Link href={`/doctor/consult/${upcoming.appt.id}`}>
              <StatusChip tone="info">
                Next: {formatIst(new Date(upcoming.appt.startsAt), 'EEE d MMM, h:mm aaa')}
              </StatusChip>
            </Link>
          ) : null}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <section aria-labelledby="timeline">
          <h2 id="timeline" className="mb-3 text-base font-semibold text-ink">
            Timeline
          </h2>
          {file.timeline.length === 0 ? (
            <EmptyState
              title="Nothing yet"
              body="Consultations, plans, orders and check-ins will appear here."
            />
          ) : (
            <ol className="relative space-y-3 border-l border-line pl-5">
              {file.timeline.map((e, i) => (
                <li key={`${e.kind}-${i}`} className="relative">
                  <span className="absolute top-3 -left-[31px] flex size-6 items-center justify-center rounded-full border border-line bg-card text-steel">
                    {ICON[e.kind]}
                  </span>
                  <div className="rounded-md border border-line bg-card px-4 py-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      {e.href ? (
                        <Link href={e.href} className="text-sm font-medium text-ink hover:underline">
                          {e.title}
                        </Link>
                      ) : (
                        <p className="text-sm font-medium text-ink">{e.title}</p>
                      )}
                      <StatusChip tone={e.chip.tone}>{e.chip.label}</StatusChip>
                    </div>
                    <p className="mt-1 text-[13px] text-body">{e.detail}</p>
                    <p className="mt-1 text-[12px] text-muted-foreground">{formatIst(new Date(e.at))}</p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>

        <aside className="space-y-6">
          <section aria-labelledby="photos" className="rounded-lg border border-line bg-card p-4">
            <h2 id="photos" className="mb-3 text-base font-semibold text-ink">
              Progress photos
            </h2>
            <PhotoPanel current={current} previous={sets.slice(0, -1)} patientName={customer.name} />
            {sets.length ? (
              <ul className="mt-3 space-y-1 text-[13px] text-body">
                {[...sets].reverse().map((s) => (
                  <li key={s.id}>
                    {s.label} · {s.takenOn}
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
          <section aria-labelledby="consults" className="rounded-lg border border-line bg-card p-4">
            <h2 id="consults" className="mb-3 text-base font-semibold text-ink">
              Consultations
            </h2>
            {file.consults.length === 0 ? (
              <p className="text-sm text-muted-foreground">None yet.</p>
            ) : (
              <ul className="space-y-2">
                {file.consults.map(({ appt, notes }) => (
                  <li key={appt.id} className="rounded-md bg-pearl px-3 py-2">
                    <Link
                      href={`/doctor/consult/${appt.id}`}
                      className="text-sm font-medium text-ink hover:underline"
                    >
                      {formatIst(new Date(appt.startsAt), 'd MMM yyyy, h:mm aaa')} · {appt.code}
                    </Link>
                    <p className="text-[13px] text-body">
                      {t(`status.appointment.${appt.status}`)}
                      {notes?.followUpInWeeks ? ` · follow-up in ${notes.followUpInWeeks} weeks` : ''}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>
    </>
  );
}
