import type { Metadata } from 'next';
import { CartView, type AddState } from '@/components/checkout/cart-view';
import type { CatalogItemView } from '@/components/checkout/types';
import { getProduct, getProducts } from '@/server/catalog';

export const metadata: Metadata = { title: 'Your cart', robots: { index: false } };

/** Buyable products only (FR-M2-3: `requiresConsultation = false` and priced). */
function buyableCatalog(): CatalogItemView[] {
  return getProducts().flatMap((p) =>
    !p.requiresConsultation && p.pricePaise !== null
      ? [
          {
            id: p.id,
            slug: p.slug,
            name: p.name,
            tagline: p.tagline,
            pricePaise: p.pricePaise,
            daysOfSupply: p.daysOfSupply,
          },
        ]
      : [],
  );
}

export default async function CartPage({ searchParams }: PageProps<'/cart'>) {
  const { add } = await searchParams;
  const id = typeof add === 'string' ? add : null;
  let addState: AddState = null;
  if (id) {
    const p = getProduct(id);
    if (!p) addState = { kind: 'unknown' };
    else if (p.requiresConsultation || p.pricePaise === null)
      addState = { kind: 'needs_consult', name: p.name, slug: p.slug };
    else addState = { kind: 'ok', id: p.id, name: p.name };
  }
  return <CartView catalog={buyableCatalog()} add={addState} />;
}
