import { Reveal } from '@/components/site/reveal';
import { SECTION_Y } from '@/components/site/section';
import { DARK_PRODUCT_IMAGES, PRODUCT_IMAGES } from '@/lib/images';
import { getProducts } from '@/server/catalog';
import { ingredientNote } from './ingredients/ingredient-notes';
import { IngredientsSpread, type SpreadProduct } from './ingredients/ingredients-spread';

/**
 * Homepage section 10 · Ingredients — editorial product spread. The product photographs are the anchors
 * (and the tabs); the selected product's ingredients open as a quiet accordion with their catalog role
 * and a plain-language note. Only ingredients from catalog products, only their stated roles.
 */
export function IngredientsExplorer() {
  const products: SpreadProduct[] = getProducts()
    .filter((p) => p.ingredients.length > 0)
    .map((p) => {
      const image = PRODUCT_IMAGES[p.slug];
      return {
        slug: p.slug,
        name: p.name,
        tagline: p.tagline,
        image: image ? { src: image.src, alt: image.alt } : null,
        dark: DARK_PRODUCT_IMAGES.has(p.slug),
        ingredients: p.ingredients.map((ing) => ({
          name: ing.name,
          role: ing.role,
          note: ingredientNote(ing.name, ing.role),
        })),
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
        <Reveal className="mb-10 grid gap-5 md:mb-14 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:items-end md:gap-12">
          <div>
            <p className="eyebrow">What’s inside</p>
            <h2
              id="ingredients-heading"
              className="display mt-5 text-[clamp(3.5rem,2rem+6.5vw,7.5rem)] leading-[0.9] tracking-[-0.015em]"
            >
              Ingredients
            </h2>
          </div>
          <p className="max-w-sm leading-relaxed text-pretty text-body md:justify-self-end md:pb-2">
            Choose a product to see what is in it and the role each ingredient plays. Nothing here replaces
            your consultation.
          </p>
        </Reveal>
        <IngredientsSpread products={products} />
      </div>
    </section>
  );
}
