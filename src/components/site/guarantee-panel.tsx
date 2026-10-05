import { Check } from 'lucide-react';
import Link from 'next/link';
import { t } from '@/i18n/en';
import type { GuaranteePolicy } from '@/lib/domain/types';
import { VIDEOS } from '@/lib/images';
import { cn } from '@/lib/utils';
import { BackgroundVideo } from './background-video';
import type { StoryVideo } from './video-library';

/** The guarantee's conditions in plain words, straight from the active policy row. */
export function guaranteeConditions(g: GuaranteePolicy): string[] {
  return [
    `Follow your prescribed plan continuously for at least ${g.minPlanMonths} months`,
    `Reply to at least ${g.minCheckinResponsePct}% of your weekly check-ins`,
    ...(g.requireMonthlyPhotos ? ['Share progress photos every month'] : []),
    ...(g.requireFollowupConsult ? ['Attend your follow-up consultation'] : []),
    `Claim within ${g.claimWindowDays} days of finishing the plan`,
  ];
}

/** Captioned b-roll explainer for the guarantee (homepage "Watch" + /guarantee). */
export function guaranteeStory(g: GuaranteePolicy): StoryVideo {
  return {
    id: 'guarantee',
    kicker: 'The guarantee',
    title: 'How the guarantee works',
    summary: 'The conditions, the claim and the doctor review — nothing hidden.',
    video: VIDEOS.guarantee,
    captions: [
      { at: 0, text: `Follow your plan for at least ${g.minPlanMonths} months.` },
      { at: 4, text: 'Reply to your weekly check-ins and share progress photos.' },
      { at: 8, text: 'No visible improvement? Make a claim.' },
      { at: 12, text: 'A doctor reviews every claim against the published conditions.' },
    ],
  };
}

/** Refund size in words — never a percent-sign figure for a full refund (PRD §15 banned phrase). */
export function refundLine(g: GuaranteePolicy): string {
  return g.refundPercent >= 100
    ? 'The full plan price is refunded'
    : `${g.refundPercent} per cent of the plan price is refunded`;
}

export function GuaranteeConditionList({
  guarantee,
  tone = 'dark',
  className,
}: {
  guarantee: GuaranteePolicy;
  tone?: 'light' | 'dark';
  className?: string;
}) {
  return (
    <ul className={cn('space-y-3.5 text-[15px]', className)}>
      {guaranteeConditions(guarantee).map((line) => (
        <li key={line} className="flex gap-3">
          <Check
            className={cn('mt-0.5 size-4 shrink-0', tone === 'dark' ? 'text-brand-on-dark' : 'text-brand')}
            aria-hidden
          />
          {line}
        </li>
      ))}
    </ul>
  );
}

/**
 * Homepage guarantee block: b-roll panel + conditions. Callers render it only when getGuarantee() is
 * non-null, so the guarantee never appears while `guarantee.enabled = false`.
 */
export function GuaranteeVideoPanel({ guarantee }: { guarantee: GuaranteePolicy }) {
  return (
    <section className="bg-obsidian text-on-dark" aria-labelledby="guarantee-heading">
      <div className="grid md:grid-cols-2">
        <div className="relative min-h-80 md:min-h-[600px]">
          <BackgroundVideo video={VIDEOS.guarantee} />
          <div className="absolute inset-0 bg-obsidian/55" />
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/20 to-transparent md:bg-gradient-to-r md:from-transparent md:via-obsidian/10 md:to-obsidian" />
          <div className="absolute bottom-6 left-6 max-w-xs md:bottom-10 md:left-10">
            <p className="font-display text-[44px] leading-none text-on-dark md:text-[60px]">Money back</p>
            <p className="mt-3 text-sm text-on-dark-muted">
              {refundLine(guarantee)} if you meet every condition and a doctor confirms no visible
              improvement.
            </p>
          </div>
        </div>
        <div className="container-yhc flex flex-col justify-center py-16 md:max-w-xl md:px-14 md:py-24">
          <p className="eyebrow text-brand-on-dark">Money-back guarantee</p>
          <h2
            id="guarantee-heading"
            className="display mt-4 text-[clamp(2.25rem,1.6rem+2.4vw,3.25rem)] text-on-dark"
          >
            A guarantee, with its conditions in plain sight
          </h2>
          <p className="mt-5 leading-relaxed text-on-dark-muted">
            Hair responds slowly and differently for everyone. If you follow your plan for the full period and
            see no visible improvement, you can claim a refund. A doctor reviews every claim.
          </p>
          <GuaranteeConditionList guarantee={guarantee} className="mt-8" />
          <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
            <Link
              href="/guarantee"
              className="inline-flex min-h-11 items-center font-medium text-on-dark underline decoration-steel underline-offset-[6px] hover:decoration-on-dark"
            >
              How the guarantee works
            </Link>
            <Link
              href="/legal/guarantee"
              className="inline-flex min-h-11 items-center text-on-dark-muted underline underline-offset-4 hover:text-on-dark"
            >
              Full terms
            </Link>
          </div>
          {guarantee.isDraft ? (
            <p className="mt-4 text-[13px] text-on-dark-muted">{t('common.draftTerms')}</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
