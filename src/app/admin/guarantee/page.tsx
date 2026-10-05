import { ShieldCheck } from 'lucide-react';
import { ConfirmAction } from '@/components/admin/action-kit';
import { DataList } from '@/components/admin/data-list';
import { CLAIM_LABEL, istDay } from '@/components/admin/format';
import { GuaranteeDraftForm } from '@/components/admin/guarantee-form';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/states';
import { StatusChip } from '@/components/shared/status-chip';
import { t } from '@/i18n/en';
import type { GuaranteeClaim, GuaranteePolicy } from '@/lib/domain/types';
import { formatINR } from '@/lib/money';
import { activePolicy } from '@/server/admin/guarantee';
import { requireAdminPage } from '@/server/admin/guard';
import { adminState } from '@/server/admin/state';
import { db, getSetting } from '@/server/demo/store';
import { activateDraftAction, discardDraftAction } from './actions';

export const metadata = { title: 'Guarantee' };

function Rules({ p }: { p: GuaranteePolicy }) {
  const rows: [string, string][] = [
    ['Refund', `${p.refundPercent}% of plan payments`],
    ['Minimum plan', `${p.minPlanMonths} months, continuous`],
    ['Claim window', `${p.claimWindowDays} days after plan end`],
    ['Check-in replies', `at least ${p.minCheckinResponsePct}%`],
    ['Monthly progress photos', p.requireMonthlyPhotos ? 'Required' : 'Not required'],
    ['Follow-up consultation', p.requireFollowupConsult ? 'Required' : 'Not required'],
  ];
  return (
    <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
      {rows.map(([k, v]) => (
        <div key={k} className="flex justify-between gap-3 border-b border-line py-1.5">
          <dt className="text-muted-foreground">{k}</dt>
          <dd className="text-right font-medium text-ink">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

export default async function GuaranteePage() {
  await requireAdminPage();
  const policy = activePolicy();
  const { policyDraft: draft, policyHistory } = adminState();
  const enabled = getSetting('guarantee.enabled') === 'true';
  const s = db();
  const claims = [...s.claims].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
  const nameOf = (id: string) => s.customers.find((c) => c.id === id)?.name ?? '—';
  const base = draft ?? policy;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Guarantee"
        description={
          <span className="inline-flex flex-wrap items-center gap-2">
            {enabled ? (
              <StatusChip tone="success">Shown to customers</StatusChip>
            ) : (
              <StatusChip tone="neutral">Hidden — guarantee.enabled is off</StatusChip>
            )}
            <span>Toggle visibility in Settings.</span>
          </span>
        }
      />

      <section className="rounded-xl bg-card p-4 shadow-card ring-1 ring-line/80 md:p-6">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <ShieldCheck className="size-5 text-steel" aria-hidden />
          <h2 className="text-base font-semibold text-ink">{policy.name}</h2>
          <StatusChip tone="info">Active · v{policy.version}</StatusChip>
          {policy.isDraft ? <StatusChip tone="warning">DRAFT</StatusChip> : null}
        </div>
        {policy.isDraft ? (
          <p className="mb-4 rounded-md bg-warning-bg px-3 py-2 text-sm text-warning">
            {t('common.draftTerms')} (docs/15 D-P1). Values are our recommendation until the client approves
            them.
          </p>
        ) : null}
        <Rules p={policy} />
        <h3 className="mt-5 mb-1.5 text-sm font-medium text-ink">Terms, as customers see them</h3>
        <blockquote className="rounded-md bg-mist/60 p-3 text-sm leading-relaxed text-body">
          {policy.termsMd}
        </blockquote>
      </section>

      <section className="grid gap-4 lg:grid-cols-5">
        <div className="rounded-xl bg-card p-4 shadow-card ring-1 ring-line/80 md:p-6 lg:col-span-3">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold text-ink">
                {draft ? `Draft v${draft.version}` : `New version (v${policy.version + 1})`}
              </h2>
              <p className="text-[13px] text-muted-foreground">
                Draft → review → activate. Only one policy is active; existing enrolments keep their version.
              </p>
            </div>
            {draft ? <StatusChip tone="pending">Draft saved · not live</StatusChip> : null}
          </div>
          <GuaranteeDraftForm
            key={draft ? `d${draft.version}-${draft.termsMd.length}` : `a${policy.version}`}
            initial={{
              name: draft ? base.name : base.name.replace(/v\d+/, `v${policy.version + 1}`),
              refundPercent: base.refundPercent,
              minPlanMonths: base.minPlanMonths,
              claimWindowDays: base.claimWindowDays,
              minCheckinResponsePct: base.minCheckinResponsePct,
              requireMonthlyPhotos: base.requireMonthlyPhotos,
              requireFollowupConsult: base.requireFollowupConsult,
              termsMd: base.termsMd,
            }}
          />
        </div>
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-xl bg-card p-4 shadow-card ring-1 ring-line/80 md:p-5">
            <h2 className="mb-2 text-base font-semibold text-ink">Activate</h2>
            {draft ? (
              <>
                <Rules p={draft} />
                <div className="mt-4 flex flex-wrap gap-2">
                  <ConfirmAction
                    action={activateDraftAction}
                    label={`Activate v${draft.version}`}
                    variant="default"
                    title={`Make v${draft.version} the active guarantee?`}
                    description={
                      <>
                        <p>
                          The new terms replace v{policy.version} on every plan price, the plan link page,
                          checkout and the guarantee page — in the same words.
                        </p>
                        <p className="font-medium text-warning">
                          Guarantee terms are legal text. In production this needs the client’s written
                          approval.
                        </p>
                        <p className="text-muted-foreground">
                          Demo: changes reset when the server restarts. Audited.
                        </p>
                      </>
                    }
                    confirmLabel="Activate"
                  />
                  <ConfirmAction
                    action={discardDraftAction}
                    label="Discard draft"
                    variant="ghost"
                    title="Discard this draft?"
                    description={<p>The active policy is not affected.</p>}
                    confirmLabel="Discard"
                    destructive
                  />
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Save a draft to review and activate it.</p>
            )}
          </div>
          <div className="rounded-xl bg-card p-4 shadow-card ring-1 ring-line/80 md:p-5">
            <h2 className="mb-2 text-base font-semibold text-ink">Version history</h2>
            {policyHistory.length ? (
              <ul className="space-y-1.5 text-sm">
                {policyHistory.map((p) => (
                  <li key={p.version} className="flex justify-between gap-2">
                    <span className="text-body">
                      v{p.version} · {p.name}
                    </span>
                    <StatusChip tone="neutral">Retired</StatusChip>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Only v{policy.version} so far.</p>
            )}
          </div>
        </div>
      </section>

      <section className="space-y-3" aria-labelledby="claims-title">
        <div>
          <h2 id="claims-title" className="text-base font-semibold text-ink">
            Claims
          </h2>
          <p className="text-[13px] text-muted-foreground">
            Dr. Tyagi reviews each claim (photos, adherence) in the doctor portal; refunds are triggered here
            after approval.
          </p>
        </div>
        <DataList<GuaranteeClaim>
          rows={claims}
          rowKey={(c) => c.id}
          caption="Guarantee claims"
          empty={<EmptyState title="No claims yet" />}
          columns={[
            { header: 'Claim', cell: (c) => <span className="price font-medium text-ink">{c.code}</span> },
            { header: 'Customer', cell: (c) => nameOf(c.customerId) },
            {
              header: 'Status',
              cell: (c) => (
                <StatusChip tone={CLAIM_LABEL[c.status][1]}>{CLAIM_LABEL[c.status][0]}</StatusChip>
              ),
            },
            { header: 'Submitted', cell: (c) => istDay(c.submittedAt) },
            {
              header: 'Refund',
              align: 'right',
              cell: (c) => <span className="price">{c.refundPaise ? formatINR(c.refundPaise) : '—'}</span>,
            },
          ]}
        />
      </section>
    </div>
  );
}
