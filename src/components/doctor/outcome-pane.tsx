'use client';

import { CheckCircle2, Copy, ExternalLink, Loader2, Plus, Send, Trash2 } from 'lucide-react';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { createRecommendationAction } from '@/app/doctor/actions';
import { maskPhone, recommendationStatus } from '@/components/doctor/format';
import { PrescriptionPreview, type PrescriptionData } from '@/components/doctor/prescription-preview';
import type { NotesForm } from '@/components/doctor/validation';
import { StatusChip } from '@/components/shared/status-chip';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type {
  AppointmentStatus,
  LeadStage,
  Plan,
  PrescriptionItem,
  Recommendation,
} from '@/lib/domain/types';
import { formatINR } from '@/lib/money';
import { formatIst } from '@/lib/time';
import { t } from '@/i18n/en';
import { cn } from '@/lib/utils';
import type { ProtocolTemplate } from '@/server/doctor/protocols';
import type { PlanQuote } from '@/server/doctor/queries';

export interface ProductOption {
  id: string;
  name: string;
  tagline: string;
  category: string;
}

const EMPTY_ITEM: PrescriptionItem = {
  genericName: '',
  strength: '',
  dosage: '',
  frequency: '',
  duration: '',
  instructions: '',
};

const FOLLOW_UP_WEEKS = [4, 6, 8, 12];

function OutcomeSection({
  title,
  children,
  hint,
}: {
  title: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <section className="border-b border-line px-4 py-4 last:border-b-0 md:px-5">
      <h3 className="text-[13px] font-semibold tracking-[0.1em] text-brand uppercase">{title}</h3>
      {hint ? <p className="mt-1 text-[13px] text-muted-foreground">{hint}</p> : null}
      <div className="mt-3">{children}</div>
    </section>
  );
}

export function OutcomePane(props: {
  appointmentId: string;
  status: AppointmentStatus;
  patient: { name: string; phone: string };
  notes: NotesForm;
  consentOk: boolean;
  onBeforeSubmit: () => void;
  protocols: ProtocolTemplate[];
  products: ProductOption[];
  plans: Plan[];
  quotes: PlanQuote[];
  credit: { amountPaise: number; expiresAt: string | null; projected: boolean } | null;
  creditWindowDays: number;
  linkTtlHours: number;
  recommendation: Recommendation | null;
  leadStage: LeadStage | null;
  prescriptionBase: Omit<
    PrescriptionData,
    'items' | 'advice' | 'followUpInWeeks' | 'chiefComplaint' | 'assessment'
  >;
}) {
  const { status, recommendation } = props;
  if (recommendation) return <SentPanel {...props} recommendation={recommendation} />;
  if (status === 'held')
    return (
      <Notice title="Waiting for payment">
        This slot is held while the patient pays. The recommendation builder opens once the consultation is
        booked.
      </Notice>
    );
  if (status === 'no_show')
    return (
      <Notice title="Marked as no-show">
        The patient was sent a WhatsApp message to pick a new time. A plan can be recommended after the
        rebooked consultation.
      </Notice>
    );
  if (status !== 'booked' && status !== 'completed')
    return <Notice title={t(`status.appointment.${status}`)}>No recommendation for this appointment.</Notice>;
  return <Builder {...props} />;
}

function Notice({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="px-4 py-6 md:px-5">
      <div className="rounded-lg border border-dashed border-line bg-card px-4 py-6 text-center">
        <p className="font-medium text-ink">{title}</p>
        <p className="mx-auto mt-1 max-w-xs text-sm text-muted-foreground">{children}</p>
      </div>
    </div>
  );
}

