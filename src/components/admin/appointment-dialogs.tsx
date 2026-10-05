'use client';

import { Loader2 } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import { useAction, type ClientActionResult } from './action-kit';

export function RescheduleDialog({
  action,
  code,
  current,
  options,
}: {
  action: (input: { startsAt: string }) => Promise<ClientActionResult>;
  code: string;
  current: string;
  options: { value: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const { pending, run } = useAction();
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="min-h-9">
          Reschedule
        </Button>
      </DialogTrigger>
      <DialogContent mobileSheet>
        <DialogHeader>
          <DialogTitle>Reschedule {code}</DialogTitle>
          <DialogDescription>
            Currently {current}. The customer gets the “appointment rescheduled” WhatsApp (demo log).
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5">
          <Label htmlFor={`rs-${code}`}>New time (IST)</Label>
          {options.length ? (
            <Select value={value} onValueChange={setValue}>
              <SelectTrigger id={`rs-${code}`} className="w-full">
                <SelectValue placeholder="Pick an open slot" />
              </SelectTrigger>
              <SelectContent>
                {options.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <p className="text-sm text-muted-foreground">No open slots in the booking window.</p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>
            Cancel
          </Button>
          <Button
            disabled={pending || !value}
            onClick={() =>
              run(
                () => action({ startsAt: value }),
                () => setOpen(false),
              )
            }
          >
            {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
            Confirm new time
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Confirmation dialog that requires a written reason (cancel on behalf, deactivate, …). */
export function ReasonDialog({
  action,
  label,
  title,
  description,
  confirmLabel,
  destructive = true,
}: {
  action: (input: { reason: string }) => Promise<ClientActionResult>;
  label: string;
  title: string;
  description: string;
  confirmLabel: string;
  destructive?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const { pending, run } = useAction();
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="min-h-9">
          {label}
        </Button>
      </DialogTrigger>
      <DialogContent mobileSheet>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5">
          <Label htmlFor="reason-input">Reason</Label>
          <Textarea
            id="reason-input"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            maxLength={200}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>
            Keep as is
          </Button>
          <Button
            variant={destructive ? 'destructive' : 'default'}
            disabled={pending || reason.trim().length < 3}
            onClick={() =>
              run(
                () => action({ reason: reason.trim() }),
                () => setOpen(false),
              )
            }
          >
            {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
