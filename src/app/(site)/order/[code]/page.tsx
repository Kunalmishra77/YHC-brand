import { MessageCircle, Package, Sprout } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { SignInPrompt } from '@/components/booking/sign-in-prompt';
import { OrderStatusGate } from '@/components/checkout/order-status';
import { EmptyState } from '@/components/shared/states';
import { Button } from '@/components/ui/button';
import { formatINR } from '@/lib/money';
import { formatIst } from '@/lib/time';
import { getPlan } from '@/server/catalog';
import { findVisibleOrder } from '../order-access';

export const metadata: Metadata = { title: 'Your order', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function OrderPage({ params, searchParams }: PageProps<'/order/[code]'>) {
  const { code } = await params;
  const sp = await searchParams;
  const token = typeof sp.t === 'string' ? sp.t : undefined;
  const justPaid = sp.paid === '1';
  const { order, signedIn } = await findVisibleOrder(decodeURIComponent(code), token);

  if (!order) {
    return (
      <div className="container-yhc py-12 md:py-20">
        {signedIn ? (
          <EmptyState
            title="We couldn't find this order"
            body="It may belong to a different mobile number. Your orders are listed in your account."
            action={
              <Button asChild className="h-12 px-6">
                <Link href="/account">Go to your account</Link>
              </Button>
            }
          />
        ) : (
          <SignInPrompt
            title="Sign in to see your order"
            body="Verify the mobile number you ordered with — we'll show the order right here."
          />
        )}
      </div>
    );
  }

  const plan = order.planId ? getPlan(order.planId) : null;
  const paidAt = order.paidAt ? formatIst(new Date(order.paidAt)) : null;

  return (
    <div className="container-yhc py-10 md:py-16">
      <div className="mx-auto max-w-3xl">
        <OrderStatusGate code={order.code} token={token} initialStatus={order.status} justPaid={justPaid}>
          <h1 className="display mt-4 text-[clamp(2rem,1.5rem+1.8vw,2.75rem)] text-balance">
            {order.status === 'pending_payment'
              ? 'Your order is waiting for payment'
              : 'Thank you — your order is confirmed.'}
          </h1>
          {paidAt ? (
            <p className="price mt-3 text-lg text-ink">
              {formatINR(order.totalPaise)} paid · {paidAt}
            </p>
          ) : null}

          <div className="mt-8 overflow-hidden rounded-2xl border border-line bg-card shadow-card">
            <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
              <div>
                <p className="text-sm text-muted-foreground">Order</p>
                <p className="price font-medium text-ink">{order.code}</p>
              </div>
              <Package className="size-5 text-steel" aria-hidden />
            </div>
            <ul className="divide-y divide-line px-5">
              {order.lines.map((l) => (
                <li key={l.label} className="flex justify-between gap-4 py-3.5 text-[15px]">
                  <span className="min-w-0 text-ink">
                    {l.label}
                    {l.qty > 1 ? <span className="price text-muted-foreground"> × {l.qty}</span> : null}
                  </span>
                  <span className="price text-ink">{formatINR(l.amountPaise)}</span>
                </li>
              ))}
            </ul>
            <dl className="space-y-2 border-t border-line bg-pearl/60 px-5 py-4 text-sm">
              {order.creditPaise > 0 ? (
                <>
                  <div className="flex justify-between">
                    <dt className="text-body">Subtotal</dt>
                    <dd className="price text-ink">{formatINR(order.subtotalPaise)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-body">Consultation credit</dt>
                    <dd className="price text-success">−{formatINR(order.creditPaise)}</dd>
                  </div>
                </>
              ) : null}
              <div className="flex items-baseline justify-between pt-1">
                <dt className="font-medium text-ink">Total paid</dt>
                <dd className="price text-xl text-ink">{formatINR(order.totalPaise)}</dd>
              </div>
              {order.paymentId ? (
                <div className="flex justify-between gap-4 text-[13px] text-muted-foreground">
                  <dt className="shrink-0">Payment reference</dt>
                  <dd className="min-w-0 text-right break-all">
                    <code>{order.paymentId}</code>
                  </dd>
                </div>
              ) : null}
            </dl>
            <div className="border-t border-line px-5 py-4 text-sm">
              <p className="text-muted-foreground">Delivering to</p>
              <p className="mt-0.5 text-ink">{order.address}</p>
            </div>
          </div>

          <div className="mt-5 flex gap-3 rounded-2xl bg-mist/60 px-4 py-3.5 text-sm text-body">
            <MessageCircle className="mt-0.5 size-4 shrink-0 text-steel" aria-hidden />
            <p>
              We&apos;ll share tracking on WhatsApp as soon as it ships. Your invoice will be in your account.
              <span className="text-muted-foreground"> (Demo: messages are logged, not sent.)</span>
            </p>
          </div>

          <div className="bg-hero-dark mt-8 rounded-2xl p-6 text-on-dark md:p-8">
            <div className="flex gap-3">
              <Sprout className="mt-1 size-5 shrink-0 text-platinum" aria-hidden />
              <div>
                <p className="text-[13px] tracking-[0.12em] text-brand-on-dark uppercase">Next step</p>
                {plan ? (
                  <>
                    <p className="mt-2 text-lg font-medium">Your routine starts when it arrives</p>
                    <p className="mt-1 text-sm text-on-dark-muted">
                      Your {plan.name} begins on delivery day. You&apos;ll get a short check-in on WhatsApp
                      each week, and your account shows your day-by-day progress.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="mt-2 text-lg font-medium">Track it from your account</p>
                    <p className="mt-1 text-sm text-on-dark-muted">
                      For hair fall or thinning, a consultation with Dr. Tyagi gives you a plan made for you.
                    </p>
                  </>
                )}
                <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                  <Button asChild className="bg-silver h-12 px-6 text-base text-obsidian hover:opacity-90">
                    <Link href="/account">Go to your account</Link>
                  </Button>
                  {!plan ? (
                    <Button
                      asChild
                      variant="outline"
                      className="h-12 border-line-dark bg-transparent px-6 text-on-dark hover:bg-graphite hover:text-on-dark"
                    >
                      <Link href="/book">Book consultation · ₹500</Link>
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </OrderStatusGate>
      </div>
    </div>
  );
}
