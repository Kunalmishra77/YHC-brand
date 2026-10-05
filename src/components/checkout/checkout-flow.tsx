'use client';

import { CheckCircle2, Lock, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { payCartAction, quoteCartAction } from '@/app/(site)/checkout/actions';
import { ContinueBar } from '@/components/booking/continue-bar';
import { DemoPaymentSheet } from '@/components/booking/demo-payment-sheet';
import { PhoneVerify } from '@/components/booking/phone-verify';
import { EmptyState, ErrorState, ListSkeleton } from '@/components/shared/states';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { formatINR } from '@/lib/money';
import { cn } from '@/lib/utils';
import type { AddressInput } from '@/lib/validation/checkout';
import { AddressForm } from './address-form';
import { cart, useCart } from './cart-store';
import type { CartQuote, CheckoutCustomerView } from './types';

const ADDRESS_FORM = 'checkout-address';

/** /checkout (FR-M2-4/5): mobile OTP if needed → address → server-priced summary → pay (prepaid only). */
export function CheckoutFlow({ signedIn: initialSignedIn }: { signedIn: CheckoutCustomerView | null }) {
  const router = useRouter();
  const items = useCart();
  const [signedIn, setSignedIn] = useState(initialSignedIn);
  const [quote, setQuote] = useState<{ key: string; result: CartQuote | null; error: string | null } | null>(
    null,
  );
  const [consent, setConsent] = useState(false);
  const [consentError, setConsentError] = useState<string | null>(null);
  const [address, setAddress] = useState<AddressInput | null>(null);
  const [payOpen, setPayOpen] = useState(false);
  const [needSignIn, setNeedSignIn] = useState(false);

  const key = JSON.stringify(items ?? []);
  useEffect(() => {
    if (!items || items.length === 0) return;
    let live = true;
    quoteCartAction(items).then(
      (res) => {
        if (!live) return;
        setQuote(
          res.ok ? { key, result: res.data, error: null } : { key, result: null, error: res.error.message },
        );
      },
      () => live && setQuote({ key, result: null, error: 'We could not price your cart. Please try again.' }),
    );
    return () => {
      live = false;
    };
  }, [items, key]);

  if (items === null) {
    return (
      <Shell>
        <ListSkeleton rows={3} />
      </Shell>
    );
  }
  if (items.length === 0) {
    return (
      <Shell>
        <EmptyState
          icon={ShoppingBag}
          title="Nothing to check out yet"
          body="Your cart is empty. Add shampoo or conditioner, or book a consultation for a personalised plan."
          action={
            <Button asChild className="h-11">
              <Link href="/products">Browse products</Link>
            </Button>
          }
        />
      </Shell>
    );
  }

  const current = quote?.key === key ? quote : null;
  const q = current?.result ?? null;

  const onAddress = (a: AddressInput) => {
    if (!signedIn) {
      setNeedSignIn(true);
      document.getElementById('checkout-mobile')?.scrollIntoView({ block: 'center' });
      return;
    }
    if (!consent) {
      setConsentError('Please accept the terms and refund policy to continue');
      return;
    }
    if (!q || q.lines.length === 0 || q.unavailable.length > 0) return;
    setAddress(a);
    setPayOpen(true);
  };

  const confirm = async (): Promise<string | null> => {
    if (!address) return 'Please check your address.';
    const res = await payCartAction({ items, address, consent });
    if (!res.ok) {
      if (res.error.code === 'unauthenticated' || res.error.code === 'forbidden') {
        setPayOpen(false);
        setSignedIn(null);
        setNeedSignIn(true);
        return null;
      }
      return res.error.message;
    }
    cart.clear();
    router.push(`/order/${res.data.code}?paid=1`);
    return null;
  };

  return (
    <Shell>
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-12">
        <div className="min-w-0 space-y-10">
          <Step n={1} title="Mobile number" id="checkout-mobile" done={Boolean(signedIn)}>
            {signedIn ? (
              <p className="flex flex-wrap items-center gap-x-2 text-sm text-body">
                <CheckCircle2 className="size-4 text-success" aria-hidden />
                Verified · <span className="price text-ink">{signedIn.maskedPhone}</span>
                {signedIn.name ? <span className="text-muted-foreground">({signedIn.name})</span> : null}
              </p>
            ) : (
              <div className="max-w-md">
                {needSignIn ? (
                  <p role="alert" className="mb-3 text-sm text-danger">
                    Please verify your mobile number to place the order.
                  </p>
                ) : null}
                <PhoneVerify
                  onVerified={(v) => {
                    setSignedIn({ maskedPhone: v.maskedPhone, name: v.name });
                    setNeedSignIn(false);
                    router.refresh();
                  }}
                  intro={
                    <p className="text-sm text-body">
                      We&apos;ll send order and delivery updates to this number.
                    </p>
                  }
                />
              </div>
            )}
          </Step>

          <Step n={2} title="Delivery address">
            <AddressForm
              formId={ADDRESS_FORM}
              onValid={onAddress}
              defaultValues={{ fullName: signedIn?.name ?? '' }}
            />
          </Step>
        </div>

        <aside className="h-fit min-w-0 space-y-4 lg:sticky lg:top-24">
          <div className="rounded-2xl border border-line bg-card p-5 shadow-card sm:p-6">
            <p className="text-sm font-medium text-ink">Order summary</p>
            {current?.error ? (
              <div className="mt-4">
                <ErrorState body={current.error} />
              </div>
            ) : !q ? (
              <div className="mt-4 space-y-2" aria-busy="true" aria-label="Pricing your cart">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-7 w-1/2" />
              </div>
            ) : (
              <>
                <ul className="mt-4 space-y-2 text-sm">
                  {q.lines.map((l) => (
                    <li key={l.productId} className="flex justify-between gap-3">
                      <span className="text-body">
                        {l.name} <span className="price text-muted-foreground">× {l.qty}</span>
                      </span>
                      <span className="price text-ink">{formatINR(l.amountPaise)}</span>
                    </li>
                  ))}
                  <li className="flex justify-between gap-3">
                    <span className="text-body">Delivery</span>
                    <span className="price text-ink">
                      {q.deliveryPaise === 0 ? 'Included' : formatINR(q.deliveryPaise)}
                    </span>
                  </li>
                </ul>
                <div className="mt-4 flex items-baseline justify-between border-t border-line pt-4">
                  <span className="font-medium text-ink">Total</span>
                  <span className="price text-2xl text-ink">{formatINR(q.totalPaise)}</span>
                </div>
                <p className="mt-1 text-[13px] text-muted-foreground">
                  Prices include GST · calculated by our server
                </p>
                {q.unavailable.length > 0 ? (
                  <p role="alert" className="mt-3 rounded-md bg-warning-bg px-3 py-2 text-sm text-warning">
                    {q.unavailable.join(', ')} can&apos;t be bought without a consultation.{' '}
                    <Link href="/cart" className="underline underline-offset-2">
                      Review your cart
                    </Link>
                  </p>
                ) : null}
              </>
            )}
          </div>

          <div>
            <div className="flex min-h-11 items-start gap-3">
              <Checkbox
                id="checkout-consent"
                checked={consent}
                onCheckedChange={(v) => {
                  setConsent(v === true);
                  if (v === true) setConsentError(null);
                }}
                aria-invalid={consentError ? true : undefined}
                aria-describedby="checkout-consent-err"
                className="mt-0.5 size-5 bg-card"
              />
              <label htmlFor="checkout-consent" className="text-sm leading-snug text-body">
                I accept the{' '}
                <Link href="/legal/terms" className="text-brand underline underline-offset-2">
                  terms
                </Link>{' '}
                and the{' '}
                <Link href="/legal/refund-cancellation" className="text-brand underline underline-offset-2">
                  refund &amp; cancellation policy
                </Link>
                .
              </label>
            </div>
            <p id="checkout-consent-err" aria-live="polite" className="min-h-5 pl-8 text-sm text-danger">
              {consentError}
            </p>
          </div>

          <p className="text-[13px] text-muted-foreground">
            Prepaid only — UPI, cards or netbanking. Cash on delivery isn&apos;t available.
          </p>

          <ContinueBar
            summary={
              <>
                <span className="block text-muted-foreground">Total</span>
                <span className="price font-medium text-ink">{q ? formatINR(q.totalPaise) : '—'}</span>
              </>
            }
          >
            <Button
              type="submit"
              form={ADDRESS_FORM}
              disabled={!q || q.unavailable.length > 0}
              className="h-12 px-6 text-base md:w-full"
            >
              <Lock className="size-4" aria-hidden />
              {q ? `Pay ${formatINR(q.totalPaise)}` : 'Pay'}
            </Button>
          </ContinueBar>
        </aside>
      </div>

      {q ? (
        <DemoPaymentSheet
          open={payOpen}
          onOpenChange={setPayOpen}
          amountPaise={q.totalPaise}
          description={`${q.lines.reduce((s, l) => s + l.qty, 0)} item order · delivered to ${address?.city ?? 'you'}`}
          onConfirm={confirm}
        />
      ) : null}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="container-yhc py-10 md:py-16">
      <div className="mx-auto max-w-5xl">
        <p className="eyebrow">Checkout</p>
        <h1 className="display mt-3 mb-8 text-[clamp(2rem,1.5rem+1.8vw,2.75rem)] text-balance md:mb-12">
          Almost there
        </h1>
        {children}
      </div>
    </div>
  );
}

function Step({
  n,
  title,
  id,
  done,
  children,
}: {
  n: number;
  title: string;
  id?: string;
  done?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id ?? `step-${n}`}-title`} className="scroll-mt-24">
      <div className="mb-4 flex items-center gap-3">
        <span
          className={cn(
            'flex size-7 items-center justify-center rounded-full border text-[13px] font-semibold',
            done ? 'border-obsidian bg-obsidian text-on-dark' : 'border-brand text-brand',
          )}
          aria-hidden
        >
          {n}
        </span>
        <h2 id={`${id ?? `step-${n}`}-title`} className="text-lg font-medium text-ink">
          {title}
          {done ? <span className="sr-only"> (done)</span> : null}
        </h2>
      </div>
      {children}
    </section>
  );
}
