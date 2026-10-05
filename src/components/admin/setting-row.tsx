'use client';

import { Loader2, RotateCcw } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { resetDemoAction } from '@/app/admin/actions';
import { updateSettingAction } from '@/app/admin/settings/actions';
import { ConfirmAction, useAction } from './action-kit';

export type SettingKindClient = 'boolean' | 'number' | 'json' | 'text';

function clientCheck(kind: SettingKindClient, value: string): string | null {
  const v = value.trim();
  if (kind === 'number') {
    if (v === '' || !Number.isFinite(Number(v))) return 'Enter a number.';
    if (!Number.isInteger(Number(v))) return 'Enter a whole number.';
  }
  if (kind === 'json') {
    try {
      JSON.parse(v);
    } catch {
      return 'Not valid JSON.';
    }
  }
  if (kind === 'text' && v === '') return 'Cannot be empty.';
  return null;
}

/** Inline settings editor: type-aware input, confirm (old → new), audited save. */
export function SettingRow({
  settingKey,
  description,
  value,
  kind,
  sensitive,
}: {
  settingKey: string;
  description: string;
  value: string;
  kind: SettingKindClient;
  /** shows extra copy in the confirmation (e.g. guarantee visibility, fees) */
  sensitive?: string;
}) {
  const [draft, setDraft] = useState(value);
  const [confirm, setConfirm] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { pending, run } = useAction();
  const dirty = draft.trim() !== value;
  const inputId = `set-${settingKey.replaceAll('.', '-')}`;

  function review(next: string) {
    const e = clientCheck(kind, next);
    setError(e);
    if (!e) setConfirm(next);
  }

  const label = (v: string) => (kind === 'boolean' ? (v === 'true' ? 'On' : 'Off') : v);

  return (
    <div className="grid gap-3 py-4 md:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] md:items-center">
      <div className="min-w-0">
        <label htmlFor={inputId} className="block">
          <code className="text-[13px] font-medium text-ink">{settingKey}</code>
        </label>
        <p className="text-[13px] text-muted-foreground">{description}</p>
      </div>
      <div className="flex flex-col gap-1.5">
        {kind === 'boolean' ? (
          <div className="flex items-center gap-2 md:justify-end">
            <span className="text-sm text-body">{value === 'true' ? 'On' : 'Off'}</span>
            <Switch
              id={inputId}
              checked={value === 'true'}
              disabled={pending}
              onCheckedChange={(c) => review(c ? 'true' : 'false')}
            />
          </div>
        ) : (
          <div className="flex items-start gap-2">
            {kind === 'json' ? (
              <Textarea
                id={inputId}
                value={draft}
                rows={2}
                className="font-mono text-[13px]"
                aria-invalid={error ? true : undefined}
                onChange={(e) => setDraft(e.target.value)}
              />
            ) : (
              <Input
                id={inputId}
                value={draft}
                inputMode={kind === 'number' ? 'numeric' : undefined}
                className="price h-10 bg-card"
                aria-invalid={error ? true : undefined}
                onChange={(e) => setDraft(e.target.value)}
              />
            )}
            <Button
              variant="outline"
              className="h-10 shrink-0"
              disabled={!dirty || pending}
              onClick={() => review(draft)}
            >
              Save
            </Button>
          </div>
        )}
        {error ? (
          <p role="alert" className="text-[13px] text-danger">
            {error}
          </p>
        ) : null}
      </div>

      <Dialog open={confirm !== null} onOpenChange={(o) => !o && setConfirm(null)}>
        <DialogContent mobileSheet>
          <DialogHeader>
            <DialogTitle>Change {settingKey}?</DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-2 text-sm text-body">
                <p>
                  <span className="price">{label(value)}</span> →{' '}
                  <span className="price font-medium text-ink">{label(confirm ?? '')}</span>
                </p>
                {sensitive ? <p className="text-warning">{sensitive}</p> : null}
                <p className="text-muted-foreground">
                  Applies immediately. Audited. Demo: changes reset when the server restarts.
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirm(null)} disabled={pending}>
              Cancel
            </Button>
            <Button
              disabled={pending}
              onClick={() => {
                const next = confirm ?? value;
                run(
                  () => updateSettingAction({ key: settingKey, value: next }),
                  () => setConfirm(null),
                );
              }}
            >
              {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
              Save setting
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function ResetDemoButton() {
  return (
    <ConfirmAction
      action={resetDemoAction}
      label="Reset demo data"
      icon={<RotateCcw className="size-4" aria-hidden />}
      title="Reset all demo data?"
      description={
        <p>
          Orders, appointments, leads, messages, settings, catalog edits, staff changes, guarantee drafts and
          the audit log go back to the original sample. Nothing real is affected.
        </p>
      }
      confirmLabel="Reset demo data"
      destructive
    />
  );
}
