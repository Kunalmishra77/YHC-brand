import { MessageCircle, Phone, Search } from 'lucide-react';
import Link from 'next/link';
import { FollowUpChip, OutcomeChip, StageChip, ago, istDateTime, prettyPhone, sourceLabel, whatsappHref } from './lead-bits';
import { TakeButton } from './lead-controls';
import { EmptyState } from '@/components/shared/states';
import { cn } from '@/lib/utils';
import { LEAD_VIEWS, type LeadRow, type LeadView, type SalesDashboard } from '@/server/live/sales';

const VIEW_LABEL: Record<LeadView, string> = {
  today: 'Calls due',
  new: 'New',
  mine: 'My leads',
  open: 'All open',
  eligible: 'Eligible',
  not_eligible: 'Not eligible',
  unclear: 'Closer look',
  sold: 'Sold',
  lost: 'Lost',
  all: 'Everything',
};

const EMPTY: Record<LeadView, string> = {
  today: 'No calls due today. Set a follow-up on a lead and it shows up here.',
  new: 'Nobody new is waiting. New leads appear here as soon as someone finishes signing up.',
  mine: 'You have no open leads. Take one from New.',
  open: 'No open leads right now.',
  eligible: 'No open eligible leads.',
  not_eligible: 'No open not-eligible leads.',
  unclear: 'No open leads that need a closer look.',
  sold: 'No sales yet.',
  lost: 'No lost leads.',
  all: 'No leads yet. They appear here as soon as someone signs up for the free scalp scan.',
};

