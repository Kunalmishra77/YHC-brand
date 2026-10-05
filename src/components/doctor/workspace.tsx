'use client';

import { AlertTriangle, CheckCircle2, CircleDashed, Loader2, Lock, UserX } from 'lucide-react';
import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { completeConsultAction, markNoShowAction, saveNotesAction } from '@/app/doctor/actions';
import { OutcomePane } from '@/components/doctor/outcome-pane';
import type { NotesForm } from '@/components/doctor/validation';
import { VideoStage } from '@/components/doctor/video-stage';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { formatIst } from '@/lib/time';
import { cn } from '@/lib/utils';

type OutcomeProps = Parameters<typeof OutcomePane>[0];

type SaveState =
  | { kind: 'idle' }
  | { kind: 'dirty' }
  | { kind: 'saving' }
  | { kind: 'saved'; at: string | null }
  | { kind: 'error'; message: string };

const AUTOSAVE_MS = 5000;

type TextKey = 'chiefComplaint' | 'observations' | 'assessment' | 'treatmentPlan' | 'followUpInstructions';

const NOTE_FIELDS: { key: TextKey; label: string; placeholder: string; rows: number }[] = [
  {
    key: 'chiefComplaint',
    label: 'Chief complaint',
    placeholder: 'In the patient’s words — what, where, since when',
    rows: 2,
  },
  {
    key: 'observations',
    label: 'Observations',
    placeholder: 'Scalp, pattern, density, photos, video exam',
    rows: 3,
  },
  { key: 'assessment', label: 'Assessment', placeholder: 'Provisional diagnosis', rows: 2 },
  { key: 'treatmentPlan', label: 'Treatment plan', placeholder: 'Routine, products, duration', rows: 3 },
  {
    key: 'followUpInstructions',
    label: 'Follow-up instructions',
    placeholder: 'What the patient should do and when to check in (shared with the patient)',
    rows: 2,
  },
];

type Tab = 'patient' | 'consult' | 'outcome';

