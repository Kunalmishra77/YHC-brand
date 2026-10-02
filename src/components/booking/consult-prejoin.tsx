'use client';

import { Camera, CameraOff, Mic, MicOff, Sun, Volume2, Wifi } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Check = 'idle' | 'asking' | 'ok' | 'denied' | 'unavailable';

/**
 * Patient pre-join (FR-M5-6): local camera/mic check, then a waiting state until the doctor admits.
 * Demo: LiveKit is not connected — the stage is a placeholder. Nothing is recorded.
 * TODO(phase-06): LiveKit room token from the server; Google Meet fallback link.
 */
export function ConsultPrejoin({
  admitAt,
  doctorName,
  minutes,
}: {
  admitAt: string;
  doctorName: string;
  minutes: number;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const [check, setCheck] = useState<Check>('idle');
  const [camOn, setCamOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [level, setLevel] = useState(0);
  const [waiting, setWaiting] = useState(false);

  useEffect(
    () => () => {
      stream.current?.getTracks().forEach((t) => t.stop());
    },
    [],
  );

  const start = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCheck('unavailable');
      return;
    }
    setCheck('asking');
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: true });
      stream.current = s;
      if (video.current) {
        video.current.srcObject = s;
        await video.current.play().catch(() => undefined);
      }
      setCheck('ok');
      // Simple mic level meter
      const AudioCtx = window.AudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        ctx.createMediaStreamSource(s).connect(analyser);
        const data = new Uint8Array(analyser.frequencyBinCount);
        const loop = () => {
          if (!stream.current) {
            void ctx.close();
            return;
          }
          analyser.getByteFrequencyData(data);
          const avg = data.reduce((a, b) => a + b, 0) / data.length;
          setLevel(Math.min(1, avg / 60));
          window.setTimeout(loop, 120);
        };
        loop();
      }
    } catch (e) {
      setCheck(e instanceof DOMException && e.name === 'NotAllowedError' ? 'denied' : 'unavailable');
    }
  };

  const toggle = (kind: 'video' | 'audio') => {
    const tracks = kind === 'video' ? stream.current?.getVideoTracks() : stream.current?.getAudioTracks();
    const next = kind === 'video' ? !camOn : !micOn;
    tracks?.forEach((t) => (t.enabled = next));
    if (kind === 'video') setCamOn(next);
    else setMicOn(next);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div>
        {/* Stage */}
        <div className="relative aspect-video overflow-hidden rounded-xl border border-line-dark bg-ink-2">
          <video
            ref={video}
            muted
            playsInline
            className={cn(
              'absolute inset-0 size-full -scale-x-100 object-cover',
              check === 'ok' && camOn ? 'opacity-100' : 'opacity-0',
            )}
          />
          {check !== 'ok' || !camOn ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
              <span className="flex size-16 items-center justify-center rounded-full bg-graphite">
                {check === 'ok' ? (
                  <CameraOff className="size-6 text-platinum" aria-hidden />
                ) : (
                  <Camera className="size-6 text-platinum" aria-hidden />
                )}
              </span>
              <p className="max-w-sm text-sm text-on-dark-muted">
                {check === 'idle' && 'Check your camera and microphone before Dr. Tyagi admits you.'}
                {check === 'asking' && 'Allow camera and microphone in your browser prompt…'}
                {check === 'denied' &&
                  'Camera or microphone was blocked. Allow them from your browser’s address bar, then try again.'}
                {check === 'unavailable' &&
                  'We couldn’t find a camera or microphone. You can still join — or switch to a phone.'}
                {check === 'ok' && !camOn && 'Camera is off.'}
              </p>
            </div>
          ) : null}
          <span className="absolute top-3 left-3 rounded-sm bg-warning-bg px-2 py-0.5 text-[12px] font-semibold text-warning">
            DEMO
          </span>
          <span className="absolute right-3 bottom-3 left-3 rounded-md bg-black/55 px-3 py-2 text-center text-[13px] text-on-dark">
            Video (LiveKit) connects here — demo
          </span>
        </div>

        {/* Controls */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {check === 'ok' ? (
            <>
              <Button
                variant="outline"
                onClick={() => toggle('video')}
                aria-pressed={!camOn}
                className="h-12 border-line-dark bg-transparent px-4 text-on-dark hover:bg-graphite hover:text-on-dark"
              >
                {camOn ? (
                  <Camera className="size-4" aria-hidden />
                ) : (
                  <CameraOff className="size-4" aria-hidden />
                )}
                {camOn ? 'Camera on' : 'Camera off'}
              </Button>
              <Button
                variant="outline"
                onClick={() => toggle('audio')}
                aria-pressed={!micOn}
                className="h-12 border-line-dark bg-transparent px-4 text-on-dark hover:bg-graphite hover:text-on-dark"
              >
                {micOn ? <Mic className="size-4" aria-hidden /> : <MicOff className="size-4" aria-hidden />}
                {micOn ? 'Mic on' : 'Mic off'}
              </Button>
              <div className="flex h-12 items-center gap-2 px-2" aria-label="Microphone level">
                <Volume2 className="size-4 text-platinum" aria-hidden />
                <span className="h-1.5 w-24 overflow-hidden rounded-full bg-graphite">
                  <span
                    className="block h-full rounded-full bg-platinum transition-[width] duration-100 motion-reduce:transition-none"
                    style={{ width: `${Math.round((micOn ? level : 0) * 100)}%` }}
                  />
                </span>
              </div>
            </>
          ) : (
            <Button
              onClick={start}
              disabled={check === 'asking'}
              className="bg-silver h-12 px-6 text-base text-obsidian hover:opacity-90"
            >
              <Camera className="size-4" aria-hidden />
              {check === 'denied' || check === 'unavailable' ? 'Try again' : 'Check camera and mic'}
            </Button>
          )}
        </div>
      </div>

      <aside className="space-y-5">
        <div className="rounded-xl border border-line-dark bg-ink-2 p-5">
          {waiting ? (
            <div aria-live="polite">
              <p className="flex items-center gap-2 text-sm font-medium text-on-dark">
                <span className="relative flex size-2.5">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-platinum opacity-60 motion-reduce:animate-none" />
                  <span className="relative inline-flex size-2.5 rounded-full bg-platinum" />
                </span>
                You&apos;re in the waiting room
              </p>
              <p className="mt-2 text-sm text-on-dark-muted">
                {doctorName} will admit you at {admitAt}. Please keep this page open.
              </p>
            </div>
          ) : (
            <>
              <p className="text-sm text-on-dark-muted">{minutes}-minute video consultation</p>
              <p className="mt-1 text-lg font-medium text-on-dark">
                {doctorName} will admit you at {admitAt}
              </p>
              <Button
                onClick={() => setWaiting(true)}
                className="bg-silver mt-5 h-12 w-full text-base text-obsidian hover:opacity-90"
              >
                Join waiting room
              </Button>
            </>
          )}
          <p className="mt-4 text-[13px] text-on-dark-muted">
            This consultation is not recorded. Only you and {doctorName} are in the call.
          </p>
        </div>

        <div className="rounded-xl border border-line-dark p-5">
          <p className="text-sm font-medium text-on-dark">For a clear consultation</p>
          <ul className="mt-3 space-y-3 text-sm text-on-dark-muted">
            <li className="flex gap-2.5">
              <Sun className="mt-0.5 size-4 shrink-0 text-platinum" aria-hidden />
              Face a window or a lamp — light in front of you, not behind. Dr. Tyagi may ask to see your
              hairline and crown.
            </li>
            <li className="flex gap-2.5">
              <Wifi className="mt-0.5 size-4 shrink-0 text-platinum" aria-hidden />
              Use Wi-Fi or a strong 4G signal, and close other apps using the camera.
            </li>
            <li className="flex gap-2.5">
              <Volume2 className="mt-0.5 size-4 shrink-0 text-platinum" aria-hidden />A quiet room and
              earphones help you both hear clearly.
            </li>
          </ul>
        </div>
      </aside>
    </div>
  );
}
