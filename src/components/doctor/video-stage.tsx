'use client';

import { Circle, Mic, MicOff, PhoneOff, Video, VideoOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { initials } from '@/components/doctor/format';
import { cn } from '@/lib/utils';

/**
 * Video stage placeholder (FR-M5-6). TODO(client): LiveKit API key/secret + Google Meet fallback
 * decision — see docs/12. The real stage mounts LiveKit's <VideoConference> here. No recording.
 */
export function VideoStage({
  patientName,
  doctorName,
  ended,
  disabled,
}: {
  patientName: string;
  doctorName: string;
  ended: boolean;
  disabled: boolean;
}) {
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(0);
  const [mic, setMic] = useState(true);
  const [cam, setCam] = useState(true);
  const live = startedAt !== null && !ended;

  useEffect(() => {
    if (!live) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [live]);

  const elapsed = live && now ? Math.max(0, Math.floor((now - startedAt) / 1000)) : 0;
  const clock = `${String(Math.floor(elapsed / 60)).padStart(2, '0')}:${String(elapsed % 60).padStart(2, '0')}`;

  const status = ended
    ? 'Consultation ended'
    : live
      ? `Live · ${clock}`
      : disabled
        ? 'Video opens once the slot is paid'
        : `${patientName.split(' ')[0]} is waiting in the lobby (demo)`;

  return (
    <div
      className="overflow-hidden rounded-lg bg-obsidian text-on-dark"
      style={{ backgroundImage: 'var(--yhc-hero-dark)' }}
    >
      <div className="relative aspect-video w-full">
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <span
            className={cn(
              'flex size-16 items-center justify-center rounded-full border border-line-dark bg-graphite text-xl font-medium',
              live && 'ring-2 ring-brand-on-dark/60 ring-offset-2 ring-offset-obsidian',
            )}
            aria-hidden
          >
            {initials(patientName)}
          </span>
          <p className="text-sm text-on-dark">{live ? patientName : 'LiveKit video — demo'}</p>
          <p className="text-[13px] text-on-dark-muted" aria-live="polite">
            {status}
          </p>
        </div>
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-ink-2/80 px-2.5 py-1 text-[12px] text-on-dark-muted">
            <Circle className="size-2.5" aria-hidden /> No recording
          </span>
          {live ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-success-bg px-2.5 py-1 text-[12px] font-medium text-success">
              <span className="size-1.5 rounded-full bg-success" aria-hidden /> Connected
            </span>
          ) : null}
        </div>
        {live ? (
          <div className="absolute right-3 bottom-3 flex aspect-video h-[22%] min-h-12 items-center justify-center rounded-md border border-line-dark bg-graphite text-[12px] text-on-dark-muted">
            {cam ? doctorName : 'Camera off'}
          </div>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line-dark px-3 py-2.5">
        <p className="text-[12px] text-on-dark-muted">Fallback: Google Meet link (TODO)</p>
        <div className="flex gap-2">
          {live ? (
            <>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="size-10 text-on-dark hover:bg-graphite hover:text-on-dark"
                aria-label={mic ? 'Mute microphone' : 'Unmute microphone'}
                aria-pressed={!mic}
                onClick={() => setMic((m) => !m)}
              >
                {mic ? <Mic /> : <MicOff />}
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="size-10 text-on-dark hover:bg-graphite hover:text-on-dark"
                aria-label={cam ? 'Turn camera off' : 'Turn camera on'}
                aria-pressed={!cam}
                onClick={() => setCam((c) => !c)}
              >
                {cam ? <Video /> : <VideoOff />}
              </Button>
              <Button
                type="button"
                size="sm"
                className="h-10 bg-danger text-white hover:bg-danger/90"
                onClick={() => setStartedAt(null)}
              >
                <PhoneOff aria-hidden />
                Leave call
              </Button>
            </>
          ) : (
            <Button
              type="button"
              size="sm"
              disabled={ended || disabled}
              className="h-10 text-obsidian"
              style={{ backgroundImage: 'var(--yhc-silver)' }}
              onClick={() => {
                const t = Date.now();
                setStartedAt(t);
                setNow(t);
              }}
            >
              <Video aria-hidden />
              Start video
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