function Builder({
  appointmentId,
  status,
  notes,
  consentOk,
  onBeforeSubmit,
  protocols,
  products,
  plans,
  quotes,
  credit,
  creditWindowDays,
  linkTtlHours,
  prescriptionBase,
}: Parameters<typeof OutcomePane>[0]) {
  const [protocolId, setProtocolId] = useState<string | null>(null);
  const [edited, setEdited] = useState(false);
  const [productIds, setProductIds] = useState<string[]>([]);
  const [items, setItems] = useState<PrescriptionItem[]>([{ ...EMPTY_ITEM }]);
  const [planId, setPlanId] = useState<string>('plan-3');
  const [followUp, setFollowUp] = useState<number>(notes.followUpInWeeks ?? 8);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const quote = quotes.find((q) => q.planId === planId);
  const plan = plans.find((p) => p.id === planId);

  function applyProtocol(p: ProtocolTemplate) {
    setProtocolId(p.id);
    setEdited(false);
    setProductIds([...p.productIds]);
    setItems(p.items.map((i) => ({ ...i })));
    setPlanId(p.planId);
    setFollowUp(p.followUpInWeeks);
    setNote(p.note);
    setError(null);
  }

  const touch = () => protocolId && setEdited(true);

  function updateItem(index: number, patch: Partial<PrescriptionItem>) {
    touch();
    setItems((list) => list.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  const missing: string[] = [];
  if (!consentOk) missing.push('tick identity verified and consent recorded (Consult)');
  if (productIds.length === 0) missing.push('pick at least one product');
  if (!items.some((i) => i.genericName.trim())) missing.push('add a prescription item');

  function submit() {
    setError(null);
    if (missing.length) {
      setError(`Before sending: ${missing.join('; ')}.`);
      return;
    }
    onBeforeSubmit();
    startTransition(async () => {
      const res = await createRecommendationAction({
        appointmentId,
        planId,
        productIds,
        items: items.filter((i) => i.genericName.trim()),
        note,
        followUpInWeeks: followUp,
        notes: { ...notes, followUpInWeeks: followUp },
      });
      if (res.ok) {
        toast.success('Plan sent on WhatsApp', { description: `Link valid for ${linkTtlHours} hours.` });
      } else {
        setError(res.error.message);
        toast.error(res.error.message);
      }
    });
  }

  const prescription: PrescriptionData = {
    ...prescriptionBase,
    chiefComplaint: notes.chiefComplaint,
    assessment: notes.assessment,
    items,
    advice: [notes.followUpInstructions, note].filter(Boolean).join('\n\n'),
    followUpInWeeks: followUp,
  };

  return (
    <div>
      <OutcomeSection title="Protocol template" hint="A starting point — everything below stays editable.">
        <div className="grid gap-2">
          {protocols.map((p) => {
            const active = protocolId === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => applyProtocol(p)}
                aria-pressed={active}
                className={cn(
                  'rounded-md border px-3 py-2.5 text-left transition-colors focus-visible:ring-2 focus-visible:ring-ring',
                  active ? 'border-obsidian bg-mist/60' : 'border-line bg-card hover:bg-mist/40',
                )}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-ink">{p.name}</span>
                  {active ? (
                    <span className="text-[12px] text-body">{edited ? 'Applied · edited' : 'Applied'}</span>
                  ) : null}
                </span>
                <span className="mt-0.5 block text-[13px] text-muted-foreground">{p.summary}</span>
              </button>
            );
          })}
        </div>
      </OutcomeSection>

      <OutcomeSection title="Products">
        <ul className="space-y-1.5">
          {products.map((p) => {
            const checked = productIds.includes(p.id);
            return (
              <li key={p.id}>
                <label
                  className={cn(
                    'flex min-h-11 cursor-pointer items-start gap-3 rounded-md border px-3 py-2.5',
                    checked ? 'border-steel bg-card' : 'border-line bg-card/60',
                  )}
                >
                  <Checkbox
                    checked={checked}
                    className="mt-0.5"
                    onCheckedChange={(v) => {
                      touch();
                      setProductIds((ids) => (v === true ? [...ids, p.id] : ids.filter((x) => x !== p.id)));
                    }}
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-ink">{p.name}</span>
                    <span className="block text-[13px] text-muted-foreground">
                      {p.category} · {p.tagline}
                    </span>
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </OutcomeSection>

      <OutcomeSection
        title="Prescription"
        hint="Generic name, strength, dosage, frequency, duration, instructions."
      >
        <ol className="space-y-3">
          {items.map((item, i) => (
            <li key={i} className="rounded-md border border-line bg-card p-3">
              <div className="flex items-start gap-2">
                <span className="price mt-2.5 text-[13px] text-muted-foreground">{i + 1}.</span>
                <div className="grid min-w-0 flex-1 grid-cols-2 gap-2">
                  <RxField
                    className="col-span-2"
                    label="Generic name"
                    value={item.genericName}
                    onChange={(v) => updateItem(i, { genericName: v })}
                  />
                  <RxField
                    label="Strength"
                    value={item.strength}
                    onChange={(v) => updateItem(i, { strength: v })}
                  />
                  <RxField
                    label="Dosage"
                    value={item.dosage}
                    onChange={(v) => updateItem(i, { dosage: v })}
                  />
                  <RxField
                    label="Frequency"
                    value={item.frequency}
                    onChange={(v) => updateItem(i, { frequency: v })}
                  />
                  <RxField
                    label="Duration"
                    value={item.duration}
                    onChange={(v) => updateItem(i, { duration: v })}
                  />
                  <RxField
                    className="col-span-2"
                    label="Instructions"
                    value={item.instructions}
                    onChange={(v) => updateItem(i, { instructions: v })}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-10 text-muted-foreground hover:text-danger"
                  aria-label={`Remove item ${i + 1}`}
                  disabled={items.length === 1}
                  onClick={() => {
                    touch();
                    setItems((list) => list.filter((_, x) => x !== i));
                  }}
                >
                  <Trash2 />
                </Button>
              </div>
            </li>
          ))}
        </ol>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-3 h-10"
          disabled={items.length >= 12}
          onClick={() => {
            touch();
            setItems((list) => [...list, { ...EMPTY_ITEM }]);
          }}
        >
          <Plus aria-hidden />
          Add item
        </Button>
      </OutcomeSection>

      <OutcomeSection title="Plan duration">
        <div role="radiogroup" aria-label="Plan duration" className="grid gap-2">
          {plans.map((p) => {
            const active = planId === p.id;
            const q = quotes.find((x) => x.planId === p.id);
            return (
              <button
                key={p.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => {
                  touch();
                  setPlanId(p.id);
                }}
                className={cn(
                  'flex min-h-14 items-center justify-between gap-3 rounded-md border px-3 py-2.5 text-left focus-visible:ring-2 focus-visible:ring-ring',
                  active ? 'border-obsidian bg-mist/60' : 'border-line bg-card hover:bg-mist/40',
                )}
              >
                <span className="flex items-center gap-2.5">
                  <span
                    aria-hidden
                    className={cn(
                      'flex size-4 items-center justify-center rounded-full border',
                      active ? 'border-obsidian' : 'border-steel',
                    )}
                  >
                    {active ? <span className="size-2 rounded-full bg-obsidian" /> : null}
                  </span>
                  <span>
                    <span className="block text-sm font-medium text-ink">{p.name}</span>
                    {p.isRecommended ? (
                      <span className="block text-[12px] text-brand">Doctor-recommended duration</span>
                    ) : null}
                  </span>
                </span>
                <span className="price text-sm text-ink">
                  {q ? formatINR(q.subtotalPaise) : formatINR(p.pricePaise)}
                </span>
              </button>
            );
          })}
        </div>
        <div className="mt-4 grid grid-cols-[1fr_auto] items-center gap-3">
          <Label htmlFor="follow-up-weeks" className="text-sm text-ink">
            Follow-up consultation in
          </Label>
          <select
            id="follow-up-weeks"
            value={followUp}
            onChange={(e) => {
              touch();
              setFollowUp(Number(e.target.value));
            }}
            className="h-10 rounded-md border border-line bg-card px-3 text-sm text-ink"
          >
            {FOLLOW_UP_WEEKS.map((w) => (
              <option key={w} value={w}>
                {w} weeks
              </option>
            ))}
          </select>
        </div>
      </OutcomeSection>

      <OutcomeSection
        title="Note to patient"
        hint="Shown on the plan page and in the prescription advice. Avoid promising results."
      >
        <Textarea
          value={note}
          onChange={(e) => {
            touch();
            setNote(e.target.value);
          }}
          rows={3}
          maxLength={1500}
          aria-label="Note to patient"
          placeholder="e.g. Use the routine every day and share photos each month."
          className="bg-card"
        />
      </OutcomeSection>

      <section className="sticky bottom-0 border-t border-line bg-pearl/95 px-4 py-4 backdrop-blur md:px-5">
        {quote && plan ? (
          <dl className="space-y-1 text-sm" aria-live="polite">
            <div className="flex justify-between">
              <dt className="text-body">{plan.name}</dt>
              <dd className="price text-ink">{formatINR(quote.subtotalPaise)}</dd>
            </div>
            {quote.creditPaise > 0 ? (
              <div className="flex justify-between">
                <dt className="text-success">Consultation credit</dt>
                <dd className="price text-success">−{formatINR(quote.creditPaise)}</dd>
              </div>
            ) : null}
            <div className="flex justify-between border-t border-line pt-1.5">
              <dt className="font-semibold text-ink">Patient pays</dt>
              <dd className="price text-base font-semibold text-ink">{formatINR(quote.totalPaise)}</dd>
            </div>
            {credit ? (
              <p className="text-[12px] text-muted-foreground">
                {credit.projected
                  ? `${formatINR(credit.amountPaise)} consultation fee is credited when you complete this consult (valid ${creditWindowDays} days).`
                  : `${formatINR(credit.amountPaise)} credit valid until ${credit.expiresAt ? formatIst(new Date(credit.expiresAt)) : '—'}.`}{' '}
                {t('common.inclGst')}.
              </p>
            ) : (
              <p className="text-[12px] text-muted-foreground">
                {t('common.inclGst')}. Price is recalculated on the server.
              </p>
            )}
          </dl>
        ) : null}
        {error ? (
          <p role="alert" className="mt-3 rounded-md bg-danger-bg px-3 py-2 text-[13px] text-danger">
            {error}
          </p>
        ) : !consentOk ? (
          <p className="mt-3 rounded-md bg-warning-bg px-3 py-2 text-[13px] text-warning">
            Tick “Identity verified” and “Consent recorded” in Consult before sending.
          </p>
        ) : null}
        <div className="mt-3 grid gap-2">
          <Button
            type="button"
            size="lg"
            className="h-12 w-full text-[15px]"
            disabled={pending}
            onClick={submit}
          >
            {pending ? <Loader2 className="animate-spin" aria-hidden /> : <Send aria-hidden />}
            {pending ? 'Sending plan…' : 'Recommend & create order'}
          </Button>
          <PrescriptionPreview data={prescription} />
          <p className="text-center text-[12px] text-muted-foreground">
            {status === 'booked' ? 'Also marks the consultation completed. ' : ''}Patient gets a WhatsApp with
            a personal link valid {linkTtlHours} hours.
          </p>
        </div>
      </section>
    </div>
  );
}

function RxField({
  label,
  value,
  onChange,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  return (
    <label className={cn('block min-w-0', className)}>
      <span className="mb-1 block text-[12px] text-body">{label}</span>
      <Input value={value} onChange={(e) => onChange(e.target.value)} className="h-10 bg-pearl/60 text-sm" />
    </label>
  );
}

function SentPanel({
  recommendation: rec,
  patient,
  plans,
  products,
  quotes,
  leadStage,
  notes,
  prescriptionBase,
}: Parameters<typeof OutcomePane>[0] & { recommendation: Recommendation }) {
  const plan = plans.find((p) => p.id === rec.planId);
  const chip = recommendationStatus(rec.status);
  const path = `/r/${rec.token}`;
  const quote = quotes.find((q) => q.planId === rec.planId);
  const heading =
    rec.status === 'sent'
      ? 'Plan sent on WhatsApp'
      : rec.status === 'paid'
        ? 'Plan purchased'
        : rec.status === 'expired'
          ? 'Plan link expired'
          : 'Recommendation';

  return (
    <div>
      <section className="px-4 py-5 md:px-5">
        <div className="rounded-lg border border-success/30 bg-success-bg/60 p-4">
          <p className="flex items-center gap-2 text-base font-semibold text-success">
            <CheckCircle2 className="size-5" aria-hidden />
            {heading}
          </p>
          <p className="mt-1 text-sm text-body">
            Sent to {patient.name.split(' ')[0]} on WhatsApp ({maskPhone(patient.phone)}) with a personal
            link.
          </p>
        </div>

        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <dt className="text-muted-foreground">Status</dt>
            <dd>
              <StatusChip tone={chip.tone}>{chip.label}</StatusChip>
            </dd>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <dt className="text-muted-foreground">CRM stage</dt>
            <dd>
              <StatusChip tone="info">
                {leadStage ? t(`status.leadStage.${leadStage}`) : 'Plan recommended'}
              </StatusChip>
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Personal link</dt>
            <dd className="mt-1 flex items-center gap-2">
              <code className="min-w-0 flex-1 truncate rounded-md border border-line bg-card px-3 py-2 text-[13px] text-ink">
                {path}
              </code>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-10"
                aria-label="Copy link"
                onClick={() => {
                  void navigator.clipboard
                    ?.writeText(`${window.location.origin}${path}`)
                    .then(() => toast.success('Link copied'));
                }}
              >
                <Copy />
              </Button>
              <Button type="button" variant="outline" size="icon" className="size-10" asChild>
                <a
                  href={path}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Open plan link in a new tab"
                >
                  <ExternalLink />
                </a>
              </Button>
            </dd>
          </div>
          <div className="flex flex-wrap justify-between gap-2">
            <dt className="text-muted-foreground">Link expires</dt>
            <dd className="text-ink">{formatIst(new Date(rec.expiresAt))}</dd>
          </div>
          <div className="flex flex-wrap justify-between gap-2">
            <dt className="text-muted-foreground">Sent</dt>
            <dd className="text-ink">{formatIst(new Date(rec.createdAt))}</dd>
          </div>
        </dl>
      </section>

      <section className="border-t border-line px-4 py-4 md:px-5">
        <h3 className="text-[13px] font-semibold tracking-[0.1em] text-brand uppercase">
          What was recommended
        </h3>
        <div className="mt-3 flex items-baseline justify-between gap-2">
          <p className="font-medium text-ink">{plan?.name ?? 'Plan'}</p>
          {quote ? (
            <p className="price text-sm text-ink">
              {formatINR(rec.status === 'paid' ? quote.subtotalPaise : quote.totalPaise)}
              {quote.creditPaise > 0 && rec.status !== 'paid' ? (
                <span className="text-muted-foreground"> after {formatINR(quote.creditPaise)} credit</span>
              ) : null}
            </p>
          ) : null}
        </div>
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {rec.productIds.map((id) => (
            <li key={id} className="rounded-full bg-mist px-2.5 py-1 text-[13px] text-ink">
              {products.find((p) => p.id === id)?.name ?? id}
            </li>
          ))}
        </ul>
        <ol className="mt-3 space-y-1.5 text-[13px]">
          {rec.items.map((item, i) => (
            <li key={i} className="text-body">
              <span className="font-medium text-ink">{item.genericName}</span> — {item.dosage},{' '}
              {item.frequency}, {item.duration}
            </li>
          ))}
        </ol>
        {rec.note ? (
          <p className="mt-3 rounded-md bg-card px-3 py-2 text-[13px] text-body">“{rec.note}”</p>
        ) : null}
        <div className="mt-4">
          <PrescriptionPreview
            data={{
              ...prescriptionBase,
              chiefComplaint: notes.chiefComplaint,
              assessment: notes.assessment,
              items: rec.items,
              advice: [notes.followUpInstructions, rec.note].filter(Boolean).join('\n\n'),
              followUpInWeeks: notes.followUpInWeeks,
            }}
          />
        </div>
      </section>
    </div>
  );
}
