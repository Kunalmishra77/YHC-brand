import { ChevronLeft, FileText } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { formatWhen } from '@/components/account/format';
import { ACCOUNT_LINKS } from '@/components/account/links';
import { Button } from '@/components/ui/button';
import { requireRole } from '@/lib/rbac';
import {
  CONCERN_LABEL,
  findCustomerAppointment,
  hasPrescription,
  patientSummary,
} from '@/server/account/queries';
import { getDoctor } from '@/server/catalog';
import { recordAudit } from '@/server/demo/store';
import { getCurrentCustomer } from '@/server/session';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Consultation summary' };

export default async function ConsultationSummaryPage({ params }: PageProps<'/account/consultations/[id]'>) {
  const { id } = await params;
  const user = await requireRole(['customer']);
  const customer = await getCurrentCustomer();
  if (!customer) notFound();
  const appt = findCustomerAppointment(customer.id, id);
  // Patient-facing pick only — never privateNotes (FR-M4-3).
  const summary = appt ? patientSummary(customer.id, id) : null;
  if (!appt || !summary) notFound();
  recordAudit(user.name, 'clinical.view', `Consultation summary · ${appt.code}`);
  const doctor = getDoctor();

  const sections = [
    { title: 'What you told us', body: summary.chiefComplaint },
    { title: 'Doctor’s assessment (provisional)', body: summary.assessment },
    { title: 'Your treatment plan', body: summary.treatmentPlan },
    { title: 'What to do next', body: summary.followUpInstructions },
  ];

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/account/consultations"
        className="inline-flex min-h-11 items-center gap-1 text-sm font-medium text-brand hover:underline"
      >
        <ChevronLeft className="size-4" aria-hidden />
        All consultations
      </Link>
      <header className="mt-2">
        <p className="eyebrow">Consultation summary</p>
        <h1 className="display mt-2 text-[28px] md:text-[34px]">
          {formatWhen(appt.startsAt, 'EEEE d MMMM yyyy')}
        </h1>
        <p className="mt-2 text-body">
          {appt.kind === 'follow_up' ? 'Follow-up' : 'First consultation'} with {doctor.name} ·{' '}
          {CONCERN_LABEL[appt.concern]} · {appt.code}
        </p>
      </header>

      <div className="mt-8 divide-y divide-line rounded-xl border border-line bg-card">
        {sections.map((s) => (
          <section key={s.title} className="p-5 md:p-6">
            <h2 className="text-sm font-semibold text-ink">{s.title}</h2>
            <p className="mt-2 leading-relaxed text-body">{s.body}</p>
          </section>
        ))}
        {summary.followUpInWeeks ? (
          <section className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between md:p-6">
            <p className="text-sm text-body">
              {doctor.name} would like to see you again in about{' '}
              <strong className="text-ink">{summary.followUpInWeeks} weeks</strong>.
            </p>
            <Button asChild className="h-11 px-5">
              <Link href={ACCOUNT_LINKS.bookFollowUp}>Book follow-up</Link>
            </Button>
          </section>
        ) : null}
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        {hasPrescription(customer.id, appt.id) ? (
          <Button asChild variant="outline" className="h-11 shrink-0 px-5">
            <Link href={`/account/consultations/${appt.id}/prescription`}>
              <FileText className="size-4" aria-hidden />
              View prescription
            </Link>
          </Button>
        ) : null}
        <p className="text-[13px] text-muted-foreground">
          This summary is private to you and your doctor. Questions about it? Reply on WhatsApp and the care
          team will pass them on.
        </p>
      </div>
    </div>
  );
}
