import { FlaskConical, Info } from 'lucide-react';
import { StatusChip, type ChipTone } from '@/components/shared/status-chip';
import {
  ANGLE_LABEL,
  MINIATURISATION_LABEL,
  SCALP_HEALTH_LABEL,
  SUITABILITY_LABEL,
} from '@/lib/journey/labels';
import type { ScanResult, Suitability } from '@/lib/journey/types';
import { formatIst } from '@/lib/time';
import { cn } from '@/lib/utils';
import { LevelMeter, ProgressRing, ScalpMap } from './meters';

export const SUITABILITY_TONE: Record<Suitability, ChipTone> = {
  suitable: 'success',
  doctor_review: 'info',
  not_suitable: 'warning',
};

const MINI_LEVELS = ['low', 'moderate', 'high'] as const;
const HEALTH_LEVELS = ['healthy', 'mild_irritation', 'needs_attention'] as const;

/**
 * Personalised (simulated) scan assessment — metrics, scalp map, reasons. Not a yes/no: always shows
 * why. Used by /start/assessment and /account/scan. Patient-facing: plain language, no private notes.
 */
export function AssessmentReport({
  scan,
  actions,
  className,
}: {
  scan: ScanResult;
  /** CTA area under the summary (depends on the page) */
  actions?: React.ReactNode;
  className?: string;
}) {
  const m = scan.metrics;
  return (
    <div className={cn('space-y-6', className)}>
      {/* summary */}
      <section className="rounded-3xl bg-card p-5 shadow-card ring-1 ring-line/80 md:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <StatusChip tone={SUITABILITY_TONE[scan.suitability]}>
            {SUITABILITY_LABEL[scan.suitability]}
          </StatusChip>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-mist px-2.5 py-1 text-[12px] font-medium text-body">
            <FlaskConical className="size-3.5" aria-hidden />
            Demo analysis
          </span>
        </div>
        <h2 className="display mt-4 text-[clamp(1.875rem,1.5rem+1.4vw,2.5rem)] text-balance">
          {scan.headline}
        </h2>
        <p className="mt-3 max-w-[62ch] text-[17px] leading-relaxed text-pretty text-body">
          {scan.explanation}
        </p>
        {actions ? <div className="mt-6">{actions}</div> : null}
      </section>

      {/* metrics */}
      <section
        aria-labelledby="metrics-heading"
        className="grid gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]"
      >
        <div className="rounded-3xl bg-card p-5 shadow-card ring-1 ring-line/80 md:col-span-2 md:p-7 lg:col-span-1">
          <h3 id="metrics-heading" className="text-base font-semibold text-ink">
            What the scan measured
          </h3>
          <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-6">
            <Metric
              title="Root density"
              value={m.rootDensity}
              hint="How closely hair roots are packed in the scanned areas."
            />
            <Metric
              title="Viable follicles"
              value={m.viableFollicles}
              hint="Follicles that still look active and able to grow hair."
            />
          </div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-ink">
                Miniaturisation ·{' '}
                <span className="text-body">{MINIATURISATION_LABEL[m.miniaturisation]}</span>
              </p>
              <p className="mt-0.5 text-[13px] text-muted-foreground">How much hairs have become finer.</p>
              <div className="mt-2.5">
                <LevelMeter
                  levels={MINI_LEVELS.map((l) => MINIATURISATION_LABEL[l])}
                  active={MINI_LEVELS.indexOf(m.miniaturisation)}
                  invert
                />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-ink">
                Scalp health · <span className="text-body">{SCALP_HEALTH_LABEL[m.scalpHealth]}</span>
              </p>
              <p className="mt-0.5 text-[13px] text-muted-foreground">
                Surface signs like redness or flaking.
              </p>
              <div className="mt-2.5">
                <LevelMeter
                  levels={['Healthy', 'Mild', 'Attention']}
                  active={HEALTH_LEVELS.indexOf(m.scalpHealth)}
                  invert
                />
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col rounded-3xl bg-card p-5 shadow-card ring-1 ring-line/80 md:p-7">
          <h3 className="text-base font-semibold text-ink">Scalp map</h3>
          <ScalpMap areas={m.thinningAreas} className="mt-4 flex-1" />
        </div>

        {/* reasons */}
        <div className="rounded-3xl bg-card p-5 shadow-card ring-1 ring-line/80 md:p-7 lg:col-span-2">
          <h3 className="text-base font-semibold text-ink">Why we say this</h3>
          <ul className="mt-3 space-y-2.5">
            {scan.reasons.map((r) => (
              <li key={r} className="flex gap-3 text-[15px] text-body">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-steel" aria-hidden />
                {r}
              </li>
            ))}
          </ul>
          <p className="mt-5 text-[13px] text-muted-foreground">
            Scanned {formatIst(new Date(scan.capturedAt))} ·{' '}
            {scan.angles.map((a) => ANGLE_LABEL[a]).join(', ')}
          </p>
        </div>
      </section>

      <p className="flex gap-2.5 rounded-2xl bg-info-bg px-4 py-3.5 text-sm text-info">
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
        <span>
          <strong className="font-semibold">Demo analysis — your doctor makes the final assessment.</strong>{' '}
          These numbers are simulated from your answers for this demo; they are not a diagnosis. Individual
          results vary.
        </span>
      </p>
    </div>
  );
}

function Metric({ title, value, hint }: { title: string; value: number; hint: string }) {
  return (
    <div className="flex flex-col items-center text-center sm:flex-row sm:items-center sm:gap-4 sm:text-left">
      <ProgressRing value={value} size={96} stroke={7} label={`${title} ${value} out of 100`}>
        <span className="price text-[22px] text-ink">{value}</span>
        <span className="text-[11px] text-muted-foreground">of 100</span>
      </ProgressRing>
      <div className="mt-2 sm:mt-0">
        <p className="text-sm font-medium text-ink">{title}</p>
        <p className="mt-0.5 text-[13px] leading-snug text-muted-foreground">{hint}</p>
      </div>
    </div>
  );
}
