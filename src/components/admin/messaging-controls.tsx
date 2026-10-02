'use client';

import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toggleJourneyAction, updateQuietHoursAction } from '@/app/admin/messaging/actions';
import { useAction } from './action-kit';

export function JourneySwitch({
  journeyKey,
  label,
  enabled,
}: {
  journeyKey: string;
  label: string;
  enabled: boolean;
}) {
  const [on, setOn] = useState(enabled);
  const { pending, run } = useAction();
  return (
    <span className="inline-flex items-center gap-2">
      <span className="text-[13px] text-muted-foreground" aria-hidden>
        {on ? 'On' : 'Paused'}
      </span>
      <Switch
        checked={on}
        disabled={pending}
        aria-label={`${label}: ${on ? 'on' : 'paused'}`}
        onCheckedChange={(next) => {
          setOn(next);
          run(async () => {
            const res = await toggleJourneyAction({ key: journeyKey, enabled: next });
            if (!res.ok) setOn(!next);
            return res;
          });
        }}
      />
    </span>
  );
}

export function QuietHoursForm({ start, end }: { start: string; end: string }) {
  const [from, setFrom] = useState(start);
  const [to, setTo] = useState(end);
  const { pending, run } = useAction();
  const dirty = from !== start || to !== end;
  return (
    <form
      className="flex flex-wrap items-end gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        run(() => updateQuietHoursAction({ start: from, end: to }));
      }}
    >
      <div className="space-y-1">
        <Label htmlFor="qh-start">From (IST)</Label>
        <Input
          id="qh-start"
          type="time"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="w-32"
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="qh-end">Until (IST)</Label>
        <Input id="qh-end" type="time" value={to} onChange={(e) => setTo(e.target.value)} className="w-32" />
      </div>
      <Button type="submit" variant="outline" disabled={pending || !dirty} className="min-h-9">
        {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
        Save quiet hours
      </Button>
    </form>
  );
}
