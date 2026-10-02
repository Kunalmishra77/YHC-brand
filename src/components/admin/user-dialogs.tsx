'use client';

import { Loader2, UserPlus } from 'lucide-react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { changeRoleAction, inviteStaffAction } from '@/app/admin/users/actions';
import { useAction } from './action-kit';

type StaffRole = 'doctor' | 'sales' | 'ops' | 'admin';
const ROLES: { value: StaffRole; label: string; hint: string }[] = [
  { value: 'doctor', label: 'Doctor', hint: 'Consultations and clinical records · TOTP required' },
  { value: 'sales', label: 'Sales', hint: 'CRM leads and tasks · no clinical data' },
  { value: 'ops', label: 'Ops', hint: 'Orders, packing and shipments only' },
  { value: 'admin', label: 'Admin', hint: 'Everything except clinical notes · TOTP required' },
];
const isRole = (v: string): v is StaffRole => ROLES.some((r) => r.value === v);

function RoleSelect({
  id,
  value,
  onChange,
}: {
  id: string;
  value: StaffRole;
  onChange: (r: StaffRole) => void;
}) {
  return (
    <Select value={value} onValueChange={(v) => isRole(v) && onChange(v)}>
      <SelectTrigger id={id} className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {ROLES.map((r) => (
          <SelectItem key={r.value} value={r.value}>
            {r.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function InviteDialog() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<StaffRole>('sales');
  const { pending, run } = useAction();
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="min-h-9">
          <UserPlus className="size-4" aria-hidden />
          Invite staff
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite a team member</DialogTitle>
          <DialogDescription>
            They get a sign-in link by email. Doctors and admins set up an authenticator app (TOTP) on first
            sign-in.
          </DialogDescription>
        </DialogHeader>
        <form
          id="invite-form"
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!valid) return;
            run(
              () => inviteStaffAction({ email: email.trim(), role }),
              () => {
                setOpen(false);
                setEmail('');
              },
            );
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="inv-email">Work email</Label>
            <Input
              id="inv-email"
              type="email"
              autoComplete="off"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@yourhaircompany.com"
              aria-invalid={email.length > 0 && !valid}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="inv-role">Role</Label>
            <RoleSelect id="inv-role" value={role} onChange={setRole} />
            <p className="text-[12px] text-muted-foreground">{ROLES.find((r) => r.value === role)?.hint}</p>
          </div>
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>
            Cancel
          </Button>
          <Button type="submit" form="invite-form" disabled={pending || !valid}>
            {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
            Send invite
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function RoleChangeDialog({
  userId,
  name,
  current,
}: {
  userId: string;
  name: string;
  current: StaffRole;
}) {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<StaffRole>(current);
  const { pending, run } = useAction();
  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setRole(current);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="min-h-9">
          Change role
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change role · {name}</DialogTitle>
          <DialogDescription>
            Role changes take effect on their next request and are audited.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5">
          <Label htmlFor={`role-${userId}`}>New role</Label>
          <RoleSelect id={`role-${userId}`} value={role} onChange={setRole} />
          <p className="text-[12px] text-muted-foreground">{ROLES.find((r) => r.value === role)?.hint}</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>
            Cancel
          </Button>
          <Button
            disabled={pending || role === current}
            onClick={() =>
              run(
                () => changeRoleAction(userId, { role }),
                () => setOpen(false),
              )
            }
          >
            {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
            Confirm role change
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
