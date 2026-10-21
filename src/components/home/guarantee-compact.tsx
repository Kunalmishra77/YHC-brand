import { ArrowRight, Check } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { GuaranteePolicy } from '@/lib/domain/types';
import { SLOTS } from '@/lib/slots';
import { getGuarantee } from '@/server/catalog';

/** Each condition in a few plain words, with its figure from the active policy. */
function conditions(g: GuaranteePolicy): string[] {
  return [
    `Stay on your plan for ${g.minPlanMonths} months`,
    // a 100 figure would print a banned phrase (PRD §15), so say it in words
    g.minCheckinResponsePct >= 100
      ? 'Answer every weekly check-in'
      : `Answer ${g.minCheckinResponsePct}% of check-ins`,
    ...(g.requireMonthlyPhotos ? ['Send photos every month'] : []),
    ...(g.requireFollowupConsult ? ['Have your follow-up call'] : []),
    `Claim within ${g.claimWindowDays} days of the plan ending`,
  ];
}

/** Refund size in words — never a percent-sign figure for a full refund (PRD §15). */
function refundPhrase(g: GuaranteePolicy): string {
  return g.refundPercent >= 100
    ? 'get all your plan money back'
    : `get ${g.refundPercent} per cent of your plan money back`;
}

/**
 * Homepage section 12 · Money-back guarantee — a slim obsidian band: the H26 still life fades in from the
 * right, the promise and its conditions sit on the left, always visible. Terms come from the active
 * guarantee policy; renders nothing while `guarantee.enabled = false`.
 */
export function GuaranteeCompact() {
  const guarantee = getGuarantee();
  if (!guarantee) return null;
  const image = SLOTS.H26;

  return (
    <section
      className="relative isolate overflow-hidden bg-obsidian text-on-dark"
      aria-labelledby="guarantee-compact-heading"
    >
      <div
        className="absolute inset-x-0 top-0 z-10 h-px bg-[image:var(--yhc-sheen)] opacity-40"
        aria-hidden
      />

      {/* Picture: a band on phones, the right half of the section from `lg` (fading into the black). */}
      <div className="relative aspect-[16/7] lg:absolute lg:inset-y-0 lg:right-0 lg:-z-10 lg:aspect-auto lg:w-[52%]">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes="(min-width: 1024px) 52vw, 100vw"
          className="object-cover"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(to_top,var(--yhc-obsidian),transparent_60%)] lg:bg-[linear-gradient(to_right,var(--yhc-obsidian),transparent_55%)]"
        />
      </div>

      <div className="container-yhc relative py-8 md:py-10">
        <div className="max-w-[40rem]">
          <h2
            id="guarantee-compact-heading"
            className="display text-[clamp(1.75rem,1.45rem+1.1vw,2.5rem)] leading-[1.08] text-balance text-on-dark"
          >
            No visible improvement? You can {refundPhrase(guarantee)}.
          </h2>
          <p className="mt-2 text-sm text-on-dark-muted">
            Only if you meet all of these. A doctor checks every claim.
          </p>
          <ul className="mt-4 flex flex-wrap gap-2" aria-label="Conditions">
            {conditions(guarantee).map((c) => (
              <li
                key={c}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-white/[0.06] px-3 text-[13px] text-on-dark ring-1 ring-line-dark backdrop-blur-sm"
              >
                <Check className="size-3.5 shrink-0 text-brand-on-dark" aria-hidden />
                {c}
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap items-center gap-x-6">
            <Link
              href="/guarantee"
              className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-on-dark underline decoration-steel underline-offset-[6px] hover:decoration-on-dark"
            >
              How the guarantee works
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>
            <Link
              href="/legal/guarantee"
              className="inline-flex min-h-11 items-center text-sm text-on-dark-muted underline underline-offset-4 hover:text-on-dark"
            >
              Full terms
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
