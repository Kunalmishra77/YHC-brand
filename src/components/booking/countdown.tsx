'use client';

import { Timer } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * Hold timer mm:ss (FR-M3-5, docs/07 §5). `deadline` is a client-clock epoch (ms) derived from the
 * server's seconds-left, so device clock skew does not matter. Warns at 2 min via aria-live.
 */
export function Countdown({
  deadline,
  onExpire,
  warnAtSeconds = 120,
  className,
}: {
  deadline: number;
  onExpire?: () => void;
  warnAtSeconds?: number;
  className?: string;
}) {
  const [now, setNow] = useState<number | null>(null);
  const expiredRef = useRef(false);
  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    expiredRef.current = false;
    const tick = () => {
      const n = Date.now();
      setNow(n);
      if (n >= deadline && !expiredRef.current) {
        expiredRef.current = true;
        onExpireRef.current?.();
      }
    };
    const first = window.setTimeout(tick, 0);
    const id = window.setInterval(tick, 1000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(id);
    };
  }, [deadline]);

  const left = now === null ? null : Math.max(0, Math.ceil((deadline - now) / 1000));
  const mm = left === null ? '--' : String(Math.floor(left / 60)).padStart(2, '0');
  const ss = left === null ? '--' : String(left % 60).padStart(2, '0');
  const warn = left !== null && left <= warnAtSeconds && left > 0;
  const over = left === 0;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium',
        over ? 'bg-danger-bg text-danger' : warn ? 'bg-warning-bg text-warning' : 'bg-mist text-ink',
        className,
      )}
    >
      <Timer className="size-4" aria-hidden />
      <span>
        {over ? 'Hold ended' : 'Slot held for'}{' '}
        {!over ? (
          <span className="price" aria-hidden>
            {mm}:{ss}
          </span>
        ) : null}
      </span>
      {/* Screen readers: announce only at the warning threshold and on expiry, not every second. */}
      <span className="sr-only" aria-live="assertive">
        {over
          ? 'Your slot hold has ended.'
          : warn
            ? `Less than ${Math.ceil(warnAtSeconds / 60)} minutes left to pay before the slot is released.`
            : ''}
      </span>
      {!over && left !== null ? (
        <span className="sr-only">
          {Math.floor(left / 60)} minutes {left % 60} seconds left
        </span>
      ) : null}
    </div>
  );
}
