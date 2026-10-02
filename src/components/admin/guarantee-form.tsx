'use client';

import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { saveDraftAction, type PolicyRulesInput } from '@/app/admin/guarantee/actions';
import { DemoResetNote, useAction } from './action-kit';

const NUMBER_FIELDS: { key: keyof PolicyRulesInput; label: string; suffix: string }[] = [
  { key: 'refundPercent', label: 'Refund', suffix: '% of plan payments' },
  { key: 'minPlanMonths', label: 'Minimum plan', suffix: 'months, continuous' },
  { key: 'claimWindowDays', label: 'Claim window', suffix: 'days after plan end' },
  { key: 'minCheckinResponsePct', label: 'Check-in replies', suffix: '% minimum' },
];

/** Draft editor for the next guarantee version. Saving never changes the live policy. */
export function GuaranteeDraftForm({ initial }: { initial: PolicyRulesInput }) {
  const [v, setV] = useState(initial);
  const [nums, setNums] = useState<Record<string, string>>(() =>
    Object.fromEntries(NUMBER_FIELDS.map((f) => [f.key, String(initial[f.key])])),
  );
  const [error, setError] = useState<string | null>(null);
  const { pending, run } = useAction();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed: Record<string, number> = {};
    for (const f of NUMBER_FIELDS) {
      const n = Number(nums[f.key]);
      if (!Number.isInteger(n) || n < 0) {
        setError(`${f.label} must be a whole number.`);
        return;
      }
      parsed[f.key] = n;
    }
    setError(null);
    run(() =>
      saveDraftAction({
        ...v,
        refundPercent: parsed.refundPercent ?? v.refundPercent,
        minPlanMonths: parsed.minPlanMonths ?? v.minPlanMonths,
        claimWindowDays: parsed.claimWindowDays ?? v.claimWindowDays,
        minCheckinResponsePct: parsed.minCheckinResponsePct ?? v.minCheckinResponsePct,
      }),
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="gp-name">Policy name</Label>
        <Input id="gp-name" value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {NUMBER_FIELDS.map((f) => (
          <div key={f.key} className="space-y-1.5">
            <Label htmlFor={`gp-${f.key}`}>{f.label}</Label>
            <div className="flex items-center gap-2">
              <Input
                id={`gp-${f.key}`}
                inputMode="numeric"
                className="w-24"
                value={nums[f.key] ?? ''}
                onChange={(e) => setNums({ ...nums, [f.key]: e.target.value })}
              />
              <span className="text-[13px] text-muted-foreground">{f.suffix}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex items-center justify-between gap-3 rounded-md border border-line p-3">
          <Label htmlFor="gp-photos">Monthly progress photos required</Label>
          <Switch
            id="gp-photos"
            checked={v.requireMonthlyPhotos}
            onCheckedChange={(c) => setV({ ...v, requireMonthlyPhotos: c })}
          />
        </div>
        <div className="flex items-center justify-between gap-3 rounded-md border border-line p-3">
          <Label htmlFor="gp-followup">Follow-up consultation required</Label>
          <Switch
            id="gp-followup"
            checked={v.requireFollowupConsult}
            onCheckedChange={(c) => setV({ ...v, requireFollowupConsult: c })}
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="gp-terms">Terms (shown beside every plan price, in these exact words)</Label>
        <Textarea
          id="gp-terms"
          rows={6}
          value={v.termsMd}
          onChange={(e) => setV({ ...v, termsMd: e.target.value })}
        />
        <p className="text-[12px] text-muted-foreground">
          State every condition. No “guaranteed regrowth”, “100%”, “cure” or fixed timelines (PRD §15).
        </p>
      </div>
      {error ? (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
          Save draft
        </Button>
        <DemoResetNote />
      </div>
    </form>
  );
}
