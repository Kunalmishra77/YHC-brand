'use client';

import { Camera, Check, Loader2, RotateCcw, Trash2 } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export type PhotoAngle = 'front' | 'crown' | 'parting';

const ANGLES: { id: PhotoAngle; title: string; tip: string }[] = [
  {
    id: 'front',
    title: 'Front hairline',
    tip: 'Face the camera, hair pushed back, forehead and temples in view.',
  },
  {
    id: 'crown',
    title: 'Crown',
    tip: 'Ask someone to help, or use a mirror — photograph the top-back of your head from above.',
  },
  {
    id: 'parting',
    title: 'Parting',
    tip: 'Part your hair in the middle and photograph straight down along the line.',
  },
];

const MAX_EDGE = 2048;
const QUALITY = 0.8;

/**
 * Re-encode in the browser (TRD §7): honour EXIF orientation, downscale to ≤ 2048 px, JPEG q≈0.8.
 * Drawing through a canvas drops all EXIF/GPS metadata.
 */
async function reencode(file: File): Promise<Blob> {
  if (!file.type.startsWith('image/')) throw new Error('not_image');
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('no_canvas');
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('encode_failed'))), 'image/jpeg', QUALITY),
  );
}

type Shot =
  | { state: 'empty' }
  | { state: 'working' }
  | { state: 'done'; url: string; kb: number }
  | { state: 'error'; message: string };

