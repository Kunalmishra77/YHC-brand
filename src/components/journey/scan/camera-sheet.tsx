'use client';

import { CameraOff, ImageUp, Loader2, RefreshCcw, RotateCcw, SwitchCamera, X } from 'lucide-react';
import { Dialog } from 'radix-ui';
import { useEffect, useRef, useState } from 'react';
import { ANGLE_LABEL } from '@/lib/journey/labels';
import type { CaptureZone } from '@/lib/journey/types';
import { cn } from '@/lib/utils';
import styles from '../journey.module.css';
import { hasCamera, reencode, reencodeFile } from './encode';

/*
 * Full-bleed camera for one scan zone (phones: the whole screen; desktop: a phone-sized frame).
 * Environment camera by default, switchable; a photo picker is the fallback when there is no camera
 * or permission. Frames are re-encoded locally — nothing is uploaded.
 */

type Facing = 'user' | 'environment';
type CameraState = 'starting' | 'live' | 'unavailable';

interface CameraSheetProps {
  open: boolean;
  zone: CaptureZone;
  /** local preview of this zone's photo, when one exists */
  shotUrl: string | null;
  onOpenChange: (open: boolean) => void;
  onCapture: (blob: Blob) => void;
  /** element to focus after closing (defaults to the opener) */
  returnFocusTo?: React.RefObject<HTMLElement | null>;
}

