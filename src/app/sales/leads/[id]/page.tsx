import { ArrowLeft, Mail, MessageCircle, Phone } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ClaimControl, NoteForm, StageControl } from '@/components/sales-live/lead-controls';
import { OutcomeChip, StageChip, istDateTime, prettyPhone, whatsappHref } from '@/components/sales-live/lead-bits';
import type { ScanOutcome } from '@/lib/scan/rules';
import { currentMember, getLead } from '@/server/live/sales';

export const metadata = { title: 'Lead · Sales', robots: { index: false } };
export const dynamic = 'force-dynamic';

/** What to say on the call, per outcome — no medical claims, no promises (PRD §15). */
const CALL_GUIDE: Record<ScanOutcome, string> = {
  eligible:
    'Their scan shows hair roots still visible. Explain how the YHC products work, answer questions, and help them choose. Do not promise results or timelines.',
  not_eligible:
    'Their scan shows smooth, bare scalp in the main areas and they are older. Be honest: treatment is unlikely to help the bare areas. Offer care for the hair they still have only if they ask.',
  unclear:
    'The photos were unclear, or they are younger with very little hair. Ask them to scan again in good light, or talk it through and note what you learn.',
};

export default async function LeadPage(props: PageProps<'/sales/leads/[id]'>) {
  const { id } = await props.params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const [lead, member] = await Promise.all([getLead(id), currentMember()]);
  if (!lead) notFound();

  return (
    <div className="max-w-4xl">
      <Link href="/sales" className="-ml-1 inline-flex min-h-10 items-center gap-1.5 px-1 text-sm text-muted-foreground hover:text-ink">
        <ArrowLeft className="size-4" aria-hidden />
        All leads
      </Link>
      <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-display text-[32px] leading-tight font-medium text-ink">{lead.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {lead.age ? `${lead.age} years · ` : ''}Signed up {istDateTime(lead.createdAt)}
            {lead.source && lead.source !== 'website' ? ` · ${lead.source}` : ''}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <OutcomeChip outcome={lead.outcome} />
            <StageChip stage={lead.stage} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={`tel:${lead.phone}`} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-obsidian px-4 text-sm font-semibold text-pearl">
            <Phone className="size-4" aria-hidden />
            Call {prettyPhone(lead.phone)}
          </a>
          <a
            href={whatsappHref(lead.phone)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center gap-2 rounded-lg px-4 text-sm font-medium text-ink ring-1 ring-line hover:bg-mist"
          >
            <MessageCircle className="size-4" aria-hidden />
            WhatsApp
          </a>
          {lead.email ? (
            <a href={`mailto:${lead.email}`} className="inline-flex min-h-11 items-center gap-2 rounded-lg px-4 text-sm font-medium text-ink ring-1 ring-line hover:bg-mist">
              <Mail className="size-4" aria-hidden />
              Email
            </a>
          ) : null}
        </div>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl bg-white p-5 ring-1 ring-line">
          <h2 className="font-semibold text-ink">Owner</h2>
          <div className="mt-3">
            <ClaimControl id={lead.id} owner={lead.owner} me={member} />
          </div>
        </section>
        <section className="rounded-2xl bg-white p-5 ring-1 ring-line">
          <h2 className="font-semibold text-ink">Stage</h2>
          {lead.stage === 'lost' && lead.lostReason ? (
            <p className="mt-1 text-sm text-muted-foreground">Lost: {lead.lostReason}</p>
          ) : null}
          <div className="mt-3">
            <StageControl id={lead.id} stage={lead.stage} />
          </div>
        </section>
      </div>

      {lead.outcome ? (
        <section className="mt-4 rounded-2xl bg-mist p-5">
          <h2 className="font-semibold text-ink">For the call</h2>
          <p className="mt-1 text-sm leading-relaxed text-body">{CALL_GUIDE[lead.outcome]}</p>
          <p className="mt-2 text-[13px] text-muted-foreground">
            The scan is a photo check, not a diagnosis. Photos and answers are private to the customer.
          </p>
        </section>
      ) : null}

      <section className="mt-4 rounded-2xl bg-white p-5 ring-1 ring-line">
        <h2 className="font-semibold text-ink">Log a call or note</h2>
        <div className="mt-3">
          <NoteForm id={lead.id} />
        </div>
      </section>

      <section className="mt-4 rounded-2xl bg-white p-5 ring-1 ring-line">
        <h2 className="font-semibold text-ink">History</h2>
        {lead.activities.length ? (
          <ol className="mt-3 space-y-3">
            {lead.activities.map((a) => (
              <li key={a.id} className="border-l-2 border-line pl-3">
                <p className="text-[13px] text-muted-foreground">
                  {istDateTime(a.at)} · {a.kind === 'call' ? 'Call' : a.kind === 'note' ? 'Note' : a.kind === 'stage_change' ? 'Stage' : 'System'}
                  {a.by ? ` · ${a.by}` : ''}
                </p>
                {a.body ? <p className="mt-0.5 text-sm whitespace-pre-line text-ink">{a.body}</p> : null}
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">Nothing yet.</p>
        )}
      </section>
    </div>
  );
}
