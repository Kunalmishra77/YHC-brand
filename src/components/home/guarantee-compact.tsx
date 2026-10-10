import { ArrowRight, Check } from 'lucide-react';
import Link from 'next/link';
import { t } from '@/i18n/en';
import type { GuaranteePolicy } from '@/lib/domain/types';
import { getGuarantee } from '@/server/catalog';
import { GuaranteeSeal } from './guarantee/seal';

/** Each condition in a few words: a figure (when there is one) and its meaning. */
function conditions(g: GuaranteePolicy): { figure?: string; text: string }[] {
  return [
    { figure: `${g.minPlanMonths} months`, text: 'minimum on your plan' },
    // a 100 figure would print a banned phrase (PRD §15), so say it in words
    g.minCheckinResponsePct >= 100
      ? { text: 'Every weekly check-in answered' }
      : { figure: `${g.minCheckinResponsePct}%`, text: 'of check-ins answered' },
    ...(g.requireMonthlyPhotos ? [{ text: 'Monthly progress photos' }] : []),
    ...(g.requireFollowupConsult ? [{ text: 'Follow-up consultation' }] : []),
    { figure: `${g.claimWindowDays} days`, text: 'to claim after the plan' },
  ];
}

/** Refund size in words — never a percent-sign figure for a full refund (PRD §15). */
function refundPhrase(g: GuaranteePolicy): string {
  return g.refundPercent >= 100
    ? 'a full refund of your plan payments'
    : `${g.refundPercent} per cent of your plan payments back`;
}

/**
 * Homepage section 12 · Money-back guarantee — a slim obsidian band: slowly turning seal, a one-line
 * promise and its conditions as a quiet checklist. Terms come from the active guarantee policy; renders
 * nothing while `guarantee.enabled = false`.
 */
export function GuaranteeCompact() {
  const guarantee = getGuarantee();
  if (!guarantee) return null;

  return (
    <section
      className="relative overflow-hidden bg-obsidian text-on-dark"
      aria-labelledby="guarantee-compact-heading"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-[image:var(--yhc-sheen)] opacity-40" aria-hidden />
      <div className="container-yhc py-9 md:py-11">
        <div className="grid gap-x-10 gap-y-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="flex gap-5 md:gap-7">
            <GuaranteeSeal className="w-16 shrink-0 self-start md:w-20" />
            <div className="min-w-0">
              <p className="eyebrow text-brand-on-dark">Money-back guarantee</p>
              <h2
                id="guarantee-compact-heading"
                className="display mt-2 text-[clamp(1.75rem,1.5rem+0.9vw,2.25rem)] text-balance text-on-dark"
              >
                No visible improvement? Claim {refundPhrase(guarantee)}.
              </h2>
              <p className="mt-2 text-sm text-on-dark-muted">
                Only when every condition is met. A doctor reviews each claim.
              </p>
              <ul
                className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-on-dark-muted"
                aria-label="Conditions"
              >
                {conditions(guarantee).map((c) => (
                  <li key={c.text} className="inline-flex items-center gap-1.5">
                    <Check className="size-3.5 shrink-0 text-brand-on-dark" aria-hidden />
                    {c.figure ? <span className="price text-on-dark">{c.figure}</span> : null}
                    {c.text}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 pl-[5.25rem] md:pl-[6.75rem] lg:flex-col lg:items-start lg:gap-0 lg:border-l lg:border-line-dark lg:pl-10">
            <Link
              href="/guarantee"
              className="inline-flex min-h-12 items-center gap-2 text-sm font-medium text-on-dark underline decoration-steel underline-offset-[6px] hover:decoration-on-dark"
            >
              How it works
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>
            <Link
              href="/legal/guarantee"
              className="inline-flex min-h-12 items-center text-sm text-on-dark-muted underline underline-offset-4 hover:text-on-dark"
            >
              Full terms
            </Link>
            {guarantee.isDraft ? (
              <p className="mt-1 inline-flex items-center rounded-full border border-dashed border-steel px-3 py-1 text-[13px] text-on-dark-muted">
                {t('common.draftTerms')}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
