'use client';

import { Loader2 } from 'lucide-react';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';
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
import type { Result } from '@/lib/result';

export type ClientActionResult = Result<{ message: string }>;

/** Runs a server action in a transition and toasts the outcome. */
export function useAction() {
  const [pending, startTransition] = useTransition();
  function run(fn: () => Promise<ClientActionResult>, onOk?: () => void) {
    startTransition(async () => {
      try {
        const res = await fn();
        if (res.ok) {
          toast.success(res.data.message);
          onOk?.();
        } else {
          toast.error(res.error.message);
        }
      } catch {
        toast.error('Something went wrong. Please try again.');
      }
    });
  }
  return { pending, run };
}

/** A button that asks for confirmation before calling a (bound) server action. */
export function ConfirmAction({
  action,
  label,
  title,
  description,
  confirmLabel = 'Confirm',
  variant = 'outline',
  size = 'sm',
  destructive = false,
  icon,
  disabled,
}: {
  action: () => Promise<ClientActionResult>;
  label: string;
  title: string;
  description: React.ReactNode;
  confirmLabel?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  size?: 'sm' | 'default';
  destructive?: boolean;
  icon?: React.ReactNode;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const { pending, run } = useAction();
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} disabled={disabled} className="min-h-9">
          {icon}
          {label}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-2 text-sm text-body">{description}</div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>
            Cancel
          </Button>
          <Button
            variant={destructive ? 'destructive' : 'default'}
            disabled={pending}
            onClick={() => run(action, () => setOpen(false))}
          >
            {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Shown wherever the admin edits in-memory demo values (prices, terms, settings). */
export function DemoResetNote({ className }: { className?: string }) {
  return (
    <p className={className ?? 'text-[13px] text-muted-foreground'}>
      Demo: changes reset when the server restarts.
    </p>
  );
}
