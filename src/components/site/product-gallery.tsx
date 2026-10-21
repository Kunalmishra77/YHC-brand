'use client';

import Image from 'next/image';
import { useState } from 'react';
import { LINE_LABEL, type ProductLine } from '@/lib/brand-media';
import type { SiteImage } from '@/lib/images';
import { cn } from '@/lib/utils';

const LINE_DOT: Record<ProductLine, string> = { men: 'bg-[#bfe3cb]', women: 'bg-[#f0c3cf]' };

/**
 * Pack photography with a men/women switch (same listed formula, two packs) and thumbnails.
 * The images are renders of the real YHC packs, labelled as such. `lead` is the product's lifestyle
 * slot (P01–P04): the page passes it only once the generated image is ready, and it then comes first.
 */
export function ProductGallery({
  lines,
  name,
  lead,
}: {
  lines: Partial<Record<ProductLine, SiteImage[]>>;
  name: string;
  lead?: SiteImage;
}) {
  const available = (Object.keys(LINE_LABEL) as ProductLine[]).filter((l) => (lines[l]?.length ?? 0) > 0);
  const [line, setLine] = useState<ProductLine>(available[0] ?? 'men');
  const [active, setActive] = useState(0);
  const packs = lines[line] ?? [];
  const images = lead ? [lead, ...packs] : packs;
  const main = images[active] ?? images[0];
  if (!main) return null;
  const isPack = main !== lead;

  return (
    <div>
      {available.length > 1 ? (
        <div
          role="group"
          aria-label={`${name} packs`}
          className="mb-3 inline-flex rounded-full bg-mist p-1 text-[14px] font-medium"
        >
          {available.map((l) => (
            <button
              key={l}
              type="button"
              aria-pressed={l === line}
              onClick={() => {
                setLine(l);
                setActive(0);
              }}
              className={cn(
                'inline-flex min-h-10 items-center gap-2 rounded-full px-4 transition-colors',
                l === line ? 'bg-obsidian text-on-dark shadow-card' : 'text-body hover:text-ink',
              )}
            >
              <span aria-hidden className={cn('size-2.5 rounded-full', LINE_DOT[l])} />
              {LINE_LABEL[l]}
            </button>
          ))}
        </div>
      ) : null}

      <div className="group relative aspect-[4/5] overflow-hidden rounded-[28px] bg-obsidian">
        <Image
          key={main.src}
          src={main.src}
          alt={main.alt}
          fill
          priority
          sizes="(min-width: 768px) 50vw, 100vw"
          className="animate-in object-cover transition-transform duration-500 fade-in group-hover:scale-[1.03] motion-reduce:animate-none motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
        {isPack ? (
          <span className="absolute bottom-3 left-3 rounded-full bg-black/55 px-2.5 py-1 text-[12px] text-white/85 backdrop-blur">
            Pack render
          </span>
        ) : null}
      </div>

      {images.length > 1 ? (
        <div
          className={cn('mt-3 grid gap-2 sm:gap-3', images.length > 5 ? 'grid-cols-6' : 'grid-cols-5')}
          role="group"
          aria-label={`${name} images`}
        >
          {images.map((img, i) => (
            <button
              key={img.src}
              type="button"
              onClick={() => setActive(i)}
              aria-pressed={i === active}
              aria-label={`Show image ${i + 1} of ${images.length}`}
              className={cn(
                'relative aspect-square overflow-hidden rounded-lg bg-obsidian ring-1 transition',
                i === active ? 'ring-2 ring-ink' : 'opacity-80 ring-line hover:opacity-100 hover:ring-steel',
              )}
            >
              <Image
                src={img.src}
                alt=""
                fill
                sizes="(min-width: 768px) 10vw, 20vw"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
