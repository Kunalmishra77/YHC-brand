import { FlaskConical } from 'lucide-react';
import { SUITABILITY_TONE } from '@/components/journey/assessment-report';
import { ScalpMap } from '@/components/journey/meters';
import { StatusChip } from '@/components/shared/status-chip';
import {
  ANGLE_LABEL,
  DURATION_ANSWERS,
  FAMILY_ANSWERS,
  LONG_BALD_ANSWERS,
  MINIATURISATION_LABEL,
  PATTERN_ANSWERS,
  SCALP_HEALTH_LABEL,
  SUITABILITY_LABEL,
  SUITABILITY_SHORT,
  answerLabel,
} from '@/lib/journey/labels';
import type { ScanResult, Suitability } from '@/lib/journey/types';
import { formatIst } from '@/lib/time';

/** Clinical: doctor portal only. Callers must audit `clinical.view` before rendering. */
export function ScanSummary({ scan }: { scan: ScanResult }) {
  const m = scan.metrics;
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <StatusChip tone={SUITABILITY_TONE[scan.suitability]}>
          {SUITABILITY_LABEL[scan.suitability]}
        </StatusChip>
        <span className="inline-flex items-center gap-1 rounded-full bg-mist px-2 py-0.5 text-[12px] text-body">
          <FlaskConical className="size-3" aria-hidden />
          Demo analysis
        </span>
      </div>
      <dl className="grid grid-cols-2 gap-2 text-sm">
        <Metric label="Root density" value={`${m.rootDensity} / 100`} />
        <Metric label="Viable follicles" value={`${m.viableFollicles} / 100`} />
        <Metric label="Miniaturisation" value={MINIATURISATION_LABEL[m.miniaturisation]} />
        <Metric label="Scalp health" value={SCALP_HEALTH_LABEL[m.scalpHealth]} />
      </dl>
      <div className="rounded-md border border-line bg-card px-3 py-3">
        <ScalpMap areas={m.thinningAreas} className="[&_svg]:max-w-[150px]" />
      </div>
      <div>
        <p className="text-[12px] font-medium text-body">Reasons</p>
        <ul className="mt-1 space-y-1">
          {scan.reasons.map((r) => (
            <li key={r} className="flex gap-2 text-[13px] text-ink">
              <span className="mt-1.5 size-1 shrink-0 rounded-full bg-steel" aria-hidden />
              {r}
            </li>
          ))}
        </ul>
      </div>
      <dl className="space-y-1.5 text-[13px]">
        <Answer label="Thinning for" value={answerLabel(DURATION_ANSWERS, scan.answers.duration)} />
        <Answer label="Pattern" value={answerLabel(PATTERN_ANSWERS, scan.answers.pattern)} />
        <Answer label="Bald 5+ years" value={answerLabel(LONG_BALD_ANSWERS, scan.answers.longBald)} />
        <Answer label="Family history" value={answerLabel(FAMILY_ANSWERS, scan.answers.familyHistory)} />
      </dl>
      <p className="text-[12px] text-muted-foreground">
        Scanned {formatIst(new Date(scan.capturedAt), 'd MMM yyyy, h:mm aaa')} · Captured:{' '}
        {scan.angles.map((a) => ANGLE_LABEL[a]).join(', ')}
        {scan.skippedZones?.length
          ? ` · Skipped: ${scan.skippedZones.map((z) => ANGLE_LABEL[z]).join(', ')}`
          : ''}
        . Simulated from the patient&apos;s answers — not an image analysis; your examination decides.
      </p>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-mist/60 px-3 py-2">
      <dt className="text-[12px] text-body">{label}</dt>
      <dd className="font-medium text-ink">{value}</dd>
    </div>
  );
}

function Answer({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-ink">{value}</dd>
    </div>
  );
}

/** Small chip for the doctor's Today list. */
export function ScanChip({ suitability }: { suitability: Suitability }) {
  return <StatusChip tone={SUITABILITY_TONE[suitability]}>{SUITABILITY_SHORT[suitability]}</StatusChip>;
}
