'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { updateProfileAction } from '@/app/account/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function ProfileForm({ name, email, phone }: { name: string; email: string | null; phone: string }) {
  const [values, setValues] = useState({ name, email: email ?? '' });
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const dirty = values.name !== name || values.email !== (email ?? '');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    start(async () => {
      const res = await updateProfileAction(values);
      if (!res.ok) {
        setError(res.error.message);
        return;
      }
      toast.success('Profile saved');
    });
  }

  return (
    <form onSubmit={submit} className="grid gap-5 sm:grid-cols-2" noValidate>
      <div className="space-y-2">
        <Label htmlFor="name">Full name</Label>
        <Input
          id="name"
          className="h-11"
          autoComplete="name"
          value={values.name}
          onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Mobile number</Label>
        <Input id="phone" className="h-11 bg-mist" value={phone} readOnly aria-describedby="phone-help" />
        <p id="phone-help" className="text-[13px] text-muted-foreground">
          You sign in with this number. To change it, message the care team.
        </p>
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="email">Email (optional)</Label>
        <Input
          id="email"
          type="email"
          className="h-11"
          autoComplete="email"
          value={values.email}
          onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
          aria-describedby="email-help"
        />
        <p id="email-help" className="text-[13px] text-muted-foreground">
          For invoices and consultation confirmations.
        </p>
      </div>
      {error ? (
        <p role="alert" className="text-sm text-danger sm:col-span-2">
          {error}
        </p>
      ) : null}
      <div className="sm:col-span-2">
        <Button type="submit" className="h-11 px-6" disabled={!dirty || pending} aria-busy={pending}>
          {pending ? 'Saving…' : 'Save changes'}
        </Button>
      </div>
    </form>
  );
}
