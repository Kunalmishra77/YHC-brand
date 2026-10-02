import { Check, Minus, Stethoscope } from 'lucide-react';
import { PriceTag } from '@/components/shared/pricing';
import type { GuaranteePolicy, Plan } from '@/lib/domain/types';
import { cn } from '@/lib/utils';

/**
 * Side-by-side plan comparison. The doctor-recommended duration rises out of the row instead of
 * three identical cards. Plans are never bought from here: they are prescribed after a consultation.
 */
export function PlanLadder({
  plans,
  guarantee,
  creditLine,
  headingLevel = 'h3',
}: {
  plans: Plan[];
  guarantee: GuaranteePolicy | null;
  /** e.g. "₹500 consultation fee credited if bought within 7 days (pending confirmation)" */
  creditLine: string | null;
  headingLevel?: 'h2' | 'h3';
}) {
  const Heading = headingLevel;
  return (
    <ol className="grid gap-4 md:grid-cols-3 md:items-end md:gap-0">
      {plans.map((plan, i) => {
        const eligible = guarantee ? plan.months >= guarantee.minPlanMonths : false;
        return (
          <li
            key={plan.id}
            className={cn(
              'relative flex flex-col',
              plan.isRecommended
                ? 'z-10 rounded-xl bg-card shadow-raised ring-1 ring-platinum md:-my-2'
                : cn(
                    'rounded-xl border border-line md:rounded-none md:border-x-0',
                    i === 0 && 'md:rounded-l-xl md:border-l',
                    i === plans.length - 1 && 'md:rounded-r-xl md:border-r',
                  ),
            )}
          >
            {plan.isRecommended ? (
              <div className="bg-silver flex items-center gap-2 rounded-t-xl px-5 py-2.5 text-sm font-semibold text-obsidian">
                <Stethoscope className="size-4" aria-hidden />
                Doctor-recommended duration
              </div>
            ) : null}
            <div className={cn('flex flex-1 flex-col p-5 md:p-6', plan.isRecommended && 'md:py-8')}>
              <Heading className="text-xl font-semibold text-ink">{plan.name}</Heading>
              <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
              <div className="mt-5">
                <PriceTag plan={plan} size={plan.isRecommended ? 'lg' : 'md'} />
              </div>
              <ul className="mt-5 space-y-2.5 border-t border-line pt-5 text-sm text-body">
                <li className="flex gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
                  {plan.months === 1 ? 'One month' : `${plan.months} months`} of the routine Dr. Tyagi
                  prescribes for you
                </li>
                <li className="flex gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
                  Delivered across India, with check-ins while you use it
                </li>
                {creditLine ? (
                  <li className="flex gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
                    {creditLine}
                  </li>
                ) : null}
                {guarantee ? (
                  <li className="flex gap-2">
                    {eligible ? (
                      <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
                    ) : (
                      <Minus className="mt-0.5 size-4 shrink-0 text-steel" aria-hidden />
                    )}
                    {eligible
                      ? 'Eligible for the money-back guarantee, if its conditions are met'
                      : `Not covered by the guarantee (needs ${guarantee.minPlanMonths}+ months)`}
                  </li>
                ) : null}
              </ul>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
