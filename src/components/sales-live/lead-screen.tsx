import { AlertTriangle, ArrowLeft, Camera, Hand, Lock, Mail, MessageCircle, Phone, PhoneCall } from 'lucide-react';
import Link from 'next/link';
import { coverLabel } from '@/components/journey/scan-result';
import {
  FollowUpChip,
  OutcomeChip,
  REASON_TEXT,
  StageChip,
  ago,
  istDateTime,
  prettyPhone,
  sourceLabel,
  whatsappHref,
} from './lead-bits';
import {
  CallPanel,
  FollowUpPanel,
  NoteForm,
  OwnerPanel,
  StageControl,
  WhatsAppPanel,
} from './lead-controls';
import { ANGLE_LABEL } from '@/lib/journey/labels';
import { ANSWER_LABELS, followUpState } from '@/lib/sales/playbook';
import type { ScanOutcome } from '@/lib/scan/rules';
import { cn } from '@/lib/utils';
import type { LeadDetail } from '@/server/live/sales';

/** What to say on the call, per outcome — no medical claims, no promises (PRD §15). */
const CALL_GUIDE: Record<ScanOutcome, string[]> = {
  eligible: [
    'Their scan shows hair roots still visible.',
    'Ask how long they have noticed hair loss and what they have tried.',
    'Explain how the YHC products work and help them choose. Do not promise results or timelines.',
  ],
  not_eligible: [
    'Their scan shows smooth, bare scalp in the main areas and they are older.',
    'Be honest: treatment is unlikely to help the bare areas.',
    'Offer care for the hair they still have only if they ask.',
  ],
  unclear: [
    'The photos were unclear, or they are younger with very little hair.',
    'Ask them to scan again in good light (send the "Please scan again" WhatsApp), or talk it through.',
    'Write down what you learn in a note.',
  ],
};

