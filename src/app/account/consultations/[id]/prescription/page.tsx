import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { formatWhen } from '@/components/account/format';
import { PrintButton } from '@/components/account/print-button';
import { t } from '@/i18n/en';
import { requireRole } from '@/lib/rbac';
import { prescriptionFor } from '@/server/account/queries';
import { recordAudit } from '@/server/demo/store';
import { getCurrentCustomer } from '@/server/session';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Prescription' };

const GENDER = { male: 'Male', female: 'Female', other: 'Other' } as const;

/*
 * Printable HTML prescription (FR-M4-3).
 * TODO(phase-05): signed PDF via @react-pdf/renderer (`prescription.render` job) and download link.
 * TODO(client): letterhead artwork, doctor's full name, registration no. and council — see docs/12 C.
 */
export default async function PrescriptionPage({
  params,
}: PageProps<'/account/consultations/[id]/prescription'>) {
  const { id } = await params;
  const user = await requireRole(['customer']);
  const customer = await getCurrentCustomer();
  if (!customer) notFound();
  const rx = prescriptionFor(customer.id, id);
  if (!rx) notFound();
  recordAudit(user.name, 'clinical.view', `Prescription · ${rx.appointment.code}`);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link
          href={`/account/consultations/${rx.appointment.id}`}
          className="inline-flex min-h-11 items-center gap-1 text-sm font-medium text-brand hover:underline"
        >
          <ChevronLeft className="size-4" aria-hidden />
          Consultation summary
        </Link>
        <PrintButton />
      </div>

      <article className="mt-4 rounded-xl border border-line bg-white p-5 shadow-card md:p-10 print:mt-0 print:rounded-none print:border-0 print:p-0 print:shadow-none">
        {/* Letterhead */}
        <header className="flex flex-col gap-4 border-b-2 border-obsidian pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-display text-[28px] leading-none font-medium text-ink">{t('brand.name')}</p>
            <p className="mt-1 text-[13px] tracking-[0.12em] text-brand uppercase">{t('brand.tagline')}</p>
          </div>
          <div className="text-sm sm:text-right">
            <p className="font-semibold text-ink">{rx.doctor.name}</p>
            <p className="text-body">{rx.doctor.qualifications}</p>
            <p className="text-body">
              Reg. No. {rx.doctor.registrationNo} · {rx.doctor.council}
            </p>
          </div>
        </header>

        {/* Patient */}
        <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <dt className="text-muted-foreground">Patient</dt>
            <dd className="font-medium text-ink">{customer.name}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Age / Gender</dt>
            <dd className="font-medium text-ink">
              {customer.age} y · {GENDER[customer.gender]}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Date</dt>
            <dd className="font-medium text-ink">{formatWhen(rx.appointment.startsAt, 'd MMM yyyy')}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Rx no.</dt>
            <dd className="price text-ink">{rx.rxNo}</dd>
          </div>
        </dl>
        <p className="mt-3 text-[13px] text-muted-foreground">
          Video consultation · {rx.appointment.code} · {formatWhen(rx.appointment.startsAt)}
        </p>

        {/* Rx */}
        <section aria-labelledby="rx-heading" className="mt-8">
          <h2 id="rx-heading" className="font-display text-[32px] leading-none text-ink">
            ℞
          </h2>

          {/* Mobile: stacked */}
          <ol className="mt-4 space-y-3 sm:hidden print:hidden">
            {rx.items.map((item, i) => (
              <li key={`${item.genericName}-${i}`} className="rounded-lg border border-line p-4">
                <p className="font-semibold text-ink">
                  {i + 1}. {item.genericName}
                </p>
                <p className="mt-0.5 text-sm text-body">Strength: {item.strength}</p>
                <p className="mt-2 text-sm text-body">
                  {item.dosage} · {item.frequency} · {item.duration}
                </p>
                {item.instructions ? (
                  <p className="mt-1 text-sm text-muted-foreground">{item.instructions}</p>
                ) : null}
              </li>
            ))}
          </ol>

          {/* Tablet+ and print: table */}
          <table className="mt-4 hidden w-full border-collapse text-left text-sm sm:table print:table">
            <thead>
              <tr className="border-b border-line text-[13px] text-muted-foreground">
                <th scope="col" className="py-2 pr-3 font-medium">
                  #
                </th>
                <th scope="col" className="py-2 pr-3 font-medium">
                  Medicine
                </th>
                <th scope="col" className="py-2 pr-3 font-medium">
                  Dose
                </th>
                <th scope="col" className="py-2 pr-3 font-medium">
                  When
                </th>
                <th scope="col" className="py-2 pr-3 font-medium">
                  Duration
                </th>
                <th scope="col" className="py-2 font-medium">
                  Instructions
                </th>
              </tr>
            </thead>
            <tbody>
              {rx.items.map((item, i) => (
                <tr key={`${item.genericName}-${i}`} className="border-b border-line align-top">
                  <td className="py-3 pr-3 text-muted-foreground">{i + 1}</td>
                  <td className="py-3 pr-3">
                    <p className="font-medium text-ink">{item.genericName}</p>
                    <p className="text-[13px] text-muted-foreground">{item.strength}</p>
                  </td>
                  <td className="py-3 pr-3 text-body">{item.dosage}</td>
                  <td className="py-3 pr-3 text-body">{item.frequency}</td>
                  <td className="py-3 pr-3 text-body">{item.duration}</td>
                  <td className="py-3 text-body">{item.instructions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {rx.advice.length ? (
          <section aria-labelledby="advice-heading" className="mt-8">
            <h2 id="advice-heading" className="text-sm font-semibold text-ink">
              Advice
            </h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-body">
              {rx.advice.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </section>
        ) : null}

        <footer className="mt-10 flex flex-col gap-6 border-t border-line pt-5 sm:flex-row sm:items-end sm:justify-between">
          <p className="max-w-md text-[13px] text-muted-foreground">
            This is an electronically generated prescription issued after a video consultation and does not
            need a physical signature. Use only as directed. If you notice any side effect, stop and message
            us.
          </p>
          <div className="text-sm sm:text-right">
            <p className="font-semibold text-ink">{rx.doctor.name}</p>
            <p className="text-[13px] text-muted-foreground">
              Reg. No. {rx.doctor.registrationNo} · issued {formatWhen(rx.issuedAt, 'd MMM yyyy')}
            </p>
          </div>
        </footer>
      </article>
    </div>
  );
}
