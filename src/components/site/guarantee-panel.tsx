import { Check } from 'lucide-react';
import Link from 'next/link';
import { t } from '@/i18n/en';
import type { GuaranteePolicy } from '@/lib/domain/types';
import { VIDEOS } from '@/lib/images';
import { cn } from '@/lib/utils';
import { BackgroundVideo } from './background-video';
import { H2 } from './section';
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
      {/* Split only from lg; below that the film sits on top and the text uses the normal container. */}
      <div className="grid lg:grid-cols-2">
        <div className="relative min-h-[22rem] overflow-hidden sm:min-h-[26rem] lg:min-h-[640px]">
          <BackgroundVideo video={VIDEOS.guarantee} />
          <div className="absolute inset-0 bg-obsidian/55" aria-hidden />
          <div
            className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/20 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-obsidian/10 lg:to-obsidian"
            aria-hidden
          />
          <div className="absolute inset-x-0 bottom-0 lg:inset-x-auto lg:bottom-12 lg:left-12">
            <div className="container-yhc pb-8 lg:max-w-sm lg:px-0 lg:pb-0">
              <p className="font-display text-[clamp(2.75rem,2.2rem+2.4vw,3.75rem)] leading-none text-on-dark">
                Money back
              </p>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-pretty text-on-dark-muted">
                {refundLine(guarantee)} if you meet every condition and a doctor confirms no visible
                improvement.
              </p>
            </div>
          </div>
        </div>
        <div className="container-yhc flex flex-col justify-center py-14 md:py-20 lg:mx-0 lg:max-w-[38rem] lg:px-14 lg:py-24 xl:px-20">
          <p className="eyebrow text-brand-on-dark">Money-back guarantee</p>
          <h2 id="guarantee-heading" className={`${H2} mt-4 max-w-xl text-on-dark`}>
            A guarantee, with its conditions in plain sight
          </h2>
          <p className="mt-5 max-w-[62ch] leading-relaxed text-pretty text-on-dark-muted">
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
