'use client';

import { ArrowRight, Plus, Stethoscope } from 'lucide-react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { useId, useRef, useState, type KeyboardEvent } from 'react';
import { TEXT_LINK } from '@/components/site/section';
import { cn } from '@/lib/utils';

export interface SpreadIngredient {
  name: string;
  /** Catalog role — the only claim made about the ingredient. */
  role: string;
  /** Plain-language explanation (ingredient-notes.ts). */
  note: string;
}

export interface SpreadProduct {
  slug: string;
  name: string;
  tagline: string;
  image: { src: string; alt: string } | null;
  /** Photographed on a dark background → obsidian frame. */
  dark: boolean;
  ingredients: SpreadIngredient[];
}

const EASE = [0.2, 0.7, 0.2, 1] as const;

/**
 * Desktop mosaic slots (6-column grid, fixed row height): one hero tile, two squares, two wide tiles —
 * an editorial "product spread". Below `lg` every tile is an edge-to-edge snap card instead.
 */
const SLOTS = [
  'lg:col-span-4 lg:row-span-2',
  'lg:col-span-2',
  'lg:col-span-2',
  'lg:col-span-3',
  'lg:col-span-3',
] as const;

/**
 * Section 10 explorer. Product photographs are the tabs (roving tabindex, arrow keys): a mosaic on
 * desktop, a swipeable edge-to-edge rail on phones. The selected product's ingredients are an editorial
 * accordion — name and catalog role on the row, a plain-language note when opened, and a product link.
 */
