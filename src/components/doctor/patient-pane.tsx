import { FileText, MessageCircleQuestion, Package, Stethoscope } from 'lucide-react';
import Link from 'next/link';
import { concernLabel, genderLabel, initials, maskPhone } from '@/components/doctor/format';
import { PhotoPanel } from '@/components/doctor/photo-panel';
import { ScanSummary } from '@/components/doctor/scan-summary';
import { StatusChip, type ChipTone } from '@/components/shared/status-chip';
import type {
  Appointment,
  CareCheckin,
  ConsultationNotes,
  Customer,
  IntakeForm,
  Order,
  ProgressPhotoSet,
} from '@/lib/domain/types';
import type { ScanResult } from '@/lib/journey/types';
import { formatINR } from '@/lib/money';
import { formatIst } from '@/lib/time';
import { t } from '@/i18n/en';
import { cn } from '@/lib/utils';

export function PaneSection({
  title,
  children,
  aside,
  className,
}: {
  title: string;
  children: React.ReactNode;
  aside?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('border-b border-line px-4 py-4 last:border-b-0 md:px-5', className)}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-[13px] font-semibold tracking-[0.1em] text-brand uppercase">{title}</h3>
        {aside}
      </div>
      {children}
    </section>
  );
}

const isNone = (v: string) => /^(none|none known|none reported|not sure|no|—|-)?$/i.test(v.trim());

const INTAKE_FIELDS: { key: keyof Omit<IntakeForm, 'appointmentId'>; label: string; flag?: boolean }[] = [
  { key: 'duration', label: 'Duration' },
  { key: 'pattern', label: 'Pattern' },
  { key: 'previousTreatments', label: 'Previous treatments' },
  { key: 'currentProducts', label: 'Current products' },
  { key: 'medicalHistory', label: 'Medical history', flag: true },
  { key: 'medications', label: 'Medications', flag: true },
  { key: 'allergies', label: 'Allergies', flag: true },
  { key: 'familyHistory', label: 'Family history' },
];

function replyChip(reply: CareCheckin['reply']): { tone: ChipTone; label: string } {
  if (reply === 'going_well') return { tone: 'success', label: 'Going well' };
  if (reply === 'have_questions') return { tone: 'warning', label: 'Has questions' };
  if (reply === 'side_effect') return { tone: 'danger', label: 'Possible side effect' };
  return { tone: 'neutral', label: 'No reply' };
}

