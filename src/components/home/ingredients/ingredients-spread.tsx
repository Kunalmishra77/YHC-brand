'use client';

import { ArrowRight, Leaf, Stethoscope } from 'lucide-react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { useId, useRef, useState, type KeyboardEvent } from 'react';
import { TEXT_LINK } from '@/components/site/section';
import type { ProductLine } from '@/lib/brand-media';
import { cn } from '@/lib/utils';

export interface SpreadIngredient {
  /** Everyday name, without the botanical name in brackets. */
  name: string;
  botanical: string | null;
  /** Catalog role — the only claim made about the ingredient. */
  role: string;
  /** Plain-English note (ingredient-notes.ts). */
  note: string;
  /** Illustrative photo of the ingredient (brand-media.ts). */
  image: { src: string; alt: string } | null;
}

export interface SpreadPack {
  line: ProductLine;
  label: string;
  src: string;
  alt: string;
}

export interface SpreadProduct {
  slug: string;
  name: string;
  /** Prescription-only product. */
  rx: boolean;
  packs: SpreadPack[];
  ingredients: SpreadIngredient[];
}

const EASE = [0.2, 0.7, 0.2, 1] as const;

/**
 * Section 10 explorer. Left: the real pack, large, with a men/women switch; the chosen ingredient's
 * photo floats over it. Right: products as tabs (roving tabindex, arrow keys), the ingredients as photo
 * chips, and one plain line about the chosen one. Under reduced motion the pictures simply swap.
 */
