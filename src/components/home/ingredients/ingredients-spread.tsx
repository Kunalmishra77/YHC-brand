'use client';

import { ArrowLeft, ArrowRight, Leaf, Stethoscope } from 'lucide-react';
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from 'motion/react';
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

/** Soft background tints per pack line (the label colours on the packs), one shade per product. */
const TINTS: Record<ProductLine, string[]> = {
  men: ['#e2ece6', '#dce8e1', '#e6eee9'],
  women: ['#f3e5e2', '#f0dfdc', '#f5e9e6'],
};

/** Where the floating ingredient photos sit around the arch, and how long each one takes to bob. */
const ORBIT = [
  { pos: '-left-[10%] top-[8%] lg:-left-[14%]', float: 5.2 },
  { pos: '-right-[10%] top-[20%] lg:-right-[16%]', float: 6.1 },
  { pos: '-left-[12%] top-[44%] lg:-left-[18%]', float: 5.7 },
  { pos: '-right-[10%] top-[54%] lg:-right-[14%]', float: 6.6 },
  { pos: '-left-[6%] bottom-[22%] lg:-left-[8%]', float: 5.9 },
  { pos: '-right-[4%] bottom-[30%] lg:-right-[6%]', float: 6.3 },
] as const;

/**
 * Section 10 explorer (kanak pattern, ADR-35). Left: the real pack in an arch on a soft colour field
 * (mint for the men line, blush for the women line), its ingredient photos floating around it, arrows to
 * step through the products. Right: products as tabs (roving tabindex, arrow keys), the ingredients as photo
 * chips, and one plain line about the chosen one. Under reduced motion the pictures simply swap.
 */
export function IngredientsSpread({ products, headingId }: { products: SpreadProduct[]; headingId: string }) {
  const uid = useId();
  const [productIdx, setProductIdx] = useState(0);
  const [ingIdx, setIngIdx] = useState(0);
  const [line, setLine] = useState<ProductLine>('men');
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const reduce = useReducedMotion();

  const product = products[productIdx] ?? products[0];
  if (!product) return null;
  const ing = product.ingredients[ingIdx] ?? product.ingredients[0];
  const pack = product.packs.find((p) => p.line === line) ?? product.packs[0];
  const tint = TINTS[pack?.line ?? line][productIdx % 3] ?? '#e6e7e9';
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

        {/* Kanak-style colour field: soft mint for the men line, blush for the women line, a shade per product. */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          initial={false}
          animate={{ backgroundColor: tint }}
          transition={{ duration: 0.9, ease: EASE }}
        />

        {/* Stage: the real pack in an arch, its ingredients floating around it */}
        <div className="relative mx-auto w-[74%] max-w-[26rem] py-6 sm:w-[58%] lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:w-[78%] lg:max-w-[30rem] lg:self-center">
          <div className="relative aspect-[4/5] overflow-hidden rounded-t-[999px] rounded-b-[2rem] bg-obsidian shadow-[0_50px_90px_-40px_rgba(18,19,21,0.55)] ring-1 ring-black/5">
            <AnimatePresence initial={false}>
              {pack ? (
                <motion.div
                  key={pack.src}
                  className="absolute inset-0"
                  initial={{ opacity: 0, scale: 1.08 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: EASE }}
                >
                  <Image
                    src={pack.src}
                    alt={pack.alt}
                    fill
                    sizes="(min-width: 1024px) 30rem, 74vw"
                    className="object-cover"
                  />
                </motion.div>
              ) : null}
            </AnimatePresence>

            {product.packs.length > 1 ? (
              <div
                role="group"
                aria-label="Pack"
                className="absolute bottom-4 left-1/2 flex -translate-x-1/2 rounded-full bg-black/45 p-1 ring-1 ring-white/15 backdrop-blur-md"
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
                        'flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-medium whitespace-nowrap transition-colors duration-300',
                        on ? 'bg-white text-ink' : 'text-white/85 hover:text-white',
                      )}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>

          {/* Floating ingredient photos (decoration; the chips on the right are the controls). */}
          <ul aria-hidden className="pointer-events-none absolute inset-0">
            {product.ingredients.slice(0, ORBIT.length).map((x, i) => {
              const spot = ORBIT[i];
              if (!spot) return null;
              const on = i === ingIdx;
              return (
                <motion.li
                  key={`${product.slug}-${x.name}`}
                  className={cn('absolute flex flex-col items-center gap-1.5', spot.pos)}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: on ? 1.16 : 1, y: reduce ? 0 : [0, -10, 0] }}
                  transition={{
                    opacity: { duration: 0.5, delay: 0.1 + i * 0.07 },
                    scale: { type: 'spring', stiffness: 260, damping: 18 },
                    y: { duration: spot.float, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 },
                  }}
                >
                  <span
                    className={cn(
                      'relative flex size-14 items-center justify-center overflow-hidden rounded-full bg-white shadow-raised ring-4 sm:size-[4.5rem] lg:size-20',
                      on ? 'ring-white' : 'ring-white/60',
                    )}
                  >
                    {x.image ? (
                      <Image src={x.image.src} alt="" fill sizes="80px" className="object-cover" />
                    ) : (
                      <Leaf className="size-5 text-body" />
                    )}
                  </span>
                  <span
                    className={cn(
                      'rounded-full px-2.5 py-0.5 text-[12px] font-medium whitespace-nowrap shadow-card transition-colors duration-300',
                      on ? 'bg-obsidian text-on-dark' : 'bg-white/90 text-ink',
                    )}
                  >
                    {x.name}
                  </span>
                </motion.li>
              );
            })}
          </ul>

          {/* Arrows: step through the products */}
          {products.length > 1 ? (
            <div className="mt-6 flex items-center justify-center gap-3">
              <ArrowButton
                label="Previous product"
                onClick={() => select((productIdx - 1 + products.length) % products.length)}
              >
                <ArrowLeft className="size-4" aria-hidden />
              </ArrowButton>
              <span
                className="min-w-[3.5rem] text-center text-sm font-medium text-ink tabular-nums"
                aria-live="polite"
              >
                {productIdx + 1} / {products.length}
              </span>
              <ArrowButton label="Next product" onClick={() => select((productIdx + 1) % products.length)}>
                <ArrowRight className="size-4" aria-hidden />
              </ArrowButton>
            </div>
          ) : null}
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

function ArrowButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex size-12 items-center justify-center rounded-full bg-white/80 text-ink shadow-card ring-1 ring-black/5 backdrop-blur transition-[background-color,transform] duration-300 hover:bg-white active:scale-95"
    >
      {children}
    </button>
  );
}
