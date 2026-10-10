'use client';

import { AnimatePresence, motion, useInView, useReducedMotion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { CLINICAL, MEDIA, type SiteImage } from '@/lib/images';
import { ANGLE_LABEL, ZONE_HINT } from '@/lib/journey/labels';
import { CAPTURE_ZONES, type CaptureZone } from '@/lib/journey/types';
import { cn } from '@/lib/utils';

/**
 * Interactive scan preview for homepage section 3, modelled on the guided-scan app: a phone with
 * progress dashes ("Scan 1 of 7"), three head diagrams with the zone highlighted, a magnified
 * viewfinder (corner brackets + scan line) and a round shutter that steps through the zones. Zone ids,
 * titles and hints come from the real journey (@/lib/journey) so the preview never drifts from the scan.
 * Purely illustrative — it never captures anything and is never a scan result.
 */

type View = 'left' | 'top' | 'right';

interface ZoneArt {
  why: string;
  image: SiteImage;
  /** Extra zoom on the still so each zone reads differently. */
  zoom: number;
  /** Highlight dot per head diagram (60×64 units); omitted where that view does not show the zone. */
  dots: Partial<Record<View, [number, number]>>;
}

const ART: Record<CaptureZone, ZoneArt> = {
  forehead_left: {
    why: 'Temples can recede differently on each side, so each side is captured.',
    image: MEDIA.hairMacroWide,
    zoom: 1.2,
    dots: { left: [17, 14], top: [21, 15] },
  },
  forehead_centre: {
    why: 'The doctor needs the front hairline, so this one cannot be skipped.',
    image: MEDIA.hairMacroWide,
    zoom: 1.05,
    dots: { left: [13, 19], top: [30, 11], right: [47, 19] },
  },
  forehead_right: {
    why: 'Compared with the left side to see whether any change is even.',
    image: MEDIA.hairMacroWide,
    zoom: 1.35,
    dots: { right: [43, 14], top: [39, 15] },
  },
  top: {
    why: 'Shows overall density between the hairline and the crown.',
    image: CLINICAL.scalpPartingPortrait,
    zoom: 1.2,
    dots: { left: [30, 6], top: [30, 27], right: [30, 6] },
  },
  crown: {
    why: 'Hard to see in a mirror and needed by the doctor, so it cannot be skipped.',
    image: CLINICAL.scalpExam,
    zoom: 1.1,
    dots: { left: [45, 12], top: [30, 45], right: [15, 12] },
  },
  parting: {
    why: 'A widening parting is often where thinning shows first, especially in women.',
    image: CLINICAL.scalpParting,
    zoom: 1.05,
    dots: { top: [30, 21] },
  },
  back: {
    why: 'A useful comparison for the rest of your scalp.',
    image: MEDIA.hairMacro,
    zoom: 1.15,
    dots: { left: [51, 27], top: [30, 55], right: [9, 27] },
  },
};

const ZONES = CAPTURE_ZONES.map((id) => ({
  id,
  label: ANGLE_LABEL[id],
  captures: ZONE_HINT[id],
  ...ART[id],
}));
type Zone = (typeof ZONES)[number];
// Stylised head silhouette in a 60×64 box: profile facing left (mirrored for the right view).
const PROFILE =
  'M34 4 C20 3 11 11 11 22 C11 26 8 29 7 32 C6 34 8 35 10 35 L10 40 C10 43 12 44 15 44 L19 44 L19 58 L43 58 L43 46 C50 40 53 31 52 22 C51 11 44 5 34 4 Z';

const BRACKETS = [
  'top-0 left-0 border-t-2 border-l-2 rounded-tl-md',
  'top-0 right-0 border-t-2 border-r-2 rounded-tr-md',
  'bottom-0 left-0 border-b-2 border-l-2 rounded-bl-md',
  'right-0 bottom-0 border-r-2 border-b-2 rounded-br-md',
];

export function ScanExplorer() {
  const [index, setIndex] = useState(0);
  const [flash, setFlash] = useState(0);
  const [captured, setCaptured] = useState<ReadonlySet<number>>(() => new Set());
  const reduce = useReducedMotion();
  const screenRef = useRef<HTMLDivElement>(null);
  const inView = useInView(screenRef, { margin: '-10% 0px' });
  const zone: Zone | undefined = ZONES[index];
  const animate = !reduce;
  const allDone = captured.size === ZONES.length;

  // Clear the flash overlay shortly after a "capture".
  useEffect(() => {
    if (!flash) return;
    const timer = window.setTimeout(() => setFlash(0), 280);
    return () => window.clearTimeout(timer);
  }, [flash]);

  const next = () => setIndex((i) => (i + 1) % ZONES.length);
  const capture = () => {
    setCaptured((prev) => new Set(prev).add(index));
    if (animate) setFlash(Date.now());
    next();
  };

  if (!zone) return null;

  return (
    <div className="relative mx-auto w-full max-w-[21rem] sm:max-w-[22.5rem]">
      {/* platinum halo + floor shadow behind the device */}
      <div
        className="absolute -inset-12 -z-10 rounded-full bg-[radial-gradient(closest-side,rgba(201,204,209,0.6),transparent)]"
        aria-hidden
      />
      <div
        className="absolute inset-x-8 -bottom-5 -z-10 h-10 rounded-[50%] bg-obsidian/30 blur-2xl"
        aria-hidden
      />

      {/* Device frame (graphite metal) */}
      <div className="relative rounded-[3rem] bg-gradient-to-b from-[#4a4d52] via-obsidian to-[#2a2d31] p-[9px] shadow-[0_40px_80px_-30px_rgba(18,19,21,0.6),inset_0_0_0_1px_rgba(255,255,255,0.14)]">
        <div className="relative overflow-hidden rounded-[2.45rem] bg-card text-ink">
          {/* status bar + island */}
          <div
            className="relative flex h-11 items-center justify-between px-7 text-[12px] font-semibold"
            aria-hidden
          >
            <span className="price">9:41</span>
            <span className="absolute top-2.5 left-1/2 h-6 w-24 -translate-x-1/2 rounded-full bg-obsidian" />
            <span className="h-2.5 w-5 rounded-[3px] border border-ink/70 p-px">
              <span className="block h-full w-3/4 rounded-[1px] bg-ink/80" />
            </span>
          </div>

          {/* Progress dashes — one per zone, each 48 px tall and the full dash width */}
          <div className="flex gap-1.5 px-5" role="group" aria-label="Scan zones">
            {ZONES.map((z, i) => (
              <button
                key={z.id}
                type="button"
                onClick={() => setIndex(i)}
                aria-pressed={i === index}
                aria-label={`Zone ${i + 1} of ${ZONES.length}: ${z.label}`}
                className="group flex h-12 flex-1 items-center rounded-md"
              >
                <span
                  className={cn(
                    'h-1.5 w-full rounded-full transition-colors duration-300',
                    i === index ? 'bg-ink' : captured.has(i) ? 'bg-steel' : 'bg-mist group-hover:bg-line',
                  )}
                />
              </button>
            ))}
          </div>

          {/* Angle counter + title */}
          <div className="px-5">
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-muted-foreground" aria-live="polite">
                Scan {index + 1} of {ZONES.length}
                <span className="sr-only">: {zone.label}</span>
              </span>
              <button
                type="button"
                onClick={next}
                className="-mr-2 inline-flex min-h-12 items-center gap-1 rounded-md px-2 font-medium text-brand hover:text-ink"
              >
                Next <ArrowRight className="size-3.5" aria-hidden />
              </button>
            </div>
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={zone.id}
                initial={animate ? { opacity: 0, y: 6 } : false}
                animate={{ opacity: 1, y: 0 }}
                exit={animate ? { opacity: 0, y: -4 } : { opacity: 0 }}
                transition={{ duration: 0.22 }}
                className="font-display text-[2rem] leading-none font-medium text-ink"
                aria-hidden
              >
                {zone.label}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Head diagrams with the zone dot */}
          <div className="grid grid-cols-3 gap-2 px-5 pt-3 pb-3" aria-hidden>
            {(['left', 'top', 'right'] as const).map((view) => {
              const dot = zone.dots[view];
              return (
                <svg
                  key={view}
                  viewBox="0 0 60 64"
                  className={cn(
                    'h-16 w-full transition-opacity duration-300',
                    dot ? 'opacity-100' : 'opacity-35',
                  )}
                >
                  {view === 'top' ? (
                    <>
                      <path d="M26 9 L30 3 L34 9" fill="none" stroke="#8e939a" strokeWidth="1.2" />
                      <ellipse
                        cx="30"
                        cy="32"
                        rx="19"
                        ry="24"
                        fill="#e6e7e9"
                        stroke="#8e939a"
                        strokeWidth="1.2"
                      />
                      <ellipse cx="10" cy="33" rx="2" ry="5" fill="none" stroke="#8e939a" strokeWidth="1" />
                      <ellipse cx="50" cy="33" rx="2" ry="5" fill="none" stroke="#8e939a" strokeWidth="1" />
                      <path d="M30 11 V40" stroke="#c9ccd1" strokeWidth="1" strokeDasharray="2 2" />
                    </>
                  ) : (
                    <path
                      d={PROFILE}
                      transform={view === 'right' ? 'translate(60 0) scale(-1 1)' : undefined}
                      fill="#e6e7e9"
                      stroke="#8e939a"
                      strokeWidth="1.2"
                    />
                  )}
                  {dot ? (
                    <motion.g
                      key={`${zone.id}-${view}`}
                      initial={animate ? { scale: 0.3, opacity: 0 } : false}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.35 }}
                      style={{ transformOrigin: `${dot[0]}px ${dot[1]}px`, transformBox: 'view-box' }}
                    >
                      <circle cx={dot[0]} cy={dot[1]} r="7" fill="rgba(78,99,120,0.22)" />
                      <circle cx={dot[0]} cy={dot[1]} r="3.4" fill="#16181b" />
                    </motion.g>
                  ) : null}
                </svg>
              );
            })}
          </div>

          {/* Magnified viewfinder — edge to edge inside the screen */}
          <div ref={screenRef} className="relative aspect-[5/4] overflow-hidden bg-obsidian">
            <AnimatePresence initial={false}>
              <motion.div
                key={zone.id}
                className="absolute inset-0"
                initial={animate ? { opacity: 0, scale: zone.zoom * 1.06 } : false}
                animate={{ opacity: 1, scale: zone.zoom }}
                exit={{ opacity: 0 }}
                transition={{ duration: animate ? 0.6 : 0, ease: [0.2, 0.7, 0.2, 1] }}
              >
                <Image
                  src={zone.image.src}
                  alt=""
                  fill
                  sizes="(min-width: 640px) 22rem, 90vw"
                  className="object-cover grayscale-[35%]"
                />
              </motion.div>
            </AnimatePresence>
            <div
              className="absolute inset-0 bg-gradient-to-b from-obsidian/10 via-transparent to-obsidian/40"
              aria-hidden
            />

            <div className="absolute inset-[18%]" aria-hidden>
              {BRACKETS.map((pos) => (
                <span key={pos} className={cn('absolute size-7 border-pearl/95', pos)} />
              ))}
            </div>

            {animate ? (
              <motion.div
                className="absolute inset-x-[18%] h-px bg-pearl shadow-[0_0_14px_2px_rgba(237,238,240,0.65)]"
                initial={{ top: '18%' }}
                animate={inView ? { top: ['18%', '82%', '18%'] } : { top: '18%' }}
                transition={{ duration: 4.2, ease: 'easeInOut', repeat: inView ? Infinity : 0 }}
                aria-hidden
              />
            ) : null}

            <AnimatePresence>
              {flash ? (
                <motion.div
                  key={flash}
                  className="absolute inset-0 bg-white"
                  initial={{ opacity: 0.85 }}
                  animate={{ opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.28 }}
                  aria-hidden
                />
              ) : null}
            </AnimatePresence>

            <span className="absolute top-3 left-3 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-medium text-on-dark backdrop-blur">
              Illustration · not a scan result
            </span>
          </div>

          {/* Shutter row */}
          <div className="relative flex items-center justify-center px-5 pt-4 pb-2">
            <button
              type="button"
              onClick={capture}
              aria-label={`Preview the ${zone.label.toLowerCase()} capture and go to the next zone (demo, nothing is recorded)`}
              className="group relative flex size-16 items-center justify-center rounded-full ring-2 ring-ink transition-transform active:scale-95"
            >
              <span className="size-12 rounded-full bg-ink transition-transform duration-200 group-hover:scale-90" />
            </button>
            <span className="price absolute right-5 text-[12px] text-muted-foreground">
              {allDone ? `All ${ZONES.length} seen` : `${captured.size}/${ZONES.length}`}
            </span>
          </div>

          {/* What this angle captures */}
          <div className="min-h-[8rem] px-5 pt-2 pb-7">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={zone.id}
                initial={animate ? { opacity: 0 } : false}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <p className="text-[14px] font-medium text-ink">{zone.captures}.</p>
                <p className="mt-1 text-[13px] leading-relaxed text-body">{zone.why}</p>
              </motion.div>
            </AnimatePresence>
          </div>
          <span
            className="absolute bottom-2 left-1/2 h-1 w-28 -translate-x-1/2 rounded-full bg-ink/80"
            aria-hidden
          />
        </div>
      </div>
      <p className="mt-7 text-center text-[13px] text-muted-foreground">
        Tap the shutter to step through the zones.
      </p>
    </div>
  );
}
