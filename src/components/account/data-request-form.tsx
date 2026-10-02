'use client';

import { CheckCircle2 } from 'lucide-react';
import { useState, useTransition } from 'react';
import { submitDataRequestAction } from '@/app/account/actions';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';

type Kind = 'access' | 'correction' | 'erasure' | 'grievance';

const KINDS: { id: Kind; title: string; body: string }[] = [
  {
    id: 'access',
    title: 'Get a copy of my data',
    body: 'Your profile, orders, consultation summaries and photos.',
  },
  { id: 'correction', title: 'Correct my data', body: 'Something in your profile or records is wrong.' },
  {
    id: 'erasure',
    title: 'Delete my data',
    body: 'Close your account and erase what we are allowed to erase.',
  },
  {
    id: 'grievance',
    title: 'Raise a grievance',
    body: 'A complaint about how we handled your data or care.',
  },
];

/** FR-M14-5 data requests. Demo: acknowledged + audited; Phase 12 adds the `data_requests` workflow and SLA timer. */
export function DataRequestForm({ slaNote }: { slaNote: string }) {
  const [kind, setKind] = useState<Kind>('access');
  const [details, setDetails] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    start(async () => {
      const res = await submitDataRequestAction({ kind, details });
      if (!res.ok) {
        setError(res.error.message);
        return;
      }
      setReference(res.data.reference);
      setDetails('');
    });
  }

  if (reference) {
    return (
      <div role="status" className="flex flex-col items-start gap-2 rounded-lg bg-success-bg p-4">
        <CheckCircle2 className="size-5 text-success" aria-hidden />
        <p className="font-medium text-ink">Request received · reference {reference}</p>
        <p className="text-sm text-body">{slaNote}</p>
        <Button variant="outline" className="mt-2 h-11 bg-card px-5" onClick={() => setReference(null)}>
          Make another request
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      <fieldset>
        <legend className="text-sm font-medium text-ink">What would you like to do?</legend>
        <RadioGroup
          value={kind}
          onValueChange={(v) => setKind(v as Kind)}
          className="mt-3 grid gap-2 sm:grid-cols-2"
        >
          {KINDS.map((k) => (
            <Label
              key={k.id}
              htmlFor={`dr-${k.id}`}
              className="flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border border-line bg-card p-3 font-normal has-[[data-state=checked]]:border-obsidian"
            >
              <RadioGroupItem id={`dr-${k.id}`} value={k.id} className="mt-0.5" />
              <span>
                <span className="block text-sm font-medium text-ink">{k.title}</span>
                <span className="block text-[13px] text-muted-foreground">{k.body}</span>
              </span>
            </Label>
          ))}
        </RadioGroup>
      </fieldset>

      {kind === 'erasure' ? (
        <p className="rounded-lg bg-warning-bg p-3 text-sm text-warning">
          Medical records — consultation notes, prescriptions and related messages — must be kept for the
          period the law requires, so they cannot be deleted. We remove everything else and anonymise what we
          must keep.
        </p>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="dr-details">Details</Label>
        <Textarea
          id="dr-details"
          rows={4}
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          maxLength={2000}
          aria-invalid={error ? true : undefined}
          placeholder="Tell us what you need. Please don't include medical details here."
        />
      </div>
      {error ? (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[13px] text-muted-foreground">{slaNote}</p>
        <Button type="submit" className="h-11 shrink-0 px-6" disabled={pending} aria-busy={pending}>
          {pending ? 'Sending…' : 'Send request'}
        </Button>
      </div>
    </form>
  );
}