export function PatientPane({
  appt,
  customer,
  intake,
  photoSets,
  pastConsults,
  orders,
  checkins,
  scan = null,
}: {
  appt: Appointment;
  customer: Customer;
  intake: IntakeForm | null;
  photoSets: ProgressPhotoSet[];
  pastConsults: { appt: Appointment; notes: ConsultationNotes | null }[];
  orders: Order[];
  checkins: CareCheckin[];
  /** 3D scan assessment (ADR-26) — the page must audit clinical.view before passing it */
  scan?: ScanResult | null;
}) {
  const dateLabel = (d: string) => formatIst(new Date(`${d}T06:30:00Z`), 'd MMM yyyy');
  const current = appt.photosDone
    ? {
        id: `intake-${appt.id}`,
        label: 'This consultation (intake)',
        takenOn: formatIst(new Date(appt.startsAt), 'd MMM yyyy'),
      }
    : null;
  const previous = photoSets
    .filter((p) => p.takenOn < appt.startsAt.slice(0, 10) || !current)
    .map((p) => ({ id: p.id, label: p.label, takenOn: dateLabel(p.takenOn) }));

  return (
    <div>
      <PaneSection title="Patient">
        <div className="flex items-start gap-3">
          <span
            aria-hidden
            className="flex size-12 shrink-0 items-center justify-center rounded-full bg-obsidian text-[15px] font-semibold text-on-dark"
          >
            {initials(customer.name)}
          </span>
          <div className="min-w-0">
            <p className="text-lg leading-tight font-semibold text-ink">{customer.name}</p>
            <p className="mt-0.5 text-sm text-body">
              {customer.age} · {genderLabel(customer.gender)} · {customer.city}
            </p>
            <p className="price mt-0.5 text-[13px] text-muted-foreground">{maskPhone(customer.phone)}</p>
          </div>
        </div>
        <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-md bg-mist/60 px-3 py-2">
            <dt className="text-[12px] text-body">Concern</dt>
            <dd className="font-medium text-ink">{concernLabel(appt.concern)}</dd>
          </div>
          <div className="rounded-md bg-mist/60 px-3 py-2">
            <dt className="text-[12px] text-body">Visit</dt>
            <dd className="font-medium text-ink">
              {appt.kind === 'follow_up' ? 'Follow-up' : 'First consultation'}
            </dd>
          </div>
        </dl>
        <p className="mt-3">
          <Link
            href={`/doctor/patients/${customer.id}`}
            className="text-[13px] text-brand underline underline-offset-2 hover:text-ink"
          >
            Open full patient file
          </Link>
        </p>
      </PaneSection>

      <PaneSection
        title="Hair profile (intake)"
        aside={
          intake ? (
            <StatusChip tone="success">Intake done</StatusChip>
          ) : (
            <StatusChip tone="warning">Intake missing</StatusChip>
          )
        }
      >
        {intake ? (
          <dl className="space-y-2.5">
            {INTAKE_FIELDS.map((f) => {
              const value = intake[f.key];
              const flagged = f.flag && !isNone(value);
              return (
                <div key={f.key} className="grid grid-cols-[120px_1fr] gap-2 text-sm">
                  <dt className="text-muted-foreground">{f.label}</dt>
                  <dd className={cn('text-ink', flagged && 'font-medium')}>
                    {flagged ? (
                      <span
                        className="mr-1.5 inline-block size-1.5 translate-y-[-2px] rounded-full bg-warning"
                        aria-hidden
                      />
                    ) : null}
                    {value || '—'}
                    {flagged ? <span className="sr-only"> (review)</span> : null}
                  </dd>
                </div>
              );
            })}
          </dl>
        ) : (
          <p className="text-sm text-body">
            The patient has not completed the hair profile. Take history on the call and note it under
            observations.
          </p>
        )}
      </PaneSection>

      {scan ? (
        <PaneSection title="3D scan assessment">
          <ScanSummary scan={scan} />
        </PaneSection>
      ) : null}

      <PaneSection title="Scalp photos">
        <PhotoPanel current={current} previous={previous} patientName={customer.name} />
      </PaneSection>

      <PaneSection title="History">
        <div className="space-y-4">
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-sm font-medium text-ink">
              <Stethoscope className="size-4 text-steel" aria-hidden /> Past consultations
            </p>
            {pastConsults.length === 0 ? (
              <p className="text-[13px] text-muted-foreground">First consultation — no earlier visits.</p>
            ) : (
              <ul className="space-y-2">
                {pastConsults.map(({ appt: a, notes }) => (
                  <li key={a.id} className="rounded-md border border-line bg-card px-3 py-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <Link
                        href={`/doctor/consult/${a.id}`}
                        className="text-sm font-medium text-ink hover:underline"
                      >
                        {formatIst(new Date(a.startsAt), 'd MMM yyyy')} · {a.code}
                      </Link>
                      <StatusChip tone={a.status === 'completed' ? 'success' : 'danger'}>
                        {t(`status.appointment.${a.status}`)}
                      </StatusChip>
                    </div>
                    {notes ? (
                      <p className="mt-1 text-[13px] text-body">
                        {notes.assessment}
                        {notes.treatmentPlan ? ` — ${notes.treatmentPlan}` : ''}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-sm font-medium text-ink">
              <Package className="size-4 text-steel" aria-hidden /> Orders
            </p>
            {orders.length === 0 ? (
              <p className="text-[13px] text-muted-foreground">No orders yet.</p>
            ) : (
              <ul className="space-y-2">
                {orders.map((o) => (
                  <li
                    key={o.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-line bg-card px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink">
                        {o.code} · <span className="price">{formatINR(o.totalPaise)}</span>
                      </p>
                      <p className="truncate text-[13px] text-muted-foreground">
                        {o.lines.map((l) => l.label).join(', ')}
                      </p>
                    </div>
                    <StatusChip
                      tone={
                        o.status === 'delivered'
                          ? 'success'
                          : o.status === 'pending_payment'
                            ? 'warning'
                            : 'info'
                      }
                    >
                      {t(`status.order.${o.status}`)}
                    </StatusChip>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-sm font-medium text-ink">
              <MessageCircleQuestion className="size-4 text-steel" aria-hidden /> Check-in replies
            </p>
            {checkins.length === 0 ? (
              <p className="text-[13px] text-muted-foreground">No check-ins sent yet.</p>
            ) : (
              <ul className="space-y-2">
                {checkins.map((c) => {
                  const chip = replyChip(c.reply);
                  return (
                    <li key={c.id} className="rounded-md border border-line bg-card px-3 py-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm text-ink">Week {c.week}</p>
                        <StatusChip tone={chip.tone}>{chip.label}</StatusChip>
                      </div>
                      {c.replyText ? <p className="mt-1 text-[13px] text-body">“{c.replyText}”</p> : null}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
          <p className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
            <FileText className="size-3.5" aria-hidden />
            Viewing this file is recorded in the audit log.
          </p>
        </div>
      </PaneSection>
    </div>
  );
}
