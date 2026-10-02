'use client';

import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { createLeadAction } from '@/app/sales/actions';
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
import type { LeadSource } from '@/lib/domain/types';
import { LEAD_SOURCES, SOURCE_LABELS } from './labels';
import { FieldLabel, NativeSelect, inputClass } from './native-select';

export function NewLeadDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function submit(form: FormData) {
    setError(null);
    start(async () => {
      const res = await createLeadAction({
        name: String(form.get('name') ?? ''),
        phone: String(form.get('phone') ?? ''),
        source: String(form.get('source') ?? 'sales') as LeadSource,
      });
      if (!res.ok) {
        setError(res.error.message);
        return;
      }
      setOpen(false);
      toast.success(res.data.existed ? 'This number already has a lead — opened it' : 'Lead added', {
        description: res.data.existed
          ? 'Leads are de-duplicated by phone.'
          : 'Assigned round-robin to the sales pool.',
      });
      router.push(`/sales/leads/${res.data.leadId}`);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-10" aria-label="New lead">
          <Plus aria-hidden />
          <span className="hidden sm:inline">New lead</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New lead</DialogTitle>
          <DialogDescription>
            Walk-in, phone call or referral. We check the number for an existing lead.
          </DialogDescription>
        </DialogHeader>
        <form action={submit} className="space-y-4">
          <div>
            <FieldLabel htmlFor="nl-name">Name</FieldLabel>
            <input
              id="nl-name"
              name="name"
              required
              minLength={2}
              autoComplete="off"
              className={inputClass}
            />
          </div>
          <div>
            <FieldLabel htmlFor="nl-phone">Mobile number</FieldLabel>
            <div className="flex">
              <span className="inline-flex h-11 items-center rounded-l-md border border-r-0 border-line bg-mist px-3 text-sm text-ink">
                +91
              </span>
              <input
                id="nl-phone"
                name="phone"
                required
                inputMode="numeric"
                autoComplete="off"
                placeholder="98765 43210"
                pattern="[0-9 ]{10,11}"
                className={`${inputClass} rounded-l-none`}
              />
            </div>
          </div>
          <div>
            <FieldLabel htmlFor="nl-source">Source</FieldLabel>
            <NativeSelect id="nl-source" name="source" defaultValue="sales">
              {LEAD_SOURCES.map((s) => (
                <option key={s} value={s}>
                  {SOURCE_LABELS[s]}
                </option>
              ))}
            </NativeSelect>
          </div>
          {error ? (
            <p role="alert" aria-live="polite" className="text-sm text-danger">
              {error}
            </p>
          ) : null}
          <DialogFooter>
            <Button type="submit" className="h-11 w-full sm:w-auto" disabled={pending}>
              {pending ? 'Adding…' : 'Add lead'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
