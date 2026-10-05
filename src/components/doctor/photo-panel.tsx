'use client';

import { Camera, Columns2, Minus, Plus, ZoomIn } from 'lucide-react';
import { useState } from 'react';
import { StatusChip } from '@/components/shared/status-chip';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

export type ScalpAngle = 'front' | 'crown' | 'parting';

const ANGLES: { id: ScalpAngle; label: string }[] = [
  { id: 'front', label: 'Front hairline' },
  { id: 'crown', label: 'Crown' },
  { id: 'parting', label: 'Parting' },
];

export interface PhotoSetView {
  id: string;
  label: string;
  takenOn: string; // display date
}

/**
 * Scalp photo placeholder (demo). TODO(phase-05): real images via 5-minute signed URLs from the
 * private `clinical` bucket (TRD §7); every view is already audited by the page.
 */
function ScalpPlaceholder({
  angle,
  variant = 0,
  className,
}: {
  angle: ScalpAngle;
  variant?: number;
  className?: string;
}) {
  // Density hint differs a little per set so "compare" reads as a comparison.
  const strands = 14 + variant * 4;
  return (
    <svg
      viewBox="0 0 120 120"
      role="img"
      aria-label={`${ANGLES.find((a) => a.id === angle)?.label} placeholder`}
      className={cn('h-full w-full', className)}
    >
      <defs>
        <radialGradient id={`scalp-${angle}-${variant}`} cx="50%" cy="40%" r="65%">
          <stop offset="0%" stopColor="#F4F4F2" />
          <stop offset="100%" stopColor="#C9CCD1" />
        </radialGradient>
      </defs>
      <rect width="120" height="120" fill={`url(#scalp-${angle}-${variant})`} />
      {angle === 'front' ? (
        <g fill="none" stroke="#8E939A" strokeWidth="1.2" strokeLinecap="round">
          <ellipse cx="60" cy="78" rx="38" ry="44" stroke="#AEB2B8" />
          <path d="M26 58 C 36 30, 84 30, 94 58" strokeWidth="1.6" />
          {Array.from({ length: strands }, (_, i) => {
            const x = 30 + (i * 60) / strands;
            return (
              <path
                key={i}
                d={`M${x} ${48 - Math.sin((i / strands) * Math.PI) * 10} l2 -9`}
                stroke="#4A4E55"
                opacity={0.55}
              />
            );
          })}
        </g>
      ) : angle === 'crown' ? (
        <g fill="none" stroke="#8E939A" strokeWidth="1.2" strokeLinecap="round">
          <circle cx="60" cy="60" r="40" stroke="#AEB2B8" />
          <path d="M60 60 m0 -4 a4 4 0 1 1 -4 4 a8 8 0 1 0 8 -8 a14 14 0 1 1 -14 14" />
          {Array.from({ length: strands }, (_, i) => {
            const a = (i / strands) * Math.PI * 2;
            const r = 22 + (i % 3) * 5;
            return (
              <line
                key={i}
                x1={60 + Math.cos(a) * r}
                y1={60 + Math.sin(a) * r}
                x2={60 + Math.cos(a + 0.35) * (r + 8)}
                y2={60 + Math.sin(a + 0.35) * (r + 8)}
                stroke="#4A4E55"
                opacity={0.55}
              />
            );
          })}
        </g>
      ) : (
        <g fill="none" stroke="#8E939A" strokeWidth="1.2" strokeLinecap="round">
          <ellipse cx="60" cy="62" rx="40" ry="46" stroke="#AEB2B8" />
          <path d="M60 18 L60 106" strokeWidth="2" stroke="#F4F4F2" />
          {Array.from({ length: strands }, (_, i) => {
            const y = 24 + (i * 78) / strands;
            return (
              <g key={i} stroke="#4A4E55" opacity={0.55}>
                <path d={`M56 ${y} q-10 3 -18 10`} />
                <path d={`M64 ${y} q10 3 18 10`} />
              </g>
            );
          })}
        </g>
      )}
    </svg>
  );
}

