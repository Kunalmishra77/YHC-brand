'use client';

import { Bell, BellOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useSyncExternalStore } from 'react';
import { toast } from 'sonner';
import { pollAlertsAction } from '@/app/sales/actions';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const POLL_MS = 4000;
const MUTE_KEY = 'yhc.sales.alertsMuted';

type AudioCtor = typeof AudioContext;

// Mute preference as an external store (localStorage), so SSR renders "sound on" without an effect.
const muteListeners = new Set<() => void>();
function readMuted(): boolean {
  try {
    return window.localStorage.getItem(MUTE_KEY) === '1';
  } catch {
    return false; // storage blocked — default to sound on
  }
}
function writeMuted(value: boolean) {
  try {
    window.localStorage.setItem(MUTE_KEY, value ? '1' : '0');
  } catch {
    // ignore
  }
  muteListeners.forEach((l) => l());
}
function subscribeMuted(listener: () => void) {
  muteListeners.add(listener);
  window.addEventListener('storage', listener);
  return () => {
    muteListeners.delete(listener);
    window.removeEventListener('storage', listener);
  };
}

/**
 * FR-M7-6 realtime toasts + sound. Demo: polls domain events every 4 s
 * (stand-in for a Supabase Realtime channel). Starts at the latest event id — no toast storm.
 */
export function RealtimeAlerts({ initialLastId }: { initialLastId: number }) {
  const router = useRouter();
  const lastId = useRef(initialLastId);
  const inFlight = useRef(false);
  const audio = useRef<AudioContext | null>(null);
  const unlocked = useRef(false);
  const muted = useSyncExternalStore(subscribeMuted, readMuted, () => false);

  // Browsers only allow audio after a user gesture.
  useEffect(() => {
    const unlock = () => {
      unlocked.current = true;
      const Ctor: AudioCtor | undefined =
        window.AudioContext ?? (window as unknown as { webkitAudioContext?: AudioCtor }).webkitAudioContext;
      if (Ctor && !audio.current) audio.current = new Ctor();
      void audio.current?.resume();
    };
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);

  useEffect(() => {
    function beep(high: boolean) {
      const ctx = audio.current;
      if (!ctx || !unlocked.current || readMuted()) return;
      const now = ctx.currentTime;
      [0, 0.16].forEach((offset, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = high ? (i ? 1046 : 784) : i ? 660 : 523;
        gain.gain.setValueAtTime(0.0001, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.18, now + offset + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.14);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now + offset);
        osc.stop(now + offset + 0.15);
      });
    }

    async function poll() {
      if (inFlight.current || document.visibilityState === 'hidden') return;
      inFlight.current = true;
      try {
        const res = await pollAlertsAction(lastId.current);
        if (!res.ok) return;
        lastId.current = res.data.lastId;
        if (res.data.alerts.length === 0) return;
        for (const alert of res.data.alerts) {
          const action = alert.leadId
            ? { label: 'Open lead', onClick: () => router.push(`/sales/leads/${alert.leadId}`) }
            : undefined;
          if (alert.kind === 'new_lead') {
            toast(alert.title, { description: 'Assigned round-robin · first contact due', action });
          } else {
            toast.success(alert.title, {
              description:
                alert.kind === 'consult_paid' ? 'Consultation booked and paid' : 'Payment captured',
              action,
              duration: 8000,
            });
          }
        }
        beep(res.data.alerts.some((a) => a.kind !== 'new_lead'));
        router.refresh();
      } catch {
        // network blip — next tick retries
      } finally {
        inFlight.current = false;
      }
    }

    const timer = window.setInterval(() => void poll(), POLL_MS);
    return () => window.clearInterval(timer);
  }, [router]);

  function toggle() {
    const next = !muted;
    writeMuted(next);
    toast(next ? 'Alert sound off' : 'Alert sound on', { duration: 1500 });
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-10"
          onClick={toggle}
          aria-pressed={muted}
          aria-label={muted ? 'Turn alert sound on' : 'Turn alert sound off'}
        >
          {muted ? <BellOff className="size-5 text-steel" /> : <Bell className="size-5 text-ink" />}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        Live alerts for payments and new leads{muted ? ' · sound off' : ' · sound on'}
      </TooltipContent>
    </Tooltip>
  );
}
