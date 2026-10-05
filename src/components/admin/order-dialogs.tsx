'use client';

import { Download, Loader2 } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { formatINR } from '@/lib/money';
import { logExportAction } from '@/app/admin/actions';
import { useAction, type ClientActionResult } from './action-kit';

/** Full / partial refund with reason. Demo: audited record + toast, no money moves (FR-M12-3/-4). */
export function RefundDialog({
  action,
  target,
  remainingPaise,
  label = 'Refund',
}: {
  action: (input: { full: boolean; amountRupees?: number; reason: string }) => Promise<ClientActionResult>;
  target: string;
  remainingPaise: number;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'full' | 'partial'>('full');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { pending, run } = useAction();
  const max = remainingPaise / 100;

  function submit() {
    const rupees = Number(amount);
    if (mode === 'partial' && (!Number.isFinite(rupees) || rupees <= 0 || rupees > max)) {
      setError(`Enter an amount between ₹1 and ${formatINR(remainingPaise)}.`);
      return;
    }
    if (reason.trim().length < 3) {
      setError('Add a reason (at least 3 characters).');
      return;
    }
    setError(null);
    run(
      () =>
        action({
          full: mode === 'full',
          amountRupees: mode === 'partial' ? rupees : undefined,
          reason: reason.trim(),
        }),
      () => {
        setOpen(false);
        setReason('');
        setAmount('');
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={remainingPaise <= 0} className="min-h-9">
          {remainingPaise <= 0 ? 'Fully refunded' : label}
        </Button>
      </DialogTrigger>
      <DialogContent mobileSheet>
        <DialogHeader>
          <DialogTitle>Refund {target}</DialogTitle>
          <DialogDescription>
            Up to {formatINR(remainingPaise)} can be refunded. Demo: this records an audited refund — no money
            moves until Razorpay is connected.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <RadioGroup value={mode} onValueChange={(v) => setMode(v === 'partial' ? 'partial' : 'full')}>
            <div className="flex items-center gap-2">
              <RadioGroupItem id="rf-full" value="full" />
              <Label htmlFor="rf-full">Full refund · {formatINR(remainingPaise)}</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem id="rf-partial" value="partial" />
              <Label htmlFor="rf-partial">Partial refund</Label>
            </div>
          </RadioGroup>
          {mode === 'partial' ? (
            <div className="space-y-1.5">
              <Label htmlFor="rf-amount">Amount (₹)</Label>
              <Input
                id="rf-amount"
                className="h-11 bg-card"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={`Max ${max}`}
              />
            </div>
          ) : null}
          <div className="space-y-1.5">
            <Label htmlFor="rf-reason">Reason</Label>
            <Textarea
              id="rf-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Damaged in transit, customer request"
              maxLength={200}
            />
          </div>
          {error ? (
            <p role="alert" className="text-sm text-danger">
              {error}
            </p>
          ) : null}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={pending}>
            {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
            Record refund
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** FR-M9-4 manual status override (RTO / cancelled) with reason. */
export function OverrideStatusDialog({
  action,
  code,
}: {
  action: (input: { status: 'rto' | 'cancelled'; reason: string }) => Promise<ClientActionResult>;
  code: string;
}) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<'rto' | 'cancelled'>('rto');
  const [reason, setReason] = useState('');
  const { pending, run } = useAction();
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="min-h-9">
          Mark exception
        </Button>
      </DialogTrigger>
      <DialogContent mobileSheet>
        <DialogHeader>
          <DialogTitle>Override status · {code}</DialogTitle>
          <DialogDescription>
            Use for courier returns (RTO) or cancellations. The change and reason go to the audit log.
          </DialogDescription>
        </DialogHeader>
        <RadioGroup value={status} onValueChange={(v) => setStatus(v === 'cancelled' ? 'cancelled' : 'rto')}>
          <div className="flex items-center gap-2">
            <RadioGroupItem id="ov-rto" value="rto" />
            <Label htmlFor="ov-rto">Returned to origin (RTO)</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem id="ov-cancel" value="cancelled" />
            <Label htmlFor="ov-cancel">Cancelled</Label>
          </div>
        </RadioGroup>
        <div className="space-y-1.5">
          <Label htmlFor="ov-reason">Reason</Label>
          <Textarea
            id="ov-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            maxLength={200}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>
            Cancel
          </Button>
          <Button
            disabled={pending || reason.trim().length < 3}
            onClick={() =>
              run(
                () => action({ status, reason: reason.trim() }),
                () => setOpen(false),
              )
            }
          >
            {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
            Save override
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** One-click action without confirmation (e.g. invoice regenerate, retry). */
export function ActionButton({
  action,
  label,
  icon,
  variant = 'outline',
}: {
  action: () => Promise<ClientActionResult>;
  label: string;
  icon?: React.ReactNode;
  variant?: 'outline' | 'ghost' | 'default';
}) {
  const { pending, run } = useAction();
  return (
    <Button variant={variant} size="sm" disabled={pending} onClick={() => run(action)} className="min-h-9">
      {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : icon}
      {label}
    </Button>
  );
}

function toCsv(rows: string[][]): string {
  return rows
    .map((r) => r.map((cell) => (/[",\n]/.test(cell) ? `"${cell.replaceAll('"', '""')}"` : cell)).join(','))
    .join('\n');
}

/** Client-side CSV download; the export itself is audited server-side (FR-M14-4). */
export function CsvButton({
  rows,
  filename,
  dataset,
}: {
  rows: string[][];
  filename: string;
  dataset: 'orders' | 'audit' | 'customers';
}) {
  const { pending, run } = useAction();
  return (
    <Button
      variant="outline"
      size="sm"
      className="min-h-9"
      disabled={pending || rows.length <= 1}
      onClick={() =>
        run(
          () => logExportAction({ dataset, rows: rows.length - 1 }),
          () => {
            const blob = new Blob([`﻿${toCsv(rows)}`], { type: 'text/csv;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
          },
        )
      }
    >
      <Download className="size-4" aria-hidden />
      Export CSV
    </Button>
  );
}
