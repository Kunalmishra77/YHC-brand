'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { LOST_REASONS } from './labels';
import { FieldLabel, NativeSelect, inputClass } from './native-select';

/** Mark lost — a reason is required (FR-M7-8). */
export function LostDialog({
  leadName,
  open,
  pending,
  onOpenChange,
  onConfirm,
}: {
  leadName: string;
  open: boolean;
  pending?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState<string>(LOST_REASONS[0]);
  const [other, setOther] = useState('');
  const finalReason = reason === 'Other' ? other.trim() : reason;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent mobileSheet className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Mark {leadName} as lost</DialogTitle>
          <DialogDescription>
            The lead leaves the active pipeline. A later booking or payment re-opens it automatically.
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (finalReason) onConfirm(finalReason);
          }}
        >
          <div>
            <FieldLabel htmlFor="lost-reason">Reason</FieldLabel>
            <NativeSelect id="lost-reason" value={reason} onChange={(e) => setReason(e.target.value)}>
              {LOST_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </NativeSelect>
          </div>
          {reason === 'Other' ? (
            <div>
              <FieldLabel htmlFor="lost-other">Describe the reason</FieldLabel>
              <input
                id="lost-other"
                value={other}
                onChange={(e) => setOther(e.target.value)}
                maxLength={200}
                required
                className={inputClass}
              />
            </div>
          ) : null}
          <DialogFooter>
            <Button type="button" variant="outline" className="h-11" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="destructive" className="h-11" disabled={pending || !finalReason}>
              {pending ? 'Saving…' : 'Mark lost'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