function Card({ title, icon, children, className }: { title: string; icon?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn('rounded-2xl bg-white p-4 ring-1 ring-line sm:p-5', className)}>
      <h2 className="flex items-center gap-2 font-semibold text-ink">
        {icon}
        {title}
      </h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

/** The single most useful next step, in words. */
function nextStep(lead: LeadDetail, me: string | null, now: Date): { text: string; tone: 'urgent' | 'normal' | 'done' } {
  if (lead.stage === 'product_purchased') return { text: 'Sold. Send a thank-you on WhatsApp and set a check-in call if needed.', tone: 'done' };
  if (lead.stage === 'lost') return { text: `Lost${lead.lostReason ? `: ${lead.lostReason}` : ''}.`, tone: 'done' };
  if (!lead.owner) return { text: 'Nobody owns this lead. Take it, then call.', tone: 'urgent' };
  if (lead.owner !== me) return { text: `${lead.owner} owns this lead. Take it over only if you agreed with them.`, tone: 'normal' };
  const fu = followUpState(lead.nextActionAt, now);
  if (fu === 'overdue') return { text: `The follow-up call was due ${istDateTime(lead.nextActionAt)}. Call now.`, tone: 'urgent' };
  if (lead.callAttempts === 0) return { text: 'Not called yet. Call now and log how it went.', tone: 'urgent' };
  if (fu === 'today') return { text: `Call again today at ${istDateTime(lead.nextActionAt)}.`, tone: 'normal' };
  if (!lead.nextActionAt) return { text: 'Set the next follow-up so this lead is not forgotten.', tone: 'normal' };
  return { text: `Next call ${istDateTime(lead.nextActionAt)}.`, tone: 'normal' };
}

const KIND_LABEL: Record<string, string> = {
  call: 'Call',
  note: 'Note',
  whatsapp: 'WhatsApp',
  stage_change: 'Stage',
  system: 'Update',
  email: 'Email',
};

/** The lead page (presentational; data comes from the route). */
export function LeadScreen({ lead, me, team, now }: { lead: LeadDetail; me: string | null; team: string[]; now: Date }) {
  const step = nextStep(lead, me, now);
  const phone = prettyPhone(lead.phone);
  const lastCall = lead.activities.find((a) => a.kind === 'call');
  const suggest =
    lead.stage === 'product_purchased'
      ? 'thanks'
      : lead.outcome === 'unclear'
        ? 'rescan'
        : lastCall && /No answer|Busy|Switched off/.test(lastCall.body ?? '')
          ? 'missed_call'
          : lead.callAttempts === 0
            ? 'intro'
            : null;
  const scan = lead.scan;

  return (
    <div className="mx-auto max-w-6xl">
      <Link href="/sales" className="-ml-1 inline-flex min-h-10 items-center gap-1.5 px-1 text-sm text-muted-foreground hover:text-ink">
        <ArrowLeft className="size-4" aria-hidden />
        All leads
      </Link>

      {/* Header */}
      <header className="mt-2 rounded-[24px] bg-white p-4 ring-1 ring-line sm:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <h1 className="font-display text-[30px] leading-tight font-medium break-words text-ink sm:text-[34px]">{lead.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {[lead.age ? `${lead.age} years` : null, lead.city, `Signed up ${istDateTime(lead.createdAt)}`].filter(Boolean).join(' · ')}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <OutcomeChip outcome={lead.outcome} />
              <StageChip stage={lead.stage} />
              <FollowUpChip at={lead.nextActionAt} stage={lead.stage} now={now} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 md:flex md:shrink-0">
            <a href={`tel:${lead.phone}`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-obsidian px-4 text-sm font-semibold text-pearl">
              <Phone className="size-4" aria-hidden />
              Call
            </a>
            <a
              href={whatsappHref(lead.phone)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium text-ink ring-1 ring-line hover:bg-mist"
            >
              <MessageCircle className="size-4" aria-hidden />
              WhatsApp
            </a>
            {lead.email ? (
              <a href={`mailto:${lead.email}`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium text-ink ring-1 ring-line hover:bg-mist">
                <Mail className="size-4" aria-hidden />
                Email
              </a>
            ) : null}
          </div>
        </div>
        <p
          className={cn(
            'mt-4 flex items-start gap-2 rounded-xl p-3 text-sm',
            step.tone === 'urgent' ? 'bg-warning-bg text-ink' : step.tone === 'done' ? 'bg-success-bg text-ink' : 'bg-mist text-ink',
          )}
        >
          {step.tone === 'urgent' ? <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden /> : <Hand className="mt-0.5 size-4 shrink-0 text-steel" aria-hidden />}
          <span>
            <span className="font-semibold">Next step: </span>
            {step.text}
          </span>
        </p>
      </header>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)]">
        {/* Work column */}
        <div className="min-w-0 space-y-4">
          <Card title="Owner">
            <OwnerPanel id={lead.id} owner={lead.owner} me={me} team={team} />
          </Card>

          <Card title="Call" icon={<PhoneCall className="size-4" aria-hidden />}>
            <CallPanel id={lead.id} phone={lead.phone} prettyPhone={phone} />
            <p className="mt-3 text-[13px] text-muted-foreground">
              {lead.callAttempts} call{lead.callAttempts === 1 ? '' : 's'} logged · last call {ago(lead.lastContactedAt, now)}
              {lastCall?.body ? ` (${lastCall.body})` : ''}
            </p>
          </Card>

          <Card title="Next follow-up">
            <FollowUpPanel id={lead.id} nextActionAt={lead.nextActionAt} />
          </Card>

          <Card title="Stage">
            <StageControl id={lead.id} stage={lead.stage} />
          </Card>

          <Card title="WhatsApp messages" icon={<MessageCircle className="size-4" aria-hidden />}>
            <WhatsAppPanel id={lead.id} phone={lead.phone} name={lead.name} member={me} suggest={suggest} />
          </Card>

          <Card title="Add a note">
            <NoteForm id={lead.id} />
          </Card>
        </div>

        {/* Info column */}
        <div className="min-w-0 space-y-4">
          <Card title="Customer">
            <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2 text-sm">
              <dt className="text-muted-foreground">Mobile</dt>
              <dd className="price text-ink">{phone}</dd>
              <dt className="text-muted-foreground">Email</dt>
              <dd className="break-all text-ink">{lead.email ?? '—'}</dd>
              <dt className="text-muted-foreground">Age</dt>
              <dd className="text-ink">{lead.age ?? '—'}</dd>
              <dt className="text-muted-foreground">City</dt>
              <dd className="text-ink">{lead.city ?? '—'}</dd>
              <dt className="text-muted-foreground">Came from</dt>
              <dd className="text-ink">{sourceLabel(lead.source, lead.campaign)}</dd>
              {lead.utm.utm_medium ? (
                <>
                  <dt className="text-muted-foreground">Ad type</dt>
                  <dd className="text-ink">{lead.utm.utm_medium}</dd>
                </>
              ) : null}
              <dt className="text-muted-foreground">Signed up</dt>
              <dd className="text-ink">{istDateTime(lead.createdAt)}</dd>
              <dt className="text-muted-foreground">Owner since</dt>
              <dd className="text-ink">{lead.ownerSince ? istDateTime(lead.ownerSince) : '—'}</dd>
              <dt className="text-muted-foreground">Scans done</dt>
              <dd className="text-ink">{lead.scansFinished}</dd>
            </dl>
          </Card>

          <Card title="Scalp scan" icon={<Camera className="size-4" aria-hidden />}>
            {!scan ? (
              <p className="text-sm text-muted-foreground">
                They have not finished the scan yet. Send the &ldquo;Please scan again&rdquo; WhatsApp or help them on the call.
              </p>
            ) : (
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <OutcomeChip outcome={scan.outcome} />
                  <span className="text-[13px] text-muted-foreground">{istDateTime(scan.submittedAt)}</span>
                </div>
                {scan.reasons.length ? (
                  <ul className="mt-2 space-y-1 text-sm text-body">
                    {scan.reasons.map((r) => (
                      <li key={r}>• {REASON_TEXT[r] ?? r}</li>
                    ))}
                  </ul>
                ) : null}
                {scan.visible ? (
                  <>
                    {scan.answers ? (
                      <dl className="mt-4 grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1.5 rounded-xl bg-mist p-3 text-sm">
                        {Object.entries(ANSWER_LABELS).map(([key, def]) =>
                          scan.answers?.[key] ? (
                            <div key={key} className="contents">
                              <dt className="text-muted-foreground">{def.q}</dt>
                              <dd className="text-ink">{def.a[scan.answers[key]] ?? scan.answers[key]}</dd>
                            </div>
                          ) : null,
                        )}
                      </dl>
                    ) : null}
                    {scan.zones.length ? (
                      <ul className="mt-4 grid grid-cols-2 gap-2">
                        {scan.zones.map((z) => (
                          <li key={z.zone} className="overflow-hidden rounded-xl ring-1 ring-line">
                            {z.photoUrl ? (
                              <a href={z.photoUrl} target="_blank" rel="noreferrer" className="block aspect-[4/3] bg-mist" aria-label={`Open the ${ANGLE_LABEL[z.zone]} photo`}>
                                {/* eslint-disable-next-line @next/next/no-img-element -- private photo served by our own route */}
                                <img src={z.photoUrl} alt="" loading="lazy" className="size-full object-cover" />
                              </a>
                            ) : null}
                            <div className="p-2">
                              <p className="text-[13px] font-medium text-ink">{ANGLE_LABEL[z.zone]}</p>
                              <p className="text-[12px] text-muted-foreground">{coverLabel(z)}</p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                    <p className="mt-3 text-[12px] text-muted-foreground">
                      Shared by the customer with our hair-care team. Never send these photos or details on WhatsApp, and
                      never screenshot them.
                    </p>
                  </>
                ) : (
                  <p className="mt-3 flex items-start gap-2 rounded-xl bg-mist p-3 text-[13px] text-body">
                    <Lock className="mt-0.5 size-4 shrink-0" aria-hidden />
                    This scan was taken before customers could share photos with the team, so the photos stay private.
                    If you need to see them, ask the customer to scan again.
                  </p>
                )}
              </div>
            )}
          </Card>

          {lead.outcome ? (
            <Card title="For the call" className="bg-mist ring-0">
              <ul className="space-y-1.5 text-sm leading-relaxed text-body">
                {CALL_GUIDE[lead.outcome].map((line) => (
                  <li key={line}>• {line}</li>
                ))}
              </ul>
              <p className="mt-2 text-[13px] text-muted-foreground">
                The scan is a photo check, not a diagnosis. Never promise results, a cure or timelines.
              </p>
            </Card>
          ) : null}
        </div>
      </div>

      <Card title="History" className="mt-4">
        {lead.activities.length ? (
          <ol className="space-y-3">
            {lead.activities.map((a) => (
              <li key={a.id} className="border-l-2 border-line pl-3">
                <p className="text-[13px] text-muted-foreground">
                  {istDateTime(a.at)} · {KIND_LABEL[a.kind] ?? a.kind}
                  {a.by ? ` · ${a.by}` : ''}
                </p>
                {a.body ? <p className="mt-0.5 text-sm break-words whitespace-pre-line text-ink">{a.body}</p> : null}
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-sm text-muted-foreground">Nothing yet.</p>
        )}
      </Card>
    </div>
  );
}

