import type { Metadata } from 'next';
import Link from 'next/link';
import { GuaranteeTerms } from '@/components/shared/pricing';
import { EmptyState } from '@/components/shared/states';
import { getConsultTerms } from '@/components/site/consult-fee';
import { CtaBand } from '@/components/site/cta-band';
import { PageIntro } from '@/components/site/page-intro';
import { PlanLadder } from '@/components/site/plan-ladder';
import { pageMetadata } from '@/components/site/seo';
import { Button } from '@/components/ui/button';
import { t } from '@/i18n/en';
import { formatINR } from '@/lib/money';
import { getGuarantee, getPlans } from '@/server/catalog';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = pageMetadata({
  title: 'Treatment plans',
  description:
    'Compare 1, 2 and 3-month treatment plans: total price, price per month and savings. Plans are prescribed after your consultation with Dr. Tyagi.',
  path: '/plans',
});

export default function PlansPage() {
  const plans = getPlans();
  const guarantee = getGuarantee();
  const terms = getConsultTerms();
  const monthly = plans.find((p) => p.months === 1);

  return (
    <>
      <PageIntro
        title="Treatment plans"
        lede={
          <p>
            Plans are prescribed after your consultation. What goes into your plan depends on what Dr. Tyagi
            recommends for you; the duration you choose sets the price. {t('common.inclGst')}.
          </p>
        }
      />

      <section className="container-yhc py-12 md:py-16">
        {plans.length ? (
          <PlanLadder plans={plans} guarantee={guarantee} creditLine={terms.creditLine} headingLevel="h2" />
        ) : (
          <EmptyState
            title="Plan prices are being finalised"
            body="Book a consultation and Dr. Tyagi will explain your options."
          />
        )}
        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button asChild className="h-12 px-6 text-base">
            <Link href="/book">Book consultation first · {terms.fee}</Link>
          </Button>
          <p className="text-sm text-muted-foreground">
            Plans are prescribed after your consultation — there is no obligation to buy.
          </p>
        </div>
      </section>

      {plans.length ? (
        <section className="border-y border-line bg-card">
          <div className="container-yhc py-12 md:py-16">
            <h2 className="display text-3xl">Side by side</h2>
            <div className="mt-8 overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-sm">
                <caption className="sr-only">Plan comparison</caption>
                <thead>
                  <tr className="border-b border-line text-muted-foreground">
                    <th scope="col" className="py-3 pr-4 font-medium">
                      Plan
                    </th>
                    <th scope="col" className="py-3 pr-4 font-medium">
                      Total
                    </th>
                    <th scope="col" className="py-3 pr-4 font-medium">
                      Per month
                    </th>
                    <th scope="col" className="py-3 pr-4 font-medium">
                      You save
                    </th>
                    {guarantee ? (
                      <th scope="col" className="py-3 font-medium">
                        Guarantee
                      </th>
                    ) : null}
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {plans.map((p) => {
                    const perMonth = Math.round(p.pricePaise / p.months / 100) * 100;
                    const savings = monthly ? monthly.pricePaise * p.months - p.pricePaise : 0;
                    return (
                      <tr key={p.id}>
                        <th scope="row" className="py-4 pr-4 font-semibold text-ink">
                          {p.name}
                          {p.isRecommended ? (
                            <span className="block text-[13px] font-normal text-brand">
                              Doctor-recommended duration
                            </span>
                          ) : null}
                        </th>
                        <td className="price py-4 pr-4 text-ink">{formatINR(p.pricePaise)}</td>
                        <td className="price py-4 pr-4 text-body">{formatINR(perMonth)}</td>
                        <td className="py-4 pr-4 text-body">
                          {savings > 0 ? <span className="price">{formatINR(savings)}</span> : '—'}
                        </td>
                        {guarantee ? (
                          <td className="py-4 text-body">
                            {p.months >= guarantee.minPlanMonths
                              ? 'Eligible, conditions apply'
                              : 'Not covered'}
                          </td>
                        ) : null}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Savings are compared with buying the 1-month plan each month.
              {terms.creditLine ? ` ${terms.creditLine}.` : null}
            </p>
          </div>
        </section>
      ) : null}

      {guarantee ? (
        <section className="container-yhc py-12 md:py-16">
          <h2 className="display text-3xl">Money-back guarantee terms</h2>
          <p className="mt-3 max-w-2xl text-body">
            The guarantee applies only when every condition below is met. Read the{' '}
            <Link href="/legal/guarantee" className="text-brand underline underline-offset-4">
              full terms
            </Link>
            .
          </p>
          <div className="mt-6 max-w-3xl">
            <GuaranteeTerms policy={guarantee} />
          </div>
        </section>
      ) : null}

      <CtaBand
        title="Your plan starts with a consultation."
        bookLabel={terms.bookLabel}
        body="Dr. Tyagi will recommend what to include and how long to use it. You decide whether to go ahead."
      />
    </>
  );
}