/** The leads list with today's dashboard (presentational; data comes from the route). */
export function LeadsScreen({
  dash,
  view,
  q,
  leads,
  me,
  now,
}: {
  dash: SalesDashboard;
  view: LeadView;
  q: string;
  leads: LeadRow[];
  me: string | null;
  now: Date;
}) {
  const href = (v: LeadView) => `/sales?view=${v}${q ? `&q=${encodeURIComponent(q)}` : ''}`;

  const tiles: { view: LeadView; label: string; value: number; tone: string; hint: string }[] = [
    {
      view: 'today',
      label: 'Calls due today',
      value: dash.dueToday,
      tone: dash.overdue ? 'bg-danger-bg' : 'bg-white',
      hint: dash.overdue ? `${dash.overdue} overdue` : 'Follow-ups',
    },
    { view: 'new', label: 'New, not taken', value: dash.newUnclaimed, tone: dash.newUnclaimed ? 'bg-info-bg' : 'bg-white', hint: 'Take one' },
    { view: 'mine', label: 'My open leads', value: dash.mineOpen, tone: 'bg-white', hint: me ?? 'Pick your name' },
    { view: 'sold', label: 'Sold this week', value: dash.soldThisWeek, tone: 'bg-white', hint: `${dash.open} open in total` },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="font-display text-[30px] leading-tight font-medium text-ink">
            {me ? `Hi ${me.split(' ')[0]}` : 'Leads'}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Calls due first, then new leads. Take a lead so the team knows it&apos;s yours.</p>
        </div>
      </div>

      <ul className="mt-5 grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
        {tiles.map((t) => (
          <li key={t.view}>
            <Link
              href={href(t.view)}
              aria-current={view === t.view ? 'page' : undefined}
              className={cn(
                'block h-full rounded-2xl p-4 ring-1 ring-line transition-shadow hover:shadow-md',
                t.tone,
                view === t.view && 'ring-2 ring-obsidian',
              )}
            >
              <p className="text-[13px] text-muted-foreground">{t.label}</p>
              <p className="price mt-1 text-[28px] leading-none font-semibold text-ink">{t.value}</p>
              <p className="mt-1.5 truncate text-[13px] text-body">{t.hint}</p>
            </Link>
          </li>
        ))}
      </ul>

      <nav aria-label="Lead filters" className="-mx-4 mt-5 flex gap-1.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:mx-0 md:flex-wrap md:px-0">
        {LEAD_VIEWS.map((v) => (
          <Link
            key={v}
            href={href(v)}
            aria-current={v === view ? 'page' : undefined}
            className={cn(
              'inline-flex min-h-10 shrink-0 items-center rounded-full px-4 text-sm ring-1 transition-colors',
              v === view ? 'bg-obsidian font-semibold text-pearl ring-obsidian' : 'bg-white text-ink ring-line hover:bg-mist',
            )}
          >
            {VIEW_LABEL[v]}
          </Link>
        ))}
      </nav>
      <form action="/sales" className="mt-3 flex max-w-md gap-2">
        <input type="hidden" name="view" value={view} />
        <label htmlFor="lead-q" className="sr-only">
          Search by name, mobile, email or city
        </label>
        <input
          id="lead-q"
          name="q"
          defaultValue={q}
          placeholder="Search name, mobile, email, city"
          className="h-11 min-w-0 flex-1 rounded-xl border border-line bg-white px-3 text-sm"
        />
        <button type="submit" className="inline-flex size-11 items-center justify-center rounded-xl bg-white ring-1 ring-line hover:bg-mist" aria-label="Search">
          <Search className="size-4" aria-hidden />
        </button>
      </form>

      {view === 'mine' && !me ? (
        <p className="mt-6 rounded-xl bg-warning-bg p-4 text-sm text-ink">Add your team names first, then pick your name.</p>
      ) : leads.length === 0 ? (
        <div className="mt-6">
          <EmptyState title={q ? 'No leads match your search' : 'Nothing here'} body={EMPTY[view]} />
        </div>
      ) : (
        <>
          <p className="mt-5 text-[13px] text-muted-foreground">
            {leads.length} lead{leads.length === 1 ? '' : 's'}
          </p>
          <ul className="mt-2 space-y-2">
            {leads.map((l) => (
              <li key={l.id} className="rounded-2xl bg-white p-4 ring-1 ring-line">
                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                  <Link href={`/sales/leads/${l.id}`} className="min-w-0 flex-1 rounded-lg outline-offset-4">
                    <p className="flex flex-wrap items-baseline gap-x-2">
                      <span className="truncate text-[16px] font-semibold text-ink">{l.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {[l.age ? `${l.age} yrs` : null, l.city].filter(Boolean).join(' · ')}
                      </span>
                    </p>
                    <p className="price mt-0.5 text-sm text-body">{prettyPhone(l.phone)}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <OutcomeChip outcome={l.outcome} />
                      <StageChip stage={l.stage} />
                      <FollowUpChip at={l.nextActionAt} stage={l.stage} now={now} />
                    </div>
                    <p className="mt-2 text-[13px] text-muted-foreground">
                      {l.owner ? (
                        <>
                          Owner: <span className={cn('font-medium', l.owner === me ? 'text-ink' : 'text-body')}>{l.owner === me ? 'You' : l.owner}</span>
                        </>
                      ) : (
                        'Not taken'
                      )}
                      {' · '}Signed up {istDateTime(l.createdAt)} · Last call {ago(l.lastContactedAt, now)} · {sourceLabel(l.source, l.campaign)}
                    </p>
                  </Link>
                  <div className="grid grid-cols-3 gap-2 md:flex md:w-auto md:shrink-0">
                    {!l.owner && me ? <TakeButton id={l.id} /> : null}
                    <a
                      href={`tel:${l.phone}`}
                      className={cn(
                        'inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-obsidian px-3.5 text-sm font-medium text-pearl',
                        (l.owner || !me) && 'col-span-2',
                      )}
                    >
                      <Phone className="size-4" aria-hidden />
                      Call
                    </a>
                    <a
                      href={whatsappHref(l.phone)}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`WhatsApp ${l.name}`}
                      className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl px-3.5 text-sm font-medium text-ink ring-1 ring-line hover:bg-mist"
                    >
                      <MessageCircle className="size-4" aria-hidden />
                      <span className="hidden sm:inline">WhatsApp</span>
                    </a>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
