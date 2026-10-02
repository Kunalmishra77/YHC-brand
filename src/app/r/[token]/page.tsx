import { Clock, Link2Off, MessageCircle } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { PlanCheckout } from '@/components/checkout/plan-checkout';
import type { PlanOptionView } from '@/components/checkout/types';
import { GuaranteeLine } from '@/components/shared/pricing';
import { StatusChip } from '@/components/shared/status-chip';
import { Button } from '@/components/ui/button';
import { formatIst } from '@/lib/time';
import { SITE } from '@/lib/site';
import { getDoctor, getGuarantee, getPlans, getProduct } from '@/server/catalog';
import { db, quotePlan } from '@/server/demo/store';
import { getCurrentCustomer } from '@/server/session';
import { savedAddressFor } from '../saved-address';

export const metadata: Metadata = { title: 'Your hair plan', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

export default async function PlanLinkPage({ params }: PageProps<'/r/[token]'>) {
  const { token } = await params;
  const s = db();
  const rec = s.recommendations.find((r) => r.token === token);
  const doctor = getDoctor();

  if (!rec || rec.status === 'draft') {
    return (
      <LinkProblem
        icon={<Link2Off className="size-6 text-steel" aria-hidden />}
        title="This link doesn't look right"
        body="It may be incomplete — please open it again from your WhatsApp message. If it still doesn't work, message us and we'll send a fresh one."
      />
    );
  }

  if (rec.status === 'paid') {
    const order = s.orders.find((o) => o.recommendationId === rec.id && o.status !== 'pending_payment');
    return (
      <LinkProblem
        icon={<StatusChip tone="success">Paid</StatusChip>}
        title="This plan is already paid"
        body="Thank you — your order is confirmed. You can follow it from the order page or your account."
        action={
          order ? (
            <Button asChild className="h-12 px-6">
              <Link href={`/order/${order.code}?t=${encodeURIComponent(token)}`}>
                View order {order.code}
              </Link>
            </Button>
          ) : null
        }
      />
    );
  }

  const expired = rec.status !== 'sent' || new Date(rec.expiresAt) < new Date();
  if (expired) {
    return (
      <LinkProblem
        icon={<Clock className="size-6 text-steel" aria-hidden />}
        title="This plan link has expired"
        body={`For your safety, plan links work for a limited time. Your prescription from ${doctor.name} is still yours — message us and our team will send a new link.`}
        action={
          <Button asChild className="h-12 px-6">
            <a href={SITE.whatsappUrl}>
              <MessageCircle className="size-4" aria-hidden />
              Ask for a new link on WhatsApp
            </a>
          </Button>
        }
      />
    );
  }

  const patient = s.customers.find((c) => c.id === rec.customerId);
  const firstName = patient?.name.split(' ')[0] ?? '';
  const current = await getCurrentCustomer();
  const savedAddress = current?.id === rec.customerId ? savedAddressFor(rec.customerId) : null;
  const guarantee = getGuarantee();
  const plans: PlanOptionView[] = getPlans().map((p) => ({
    id: p.id,
    name: p.name,
    months: p.months,
    pricePaise: p.pricePaise,
    compareAtPaise: p.compareAtPaise,
    isRecommended: p.isRecommended,
    quote: quotePlan(rec.customerId, p.id),
  }));
  const products = rec.productIds.map((id, i) => ({ product: getProduct(id), item: rec.items[i] ?? null }));

  return (
    <div className="container-yhc py-8 md:py-14">
      <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-14">
        <div>
          <p className="eyebrow">Your personalised hair plan</p>
          <h1 className="display mt-2 text-[34px] md:text-[48px]">
            {firstName ? `${firstName}, your plan is ready.` : 'Your plan is ready.'}
          </h1>
          <p className="mt-3 text-body">
            Prepared by {doctor.name} after your consultation. This link is valid until{' '}
            <span className="font-medium text-ink">{formatIst(new Date(rec.expiresAt))}</span>.
          </p>

          <figure className="bg-hero-dark mt-8 rounded-xl p-6 text-on-dark md:p-8">
            <blockquote className="font-display text-[24px] leading-snug text-on-dark md:text-[28px]">
              “{rec.note}”
            </blockquote>
            <figcaption className="mt-4 text-sm text-on-dark-muted">
              {doctor.name}, {doctor.qualifications} · Reg. No. {doctor.registrationNo}
            </figcaption>
          </figure>

          <section aria-labelledby="routine-title" className="mt-10">
            <h2 id="routine-title" className="text-lg font-medium text-ink">
              Your routine
            </h2>
            <ol className="mt-4 divide-y divide-line border-y border-line">
              {products.map(({ product, item }, i) => (
                <li key={product?.id ?? i} className="grid gap-2 py-5 sm:grid-cols-[40px_minmax(0,1fr)]">
                  <span className="price text-sm text-brand">0{i + 1}</span>
                  <div>
                    <p className="font-medium text-ink">
                      {product?.name ?? item?.genericName ?? 'Prescribed item'}
                    </p>
                    {product?.tagline ? (
                      <p className="text-sm text-muted-foreground">{product.tagline}</p>
                    ) : null}
                    {item ? (
                      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-3">
                        <div>
                          <dt className="text-muted-foreground">How much</dt>
                          <dd className="text-ink">{item.dosage}</dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground">When</dt>
                          <dd className="text-ink">{item.frequency}</dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground">For</dt>
                          <dd className="text-ink">{item.duration}</dd>
                        </div>
                        {item.instructions ? (
                          <div className="col-span-2 sm:col-span-3">
                            <dt className="text-muted-foreground">Tip</dt>
                            <dd className="text-ink">{item.instructions}</dd>
                          </div>
                        ) : null}
                      </dl>
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>
            <p className="mt-3 text-[13px] text-muted-foreground">
              Individual results vary. Follow the routine as advised and tell us about any side effects on
              WhatsApp.
            </p>
          </section>

          <aside className="mt-10 rounded-lg border border-line bg-card px-5 py-4 text-sm text-body">
            <p>
              {doctor.name} is associated with Your Hair Company. Your prescription is yours whether or not
              you buy.
            </p>
          </aside>
        </div>

        <div className="lg:sticky lg:top-8 lg:h-fit">
          <PlanCheckout
            token={rec.token}
            plans={plans}
            doctorPlanId={rec.planId}
            savedAddress={savedAddress}
            guarantee={guarantee ? <GuaranteeLine policy={guarantee} /> : null}
            guaranteeMinMonths={guarantee?.minPlanMonths ?? null}
          />
        </div>
      </div>
    </div>
  );
}

function LinkProblem({
  icon,
  title,
  body,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="container-yhc py-16 md:py-24">
      <div className="mx-auto max-w-lg text-center">
        <div className="flex justify-center">{icon}</div>
        <h1 className="display mt-4 text-[32px] md:text-[40px]">{title}</h1>
        <p className="mt-3 text-body">{body}</p>
        {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
      </div>
    </div>
  );
}
