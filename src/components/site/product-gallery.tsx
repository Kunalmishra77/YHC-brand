'use client';

import Image from 'next/image';
import { useState } from 'react';
import type { SiteImage } from '@/lib/images';
import { cn } from '@/lib/utils';

/** Main image + thumbnails. Concept imagery until product photography arrives (ADR-25). */
export function ProductGallery({ images, name }: { images: SiteImage[]; name: string }) {
  const [active, setActive] = useState(0);
  const main = images[active] ?? images[0];
  if (!main) return null;
  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#efeeeb]">
        <Image
          key={main.src}
          src={main.src}
          alt={main.alt}
          fill
          priority
          sizes="(min-width: 768px) 50vw, 100vw"
          className="animate-in object-cover duration-300 fade-in motion-reduce:animate-none"
        />
        <span className="absolute bottom-3 left-3 rounded-full bg-white/75 px-2.5 py-1 text-[12px] text-body backdrop-blur">
          Concept image
        </span>
      </div>
      {images.length > 1 ? (
        <div className="mt-3 grid grid-cols-3 gap-3" role="group" aria-label={`${name} images`}>
          {images.map((img, i) => (
            <button
              key={img.src}
              type="button"
              onClick={() => setActive(i)}
              aria-pressed={i === active}
              aria-label={`Show image ${i + 1}`}
              className={cn(
                'relative aspect-square overflow-hidden rounded-lg ring-1 transition',
                i === active ? 'ring-2 ring-ink' : 'ring-line hover:ring-steel',
              )}
            >
              <Image src={img.src} alt="" fill sizes="20vw" className="object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
