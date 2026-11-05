import { CheckCircle2, CircleHelp, Info, PhoneCall } from 'lucide-react';
import { ANGLE_LABEL } from '@/lib/journey/labels';
import type { OutcomeReason, ScanOutcome } from '@/lib/scan/rules';
import { cn } from '@/lib/utils';
import type { ScanZoneView } from '@/server/live/scans';

/*
 * Scan result (ADR-36): outcome in plain words, what happens next, the customer's own photos with a
 * per-area note. Copy rules: no promises of regrowth, no timelines for results; always "a photo check,
 * not a medical diagnosis".
 */

const COPY: Record<ScanOutcome, { title: string; tone: 'good' | 'neutral' | 'info' }> = {
  eligible: { title: 'Hair roots are still visible', tone: 'good' },
  not_eligible: { title: 'Treatment is unlikely to help the bare areas', tone: 'neutral' },
  unclear: { title: 'We need a closer look', tone: 'info' },
};

function body(outcome: ScanOutcome, reasons: OutcomeReason[]): string {
  if (outcome === 'eligible')
    return 'Your photos show hair still growing in the areas we checked. In cases like yours, treatment may help.';
  if (outcome === 'not_eligible')
    return 'Your photos show smooth, shiny scalp with no hair left in the main areas. Hair treatments can only work where hair roots are still alive, so we will not suggest a treatment for these areas.';
  if (reasons.includes('no_hair_younger'))
    return 'Your photos show very little hair in the main areas. A person from our team will look at your case with you.';
  return 'Some photos were not clear enough to judge. You can scan again in better light, or our team will help you on the call.';
}

export function coverLabel(z: Pick<ScanZoneView, 'ok' | 'cover'>): string {
  if (!z.ok || z.cover === null) return 'Could not check';
  if (z.cover >= 0.45) return 'Good hair cover';
  if (z.cover > 0.12) return 'Thinning';
  return 'Little or no hair';
}

export function OutcomeCard({
  outcome,
  reasons,
  phone,
}: {
  outcome: ScanOutcome;
  reasons: OutcomeReason[];
  phone: string;
}) {
  const copy = COPY[outcome];
  const Icon = copy.tone === 'good' ? CheckCircle2 : copy.tone === 'info' ? CircleHelp : Info;
  return (
    <section
      aria-labelledby="outcome-title"
      className={cn(
        'rounded-[28px] p-6 ring-1 sm:p-8',
        copy.tone === 'good' ? 'bg-success-bg ring-success/20' : 'bg-white ring-line',
      )}
    >
      <p className="flex items-center gap-2 text-[13px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
        <Icon className={cn('size-4', copy.tone === 'good' ? 'text-success' : 'text-steel')} aria-hidden />
        Your result
      </p>
      <h2 id="outcome-title" className="mt-3 font-display text-[30px] leading-[1.1] font-medium text-balance text-ink sm:text-[38px]">
        {copy.title}
      </h2>
      <p className="mt-3 max-w-2xl text-[17px] leading-relaxed text-body">{body(outcome, reasons)}</p>
      <div className="mt-6 flex items-start gap-3 rounded-2xl bg-white/80 p-4 ring-1 ring-line">
        <PhoneCall className="mt-0.5 size-5 shrink-0 text-ink" aria-hidden />
        <p className="text-[15px] leading-relaxed text-ink">
          <span className="font-semibold">What happens next:</span> our hair-care team will call you on{' '}
          <span className="price whitespace-nowrap">{phone}</span> during working hours to talk through your
          options. There is no charge for the scan or the call.
        </p>
      </div>
      <p className="mt-4 text-[13px] text-muted-foreground">
        This is a photo check, not a medical diagnosis. Results vary from person to person.
      </p>
    </section>
  );
}

export function ZoneGrid({ zones, teamVisible = false }: { zones: ScanZoneView[]; teamVisible?: boolean }) {
  if (!zones.length) return null;
  return (
    <section aria-labelledby="zones-title" className="mt-10">
      <h2 id="zones-title" className="font-display text-2xl font-medium text-ink">
        Your photos, area by area
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {teamVisible ? 'Only you and our hair-care team can see these photos.' : 'Only you can see these photos.'}
      </p>
      <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {zones.map((z) => (
          <li key={z.zone} className="overflow-hidden rounded-2xl bg-white ring-1 ring-line">
            <div className="relative aspect-[4/3] bg-mist">
              {z.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- private photo served by our own route
                <img src={z.photoUrl} alt={`Your ${ANGLE_LABEL[z.zone]} photo`} className="size-full object-cover" />
              ) : null}
            </div>
            <div className="p-3">
              <p className="text-sm font-medium text-ink">{ANGLE_LABEL[z.zone]}</p>
              <p className="mt-0.5 text-[13px] text-muted-foreground">{coverLabel(z)}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
