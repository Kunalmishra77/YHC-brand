import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Reveal } from '@/components/site/reveal';
import { SECTION_Y } from '@/components/site/section';
import { illustrativeNote } from '@/components/site/slot-note';
import { Button } from '@/components/ui/button';
import { CAPTURE_ZONES } from '@/lib/journey/types';
import { SLOTS } from '@/lib/slots';
import { ScanExplorer } from './scan-invite/scan-explorer';
import { ScanPhoto } from './scan-invite/scan-photo';

/**
 * Homepage section 3 · Take your scalp scan — invitation to start the 3D scan (/start), visual first
 * (docs/20): a real-life photo of someone scanning at a mirror (slot H03) with the tappable phone
 * preview standing in front of it, and a few words beside it. Step copy matches /start. Cinematic pass
 * (ADR-35): the photo drifts with scroll, a scan line sweeps over it and the zones pop in as chips.
 */

const STEPS = [
  'Your name and mobile number',
  `Up to ${CAPTURE_ZONES.length} photos. Your phone shows you how.`,
  'Your result, with the reasons',
];

export function ScanInvite() {
  const photo = SLOTS.H03;
  const note = illustrativeNote(photo);

  return (
    <section
      id="scan"
      aria-labelledby="scan-invite-heading"
      className="relative isolate scroll-mt-20 overflow-hidden bg-pearl"
    >
      <div
        className={`container-yhc grid items-center gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-14 xl:gap-20 ${SECTION_Y}`}
      >
        {/* Words: kept short — the picture and the phone tell the story */}
        <Reveal>
          <p className="eyebrow">Free 3D scalp scan</p>
          <h2 id="scan-invite-heading" className="mt-5">
            <span className="display block text-[clamp(3.25rem,2rem+5.5vw,6rem)] leading-[0.9] tracking-[-0.01em]">
              Look closer.
            </span>
            <span className="mt-5 block max-w-[20ch] font-display text-[clamp(1.75rem,1.4rem+1.2vw,2.375rem)] leading-tight font-medium text-body">
              Scan your scalp at home, with your phone.
            </span>
          </h2>
          <p className="mt-5 max-w-[40ch] text-lg leading-relaxed text-pretty text-body">
            You see your result straight away. A doctor makes the final call.
          </p>

          <ol className="mt-7 space-y-3">
            {STEPS.map((step, i) => (
              <li key={step} className="flex items-center gap-4 text-base text-ink">
                <span className="price flex size-9 shrink-0 items-center justify-center rounded-full bg-card text-[13px] text-ink ring-1 ring-line">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
            <Button asChild className="group h-14 w-full rounded-full px-8 text-base sm:w-auto">
              <Link href="/start">
                Begin my free 3D scan
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </Link>
            </Button>
            <p className="text-center text-[13px] leading-snug text-muted-foreground sm:max-w-[16rem] sm:text-left">
              A first check, not a diagnosis. The doctor decides.
            </p>
          </div>
        </Reveal>

        {/* Stage: the photo behind, the phone preview in front (overlapping the photo's left edge on desktop) */}
        <Reveal delayMs={120} className="relative">
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-10 -z-10 bg-[radial-gradient(ellipse_at_70%_40%,rgba(217,167,102,0.18),transparent_60%)]"
          />
          <ScanPhoto
            src={photo.src}
            alt={photo.alt}
            note={note}
            className="absolute inset-x-0 top-0 h-[55%] sm:h-[60%] lg:inset-y-6 lg:right-0 lg:left-[34%] lg:h-auto"
          />

          <div className="relative pt-24 sm:pt-28 lg:pt-0 lg:pr-[30%] xl:pr-[34%]">
            <ScanExplorer />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
