import { Search, Users } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { genderLabel, maskPhone } from '@/components/doctor/format';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/states';
import { StatusChip } from '@/components/shared/status-chip';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatIst } from '@/lib/time';
import { requireDoctorPage } from '@/server/doctor/auth';
import { appointmentChip, searchPatients } from '@/server/doctor/queries';

export const metadata: Metadata = { title: 'Patients · Doctor Portal' };

export default async function PatientsPage({ searchParams }: PageProps<'/doctor/patients'>) {
  await requireDoctorPage('/doctor/patients');
  const sp = await searchParams;
  const q = typeof sp.q === 'string' ? sp.q.slice(0, 80) : '';
  const rows = searchPatients(q);

  return (
    <>
      <PageHeader
        title="Patients"
        description={
          q
            ? `${rows.length} match${rows.length === 1 ? '' : 'es'} for “${q}”`
            : `${rows.length} patients with a consultation`
        }
      />
      <form action="/doctor/patients" role="search" className="mb-5 flex max-w-xl gap-2">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-steel"
            aria-hidden
          />
          <label htmlFor="patients-q" className="sr-only">
            Search by name, phone or appointment code
          </label>
          <Input
            id="patients-q"
            name="q"
            type="search"
            defaultValue={q}
            placeholder="Name, phone or YHC-A-1002"
            className="h-11 bg-card pl-9"
          />
        </div>
        <Button type="submit" className="h-11">
          Search
        </Button>
        {q ? (
          <Button variant="ghost" className="h-11" asChild>
            <Link href="/doctor/patients">Clear</Link>
          </Button>
        ) : null}
      </form>

      {rows.length === 0 ? (
        <EmptyState
          icon={q ? Search : Users}
          title={q ? 'No patients match' : 'No patients yet'}
          body={
            q
              ? 'Try a first name, the last 4 digits of the phone number, or the full appointment code.'
              : 'Patients appear here after their first paid consultation.'
          }
        />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-lg border border-line bg-card md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-mist text-[13px] text-ink">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Patient</th>
                  <th className="px-4 py-2.5 font-medium">Phone</th>
                  <th className="px-4 py-2.5 font-medium">Last consultation</th>
                  <th className="px-4 py-2.5 font-medium">Next</th>
                  <th className="px-4 py-2.5 font-medium">Plan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((r) => (
                  <tr key={r.customer.id} className="hover:bg-pearl">
                    <td className="px-4 py-3">
                      <Link
                        href={`/doctor/patients/${r.customer.id}`}
                        className="font-medium text-ink hover:underline"
                      >
                        {r.customer.name}
                      </Link>
                      <p className="text-[13px] text-muted-foreground">
                        {r.customer.age} · {genderLabel(r.customer.gender)} · {r.customer.city}
                      </p>
                    </td>
                    <td className="price px-4 py-3 text-[13px] text-body">{maskPhone(r.customer.phone)}</td>
                    <td className="px-4 py-3">
                      {r.last ? (
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-body">
                            {formatIst(new Date(r.last.startsAt), 'd MMM yyyy')}
                          </span>
                          <StatusChip tone={appointmentChip(r.last).tone}>
                            {appointmentChip(r.last).label}
                          </StatusChip>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-body">
                      {r.next ? (
                        <Link href={`/doctor/consult/${r.next.id}`} className="hover:underline">
                          {formatIst(new Date(r.next.startsAt), 'EEE d MMM, h:mm aaa')}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusChip tone={r.plan.tone}>{r.plan.label}</StatusChip>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Mobile list */}
          <ul className="space-y-2 md:hidden">
            {rows.map((r) => (
              <li key={r.customer.id}>
                <Link
                  href={`/doctor/patients/${r.customer.id}`}
                  className="block rounded-lg border border-line bg-card px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-ink">{r.customer.name}</p>
                      <p className="text-[13px] text-muted-foreground">
                        {r.customer.age} · {genderLabel(r.customer.gender)} · {r.customer.city}
                      </p>
                    </div>
                    <span className="price shrink-0 text-[13px] text-body">
                      {maskPhone(r.customer.phone)}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {r.last ? (
                      <StatusChip tone={appointmentChip(r.last).tone}>
                        {formatIst(new Date(r.last.startsAt), 'd MMM')} · {appointmentChip(r.last).label}
                      </StatusChip>
                    ) : null}
                    <StatusChip tone={r.plan.tone}>{r.plan.label}</StatusChip>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}
