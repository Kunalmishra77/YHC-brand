'use client';

import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { Doctor, PrescriptionItem } from '@/lib/domain/types';
import { formatIst } from '@/lib/time';
import { genderLabel } from '@/components/doctor/format';

export interface PrescriptionData {
  doctor: Doctor;
  patient: { name: string; age: number; gender: 'male' | 'female' | 'other' };
  appointmentCode: string;
  date: string; // ISO
  chiefComplaint: string;
  assessment: string;
  items: PrescriptionItem[];
  advice: string;
  followUpInWeeks: number | null;
}

/**
 * HTML prescription preview (FR-M5-7, TRD §8). Never includes private notes.
 * TODO(phase-05): @react-pdf/renderer PDF stored privately and shared with the patient.
 * TODO(client): doctor signature image, full registration details — see docs/12 C.
 */
export function PrescriptionPreview({
  data,
  trigger,
}: {
  data: PrescriptionData;
  trigger?: React.ReactNode;
}) {
  const items = data.items.filter((i) => i.genericName.trim());
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button type="button" variant="outline" className="h-11 w-full">
            <FileText aria-hidden />
            Preview prescription
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[92dvh] overflow-y-auto p-0 sm:max-w-3xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Prescription preview</DialogTitle>
          <DialogDescription>How the prescription will look for {data.patient.name}.</DialogDescription>
        </DialogHeader>
        <article className="bg-card p-5 text-[14px] text-ink sm:p-8" aria-label="Prescription">
          <header className="flex flex-col gap-3 border-b-2 border-obsidian pb-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-display text-[30px] leading-none font-medium text-ink">Your Hair Company</p>
              <p className="mt-1 text-[13px] tracking-[0.12em] text-brand uppercase">Doctor-led hair care</p>
            </div>
            <div className="sm:text-right">
              <p className="text-base font-semibold">{data.doctor.name}</p>
              <p className="text-[13px] text-body">{data.doctor.qualifications}</p>
              <p className="text-[13px] text-body">
                Reg. No. {data.doctor.registrationNo} · {data.doctor.council}
              </p>
            </div>
          </header>

          <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1.5 text-[13px] sm:grid-cols-4">
            <div>
              <dt className="text-muted-foreground">Patient</dt>
              <dd className="font-medium">{data.patient.name}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Age / gender</dt>
              <dd className="font-medium">
                {data.patient.age} · {genderLabel(data.patient.gender)}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Date</dt>
              <dd className="font-medium">{formatIst(new Date(data.date), 'd MMM yyyy')}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Ref.</dt>
              <dd className="font-medium">{data.appointmentCode}</dd>
            </div>
          </dl>

          {data.chiefComplaint || data.assessment ? (
            <div className="mt-4 space-y-1 rounded-md bg-pearl px-4 py-3 text-[13px]">
              {data.chiefComplaint ? (
                <p>
                  <span className="text-muted-foreground">Chief complaint: </span>
                  {data.chiefComplaint}
                </p>
              ) : null}
              {data.assessment ? (
                <p>
                  <span className="text-muted-foreground">Diagnosis (provisional): </span>
                  {data.assessment}
                </p>
              ) : null}
            </div>
          ) : null}

          <p className="mt-5 font-display text-[32px] leading-none" aria-label="Prescription">
            ℞
          </p>
          {items.length === 0 ? (
            <p className="mt-2 text-[13px] text-muted-foreground">No prescription items yet.</p>
          ) : (
            <div className="mt-2 overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse text-left text-[13px]">
                <thead>
                  <tr className="border-b border-line text-muted-foreground">
                    <th className="py-2 pr-3 font-medium">#</th>
                    <th className="py-2 pr-3 font-medium">Generic name</th>
                    <th className="py-2 pr-3 font-medium">Strength</th>
                    <th className="py-2 pr-3 font-medium">Dosage</th>
                    <th className="py-2 pr-3 font-medium">Frequency</th>
                    <th className="py-2 pr-3 font-medium">Duration</th>
                    <th className="py-2 font-medium">Instructions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={i} className="border-b border-line align-top">
                      <td className="py-2 pr-3 text-muted-foreground">{i + 1}</td>
                      <td className="py-2 pr-3 font-medium">{item.genericName}</td>
                      <td className="py-2 pr-3">{item.strength || '—'}</td>
                      <td className="py-2 pr-3">{item.dosage || '—'}</td>
                      <td className="py-2 pr-3">{item.frequency || '—'}</td>
                      <td className="py-2 pr-3">{item.duration || '—'}</td>
                      <td className="py-2">{item.instructions || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-5 space-y-2 text-[13px]">
            <p className="font-semibold">Advice</p>
            <p className="whitespace-pre-line text-body">{data.advice || '—'}</p>
            {data.followUpInWeeks ? (
              <p>
                <span className="text-muted-foreground">Follow-up: </span>
                in {data.followUpInWeeks} weeks (video consultation)
              </p>
            ) : null}
          </div>

          <footer className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <p className="max-w-sm text-[12px] text-muted-foreground">
              This is an electronically generated prescription. Individual results vary. Contact us on
              WhatsApp if you notice any side effect.
            </p>
            <div className="text-center">
              <div className="flex h-14 w-48 items-center justify-center rounded border border-dashed border-steel text-[12px] text-muted-foreground">
                Signature image (pending)
              </div>
              <p className="mt-1 text-[13px] font-medium">{data.doctor.name}</p>
            </div>
          </footer>
        </article>
        <p className="border-t border-line bg-pearl px-5 py-3 text-[12px] text-muted-foreground">
          Preview only. The PDF copy is generated and shared with the patient in Phase 05.
        </p>
      </DialogContent>
    </Dialog>
  );
}
