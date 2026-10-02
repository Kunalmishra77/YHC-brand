'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { submitClaimAction } from '@/app/account/actions';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

/** FR-M11-5 claim: statement → server re-checks eligibility → status `submitted`. */
export function ClaimForm({ refundLabel }: { refundLabel: string }) {
  const router = useRouter();
  const [statement, setStatement] = useState('');
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!confirm) {
      setError('Please confirm you followed the plan as prescribed.');
      return;
    }
    start(async () => {
      const res = await submitClaimAction({ statement, confirm: true });
      if (!res.ok) {
        setError(res.error.message);
        return;
      }
      toast.success(`Claim ${res.data.code} submitted`, {
        description: 'Dr. Tyagi will review it. We will update you on WhatsApp.',
      });
      setStatement('');
      setConfirm(false);
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="statement">Tell Dr. Tyagi what you noticed</Label>
        <Textarea
          id="statement"
          value={statement}
          onChange={(e) => setStatement(e.target.value)}
          rows={5}
          maxLength={2000}
          aria-describedby="statement-help"
          aria-invalid={error ? true : undefined}
          placeholder="For example: I used the routine every day for three months and shared photos each month, but I do not see a visible change at the crown."
        />
        <p id="statement-help" className="text-[13px] text-muted-foreground">
          At least 30 characters. Your monthly photos and check-in replies are attached automatically.
        </p>
      </div>
      <div className="flex items-start gap-3">
        <Checkbox
          id="confirm"
          checked={confirm}
          onCheckedChange={(v) => setConfirm(v === true)}
          className="mt-0.5 size-5"
        />
        <Label htmlFor="confirm" className="text-sm leading-snug font-normal text-body">
          I followed the plan as prescribed. I understand a doctor reviews every claim and the refund (
          {refundLabel}) is paid to the original payment method once approved.
        </Label>
      </div>
      {error ? (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}
      <Button type="submit" className="h-12 w-full px-6 sm:w-auto" disabled={pending} aria-busy={pending}>
        {pending ? 'Submitting…' : 'Submit claim'}
      </Button>
    </form>
  );
}