export function IngredientsSpread({ products }: { products: SpreadProduct[] }) {
  const uid = useId();
  const [productIdx, setProductIdx] = useState(0);
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const product = products[productIdx] ?? products[0];
  if (!product) return null;
  const tabId = (slug: string) => `${uid}-tab-${slug}`;
  const panelId = `${uid}-panel`;

  const select = (i: number) => {
    setProductIdx(i);
    setOpenIdx(0);
  };

  const onTabKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const last = products.length - 1;
    const moves: Record<string, number> = {
      ArrowRight: productIdx === last ? 0 : productIdx + 1,
      ArrowDown: productIdx === last ? 0 : productIdx + 1,
      ArrowLeft: productIdx === 0 ? last : productIdx - 1,
      ArrowUp: productIdx === 0 ? last : productIdx - 1,
      Home: 0,
      End: last,
    };
    const next = moves[e.key];
    if (next === undefined) return;
    e.preventDefault();
    select(next);
    const el = tabRefs.current[next];
    el?.focus();
    el?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16">
        {/* Product spread = tabs */}
        <div
          role="tablist"
          aria-label="Products"
          aria-orientation="horizontal"
          onKeyDown={onTabKeyDown}
          className="-mx-[var(--yhc-gutter)] flex snap-x snap-mandatory scroll-px-[var(--yhc-gutter)] [scrollbar-width:none] gap-2 overflow-x-auto overscroll-x-contain px-[var(--yhc-gutter)] lg:mx-0 lg:grid lg:auto-rows-[11rem] lg:grid-cols-6 lg:overflow-visible lg:px-0 xl:auto-rows-[12.5rem] [&::-webkit-scrollbar]:hidden"
        >
          {products.map((p, i) => {
            const selected = i === productIdx;
            return (
              <button
                key={p.slug}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                id={tabId(p.slug)}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={panelId}
                tabIndex={selected ? 0 : -1}
                onClick={() => select(i)}
                className={cn(
                  'group/tile relative aspect-[4/5] w-[72%] shrink-0 snap-start overflow-hidden text-left min-[430px]:w-[62%] sm:w-[38%] lg:aspect-auto lg:w-auto',
                  'focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-card focus-visible:outline-none',
                  p.dark ? 'bg-obsidian' : 'bg-[#efeeeb]',
                  SLOTS[i] ?? 'lg:col-span-3',
                )}
              >
                {p.image ? (
                  <Image
                    src={p.image.src}
                    alt=""
                    fill
                    sizes={i === 0 ? '(min-width: 1024px) 38vw, 72vw' : '(min-width: 1024px) 20vw, 72vw'}
                    className={cn(
                      'object-cover transition-[transform,opacity] duration-[1200ms] ease-yhc group-hover/tile:scale-[1.03] motion-reduce:transition-none',
                      !selected && 'lg:opacity-55 lg:group-hover/tile:opacity-100',
                    )}
                  />
                ) : null}
                {/* Thin caption bar; inverted when selected. */}
                <span
                  className={cn(
                    'absolute inset-x-0 bottom-0 flex min-h-12 items-center justify-between gap-3 px-4 py-2.5 text-[11px] font-semibold tracking-[0.18em] uppercase transition-colors duration-500',
                    selected ? 'bg-obsidian text-on-dark' : 'bg-white/90 text-ink backdrop-blur-sm',
                  )}
                >
                  <span className="min-w-0 truncate">{p.name}</span>
                  <span className="shrink-0 font-medium tracking-normal normal-case">
                    {p.ingredients.length} ingredients
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected product: minimal ingredient accordion */}
        <div role="tabpanel" id={panelId} aria-labelledby={tabId(product.slug)} className="min-w-0">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={product.slug}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.5, ease: EASE }}
            >
              <p className="text-[11px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                Inside
              </p>
              <h3 className="display mt-3 text-[clamp(2.25rem,1.7rem+2vw,3.25rem)] leading-[1] text-balance">
                {product.name}
              </h3>
              <p className="mt-3 text-[15px] text-body">{product.tagline}</p>

              <ul className="mt-8 border-b border-line">
                {product.ingredients.map((ing, i) => {
                  const isOpen = openIdx === i;
                  const btnId = `${uid}-ing-${product.slug}-${i}`;
                  const regionId = `${btnId}-note`;
                  return (
                    <li key={ing.name} className="border-t border-line">
                      <h4>
                        <button
                          id={btnId}
                          type="button"
                          aria-expanded={isOpen}
                          aria-controls={regionId}
                          onClick={() => setOpenIdx(isOpen ? null : i)}
                          className="group/row grid min-h-16 w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3 text-left focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none focus-visible:ring-inset"
                        >
                          <span className="min-w-0">
                            <span className="block font-medium text-ink">{ing.name}</span>
                            <span className="mt-0.5 block text-sm text-body">{ing.role}</span>
                          </span>
                          <span className="flex size-12 items-center justify-center rounded-full transition-colors group-hover/row:bg-mist">
                            <Plus
                              aria-hidden
                              className={cn(
                                'size-4 text-ink transition-transform duration-500 ease-yhc motion-reduce:transition-none',
                                isOpen && 'rotate-45',
                              )}
                            />
                          </span>
                        </button>
                      </h4>
                      <div
                        id={regionId}
                        role="region"
                        aria-labelledby={btnId}
                        className={cn(
                          'grid transition-[grid-template-rows] duration-500 ease-yhc motion-reduce:transition-none',
                          isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
                        )}
                      >
                        <div className="overflow-hidden" inert={!isOpen}>
                          <p className="max-w-[52ch] pr-14 pb-5 text-[15px] leading-relaxed text-pretty text-body">
                            {ing.note}
                          </p>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <Link href={`/products/${product.slug}`} className={cn('mt-6 text-ink', TEXT_LINK)}>
                View {product.name} <ArrowRight className="size-4" aria-hidden />
              </Link>
            </motion.div>
          </AnimatePresence>

          <p className="mt-6 flex items-start gap-2.5 text-sm leading-relaxed text-body">
            <Stethoscope className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
            <span>Strength and combination are chosen by the doctor, based on your consultation.</span>
          </p>
        </div>
      </div>
    </MotionConfig>
  );
}
