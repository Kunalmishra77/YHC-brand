import { ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { t } from '@/i18n/en';
import type { GuaranteePolicy, Plan } from '@/lib/domain/types';
import { formatINR } from '@/lib/money';
import { cn } from '@/lib/utils';

export function PriceTag({ plan, size = 'md' }: { plan: Plan; size?: 'md' | 'lg' }) {
  const perMonth = Math.round(plan.pricePaise / plan.months / 100) * 100;
  const savings = plan.compareAtPaise ? plan.compareAtPaise - plan.pricePaise : 0;
  return (
    <div>
      <div className="flex items-baseline gap-2">
        <span className={cn('price text-ink', size === 'lg' ? 'text-3xl' : 'text-2xl')}>
          {formatINR(plan.pricePaise)}
        </span>
        {plan.compareAtPaise ? (
          <s className="price text-sm text-muted-foreground">{formatINR(plan.compareAtPaise)}</s>
        ) : null}
      </div>
      <p className="price text-sm text-body">
        {formatINR(perMonth)}
        {t('common.perMonth')} · {plan.months === 1 ? '1 month' : `${plan.months} months`}
      </p>
      {savings > 0 ? (
        <p className="text-sm text-success">You save {formatINR(savings)} compared with monthly</p>
      ) : null}
    </div>
  );
}

/** Short guarantee line — always with its conditions and a link to full terms (PRD §15.4). */
export function GuaranteeLine({
  policy,
  tone = 'light',
}: {
  policy: GuaranteePolicy;
  tone?: 'light' | 'dark';
}) {
  return (
    <p className={cn('flex gap-2 text-sm', tone === 'dark' ? 'text-on-dark-muted' : 'text-body')}>
      <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
      <span>
        Money-back guarantee if you follow the plan for {policy.minPlanMonths}+ months, reply to check-ins,
        share monthly photos and attend your follow-up.{' '}
        <Link href="/legal/guarantee" className="underline underline-offset-2">
          Full terms
        </Link>
        {policy.isDraft ? <span className="text-warning"> · {t('common.draftTerms')}</span> : null}
      </span>
    </p>
  );
}

export function GuaranteeTerms({ policy }: { policy: GuaranteePolicy }) {
  return (
    <div className="rounded-lg border border-line bg-card p-5">
      <div className="flex flex-wrap items-center gap-2">
        <ShieldCheck className="size-5 text-brand" aria-hidden />
        <p className="font-semibold text-ink">{policy.name}</p>
        {policy.isDraft ? (
          <Badge variant="outline" className="border-warning text-warning">
            {t('common.draftTerms')}
          </Badge>
        ) : null}
      </div>
      <p className="mt-3 text-body">{policy.termsMd}</p>
      <ul className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
        <li>• Minimum plan: {policy.minPlanMonths} months, continuous</li>
        <li>• Check-in replies: at least {policy.minCheckinResponsePct}%</li>
        {policy.requireMonthlyPhotos ? <li>• Progress photos every month</li> : null}
        {policy.requireFollowupConsult ? <li>• One follow-up consultation</li> : null}
        <li>• Claim within {policy.claimWindowDays} days of finishing</li>
        <li>
          • Refund:{' '}
          {policy.refundPercent === 100
            ? 'your full plan payments'
            : `${policy.refundPercent}% of plan payments`}
        </li>
      </ul>
    </div>
  );
}