/** Guided scalp photos (FR-M3-10, docs/07 §5): three angles with an outline, preview, retry/remove. */
export function PhotoUploader({
  onChange,
  initialCount = 0,
}: {
  /** number of angles with a photo ready */
  onChange: (count: number) => void;
  /** photos already saved earlier (demo keeps only the count) */
  initialCount?: number;
}) {
  const [shots, setShots] = useState<Record<PhotoAngle, Shot>>({
    front: { state: 'empty' },
    crown: { state: 'empty' },
    parting: { state: 'empty' },
  });
  const urls = useRef<string[]>([]);

  useEffect(
    () => () => {
      for (const u of urls.current) URL.revokeObjectURL(u);
    },
    [],
  );

  const update = (angle: PhotoAngle, shot: Shot) => setShots((prev) => ({ ...prev, [angle]: shot }));

  const ready = Object.values(shots).filter((s) => s.state === 'done').length;
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);
  useEffect(() => {
    onChangeRef.current(ready);
  }, [ready]);

  const remove = (angle: PhotoAngle) => {
    const current = shots[angle];
    if (current.state === 'done') URL.revokeObjectURL(current.url);
    update(angle, { state: 'empty' });
  };

  const handle = async (angle: PhotoAngle, file: File | undefined) => {
    if (!file) return;
    update(angle, { state: 'working' });
    try {
      const blob = await reencode(file);
      const url = URL.createObjectURL(blob);
      urls.current.push(url);
      update(angle, { state: 'done', url, kb: Math.round(blob.size / 1024) });
    } catch (e) {
      update(angle, {
        state: 'error',
        message:
          e instanceof Error && e.message === 'not_image'
            ? 'That file is not a photo. Please choose a JPG or PNG.'
            : 'We could not read that photo. Please try again or use another one.',
      });
    }
  };

  return (
    <div>
      {initialCount > 0 && ready === 0 ? (
        <p className="mb-3 text-sm text-muted-foreground">
          {initialCount} of 3 photos saved earlier. Add them again only if you&apos;d like to replace them.
        </p>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-3">
        {ANGLES.map((a, i) => (
          <PhotoSlot
            key={a.id}
            index={i + 1}
            angle={a}
            shot={shots[a.id]}
            onFile={(f) => void handle(a.id, f)}
            onRemove={() => remove(a.id)}
          />
        ))}
      </div>
      <p className="mt-3 text-sm text-muted-foreground" aria-live="polite">
        {ready} of 3 photos ready · Natural daylight, dry hair, no filters. Photos are resized on your phone
        and location data is removed before upload.
      </p>
    </div>
  );
}

function PhotoSlot({
  index,
  angle,
  shot,
  onFile,
  onRemove,
}: {
  index: number;
  angle: (typeof ANGLES)[number];
  shot: Shot;
  onFile: (file: File | undefined) => void;
  onRemove: () => void;
}) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const pick = () => input.current?.click();

  return (
    <div
      className={cn(
        'flex flex-col overflow-hidden rounded-lg border bg-card',
        shot.state === 'done'
          ? 'border-success/40'
          : shot.state === 'error'
            ? 'border-danger/40'
            : 'border-line',
      )}
    >
      <div className="relative aspect-[4/3] bg-obsidian">
        {shot.state === 'done' ? (
          // eslint-disable-next-line @next/next/no-img-element -- local blob preview, not an optimisable asset
          <img src={shot.url} alt={`${angle.title} photo preview`} className="size-full object-cover" />
        ) : (
          <Guide angle={angle.id} />
        )}
        {shot.state === 'working' ? (
          <div className="absolute inset-0 flex items-center justify-center bg-obsidian/70 text-on-dark">
            <Loader2 className="size-5 animate-spin motion-reduce:animate-none" aria-hidden />
            <span className="ml-2 text-sm">Preparing…</span>
          </div>
        ) : null}
        <span className="absolute top-2 left-2 rounded-full bg-black/50 px-2 py-0.5 text-[12px] text-on-dark">
          {index} of 3
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-ink">{angle.title}</p>
          {shot.state === 'done' ? (
            <span className="inline-flex items-center gap-1 text-[13px] text-success">
              <Check className="size-3.5" aria-hidden />
              Ready · {shot.kb} KB
            </span>
          ) : null}
        </div>
        <p className="text-[13px] leading-snug text-muted-foreground">{angle.tip}</p>
        {shot.state === 'error' ? (
          <p role="alert" className="text-[13px] text-danger">
            {shot.message}
          </p>
        ) : null}
        <input
          ref={input}
          id={id}
          type="file"
          accept="image/*"
          capture="environment"
          className="sr-only"
          tabIndex={-1}
          onChange={(e) => {
            onFile(e.currentTarget.files?.[0]);
            e.currentTarget.value = '';
          }}
        />
        <div className="mt-auto flex gap-2 pt-1">
          {shot.state === 'done' ? (
            <>
              <button
                type="button"
                onClick={pick}
                className="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-md border border-line text-sm font-medium text-ink hover:border-steel"
              >
                <RotateCcw className="size-4" aria-hidden />
                Retake
              </button>
              <button
                type="button"
                onClick={onRemove}
                aria-label={`Remove ${angle.title} photo`}
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-line text-body hover:border-danger hover:text-danger"
              >
                <Trash2 className="size-4" aria-hidden />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={pick}
              disabled={shot.state === 'working'}
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-md bg-obsidian text-sm font-medium text-on-dark hover:bg-graphite disabled:opacity-60"
            >
              <Camera className="size-4" aria-hidden />
              {shot.state === 'error' ? 'Try again' : `Add ${angle.title.toLowerCase()}`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/** Outline overlay showing how to frame each angle. */
function Guide({ angle }: { angle: PhotoAngle }) {
  const stroke = 'stroke-platinum';
  return (
    <svg viewBox="0 0 160 120" className="size-full" aria-hidden fill="none" strokeWidth="1.5">
      {/* framing corners */}
      <g className="stroke-steel" strokeLinecap="round">
        <path d="M14 26V14h12M146 26V14h-12M14 94v12h12M146 94v12h-12" />
      </g>
      {angle === 'front' ? (
        <g className={stroke} strokeDasharray="4 4">
          <ellipse cx="80" cy="66" rx="30" ry="38" />
          <path d="M52 52c6-20 50-24 56 0" strokeDasharray="none" />
          <path d="M60 46c-3 6-4 10-4 14M100 46c3 6 4 10 4 14" strokeDasharray="none" />
        </g>
      ) : null}
      {angle === 'crown' ? (
        <g className={stroke}>
          <circle cx="80" cy="60" r="38" strokeDasharray="4 4" />
          <path d="M80 60c6-2 8-8 3-12s-14-2-16 6 4 18 14 18 20-8 20-20" />
        </g>
      ) : null}
      {angle === 'parting' ? (
        <g className={stroke}>
          <ellipse cx="80" cy="60" rx="34" ry="42" strokeDasharray="4 4" />
          <path d="M80 20v80" />
          <path d="M80 34l-10 4M80 50l-12 4M80 66l-12 4M80 34l10 4M80 50l12 4M80 66l12 4" />
        </g>
      ) : null}
    </svg>
  );
}
