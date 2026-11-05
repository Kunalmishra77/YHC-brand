import { MessageCircle, Phone, Search } from 'lucide-react';
import Link from 'next/link';
import { OutcomeChip, StageChip, istDateTime, prettyPhone, whatsappHref } from '@/components/sales-live/lead-bits';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/states';
import { cn } from '@/lib/utils';
import { type LeadView, currentMember, listLeads } from '@/server/live/sales';

export const metadata = { title: 'Leads · Sales', robots: { index: false } };
export const dynamic = 'force-dynamic';

const VIEWS: { id: LeadView; label: string }[] = [
  { id: 'new', label: 'New' },
  { id: 'mine', label: 'My leads' },
  { id: 'open', label: 'Open' },
  { id: 'eligible', label: 'Eligible' },
  { id: 'not_eligible', label: 'Not eligible' },
  { id: 'unclear', label: 'Closer look' },
  { id: 'closed', label: 'Sold / lost' },
  { id: 'all', label: 'All' },
];

/** /sales — leads from the website scan, newest first (ADR-36). */
export default async function SalesLeadsPage(props: PageProps<'/sales'>) {
  const sp = await props.searchParams;
  const view = (VIEWS.find((v) => v.id === sp.view)?.id ?? 'new') as LeadView;
  const q = typeof sp.q === 'string' ? sp.q.slice(0, 80) : '';
  const member = await currentMember();
  const leads = await listLeads(view, q, member);

  return (
    <div>
      <PageHeader
        title="Leads"
        description="Everyone who finished the free scalp scan. Call new leads first. Take a lead so the team knows it's yours."
      />
      <nav aria-label="Lead filters" className="-mx-1 mt-4 flex gap-1 overflow-x-auto pb-1">
        {VIEWS.map((v) => (
          <Link
            key={v.id}
            href={`/sales?view=${v.id}${q ? `&q=${encodeURIComponent(q)}` : ''}`}
            aria-current={v.id === view ? 'page' : undefined}
            className={cn(
              'inline-flex min-h-10 shrink-0 items-center rounded-full px-4 text-sm ring-1 transition-colors',
              v.id === view ? 'bg-obsidian font-semibold text-pearl ring-obsidian' : 'text-ink ring-line hover:bg-mist',
            )}
          >
            {v.label}
          </Link>
        ))}
      </nav>
      <form action="/sales" className="mt-3 flex max-w-md gap-2">
        <input type="hidden" name="view" value={view} />
        <label htmlFor="lead-q" className="sr-only">
          Search by name, mobile or email
        </label>
        <input
          id="lead-q"
          name="q"
          defaultValue={q}
          placeholder="Search name, mobile or email"
          className="h-10 flex-1 rounded-lg border border-line bg-white px-3 text-sm"
        />
        <button type="submit" className="inline-flex size-10 items-center justify-center rounded-lg ring-1 ring-line hover:bg-mist" aria-label="Search">
          <Search className="size-4" aria-hidden />
        </button>
      </form>

      {view === 'mine' && !member ? (
        <p className="mt-6 rounded-xl bg-warning-bg p-4 text-sm text-ink">Choose your name at the top of the page to see your leads.</p>
      ) : leads.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title={q ? 'No leads match your search' : view === 'new' ? 'No new leads right now' : 'No leads here yet'}
            body="New leads appear here as soon as someone signs up for the free scalp scan."
          />
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-line overflow-hidden rounded-2xl bg-white ring-1 ring-line">
          {leads.map((l) => (
            <li key={l.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
              <Link href={`/sales/leads/${l.id}`} className="min-w-0 flex-1 rounded-lg outline-offset-4">
                <p className="truncate font-medium text-ink">
                  {l.name}
                  {l.age ? <span className="font-normal text-muted-foreground"> · {l.age} yrs</span> : null}
                </p>
                <p className="price mt-0.5 text-sm text-muted-foreground">{prettyPhone(l.phone)}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <OutcomeChip outcome={l.outcome} />
                  <StageChip stage={l.stage} />
                  <span className="text-[13px] text-muted-foreground">
                    {l.owner ? `Owner: ${l.owner}` : 'Not taken'} · {istDateTime(l.createdAt)}
                  </span>
                </div>
              </Link>
              <div className="flex shrink-0 gap-2">
                <a href={`tel:${l.phone}`} className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-obsidian px-3.5 text-sm font-medium text-pearl">
                  <Phone className="size-4" aria-hidden />
                  Call
                </a>
                <a
                  href={whatsappHref(l.phone)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-10 items-center gap-1.5 rounded-lg px-3.5 text-sm font-medium text-ink ring-1 ring-line hover:bg-mist"
                >
                  <MessageCircle className="size-4" aria-hidden />
                  WhatsApp
                </a>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