export function CameraSheet({
  open,
  zone,
  shotUrl,
  onOpenChange,
  onCapture,
  returnFocusTo,
}: CameraSheetProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm" />
        <Dialog.Content
          onCloseAutoFocus={(e) => {
            const target = returnFocusTo?.current;
            if (target && !target.hasAttribute('disabled')) {
              e.preventDefault();
              target.focus();
            }
          }}
          className="fixed inset-0 z-[70] overflow-hidden bg-black text-white outline-none lg:inset-auto lg:top-1/2 lg:left-1/2 lg:h-[min(800px,92dvh)] lg:w-[400px] lg:-translate-x-1/2 lg:-translate-y-1/2 lg:rounded-[2.75rem] lg:ring-8 lg:ring-graphite"
        >
          <Dialog.Title className="sr-only">Scan {ANGLE_LABEL[zone]}</Dialog.Title>
          <Dialog.Description className="sr-only">
            Hold the camera 10 to 15 centimetres from the scalp, then press the round shutter button.
          </Dialog.Description>
          <CameraView
            zone={zone}
            shotUrl={shotUrl}
            onCapture={onCapture}
            onClose={() => onOpenChange(false)}
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function CameraView({
  zone,
  shotUrl,
  onCapture,
  onClose,
}: {
  zone: CaptureZone;
  shotUrl: string | null;
  onCapture: (blob: Blob) => void;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [camera, setCamera] = useState<CameraState>(() => (hasCamera() ? 'starting' : 'unavailable'));
  const [facing, setFacing] = useState<Facing>('environment');
  const [attempt, setAttempt] = useState(0);
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [announce, setAnnounce] = useState('');
  /** a photo was taken in this camera session (an earlier photo stays until it is replaced) */
  const [took, setTook] = useState(false);

  // Start (or restart) the stream; always stop it on unmount / facing change.
  useEffect(() => {
    if (!hasCamera()) return;
    const video = videoRef.current;
    let cancelled = false;
    let stream: MediaStream | null = null;
    navigator.mediaDevices
      .getUserMedia({
        video: { facingMode: { ideal: facing }, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      })
      .then(async (s) => {
        stream = s;
        if (cancelled) {
          for (const t of s.getTracks()) t.stop();
          return;
        }
        if (video) {
          video.srcObject = s;
          await video.play().catch(() => undefined);
        }
        if (!cancelled) setCamera('live');
      })
      .catch(() => {
        if (!cancelled) setCamera('unavailable');
      });
    return () => {
      cancelled = true;
      for (const t of stream?.getTracks() ?? []) t.stop();
      if (video) video.srcObject = null;
    };
  }, [facing, attempt]);

  const restart = (next: Facing) => {
    setError(null);
    setCamera('starting');
    if (next === facing) setAttempt((a) => a + 1);
    else setFacing(next);
  };

  const capture = async () => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0 || busy) return;
    setBusy(true);
    setFlash(true);
    window.setTimeout(() => setFlash(false), 160);
    try {
      onCapture(await reencode(video, video.videoWidth, video.videoHeight));
      setTook(true);
      setAnnounce(`${ANGLE_LABEL[zone]} captured. Press Done to continue, or Retake.`);
    } catch {
      setError('We could not capture that frame. Please try again or choose a photo.');
    } finally {
      setBusy(false);
    }
  };

  const upload = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('That file is not a photo. Please choose a JPG or PNG.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      onCapture(await reencodeFile(file));
      setTook(true);
      setAnnounce(`${ANGLE_LABEL[zone]} photo added. Press Done to continue.`);
    } catch {
      setError('We could not read that photo. Please try another one.');
    } finally {
      setBusy(false);
    }
  };

  const reviewing = took && Boolean(shotUrl);
  const live = camera === 'live';

  return (
    <div className="relative flex h-full flex-col">
      {/* live feed / review */}
      <video
        ref={videoRef}
        playsInline
        muted
        aria-hidden
        className={cn(
          'absolute inset-0 size-full object-cover transition-opacity duration-300 motion-reduce:transition-none',
          live && !reviewing ? 'opacity-100' : 'opacity-0',
          facing === 'user' && '-scale-x-100',
        )}
      />
      {reviewing && shotUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- local blob preview, never uploaded
        <img
          src={shotUrl}
          alt={`Your ${ANGLE_LABEL[zone]} photo`}
          className="absolute inset-0 size-full object-cover"
        />
      ) : null}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-black/70"
        aria-hidden
      />

      {/* viewfinder */}
      {!reviewing && camera !== 'unavailable' ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden>
          <div className="relative aspect-square w-[min(68vw,290px)] lg:w-[250px]">
            <span className="absolute top-0 left-0 size-11 rounded-tl-md border-t-[3px] border-l-[3px] border-white" />
            <span className="absolute top-0 right-0 size-11 rounded-tr-md border-t-[3px] border-r-[3px] border-white" />
            <span className="absolute bottom-0 left-0 size-11 rounded-bl-md border-b-[3px] border-l-[3px] border-white" />
            <span className="absolute right-0 bottom-0 size-11 rounded-br-md border-r-[3px] border-b-[3px] border-white" />
            {live ? <span className={styles.scanLine} /> : null}
          </div>
        </div>
      ) : null}
      {flash ? <div className="absolute inset-0 bg-white/70" aria-hidden /> : null}

      {/* top bar */}
      <div className="relative flex items-start justify-between gap-3 px-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-black/45 px-3.5 py-2 text-sm font-medium backdrop-blur-md">
            {ANGLE_LABEL[zone]}
          </span>
          {live && !reviewing ? (
            <button
              type="button"
              onClick={() => restart(facing === 'user' ? 'environment' : 'user')}
              aria-label={facing === 'user' ? 'Switch to back camera' : 'Switch to front camera'}
              className="flex size-12 items-center justify-center rounded-full bg-black/45 backdrop-blur-md hover:bg-black/60"
            >
              <SwitchCamera className="size-5" aria-hidden />
            </button>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close camera"
          className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white text-obsidian shadow-lg hover:bg-pearl"
        >
          <X className="size-6" strokeWidth={1.75} aria-hidden />
        </button>
      </div>

      {/* centre states */}
      <div className="relative flex flex-1 items-center justify-center px-6">
        {camera === 'starting' && !reviewing ? (
          <p className="flex items-center gap-2 rounded-full bg-black/50 px-4 py-2 text-sm backdrop-blur-md">
            <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden />
            Starting camera — allow access if asked
          </p>
        ) : null}
        {camera === 'unavailable' && !reviewing ? (
          <div className="w-full max-w-xs rounded-3xl bg-white/10 p-5 text-center ring-1 ring-white/15 backdrop-blur-md">
            <CameraOff className="mx-auto size-7" aria-hidden />
            <p className="mt-3 font-medium">Camera not available</p>
            <p className="mt-1 text-sm text-white/75">
              Allow camera access in your browser settings, or take or choose a photo instead.
            </p>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={busy}
              className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-white text-[15px] font-semibold text-obsidian disabled:opacity-60"
            >
              <ImageUp className="size-4" aria-hidden />
              Take or choose a photo
            </button>
            {hasCamera() ? (
              <button
                type="button"
                onClick={() => restart(facing)}
                className="mt-2 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full text-sm text-white ring-1 ring-white/30 hover:bg-white/10"
              >
                <RefreshCcw className="size-4" aria-hidden />
                Try the camera again
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      {/* status + controls */}
      <div className="relative px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <p className="mb-4 min-h-5 text-center text-sm text-white/85">
          {error ? (
            <span role="alert" className="text-[#ffc2b8]">
              {error}
            </span>
          ) : reviewing ? (
            'Captured — check it is sharp, then tap Done'
          ) : live ? (
            'Hold 10–15 cm away and keep steady'
          ) : null}
        </p>
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          <div className="flex justify-start">
            {reviewing ? (
              <button
                type="button"
                onClick={() => {
                  setAnnounce('');
                  setTook(false);
                }}
                className="inline-flex h-12 items-center gap-2 rounded-full bg-black/45 px-4 text-sm font-medium backdrop-blur-md hover:bg-black/60"
              >
                <RotateCcw className="size-4" aria-hidden />
                Retake
              </button>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={busy}
                aria-label="Choose a photo instead"
                className="flex size-12 items-center justify-center rounded-full bg-black/45 backdrop-blur-md hover:bg-black/60 disabled:opacity-50"
              >
                <ImageUp className="size-5" aria-hidden />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => void capture()}
            disabled={!live || reviewing || busy}
            aria-label={`Take photo of ${ANGLE_LABEL[zone]}`}
            className="group flex size-[78px] items-center justify-center rounded-full border-[4px] border-white transition-transform active:scale-95 disabled:opacity-40 motion-reduce:transition-none"
          >
            <span className="size-[60px] rounded-full bg-white transition-transform group-active:scale-90 motion-reduce:transition-none" />
          </button>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={!reviewing}
              className={cn(
                'inline-flex h-12 items-center rounded-full px-6 text-[15px] font-semibold backdrop-blur-md transition-colors motion-reduce:transition-none',
                reviewing ? 'bg-white text-obsidian' : 'bg-white/15 text-white/70',
              )}
            >
              Done
            </button>
          </div>
        </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(e) => {
          void upload(e.currentTarget.files?.[0]);
          e.currentTarget.value = '';
        }}
      />
      <p className="sr-only" aria-live="polite">
        {announce}
      </p>
    </div>
  );
}
