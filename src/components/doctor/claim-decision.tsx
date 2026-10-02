'use client';

import { Check, Loader2, X } from 'lucide-react';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { decideClaimAction } from '@/app/doctor/actions';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export function ClaimDecision({
  claimId,
  eligible,
  refundLabel,
}: {
  claimId: string;
  eligible: boolean;
  refundLabel: string;
}) {
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [choice, setChoice] = useState<'approved' | 'rejected' | null>(null);

  function decide(decision: 'approved' | 'rejected') {
    setError(null);
    if (notes.trim().length < 10) {
      setError('Add a short reason (at least 10 characters). Notes are kept with the claim.');
      return;
    }
    setChoice(decision);
    startTransition(async () => {
      const res = await decideClaimAction({ claimId, decision, notes });
      if (res.ok) toast.success(decision === 'approved' ? 'Claim approved' : 'Claim rejected');
      else {
        setError(res.error.message);
        toast.error(res.error.message);
      }
    });
  }

  return (
    <div className="space-y-2">
      <label htmlFor={`notes-${claimId}`} className="text-sm font-medium text-ink">
        Decision notes <span className="text-danger">*</span>
      </label>
      <Textarea
        id={`notes-${claimId}`}
        rows={3}
        value={notes}
        maxLength={2000}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="What you checked and why — e.g. photo comparison, check-in replies, follow-up attended."
        className="bg-card"
        aria-describedby={error ? `err-${claimId}` : undefined}
      />
      {error ? (
        <p id={`err-${claimId}`} role="alert" className="text-[13px] text-danger">
          {error}
        </p>
      ) : null}
      {!eligible ? (
        <p className="text-[13px] text-warning">
          Some conditions are not met. You can still approve as an exception — say why in the notes.
        </p>
      ) : null}
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button type="button" className="h-11 flex-1" disabled={pending} onClick={() => decide('approved')}>
          {pending && choice === 'approved' ? (
            <Loader2 className="animate-spin" aria-hidden />
          ) : (
            <Check aria-hidden />
          )}
          Approve · refund {refundLabel}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-11 flex-1"
          disabled={pending}
          onClick={() => decide('rejected')}
        >
          {pending && choice === 'rejected' ? (
            <Loader2 className="animate-spin" aria-hidden />
          ) : (
            <X aria-hidden />
          )}
          Reject
        </Button>
      </div>
    </div>
  );
}
