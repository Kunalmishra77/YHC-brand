import { SECTION_Y } from '@/components/site/section';
import { LINE_LABEL, PRODUCT_MEDIA, ingredientImage, type ProductLine } from '@/lib/brand-media';
import { getProducts } from '@/server/catalog';
import { ingredientNote } from './ingredients/ingredient-notes';
import { IngredientsSpread, type SpreadProduct } from './ingredients/ingredients-spread';

const LINES: ProductLine[] = ['men', 'women'];

/**
 * Homepage section 10 · Ingredients — the real pack is the stage (men's mint or women's blush label),
 * the selected ingredient's photo floats over it, and one plain line explains it. Only ingredients from
 * catalog products, only their stated roles.
 */
export function IngredientsExplorer() {
  const products: SpreadProduct[] = getProducts()
    .filter((p) => p.ingredients.length > 0)
    .map((p) => {
      const media = PRODUCT_MEDIA[p.slug];
      return {
        slug: p.slug,
        name: p.name,
        rx: /prescription/i.test(p.tagline),
        packs: LINES.flatMap((line) => {
          const img = media?.lines[line][0];
          return img ? [{ line, label: LINE_LABEL[line], src: img.src, alt: img.alt }] : [];
        }),
        ingredients: p.ingredients.map((ing) => {
          const photo = ingredientImage(ing.name);
          const botanical = /\(([^)]+)\)/.exec(ing.name)?.[1] ?? null;
          return {
            name: ing.name.replace(/\s*\(.*\)/, '').trim(),
            botanical,
            role: ing.role,
            note: ingredientNote(ing.name, ing.role),
            image: photo ? { src: photo.src, alt: photo.alt } : null,
          };
        }),
      };
    });

  if (products.length === 0) return null;

  return (
    <section
      id="ingredients"
      aria-labelledby="ingredients-heading"
      className={`relative scroll-mt-20 overflow-x-clip bg-card ${SECTION_Y}`}
    >
      <div className="container-yhc">
        <IngredientsSpread products={products} headingId="ingredients-heading" />
      </div>
    </section>
  );
}
