'use client';

import { Loader2, Merge } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAction, type ClientActionResult } from './action-kit';

export function MergeDialog({
  action,
  keepName,
  candidates,
}: {
  action: (input: { duplicateId: string }) => Promise<ClientActionResult>;
  keepName: string;
  candidates: { id: string; label: string; likely: boolean }[];
}) {
  const [open, setOpen] = useState(false);
  const [dup, setDup] = useState('');
  const [step, setStep] = useState<'pick' | 'confirm'>('pick');
  const { pending, run } = useAction();
  const chosen = candidates.find((c) => c.id === dup);
  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setStep('pick');
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="min-h-9">
          <Merge className="size-4" aria-hidden />
          Merge duplicate
        </Button>
      </DialogTrigger>
      <DialogContent mobileSheet>
        <DialogHeader>
          <DialogTitle>Merge a duplicate into {keepName}</DialogTitle>
          <DialogDescription>
            Orders, appointments, consents and messages of the duplicate move to {keepName}. Demo: the merge
            is recorded and audited; records are not moved.
          </DialogDescription>
        </DialogHeader>
        {step === 'pick' ? (
          <div className="space-y-1.5">
            <Label htmlFor="merge-dup">Duplicate record</Label>
            <Select value={dup} onValueChange={setDup}>
              <SelectTrigger id="merge-dup" className="w-full">
                <SelectValue placeholder="Pick a customer" />
              </SelectTrigger>
              <SelectContent>
                {candidates.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.label}
                    {c.likely ? ' · likely duplicate' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <p className="rounded-md bg-warning-bg p-3 text-sm text-warning">
            Merge <strong>{chosen?.label}</strong> into <strong>{keepName}</strong>? This cannot be undone in
            production.
          </p>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>
            Cancel
          </Button>
          {step === 'pick' ? (
            <Button disabled={!dup} onClick={() => setStep('confirm')}>
              Review merge
            </Button>
          ) : (
            <Button
              disabled={pending}
              onClick={() =>
                run(
                  () => action({ duplicateId: dup }),
                  () => {
                    setOpen(false);
                    setStep('pick');
                  },
                )
              }
            >
              {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
              Confirm merge
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
