'use client';

import { Minus, Plus, ShoppingBag, Stethoscope, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { ContinueBar } from '@/components/booking/continue-bar';
import { EmptyState, ListSkeleton } from '@/components/shared/states';
import { Button } from '@/components/ui/button';
import { formatINR } from '@/lib/money';
import { MAX_QTY } from '@/lib/validation/checkout';
import { cart, useCart } from './cart-store';
import type { CatalogItemView } from './types';

export type AddState =
  | { kind: 'ok'; id: string; name: string }
  | { kind: 'needs_consult'; name: string; slug: string }
  | { kind: 'unknown' }
  | null;

/** /cart (FR-M2-3/4). Displays catalog prices for orientation; the server re-prices at checkout. */
export function CartView({ catalog, add }: { catalog: CatalogItemView[]; add: AddState }) {
  const items = useCart();
  const router = useRouter();
  const handled = useRef<string | null>(null);

  useEffect(() => {
    if (add?.kind !== 'ok' || items === null || handled.current === add.id) return;
    handled.current = add.id;
    cart.add(add.id);
    toast.success(`${add.name} added to your cart`);
    router.replace('/cart', { scroll: false });
  }, [add, items, router]);

  const rows = (items ?? []).flatMap((i) => {
    const p = catalog.find((c) => c.id === i.productId);
    return p ? [{ ...i, product: p }] : [];
  });
  const dropped = (items ?? []).filter((i) => !catalog.some((c) => c.id === i.productId));
  const subtotal = rows.reduce((s, r) => s + r.product.pricePaise * r.qty, 0);
  const count = rows.reduce((s, r) => s + r.qty, 0);

  return (
    <div className="container-yhc py-8 md:py-14">
      <div className="mx-auto max-w-4xl">
        <p className="eyebrow">Your cart</p>
        <h1 className="display mt-2 text-[32px] md:text-[44px]">Everyday care, delivered</h1>

        {add?.kind === 'needs_consult' ? (
          <div className="mt-6 flex flex-col gap-4 rounded-lg border border-line bg-card p-5 sm:flex-row sm:items-center">
            <Stethoscope className="size-6 shrink-0 text-brand" aria-hidden />
            <div className="flex-1">
              <p className="font-medium text-ink">{add.name} needs a consultation first</p>
              <p className="mt-1 text-sm text-body">
                It&apos;s prescribed by Dr. Tyagi after a video consultation, so it can&apos;t be added to the
                cart. If it suits you, it will be part of your personalised plan.
              </p>
            </div>
            <Button asChild className="h-11 shrink-0">
              <Link href="/book">Book consultation · ₹500</Link>
            </Button>
          </div>
        ) : null}
        {add?.kind === 'unknown' ? (
          <p role="alert" className="mt-6 rounded-md bg-warning-bg px-4 py-3 text-sm text-warning">
            We couldn&apos;t find that product. It may have been renamed — browse the products below.
          </p>
        ) : null}

        <div className="mt-8">
          {items === null ? (
            <ListSkeleton rows={2} />
          ) : rows.length === 0 ? (
            <EmptyState
              icon={ShoppingBag}
              title="Your cart is empty"
              body="Shampoo and conditioner can be bought directly. Treatments are prescribed after a consultation with Dr. Tyagi."
              action={
                <div className="flex flex-wrap justify-center gap-2">
                  <Button asChild variant="outline" className="h-11 border-steel">
                    <Link href="/products">Browse products</Link>
                  </Button>
                  <Button asChild className="h-11">
                    <Link href="/book">Book consultation · ₹500</Link>
                  </Button>
                </div>
              }
            />
          ) : (
            <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_300px]">
              <ul className="divide-y divide-line border-y border-line">
                {rows.map((r) => (
                  <li key={r.productId} className="flex gap-4 py-5">
                    <div
                      className="bg-silver flex size-20 shrink-0 items-end justify-center rounded-md pb-2"
                      aria-hidden
                    >
                      <span className="h-12 w-6 rounded-sm bg-obsidian/85 shadow-card" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <Link
                            href={`/products/${r.product.slug}`}
                            className="font-medium text-ink underline-offset-4 hover:underline"
                          >
                            {r.product.name}
                          </Link>
                          <p className="mt-0.5 text-sm text-muted-foreground">{r.product.tagline}</p>
                        </div>
                        <p className="price shrink-0 text-ink">{formatINR(r.product.pricePaise * r.qty)}</p>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center rounded-md border border-line bg-card">
                          <button
                            type="button"
                            aria-label={`Decrease quantity of ${r.product.name}`}
                            disabled={r.qty <= 1}
                            onClick={() => cart.setQty(r.productId, r.qty - 1)}
                            className="flex size-11 items-center justify-center text-ink disabled:text-steel"
                          >
                            <Minus className="size-4" aria-hidden />
                          </button>
                          <span className="price w-8 text-center text-ink" aria-live="polite">
                            <span className="sr-only">Quantity </span>
                            {r.qty}
                          </span>
                          <button
                            type="button"
                            aria-label={`Increase quantity of ${r.product.name}`}
                            disabled={r.qty >= MAX_QTY}
                            onClick={() => cart.setQty(r.productId, r.qty + 1)}
                            className="flex size-11 items-center justify-center text-ink disabled:text-steel"
                          >
                            <Plus className="size-4" aria-hidden />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            cart.remove(r.productId);
                            toast(`${r.product.name} removed`, {
                              action: { label: 'Undo', onClick: () => cart.add(r.productId, r.qty) },
                            });
                          }}
                          className="inline-flex min-h-11 items-center gap-1.5 px-2 text-sm text-body hover:text-danger"
                        >
                          <Trash2 className="size-4" aria-hidden />
                          Remove
                        </button>
                      </div>
                      <p className="mt-1 text-[13px] text-muted-foreground">
                        {formatINR(r.product.pricePaise)} each · about {r.product.daysOfSupply} days per
                        bottle
                      </p>
                    </div>
                  </li>
                ))}
              </ul>

              <aside className="h-fit rounded-lg border border-line bg-card p-5">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-body">
                    Subtotal · {count} {count === 1 ? 'item' : 'items'}
                  </span>
                  <span className="price text-xl text-ink">{formatINR(subtotal)}</span>
                </div>
                <p className="mt-1 text-[13px] text-muted-foreground">
                  Prices include GST. Final amount is confirmed at checkout.
                </p>
                <p className="mt-3 text-[13px] text-muted-foreground">
                  Prepaid orders only — UPI, cards and netbanking. No cash on delivery.
                </p>
                <Button asChild className="mt-5 hidden h-12 w-full text-base md:inline-flex">
                  <Link href="/checkout">Checkout</Link>
                </Button>
              </aside>
            </div>
          )}
          {dropped.length > 0 && items !== null ? (
            <p className="mt-4 text-sm text-muted-foreground">
              Some saved items need a consultation or are no longer available, so they are not included.{' '}
              <button
                type="button"
                className="min-h-11 font-medium text-brand underline underline-offset-4"
                onClick={() => dropped.forEach((d) => cart.remove(d.productId))}
              >
                Remove them
              </button>
            </p>
          ) : null}
        </div>

        {rows.length > 0 ? (
          <div className="md:hidden">
            <ContinueBar
              summary={
                <>
                  <span className="block text-muted-foreground">Subtotal</span>
                  <span className="price font-medium text-ink">{formatINR(subtotal)}</span>
                </>
              }
            >
              <Button asChild className="h-12 px-8 text-base">
                <Link href="/checkout">Checkout</Link>
              </Button>
            </ContinueBar>
          </div>
        ) : null}
      </div>
    </div>
  );
}
