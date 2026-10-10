'use client';

import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  CircleHelp,
  RotateCcw,
  ScanLine,
} from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { CLINICAL } from '@/lib/images';
import { ANGLE_LABEL, ZONE_HINT } from '@/lib/journey/labels';
import { CAPTURE_ZONES, type CaptureZone, MIN_CAPTURED_ZONES } from '@/lib/journey/types';
import { isRequiredZone, nextZoneToFix, orderZones, zoneSelectionIssue } from '@/lib/journey/zones';
import { cn } from '@/lib/utils';
import { CameraSheet } from './camera-sheet';
import { HeadDiagrams } from './head-diagrams';
import { HowToScanList, HowToScanSheet } from './how-to-sheet';
import { ZONE_REFERENCE_POSITION, ZONE_TIP } from './zone-guide';

/*
 * Guided 7-zone capture (client design reference: design/references/scan-app-flow.jpg).
 * Phones: an app-like full-viewport screen (100dvh, safe areas, page chrome covered). Desktop: the
 * same screen in a phone frame on the right, instructions and the zone checklist on the left.
 */

export interface ScanShot {
  url: string;
  kb: number;
}

export type ZoneShots = Partial<Record<CaptureZone, ScanShot>>;

const TOTAL = CAPTURE_ZONES.length;

function issueText(captured: CaptureZone[], skipped: CaptureZone[]): string | null {
  const issue = zoneSelectionIssue(captured, skipped);
  if (!issue) return null;
  if (issue.code === 'required_missing')
    return `Please scan ${issue.zones.map((z) => ANGLE_LABEL[z]).join(' and ')} — your doctor needs ${issue.zones.length > 1 ? 'these' : 'this'}.`;
  if (issue.code === 'too_few')
    return `Please scan at least ${MIN_CAPTURED_ZONES} zones — ${issue.missing} more to go.`;
  return 'Something went wrong with the zone list. Please retake one zone.';
}

