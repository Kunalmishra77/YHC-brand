import { ImagePlus, Layers } from 'lucide-react';
import { DemoResetNote } from '@/components/admin/action-kit';
import { PlanEditDialog, ProductEditDialog } from '@/components/admin/catalog-dialogs';
import { DataList } from '@/components/admin/data-list';
import { PageHeader } from '@/components/shared/page-header';
import { StatusChip } from '@/components/shared/status-chip';
import type { Plan, Product } from '@/lib/domain/types';
import { formatINR } from '@/lib/money';
import { requireAdminPage } from '@/server/admin/guard';
import { PLANS, PRODUCTS } from '@/server/demo/fixtures';
import { updatePlanAction, updateProductAction } from './actions';

export const metadata = { title: 'Catalog' };

const CATEGORY: Record<Product['regulatoryCategory'], string> = {
  cosmetic: 'Cosmetic',
  ayurvedic: 'Ayurvedic',
  drug: 'Drug (Rx)',
  supplement: 'Supplement',
  other: 'Other',
};

export default async function CatalogPage() {
  await requireAdminPage();
  return (
    <div className="space-y-8">
      <PageHeader title="Catalog" description={<DemoResetNote className="text-sm text-muted-foreground" />} />

      <section aria-labelledby="products-title" className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 id="products-title" className="text-base font-semibold text-ink">
              Products
            </h2>
            <p className="text-[13px] text-muted-foreground">
              {PRODUCTS.length} products · prices include GST · regulatory category and HSN pending per SKU
              (D-P2)
            </p>
          </div>
          <p className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground">
            <ImagePlus className="size-4 text-steel" aria-hidden />
            Media upload arrives with Supabase Storage (Phase 02)
          </p>
        </div>
        <DataList<Product>
          rows={PRODUCTS}
          rowKey={(p) => p.id}
          caption="Products"
          columns={[
            {
              header: 'Product',
              cell: (p) => (
                <span>
                  <span className="block font-medium text-ink">{p.name}</span>
                  <span className="block text-[12px] text-muted-foreground">{p.tagline}</span>
                </span>
              ),
            },
            {
              header: 'Category',
              cell: (p) => <span className="text-sm">{CATEGORY[p.regulatoryCategory]}</span>,
            },
            {
              header: 'Consultation',
              cell: (p) =>
                p.requiresConsultation ? (
                  <StatusChip tone="info">Required</StatusChip>
                ) : (
                  <StatusChip tone="neutral">Not required</StatusChip>
                ),
            },
            {
              header: 'Price',
              align: 'right',
              cell: (p) =>
                p.pricePaise === null ? (
                  <span className="text-sm text-muted-foreground">In plan only</span>
                ) : (
                  <span className="price font-medium text-ink">{formatINR(p.pricePaise)}</span>
                ),
            },
            { header: 'HSN', cell: (p) => <span className="price text-sm">{p.hsn}</span> },
            {
              header: 'GST',
              align: 'right',
              cell: (p) => <span className="price text-sm">{p.gstRate}%</span>,
            },
            {
              header: 'Supply',
              align: 'right',
              cell: (p) => <span className="price text-sm">{p.daysOfSupply} days</span>,
            },
          ]}
          actions={(p) => (
            <ProductEditDialog
              product={{
                id: p.id,
                name: p.name,
                pricePaise: p.pricePaise,
                requiresConsultation: p.requiresConsultation,
                hsn: p.hsn,
                gstRate: p.gstRate,
                daysOfSupply: p.daysOfSupply,
              }}
              action={updateProductAction.bind(null, p.id)}
            />
          )}
        />
      </section>

      <section aria-labelledby="plans-title" className="space-y-3">
        <div>
          <h2 id="plans-title" className="text-base font-semibold text-ink">
            Plans
          </h2>
          <p className="text-[13px] text-muted-foreground">
            The plan price is what the customer pays for the doctor-chosen routine. Consultation credit is
            applied at checkout.
          </p>
        </div>
        <DataList<Plan>
          rows={[...PLANS].sort((a, b) => a.months - b.months)}
          rowKey={(p) => p.id}
          caption="Plans"
          columns={[
            {
              header: 'Plan',
              cell: (p) => (
                <span className="inline-flex flex-wrap items-center gap-2">
                  <span className="font-medium text-ink">{p.name}</span>
                  {p.isRecommended ? <StatusChip tone="success">Doctor-recommended</StatusChip> : null}
                </span>
              ),
            },
            { header: 'Months', align: 'right', cell: (p) => <span className="price">{p.months}</span> },
            {
              header: 'Price',
              align: 'right',
              cell: (p) => <span className="price font-medium text-ink">{formatINR(p.pricePaise)}</span>,
            },
            {
              header: 'Per month',
              align: 'right',
              cell: (p) => (
                <span className="price text-sm">
                  {formatINR(Math.round(p.pricePaise / p.months / 100) * 100)}
                </span>
              ),
            },
            {
              header: 'Compare-at',
              align: 'right',
              cell: (p) =>
                p.compareAtPaise === null ? (
                  <span className="text-sm text-muted-foreground">—</span>
                ) : (
                  <span className="price text-sm text-muted-foreground line-through">
                    {formatINR(p.compareAtPaise)}
                  </span>
                ),
            },
          ]}
          actions={(p) => (
            <PlanEditDialog
              plan={{
                id: p.id,
                name: p.name,
                pricePaise: p.pricePaise,
                compareAtPaise: p.compareAtPaise,
                isRecommended: p.isRecommended,
              }}
              action={updatePlanAction.bind(null, p.id)}
            />
          )}
        />
      </section>

      <section className="flex gap-3 rounded-lg border border-dashed border-line bg-card p-4">
        <Layers className="mt-0.5 size-5 shrink-0 text-steel" aria-hidden />
        <div className="space-y-1 text-sm">
          <p className="font-medium text-ink">Protocol templates</p>
          <p className="text-body">
            Shared starting points Dr. Tyagi picks from when writing a plan (products, dosage wording,
            follow-up interval). They are managed by the doctor and need medical sign-off, so they are
            read-only here.
          </p>
          <p className="text-[13px] text-muted-foreground">
            {/* TODO(client): protocol templates from Dr. Tyagi — see docs/12 (clinical content row) */}
            Waiting on Dr. Tyagi’s template list (docs/12).
          </p>
        </div>
      </section>
    </div>
  );
}