export function IngredientsSpread({ products, headingId }: { products: SpreadProduct[]; headingId: string }) {
  const uid = useId();
  const [productIdx, setProductIdx] = useState(0);
  const [ingIdx, setIngIdx] = useState(0);
  const [line, setLine] = useState<ProductLine>('men');
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const product = products[productIdx] ?? products[0];
  if (!product) return null;
  const ing = product.ingredients[ingIdx] ?? product.ingredients[0];
  const pack = product.packs.find((p) => p.line === line) ?? product.packs[0];
  const tabId = (slug: string) => `${uid}-tab-${slug}`;
  const panelId = `${uid}-panel`;

  const select = (i: number) => {
    setProductIdx(i);
    setIngIdx(0);
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
      <div className="grid gap-8 lg:grid-cols-[minmax(0,6fr)_minmax(0,6fr)] lg:grid-rows-[auto_1fr] lg:gap-x-16 lg:gap-y-8">
        <div className="lg:col-start-2">
          <h2
            id={headingId}
            className="display text-[clamp(2.75rem,1.6rem+4.4vw,5.25rem)] leading-[0.95] tracking-[-0.01em]"
          >
            What’s inside
          </h2>
          <p className="mt-3 text-lg text-body">Pick a product. Tap an ingredient to see it.</p>
        </div>

        {/* Stage: the real pack, with the chosen ingredient over it */}
        <div className="relative aspect-square overflow-hidden rounded-[1.75rem] bg-obsidian sm:aspect-[5/4] lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:aspect-[4/5]">
          <AnimatePresence initial={false}>
            {pack ? (
              <motion.div
                key={pack.src}
                className="absolute inset-0"
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7, ease: EASE }}
              >
                <Image
                  src={pack.src}
                  alt={pack.alt}
                  fill
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="object-cover"
                />
              </motion.div>
            ) : null}
          </AnimatePresence>

          {product.packs.length > 1 ? (
            <div
              role="group"
              aria-label="Pack"
              className="absolute top-4 left-4 flex rounded-full bg-black/45 p-1 ring-1 ring-white/15 backdrop-blur-md"
            >
              {product.packs.map((p) => {
                const on = p.line === (pack?.line ?? 'men');
                return (
                  <button
                    key={p.line}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setLine(p.line)}
                    className={cn(
                      'flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-medium transition-colors duration-300',
                      on ? 'bg-white text-ink' : 'text-white/85 hover:text-white',
                    )}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          ) : null}

          {/* Ingredient lens */}
          <AnimatePresence mode="wait" initial={false}>
            {ing ? (
              <motion.div
                key={`${product.slug}-${ing.name}`}
                aria-hidden
                className="absolute right-4 bottom-4 left-4 flex items-center gap-4 rounded-[1.25rem] bg-white/92 p-3 pr-5 shadow-raised backdrop-blur-md sm:right-auto sm:max-w-[22rem]"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.4, ease: EASE }}
              >
                <span className="relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-mist ring-1 ring-line sm:size-24">
                  {ing.image ? (
                    <Image src={ing.image.src} alt="" fill sizes="96px" className="object-cover" />
                  ) : (
                    <Leaf className="size-6 text-body" />
                  )}
                </span>
                <span className="min-w-0">
                  <span className="block font-display text-2xl leading-tight font-medium text-ink">
                    {ing.name}
                  </span>
                  <span className="mt-0.5 block text-[13px] leading-snug text-body">{ing.role}</span>
                </span>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <div className="min-w-0 lg:col-start-2">
          {/* Products = tabs */}
          <div
            role="tablist"
            aria-label="Products"
            aria-orientation="horizontal"
            onKeyDown={onTabKeyDown}
            className="relative -mx-[var(--yhc-gutter)] flex [scrollbar-width:none] gap-2 overflow-x-auto overscroll-x-contain px-[var(--yhc-gutter)] pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden"
          >
            {products.map((p, i) => {
              const selected = i === productIdx;
              const thumb = p.packs.find((k) => k.line === line) ?? p.packs[0];
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
                    'flex min-h-12 shrink-0 items-center gap-2.5 rounded-full py-1 pr-4 pl-1 text-sm font-medium whitespace-nowrap ring-1 transition-colors duration-300',
                    selected ? 'bg-obsidian text-on-dark ring-obsidian' : 'text-ink ring-line hover:bg-mist',
                  )}
                >
                  <span className="relative size-10 shrink-0 overflow-hidden rounded-full bg-obsidian">
                    {thumb ? (
                      <Image src={thumb.src} alt="" fill sizes="40px" className="object-cover" />
                    ) : null}
                  </span>
                  {p.name.replace(/^Hair /, '')}
                </button>
              );
            })}
          </div>

          <div role="tabpanel" id={panelId} aria-labelledby={tabId(product.slug)} className="mt-6">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h3 className="text-lg font-medium text-ink">{product.name}</h3>
              <span className="text-sm text-body">{product.ingredients.length} ingredients</span>
              {product.rx ? (
                <span className="rounded-full bg-warning-bg px-2.5 py-0.5 text-xs font-medium text-warning">
                  Prescription only
                </span>
              ) : null}
            </div>

            <ul className="mt-4 flex flex-wrap gap-2" aria-label={`Ingredients in ${product.name}`}>
              {product.ingredients.map((x, i) => {
                const on = i === ingIdx;
                return (
                  <li key={x.name}>
                    <button
                      type="button"
                      aria-pressed={on}
                      onClick={() => setIngIdx(i)}
                      className={cn(
                        'group/chip flex min-h-11 items-center gap-2 rounded-full py-1 pr-3.5 pl-1 text-sm ring-1 transition-[background-color,color,box-shadow] duration-300',
                        on
                          ? 'bg-mist font-medium text-ink ring-2 ring-obsidian'
                          : 'text-body ring-line hover:text-ink',
                      )}
                    >
                      <span className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-mist">
                        {x.image ? (
                          <Image
                            src={x.image.src}
                            alt=""
                            fill
                            sizes="36px"
                            className="object-cover transition-transform duration-500 ease-yhc group-hover/chip:scale-110 motion-reduce:transition-none"
                          />
                        ) : (
                          <Leaf className="size-4 text-body" aria-hidden />
                        )}
                      </span>
                      {x.name}
                    </button>
                  </li>
                );
              })}
            </ul>

            {ing ? (
              <div className="mt-6 min-h-[7.5rem] border-t border-line pt-5" aria-live="polite">
                <p className="text-sm font-medium text-ink">
                  {ing.name}
                  {ing.botanical ? (
                    <span className="font-normal text-muted-foreground"> ({ing.botanical})</span>
                  ) : null}
                </p>
                <p className="mt-1.5 max-w-[52ch] text-base leading-relaxed text-pretty text-body">
                  {ing.note}
                </p>
              </div>
            ) : null}

            <p className="mt-4 flex items-start gap-2.5 text-sm leading-relaxed text-body">
              <Stethoscope className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
              <span>Your doctor decides what you need, and how strong.</span>
            </p>
            <Link href={`/products/${product.slug}`} className={cn('mt-2 text-ink', TEXT_LINK)}>
              See {product.name} <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </MotionConfig>
  );
}
