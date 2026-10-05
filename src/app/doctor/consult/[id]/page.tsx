import { ChevronLeft } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AppointmentChips } from '@/components/doctor/appointment-chips';
import { concernLabel } from '@/components/doctor/format';
import { PatientPane } from '@/components/doctor/patient-pane';
import { Workspace } from '@/components/doctor/workspace';
import { formatIst } from '@/lib/time';
import { DOCTOR, PLANS, PRODUCTS } from '@/server/demo/fixtures';
import { recordAudit } from '@/server/demo/store';
import { requireDoctorPage } from '@/server/doctor/auth';
import { PROTOCOLS } from '@/server/doctor/protocols';
import { getWorkspace } from '@/server/doctor/queries';
import { getScanForCustomer } from '@/server/journey/store';

export const metadata: Metadata = { title: 'Consultation · Doctor Portal' };

const CATEGORY: Record<string, string> = {
  drug: 'Prescription',
  supplement: 'Supplement',
  cosmetic: 'Cosmetic',
  ayurvedic: 'Ayurvedic',
  other: 'Other',
};

export default async function ConsultWorkspacePage({ params }: PageProps<'/doctor/consult/[id]'>) {
  const { id } = await params;
  const user = await requireDoctorPage(`/doctor/consult/${id}`);
  const ws = getWorkspace(id);
  if (!ws) notFound();
  const { appt, customer } = ws;

  // FR-M14-4: every clinical view is audited (target names the record, never its content).
  recordAudit(user.name, 'clinical.view', `Consult workspace · ${appt.code}`);
  const scan = getScanForCustomer(customer.id);
  if (scan) recordAudit(user.name, 'clinical.view', `3D scan assessment · ${appt.code}`);

  const initialNotes = {
    appointmentId: appt.id,
    chiefComplaint: ws.notes?.chiefComplaint ?? '',
    observations: ws.notes?.observations ?? '',
    assessment: ws.notes?.assessment ?? '',
    treatmentPlan: ws.notes?.treatmentPlan ?? '',
    followUpInstructions: ws.notes?.followUpInstructions ?? '',
    privateNotes: ws.notes?.privateNotes ?? '',
    identityVerified: ws.notes?.identityVerified ?? false,
    consentRecorded: ws.notes?.consentRecorded ?? false,
    followUpInWeeks: ws.notes?.followUpInWeeks ?? null,
  };

  return (
    <div className="-mt-2 md:-mt-4">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <Link
            href="/doctor"
            className="mb-1 inline-flex min-h-8 items-center gap-1 text-[13px] text-muted-foreground hover:text-ink"
          >
            <ChevronLeft className="size-4" aria-hidden />
            Today
          </Link>
          <h1 className="display text-[clamp(2rem,1.6rem+1.6vw,2.75rem)] leading-[1.1] break-words">
            {customer.name}
            <span className="ml-2 inline-block font-sans text-base font-normal whitespace-nowrap text-muted-foreground">
              · {concernLabel(appt.concern)}
            </span>
          </h1>
          <p className="mt-1 text-sm text-body">
            {formatIst(new Date(appt.startsAt), 'EEE d MMM, h:mm aaa')}–
            {formatIst(new Date(appt.endsAt), "h:mm aaa 'IST'")} · {appt.code} ·{' '}
            {appt.kind === 'follow_up' ? 'Follow-up' : 'First consultation'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <AppointmentChips appt={appt} />
        </div>
      </div>

      <Workspace
        appointmentId={appt.id}
        status={appt.status}
        patientName={customer.name}
        doctorName={DOCTOR.name}
        initialNotes={initialNotes}
        hasSavedNotes={ws.notes !== null}
        patientPane={
          <PatientPane
            appt={appt}
            customer={customer}
            intake={ws.intake}
            photoSets={ws.photoSets}
            pastConsults={ws.pastConsults}
            orders={ws.orders}
            checkins={ws.checkins}
            scan={scan}
          />
        }
        outcome={{
          patient: { name: customer.name, phone: customer.phone },
          protocols: PROTOCOLS,
          products: PRODUCTS.map((p) => ({
            id: p.id,
            name: p.name,
            tagline: p.tagline,
            category: CATEGORY[p.regulatoryCategory] ?? 'Other',
          })),
          plans: PLANS,
          quotes: ws.quotes,
          credit: ws.credit,
          creditWindowDays: ws.creditWindowDays,
          linkTtlHours: ws.linkTtlHours,
          recommendation: ws.recommendation,
          leadStage: ws.leadStage,
          prescriptionBase: {
            doctor: DOCTOR,
            patient: { name: customer.name, age: customer.age, gender: customer.gender },
            appointmentCode: appt.code,
            date: ws.recommendation?.createdAt ?? new Date().toISOString(),
          },
        }}
      />
    </div>
  );
}