export function PhotoPanel({
  current,
  previous,
  patientName,
}: {
  /** this consultation's intake set, or null when photos are missing */
  current: PhotoSetView | null;
  /** earlier progress sets (oldest first) */
  previous: PhotoSetView[];
  patientName: string;
}) {
  const [zoom, setZoom] = useState<{ angle: ScalpAngle; set: PhotoSetView } | null>(null);
  const [scale, setScale] = useState(1);
  const [compare, setCompare] = useState(false);
  const [compareAngle, setCompareAngle] = useState<ScalpAngle>('crown');
  const sets = current ? [...previous, current] : previous;
  const shown = current ?? previous.at(-1) ?? null;
  const [leftId, setLeftId] = useState(sets[0]?.id ?? '');
  const left = sets.find((s) => s.id === leftId) ?? sets[0];
  const right = sets.at(-1);
  const variantOf = (id: string | undefined) =>
    Math.max(
      0,
      sets.findIndex((s) => s.id === id),
    );

  return (
    <div>
      {shown ? (
        <>
          <div className="grid grid-cols-3 gap-2">
            {ANGLES.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => {
                  setScale(1);
                  setZoom({ angle: a.id, set: shown });
                }}
                className="group relative aspect-square overflow-hidden rounded-md border border-line bg-mist focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={`Zoom ${a.label} photo`}
              >
                <ScalpPlaceholder angle={a.id} variant={variantOf(shown.id)} />
                <span className="absolute inset-x-0 bottom-0 bg-obsidian/70 px-1.5 py-1 text-left text-[12px] leading-tight text-on-dark">
                  {a.label}
                </span>
                <ZoomIn
                  className="absolute top-1.5 right-1.5 size-4 text-ink opacity-0 transition-opacity group-hover:opacity-100"
                  aria-hidden
                />
              </button>
            ))}
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            <p className="text-[13px] text-muted-foreground">
              {shown.label} · {shown.takenOn}
            </p>
            {sets.length > 1 ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9"
                onClick={() => setCompare(true)}
              >
                <Columns2 aria-hidden />
                Compare with previous
              </Button>
            ) : null}
          </div>
          {!current ? (
            <p className="mt-2">
              <StatusChip tone="warning">Photos missing for this consultation</StatusChip>
            </p>
          ) : null}
        </>
      ) : (
        <div className="flex flex-col items-center gap-2 rounded-md border border-dashed border-line bg-card px-4 py-6 text-center">
          <Camera className="size-5 text-steel" aria-hidden />
          <StatusChip tone="warning">Photos missing</StatusChip>
          <p className="max-w-xs text-[13px] text-muted-foreground">
            No scalp photos yet. Ask {patientName.split(' ')[0]} to upload front hairline, crown and parting
            photos from the booking link, or review on video.
          </p>
        </div>
      )}

      <Dialog open={zoom !== null} onOpenChange={(open) => !open && setZoom(null)}>
        <DialogContent mobileSheet className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{zoom ? ANGLES.find((a) => a.id === zoom.angle)?.label : ''}</DialogTitle>
            <DialogDescription>
              {zoom?.set.label} · {zoom?.set.takenOn} · demo placeholder image
            </DialogDescription>
          </DialogHeader>
          <div className="relative aspect-square max-h-[65dvh] w-full overflow-auto rounded-md border border-line bg-mist">
            {zoom ? (
              <div
                className="origin-top-left transition-transform duration-200"
                style={{ transform: `scale(${scale})`, width: '100%', height: '100%' }}
              >
                <ScalpPlaceholder angle={zoom.angle} variant={variantOf(zoom.set.id)} />
              </div>
            ) : null}
          </div>
          <div className="flex items-center justify-between gap-2">
            <p className="text-[13px] text-muted-foreground">Zoom {Math.round(scale * 100)}%</p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-10"
                aria-label="Zoom out"
                disabled={scale <= 1}
                onClick={() => setScale((s) => Math.max(1, s - 0.5))}
              >
                <Minus />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-10"
                aria-label="Zoom in"
                disabled={scale >= 3}
                onClick={() => setScale((s) => Math.min(3, s + 0.5))}
              >
                <Plus />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={compare} onOpenChange={setCompare}>
        <DialogContent mobileSheet className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Compare photos</DialogTitle>
            <DialogDescription>
              Same angle, side by side. Lighting and angle may differ between sets.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Angle">
            {ANGLES.map((a) => (
              <Button
                key={a.id}
                type="button"
                size="sm"
                variant={compareAngle === a.id ? 'default' : 'outline'}
                aria-pressed={compareAngle === a.id}
                className="h-9"
                onClick={() => setCompareAngle(a.id)}
              >
                {a.label}
              </Button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <figure>
              <div className="aspect-square overflow-hidden rounded-md border border-line bg-mist">
                <ScalpPlaceholder angle={compareAngle} variant={variantOf(left?.id)} />
              </div>
              <figcaption className="mt-2">
                <label className="sr-only" htmlFor="compare-left">
                  Earlier set
                </label>
                <select
                  id="compare-left"
                  value={left?.id}
                  onChange={(e) => setLeftId(e.target.value)}
                  className="h-10 w-full rounded-md border border-line bg-card px-2 text-sm text-ink"
                >
                  {sets.slice(0, -1).map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label} · {s.takenOn}
                    </option>
                  ))}
                </select>
              </figcaption>
            </figure>
            <figure>
              <div className="aspect-square overflow-hidden rounded-md border border-line bg-mist">
                <ScalpPlaceholder angle={compareAngle} variant={variantOf(right?.id)} />
              </div>
              <figcaption className="mt-2 flex h-10 items-center text-sm text-ink">
                {right?.label} · {right?.takenOn}
              </figcaption>
            </figure>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
