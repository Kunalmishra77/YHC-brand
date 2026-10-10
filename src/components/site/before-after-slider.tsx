'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { cn } from '@/lib/utils';

export interface SliderPhoto {
  src: string;
  alt: string;
}

const clamp = (n: number) => Math.min(100, Math.max(0, n));

/**
 * Drag-to-compare before/after frame. Pointer (mouse, pen, touch) drags anywhere on the image; the handle
 * is a focusable `role="slider"` (arrow keys ±5, Page Up/Down ±20, Home/End). `touch-action: pan-y` keeps
 * vertical page scrolling working on phones while a sideways drag compares the photos.
 */
export function BeforeAfterSlider({
  before,
  after,
  label,
  sizes = '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw',
  priority = false,
  className,
}: {
  before: SliderPhoto;
  after: SliderPhoto;
  /** Accessible name for the slider, e.g. "Compare Patient A, top-front view". */
  label: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
}) {
  const [pos, setPos] = useState(50);
  const [dragging, setDragging] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);

  const moveTo = useCallback((clientX: number) => {
    const rect = frameRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return;
    setPos(clamp(((clientX - rect.left) / rect.width) * 100));
  }, []);

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    moveTo(e.clientX);
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (dragging) moveTo(e.clientX);
  };
  const endDrag = (e: PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    setDragging(false);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const steps: Record<string, number> = {
      ArrowLeft: -5,
      ArrowDown: -5,
      ArrowRight: 5,
      ArrowUp: 5,
      PageDown: -20,
      PageUp: 20,
    };
    let next: number | null = null;
    const step = steps[e.key];
    if (step !== undefined) next = pos + step;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = 100;
    if (next === null) return;
    e.preventDefault();
    setPos(clamp(next));
  };

  const rounded = Math.round(pos);

  return (
    <div
      ref={frameRef}
      className={cn(
        'relative aspect-[4/5] touch-pan-y overflow-hidden rounded-2xl bg-ink-2 select-none',
        dragging ? 'cursor-grabbing' : 'cursor-ew-resize',
        className,
      )}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <Image
        src={after.src}
        alt={after.alt}
        fill
        sizes={sizes}
        priority={priority}
        draggable={false}
        className="pointer-events-none object-cover"
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
      >
        <Image
          src={before.src}
          alt={before.alt}
          fill
          sizes={sizes}
          priority={priority}
          draggable={false}
          className="object-cover"
        />
      </div>

      <span
        className="pointer-events-none absolute top-3 left-3 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-semibold tracking-[0.12em] text-white uppercase backdrop-blur-sm"
        aria-hidden
      >
        Before
      </span>
      <span
        className="pointer-events-none absolute top-3 right-3 rounded-full bg-white/85 px-2.5 py-1 text-[11px] font-semibold tracking-[0.12em] text-ink uppercase backdrop-blur-sm"
        aria-hidden
      >
        After
      </span>

      <div
        className="pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 bg-white/90 shadow-[0_0_0_1px_rgba(0,0,0,0.12)]"
        style={{ left: `${pos}%` }}
        aria-hidden
      />
      <div
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-orientation="horizontal"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={rounded}
        aria-valuetext={`${rounded}% before photo, ${100 - rounded}% after photo`}
        onKeyDown={onKeyDown}
        className="absolute top-1/2 flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-ink shadow-raised ring-1 ring-black/5 transition-transform outline-none focus-visible:ring-4 focus-visible:ring-brand/60 active:scale-95"
        style={{ left: `${pos}%` }}
      >
        <ChevronLeft className="size-4" aria-hidden />
        <ChevronRight className="-ml-1.5 size-4" aria-hidden />
      </div>
    </div>
  );
}