export function ZoneCapture({
  shots,
  skipped,
  onShot,
  onSkip,
  onBack,
  onFinish,
}: {
  shots: ZoneShots;
  skipped: CaptureZone[];
  /** stores (or replaces) the zone's local photo and un-skips the zone */
  onShot: (zone: CaptureZone, blob: Blob) => void;
  onSkip: (zone: CaptureZone) => void;
  onBack: () => void;
  onFinish: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [howToOpen, setHowToOpen] = useState(false);
  const [blocked, setBlocked] = useState<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  const zone = CAPTURE_ZONES[index] ?? 'forehead_left';
  const shot = shots[zone];
  const isSkipped = skipped.includes(zone);
  const required = isRequiredZone(zone);
  const captured = orderZones(CAPTURE_ZONES.filter((z) => shots[z]));
  const isLast = index === TOTAL - 1;

  // Phones: the capture screen covers the page, so stop the page behind it from scrolling.
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023.98px)');
    const root = document.documentElement;
    const apply = () => {
      root.style.overflow = mq.matches ? 'hidden' : '';
    };
    apply();
    mq.addEventListener('change', apply);
    return () => {
      mq.removeEventListener('change', apply);
      root.style.overflow = '';
    };
  }, []);

  // Move focus to the zone title whenever the zone changes (and on entering the capture screen).
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, [index]);

  const goTo = (i: number) => {
    setBlocked(null);
    setIndex(Math.max(0, Math.min(TOTAL - 1, i)));
  };

  const finish = (skippedNow: CaptureZone[]) => {
    const text = issueText(captured, skippedNow);
    if (text) {
      setBlocked(text);
      return;
    }
    onFinish();
  };

  const next = () => {
    if (isLast) finish(skipped);
    else goTo(index + 1);
  };

  const skip = () => {
    if (shot) return; // a captured zone is never also marked skipped
    onSkip(zone);
    const skippedNow = skipped.includes(zone) ? skipped : [...skipped, zone];
    if (isLast) finish(skippedNow);
    else goTo(index + 1);
  };

  const fixZone = blocked ? nextZoneToFix(captured, skipped) : null;
  const canNext = Boolean(shot) || isSkipped;

  return (
    <section className="lg:grid lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start lg:gap-14">
      {/* desktop instructions */}
      <aside className="hidden lg:block">
        <button
          type="button"
          onClick={onBack}
          className="-ml-1 inline-flex min-h-11 items-center gap-1.5 px-1 text-sm text-on-dark-muted hover:text-on-dark"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to questions
        </button>
        <p className="mt-6 text-[13px] font-semibold tracking-[0.14em] text-brand-on-dark uppercase">
          Guided 3D scalp scan
        </p>
        <h2 className="mt-3 font-display text-[44px] leading-[1.05] font-medium text-balance text-on-dark">
          Seven zones, one close-up at a time
        </h2>
        <p className="mt-4 max-w-lg text-on-dark-muted">
          Follow the dot on the head drawings, scan each zone from 10–15 cm and press Next. You can skip zones
          that are hard to reach — Forehead – Centre and Crown are needed, plus at least {MIN_CAPTURED_ZONES}{' '}
          zones in total.
        </p>
        <ol className="mt-7 grid max-w-lg grid-cols-2 gap-2">
          {CAPTURE_ZONES.map((z, i) => {
            const s = shots[z];
            const sk = skipped.includes(z);
            const active = i === index;
            return (
              <li key={z}>
                <button
                  type="button"
                  onClick={() => goTo(i)}
                  aria-current={active ? 'step' : undefined}
                  className={cn(
                    'flex min-h-12 w-full items-center gap-3 rounded-2xl px-3 py-2 text-left ring-1 transition-colors',
                    active ? 'bg-white/12 ring-white/50' : 'bg-white/5 ring-white/10 hover:ring-white/25',
                  )}
                >
                  <span
                    className={cn(
                      'flex size-7 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold ring-1',
                      s ? 'bg-platinum text-obsidian ring-platinum' : 'text-on-dark-muted ring-white/20',
                    )}
                  >
                    {s ? <Check className="size-3.5" aria-hidden /> : i + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-on-dark">{ANGLE_LABEL[z]}</span>
                    <span className="block text-[12px] text-on-dark-muted">
                      {s ? 'Captured' : sk ? 'Skipped' : isRequiredZone(z) ? 'Required' : 'Optional'}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
        <div className="mt-8 max-w-lg rounded-3xl bg-pearl p-6 text-ink">
          <p className="mb-4 font-semibold">How to scan</p>
          <HowToScanList />
        </div>
        <p className="mt-5 max-w-lg text-[13px] text-on-dark-muted">
          Demo: photos stay on this device and are never uploaded. Only which zones you scanned is sent.
        </p>
      </aside>

      {/* the app screen */}
      <div className="fixed inset-0 z-[45] flex flex-col bg-pearl text-ink lg:relative lg:inset-auto lg:z-auto lg:h-[min(820px,calc(100dvh-7rem))] lg:min-h-[640px] lg:overflow-hidden lg:rounded-[2.75rem] lg:shadow-raised lg:ring-8 lg:ring-graphite">
        {/* top: back + progress dashes */}
        <div className="flex items-center gap-1 px-2 pt-[max(0.5rem,env(safe-area-inset-top))] lg:pt-5">
          <button
            type="button"
            onClick={() => (index === 0 ? onBack() : goTo(index - 1))}
            aria-label={
              index === 0 ? 'Back to questions' : `Back to ${ANGLE_LABEL[CAPTURE_ZONES[index - 1] ?? zone]}`
            }
            className="flex size-12 shrink-0 items-center justify-center rounded-full text-ink hover:bg-mist"
          >
            <ArrowLeft className="size-5" aria-hidden />
          </button>
          <ol className="flex flex-1 items-center" aria-label="Scan zones">
            {CAPTURE_ZONES.map((z, i) => {
              const state = shots[z] ? 'captured' : skipped.includes(z) ? 'skipped' : 'to do';
              return (
                <li key={z} className="flex-1">
                  <button
                    type="button"
                    onClick={() => goTo(i)}
                    aria-label={`${ANGLE_LABEL[z]}, ${state}`}
                    aria-current={i === index ? 'step' : undefined}
                    className="group flex h-11 w-full items-center px-[3px]"
                  >
                    <span
                      className={cn(
                        'h-[5px] w-full rounded-full transition-colors motion-reduce:transition-none',
                        i === index
                          ? 'bg-obsidian'
                          : shots[z]
                            ? 'bg-steel'
                            : skipped.includes(z)
                              ? 'bg-line [background-image:repeating-linear-gradient(90deg,var(--color-steel)_0_3px,transparent_3px_6px)]'
                              : 'bg-line group-hover:bg-platinum',
                      )}
                    />
                  </button>
                </li>
              );
            })}
          </ol>
          <span className="size-12 shrink-0" aria-hidden />
        </div>

        {/* scrollable step content */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <motion.div
            key={zone}
            initial={reduceMotion ? false : { opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="pb-4"
          >
            <div className="px-5 pt-3">
              <div className="flex min-h-11 items-center justify-between gap-3">
                <p className="text-[15px] text-muted-foreground" aria-live="polite" aria-atomic="true">
                  Scan {index + 1} of {TOTAL}
                  <span className="sr-only">
                    {' '}
                    — {ANGLE_LABEL[zone]}. {captured.length} captured so far.
                  </span>
                </p>
                {shot ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-success-bg px-3 py-1 text-[12px] font-medium text-success">
                    <Check className="size-3.5" aria-hidden />
                    Captured
                  </span>
                ) : required ? (
                  <span className="rounded-full bg-mist px-3 py-1 text-[12px] font-medium text-ink">
                    Required
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={skip}
                    className="-mr-2 inline-flex min-h-11 items-center gap-1.5 px-2 text-[15px] font-medium text-ink underline-offset-4 hover:underline"
                  >
                    Skip for now
                    <ArrowRight className="size-4" aria-hidden />
                  </button>
                )}
              </div>
              <h1
                ref={headingRef}
                tabIndex={-1}
                className="mt-1 text-[30px] leading-[1.1] font-bold tracking-tight text-ink outline-none"
              >
                {ANGLE_LABEL[zone]}
              </h1>
              <p className="mt-1 text-sm text-body">{ZONE_HINT[zone]}</p>
              <button
                type="button"
                onClick={() => setHowToOpen(true)}
                className="mt-1 -ml-1 inline-flex min-h-11 items-center gap-1.5 px-1 text-[15px] font-medium text-ink underline decoration-steel underline-offset-4"
              >
                <CircleHelp className="size-4" aria-hidden />
                How to scan
              </button>
              <HeadDiagrams zone={zone} className="mt-2" />
            </div>

            {/* reference close-up or the captured photo */}
            <div className="relative mt-4 aspect-[16/11] w-full overflow-hidden bg-obsidian">
              {shot ? (
                // eslint-disable-next-line @next/next/no-img-element -- local blob preview, never uploaded
                <img
                  src={shot.url}
                  alt={`Your ${ANGLE_LABEL[zone]} photo`}
                  className="absolute inset-0 size-full object-cover"
                />
              ) : (
                <Image
                  src={CLINICAL.scalpParting.src}
                  alt="Example of a sharp scalp close-up showing individual hair roots"
                  fill
                  sizes="(min-width: 1024px) 400px, 100vw"
                  className="object-cover"
                  style={{ objectPosition: ZONE_REFERENCE_POSITION[zone] }}
                />
              )}
              <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-[12px] font-medium text-white backdrop-blur-sm">
                {shot ? (
                  <>
                    <Check className="size-3.5" aria-hidden />
                    Captured · stays on this device
                  </>
                ) : (
                  'Example of a good close-up'
                )}
              </span>
            </div>

            <div className="px-5 pt-4">
              <p className="text-[15px] leading-relaxed text-body">{ZONE_TIP[zone]}</p>
              {isSkipped && !shot ? (
                <p className="mt-3 rounded-2xl bg-mist px-4 py-3 text-sm text-ink">
                  Skipped for now — you can still scan it.
                </p>
              ) : null}
            </div>
          </motion.div>
        </div>

        {/* thumb zone */}
        <div className="border-t border-line/70 bg-pearl px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] lg:pb-6">
          {blocked ? (
            <div role="alert" className="mb-3 rounded-2xl bg-warning-bg px-4 py-3 text-sm text-ink">
              <p className="flex gap-2">
                <AlertCircle className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />
                {blocked}
              </p>
              {fixZone ? (
                <button
                  type="button"
                  onClick={() => goTo(CAPTURE_ZONES.indexOf(fixZone))}
                  className="mt-1 ml-6 inline-flex min-h-11 items-center gap-1 font-semibold underline underline-offset-4"
                >
                  Go to {ANGLE_LABEL[fixZone]}
                  <ArrowRight className="size-4" aria-hidden />
                </button>
              ) : null}
            </div>
          ) : null}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => {
                setBlocked(null);
                setCameraOpen(true);
              }}
              className="inline-flex h-12 min-w-36 items-center justify-center gap-2 rounded-full px-6 text-[15px] font-semibold text-ink ring-2 ring-obsidian hover:bg-mist"
            >
              {shot ? (
                <RotateCcw className="size-[18px]" aria-hidden />
              ) : (
                <Camera className="size-5" aria-hidden />
              )}
              {shot ? 'Retake' : 'Scan'}
              <span className="sr-only"> {ANGLE_LABEL[zone]}</span>
            </button>
          </div>
          <button
            ref={nextRef}
            type="button"
            onClick={next}
            disabled={!canNext}
            className="mt-3 inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-obsidian text-[17px] font-semibold text-pearl transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-35"
          >
            {isLast ? (
              <>
                <ScanLine className="size-5" aria-hidden />
                Analyse my scan
              </>
            ) : (
              'Next'
            )}
          </button>
          {!canNext ? (
            <p className="mt-2 text-center text-[12px] text-muted-foreground">
              {required ? 'Scan this zone to continue.' : 'Scan this zone, or skip it for now.'}
            </p>
          ) : null}
        </div>
      </div>

      <CameraSheet
        open={cameraOpen}
        zone={zone}
        shotUrl={shot?.url ?? null}
        onOpenChange={setCameraOpen}
        onCapture={(blob) => onShot(zone, blob)}
        returnFocusTo={shot ? nextRef : undefined}
      />
      <HowToScanSheet open={howToOpen} onOpenChange={setHowToOpen} />
    </section>
  );
}