export function Workspace({
  appointmentId,
  status,
  patientName,
  doctorName,
  initialNotes,
  hasSavedNotes,
  patientPane,
  outcome,
}: {
  appointmentId: string;
  status: OutcomeProps['status'];
  patientName: string;
  doctorName: string;
  initialNotes: NotesForm;
  hasSavedNotes: boolean;
  patientPane: React.ReactNode;
  outcome: Omit<OutcomeProps, 'notes' | 'consentOk' | 'onBeforeSubmit' | 'status' | 'appointmentId'>;
}) {
  const [tab, setTab] = useState<Tab>('consult');
  const [notes, setNotes] = useState<NotesForm>(initialNotes);
  const [save, setSave] = useState<SaveState>(hasSavedNotes ? { kind: 'saved', at: null } : { kind: 'idle' });
  const latest = useRef<NotesForm>(initialNotes);
  const version = useRef(0);
  const timer = useRef<number | null>(null);
  const [completing, startComplete] = useTransition();
  const [markingNoShow, startNoShow] = useTransition();

  const editable = status !== 'held';
  const ended = status === 'completed' || status === 'no_show';
  const consentOk = notes.identityVerified && notes.consentRecorded;

  const cancelTimer = useCallback(() => {
    if (timer.current !== null) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  const flush = useCallback(async () => {
    cancelTimer();
    const v = version.current;
    setSave({ kind: 'saving' });
    const res = await saveNotesAction(latest.current);
    if (!res.ok) {
      setSave({ kind: 'error', message: res.error.message });
      return;
    }
    // Typed again while saving — stay "unsaved"; the pending timer saves the newer text.
    setSave(version.current === v ? { kind: 'saved', at: res.data.savedAt } : { kind: 'dirty' });
  }, [cancelTimer]);

  const update = useCallback(
    (patch: Partial<NotesForm>) => {
      const next = { ...latest.current, ...patch };
      latest.current = next;
      version.current += 1;
      setNotes(next);
      setSave({ kind: 'dirty' });
      if (timer.current === null) {
        timer.current = window.setTimeout(() => {
          timer.current = null;
          void flush();
        }, AUTOSAVE_MS);
      }
    },
    [flush],
  );

  // Save on leave (tab switch inside the app, closing the workspace).
  useEffect(
    () => () => {
      if (timer.current !== null) {
        window.clearTimeout(timer.current);
        void saveNotesAction(latest.current);
      }
    },
    [],
  );

  function complete() {
    cancelTimer();
    startComplete(async () => {
      const res = await completeConsultAction(latest.current);
      if (res.ok) {
        setSave({ kind: 'saved', at: new Date().toISOString() });
        toast.success('Consultation completed', {
          description: 'Notes saved. Recommend a plan from the Outcome pane.',
        });
        setTab('outcome');
      } else toast.error(res.error.message);
    });
  }

  function noShow() {
    cancelTimer();
    startNoShow(async () => {
      await saveNotesAction(latest.current);
      const res = await markNoShowAction(appointmentId);
      if (res.ok)
        toast.success('Marked as no-show', { description: 'The patient gets a WhatsApp to rebook.' });
      else toast.error(res.error.message);
    });
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'patient', label: 'Patient' },
    { id: 'consult', label: 'Consult' },
    { id: 'outcome', label: 'Outcome' },
  ];

  const pane = (id: Tab) =>
    cn(
      tab === id ? 'block' : 'hidden',
      'min-w-0 rounded-xl bg-card shadow-card ring-1 ring-line/80/60 xl:block xl:h-[calc(100dvh-15rem)] xl:min-h-[560px] xl:overflow-y-auto xl:overscroll-contain',
    );

  return (
    <div>
      <div
        role="tablist"
        aria-label="Workspace sections"
        className="sticky top-16 z-20 -mx-4 mb-3 grid grid-cols-3 gap-1 border-b border-line bg-pearl/95 px-4 py-2 backdrop-blur md:-mx-8 md:px-8 xl:hidden"
      >
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            id={`ws-tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls={`ws-pane-${t.id}`}
            onClick={() => setTab(t.id)}
            className={cn(
              'h-10 rounded-md text-sm font-medium transition-colors',
              tab === t.id ? 'bg-obsidian text-on-dark' : 'text-body hover:bg-mist',
            )}
          >
            {t.label}
            {t.id === 'consult' && save.kind === 'dirty' ? <span className="sr-only"> (unsaved)</span> : null}
          </button>
        ))}
      </div>

      <div className="xl:grid xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.2fr)_minmax(0,1fr)] xl:gap-4">
        <section id="ws-pane-patient" aria-label="Patient" className={pane('patient')}>
          {patientPane}
        </section>

        <section id="ws-pane-consult" aria-label="Live consult" className={pane('consult')}>
          <div className="space-y-4 p-4 md:p-5">
            <VideoStage
              patientName={patientName}
              doctorName={doctorName}
              ended={ended}
              disabled={!editable}
            />

            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-[13px] font-semibold tracking-[0.1em] text-brand uppercase">
                Consultation notes
              </h3>
              <SaveIndicator state={save} onRetry={() => void flush()} />
            </div>

            <fieldset disabled={!editable} className="space-y-3.5">
              {NOTE_FIELDS.map((f) => (
                <div key={f.key}>
                  <label htmlFor={`note-${f.key}`} className="mb-1 block text-sm font-medium text-ink">
                    {f.label}
                  </label>
                  <Textarea
                    id={`note-${f.key}`}
                    rows={f.rows}
                    maxLength={4000}
                    value={notes[f.key]}
                    placeholder={f.placeholder}
                    onChange={(e) => {
                      const patch: Partial<NotesForm> = {};
                      patch[f.key] = e.target.value;
                      update(patch);
                    }}
                    className="bg-card text-[15px]"
                  />
                </div>
              ))}
              <div className="rounded-md border border-dashed border-steel/60 bg-mist/40 p-3">
                <label
                  htmlFor="note-privateNotes"
                  className="mb-1 flex items-center gap-1.5 text-sm font-medium text-ink"
                >
                  <Lock className="size-3.5 text-steel" aria-hidden />
                  Private notes
                </label>
                <p id="private-hint" className="mb-2 text-[13px] text-body">
                  Private — never shown to the patient.
                </p>
                <Textarea
                  id="note-privateNotes"
                  aria-describedby="private-hint"
                  rows={2}
                  maxLength={4000}
                  value={notes.privateNotes}
                  onChange={(e) => update({ privateNotes: e.target.value })}
                  className="bg-card text-[15px]"
                />
              </div>

              <div className="space-y-2 rounded-md border border-line bg-card p-3">
                <p className="text-sm font-medium text-ink">Before completing</p>
                <ConsentCheck
                  id="identity"
                  checked={notes.identityVerified}
                  onChange={(v) => update({ identityVerified: v })}
                  label="Identity verified"
                  help="Name, age and phone confirmed with the patient on video."
                />
                <ConsentCheck
                  id="consent"
                  checked={notes.consentRecorded}
                  onChange={(v) => update({ consentRecorded: v })}
                  label="Consent recorded"
                  help="Patient agreed to a teleconsultation and to sharing photos for review."
                />
              </div>
            </fieldset>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                size="lg"
                className="h-11 flex-1"
                disabled={!consentOk || status !== 'booked' || completing}
                onClick={complete}
              >
                {completing ? <Loader2 className="animate-spin" aria-hidden /> : <CheckCircle2 aria-hidden />}
                {status === 'completed' ? 'Completed' : completing ? 'Completing…' : 'Mark completed'}
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="h-11"
                    disabled={status !== 'booked' || markingNoShow}
                  >
                    {markingNoShow ? <Loader2 className="animate-spin" aria-hidden /> : <UserX aria-hidden />}
                    Mark no-show
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Mark {patientName.split(' ')[0]} as no-show?</DialogTitle>
                    <DialogDescription>
                      The patient gets a WhatsApp message to pick a new time. Your notes are kept.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline" className="h-11">
                        Keep waiting
                      </Button>
                    </DialogClose>
                    <DialogClose asChild>
                      <Button className="h-11" onClick={noShow}>
                        Mark no-show
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            {status === 'booked' && !consentOk ? (
              <p className="text-[13px] text-muted-foreground">
                Tick both checks to complete. Completing creates the consultation credit for the patient.
              </p>
            ) : null}
          </div>
        </section>

        <section id="ws-pane-outcome" aria-label="Outcome" className={pane('outcome')}>
          <OutcomePane
            {...outcome}
            appointmentId={appointmentId}
            status={status}
            notes={notes}
            consentOk={consentOk}
            onBeforeSubmit={cancelTimer}
          />
        </section>
      </div>
    </div>
  );
}

function ConsentCheck({
  id,
  checked,
  onChange,
  label,
  help,
}: {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  help: string;
}) {
  return (
    <div className="flex min-h-11 items-start gap-3">
      <Checkbox
        id={`check-${id}`}
        checked={checked}
        onCheckedChange={(v) => onChange(v === true)}
        className="mt-0.5 size-5"
        aria-describedby={`check-${id}-help`}
      />
      <div>
        <label htmlFor={`check-${id}`} className="text-sm font-medium text-ink">
          {label} <span className="text-danger">*</span>
        </label>
        <p id={`check-${id}-help`} className="text-[13px] text-muted-foreground">
          {help}
        </p>
      </div>
    </div>
  );
}

function SaveIndicator({ state, onRetry }: { state: SaveState; onRetry: () => void }) {
  const base = 'inline-flex items-center gap-1.5 text-[13px]';
  switch (state.kind) {
    case 'idle':
      return (
        <span className={cn(base, 'text-muted-foreground')}>
          <CircleDashed className="size-3.5" aria-hidden /> Autosaves every 5 s
        </span>
      );
    case 'dirty':
      return (
        <span className={cn(base, 'text-body')} aria-live="polite">
          <CircleDashed className="size-3.5" aria-hidden /> Unsaved changes
        </span>
      );
    case 'saving':
      return (
        <span className={cn(base, 'text-body')} aria-live="polite">
          <Loader2 className="size-3.5 animate-spin" aria-hidden /> Saving…
        </span>
      );
    case 'saved':
      return (
        <span className={cn(base, 'text-success')} aria-live="polite">
          <CheckCircle2 className="size-3.5" aria-hidden />
          {state.at ? `Saved · ${formatIst(new Date(state.at), 'HH:mm:ss')}` : 'Saved'}
        </span>
      );
    case 'error':
      return (
        <span className={cn(base, 'text-danger')} role="alert">
          <AlertTriangle className="size-3.5" aria-hidden /> Not saved — {state.message}
          <button type="button" onClick={onRetry} className="underline underline-offset-2">
            Retry
          </button>
        </span>
      );
  }
}
