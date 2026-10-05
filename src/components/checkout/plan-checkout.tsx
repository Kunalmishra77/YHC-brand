'use client';

import { Lock, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { payPlanAction } from '@/app/r/[token]/actions';
import { ContinueBar } from '@/components/booking/continue-bar';
import { DemoPaymentSheet } from '@/components/booking/demo-payment-sheet';
import { Button } from '@/components/ui/button';
import { formatINR } from '@/lib/money';
import { cn } from '@/lib/utils';
import type { AddressInput } from '@/lib/validation/checkout';
import { AddressForm } from './address-form';
import type { PlanOptionView } from './types';

const ADDRESS_FORM = 'plan-address';

/** Duration selector, server-computed price breakdown, address and Pay (FR-M6-3). */
export function PlanCheckout({
  token,
  plans,
  doctorPlanId,
  savedAddress,
  guarantee,
  guaranteeMinMonths,
}: {
  token: string;
  plans: PlanOptionView[];
  doctorPlanId: string;
  savedAddress: string | null;
  /** GuaranteeLine rendered on the server, or null while the guarantee is off */
  guarantee: React.ReactNode;
  guaranteeMinMonths: number | null;
}) {
  const router = useRouter();
  const [planId, setPlanId] = useState(doctorPlanId);
  const [useSaved, setUseSaved] = useState(Boolean(savedAddress));
  const [address, setAddress] = useState<AddressInput | null>(null);
  const [payOpen, setPayOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const plan = plans.find((p) => p.id === planId) ?? plans[0];
  if (!plan) return null;

  const startPay = (a: AddressInput | null) => {
    setError(null);
    setAddress(a);
    setPayOpen(true);
  };

  const confirm = async (): Promise<string | null> => {
    const res = await payPlanAction({ token, planId: plan.id, address: useSaved ? null : address });
    if (!res.ok) {
      if (res.error.code === 'address_required') {
        setPayOpen(false);
        setUseSaved(false);
        setError(res.error.message);
        return null;
      }
      return res.error.message;
    }
    router.push(`/order/${res.data.code}?t=${encodeURIComponent(token)}&paid=1`);
    return null;
  };

  const perMonth = (p: PlanOptionView) => Math.round(p.pricePaise / p.months / 100) * 100;

  return (
    <div className="space-y-10">
      <section aria-labelledby="duration-title">
        <h2 id="duration-title" className="text-lg font-medium text-ink">
          Choose your duration
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Dr. Tyagi&apos;s choice is selected. You can change it — the routine stays the same.
        </p>
        <div
          role="radiogroup"
          aria-labelledby="duration-title"
          className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-1"
        >
          {plans.map((p) => {
            const active = p.id === planId;
            return (
              <button
                key={p.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setPlanId(p.id)}
                className={cn(
                  'relative flex min-h-11 flex-col rounded-xl border p-4 text-left transition-colors',
                  active
                    ? 'border-obsidian bg-card shadow-card ring-1 ring-obsidian'
                    : 'border-line bg-card hover:border-steel',
                )}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="font-medium text-ink">
                    {p.months === 1 ? '1 month' : `${p.months} months`}
                  </span>
                  <span
                    aria-hidden
                    className={cn(
                      'size-4 rounded-full border',
                      active ? 'border-[5px] border-obsidian' : 'border-steel',
                    )}
                  />
                </span>
                <span className="price mt-3 text-xl text-ink">{formatINR(p.pricePaise)}</span>
                <span className="price text-sm text-body">{formatINR(perMonth(p))}/month</span>
                {p.compareAtPaise && p.compareAtPaise > p.pricePaise ? (
                  <span className="mt-1 text-[13px] text-success">
                    You save {formatINR(p.compareAtPaise - p.pricePaise)} compared with monthly
                  </span>
                ) : null}
                <span className="mt-3 flex flex-wrap gap-1.5">
                  {p.id === doctorPlanId ? (
                    <span className="rounded-full bg-obsidian px-2 py-0.5 text-[12px] font-medium text-on-dark">
                      Dr. Tyagi&apos;s choice
                    </span>
                  ) : null}
                  {p.isRecommended ? (
                    <span className="rounded-full bg-mist px-2 py-0.5 text-[12px] font-medium text-ink">
                      Doctor-recommended duration
                    </span>
                  ) : null}
                </span>
              </button>
            );
          })}
        </div>
        {guarantee ? (
          <div className="mt-4 space-y-1">
            {guarantee}
            {guaranteeMinMonths && plan.months < guaranteeMinMonths ? (
              <p className="pl-6 text-[13px] text-muted-foreground">
                The guarantee applies to plans of {guaranteeMinMonths} months or more.
              </p>
            ) : null}
          </div>
        ) : null}
      </section>

      <section aria-labelledby="price-title" className="rounded-2xl border border-line bg-pearl/60">
        <h2 id="price-title" className="border-b border-line px-5 py-4 text-lg font-medium text-ink">
          Price
        </h2>
        <dl className="space-y-2.5 px-5 py-4 text-[15px]">
          <div className="flex justify-between gap-3">
            <dt className="text-body">{plan.name}</dt>
            <dd className="price text-ink">{formatINR(plan.quote.subtotalPaise)}</dd>
          </div>
          {plan.quote.creditPaise > 0 ? (
            <div className="flex justify-between gap-3">
              <dt className="text-body">Consultation credit</dt>
              <dd className="price text-success">−{formatINR(plan.quote.creditPaise)}</dd>
            </div>
          ) : null}
          <div className="flex justify-between gap-3">
            <dt className="text-body">Delivery</dt>
            <dd className="text-ink">Included</dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 border-t border-line pt-3">
            <dt className="font-medium text-ink">Total</dt>
            <dd className="price text-2xl text-ink">{formatINR(plan.quote.totalPaise)}</dd>
          </div>
        </dl>
        <p className="px-5 pb-4 text-[13px] text-muted-foreground">
          Prices include GST. Prepaid only — UPI, cards or netbanking.
        </p>
      </section>

      <section aria-labelledby="address-title">
        <h2 id="address-title" className="text-lg font-medium text-ink">
          Delivery address
        </h2>
        {savedAddress ? (
          <div role="radiogroup" aria-labelledby="address-title" className="mt-4 space-y-2">
            <AddressChoice
              active={useSaved}
              onSelect={() => setUseSaved(true)}
              title="Deliver to my saved address"
            >
              <span className="flex gap-2 text-sm text-body">
                <MapPin className="mt-0.5 size-4 shrink-0 text-steel" aria-hidden />
                {savedAddress}
              </span>
            </AddressChoice>
            <AddressChoice
              active={!useSaved}
              onSelect={() => setUseSaved(false)}
              title="Use a different address"
            />
          </div>
        ) : (
          <p className="mt-1 text-sm text-muted-foreground">Where should we send your plan?</p>
        )}
        {!useSaved ? (
          <div className="mt-5">
            <AddressForm formId={ADDRESS_FORM} onValid={(a) => startPay(a)} />
          </div>
        ) : null}
        <p aria-live="assertive" className="mt-2 min-h-5 text-sm text-danger">
          {error}
        </p>
      </section>

      <ContinueBar
        summary={
          <>
            <span className="block text-muted-foreground">{plan.name}</span>
            <span className="price font-medium text-ink">{formatINR(plan.quote.totalPaise)}</span>
          </>
        }
      >
        {useSaved ? (
          <Button className="h-12 px-6 text-base md:px-10" onClick={() => startPay(null)}>
            <Lock className="size-4" aria-hidden />
            Pay {formatINR(plan.quote.totalPaise)}
          </Button>
        ) : (
          <Button type="submit" form={ADDRESS_FORM} className="h-12 px-6 text-base md:px-10">
            <Lock className="size-4" aria-hidden />
            Pay {formatINR(plan.quote.totalPaise)}
          </Button>
        )}
      </ContinueBar>

      <DemoPaymentSheet
        open={payOpen}
        onOpenChange={setPayOpen}
        amountPaise={plan.quote.totalPaise}
        description={`${plan.name} · prescribed by Dr. Tyagi`}
        onConfirm={confirm}
      />
    </div>
  );
}

function AddressChoice({
  active,
  onSelect,
  title,
  children,
}: {
  active: boolean;
  onSelect: () => void;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onSelect}
      className={cn(
        'flex min-h-14 w-full items-start gap-3 rounded-md border px-4 py-3 text-left',
        active ? 'border-obsidian bg-card' : 'border-line bg-card hover:border-steel',
      )}
    >
      <span
        aria-hidden
        className={cn(
          'mt-0.5 size-4 shrink-0 rounded-full border',
          active ? 'border-[5px] border-obsidian' : 'border-steel',
        )}
      />
      <span className="space-y-1">
        <span className="block text-sm font-medium text-ink">{title}</span>
        {children}
      </span>
    </button>
  );
}
