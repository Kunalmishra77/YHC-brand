'use client';

import { Lock, Video } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

function stateAt(now: number, startsAt: number, endsAt: number, windowMs: number) {
  if (now >= endsAt) return 'ended' as const;
  if (now >= startsAt - windowMs) return 'open' as const;
  return 'waiting' as const;
}

/**
 * Prominent "Join consultation" button: active from `windowMinutes` before the start until the end.
 * The server passes its own view of "now" for the first paint; the client then re-checks every 15 s.
 */
export function JoinConsultButton({
  href,
  startsAt,
  endsAt,
  windowMinutes,
  initialOpen,
  className,
}: {
  href: string;
  startsAt: string;
  endsAt: string;
  windowMinutes: number;
  initialOpen: boolean;
  className?: string;
}) {
  const start = Date.parse(startsAt);
  const end = Date.parse(endsAt);
  const windowMs = windowMinutes * 60_000;
  const [state, setState] = useState<'waiting' | 'open' | 'ended'>(initialOpen ? 'open' : 'waiting');
  const [minutesLeft, setMinutesLeft] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      setState(stateAt(now, start, end, windowMs));
      setMinutesLeft(Math.max(0, Math.ceil((start - windowMs - now) / 60_000)));
    };
    const first = window.setTimeout(tick, 0);
    const id = window.setInterval(tick, 15_000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(id);
    };
  }, [start, end, windowMs]);

  if (state === 'open') {
    return (
      <Link
        href={href}
        className={cn(
          'bg-silver inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl px-6 text-[15px] font-semibold text-obsidian shadow-card hover:opacity-95 sm:w-auto',
          className,
        )}
      >
        <Video className="size-4" aria-hidden />
        Join consultation
      </Link>
    );
  }

  const opensIn =
    minutesLeft === null
      ? `Opens ${windowMinutes} minutes before the start`
      : minutesLeft > 120
        ? `Opens ${windowMinutes} minutes before the start`
        : `Opens in ${minutesLeft} min`;

  return (
    <div className={cn('flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3', className)}>
      <button
        type="button"
        disabled
        aria-describedby="join-hint"
        className="inline-flex h-12 w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-mist px-6 text-[15px] font-semibold text-muted-foreground sm:w-auto"
      >
        <Lock className="size-4" aria-hidden />
        Join consultation
      </button>
      <p id="join-hint" className="text-[13px] text-muted-foreground">
        {state === 'ended' ? 'This consultation time has passed.' : opensIn}
      </p>
    </div>
  );
}
