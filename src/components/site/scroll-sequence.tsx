'use client';

import { type MotionValue, useMotionValueEvent } from 'motion/react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

/*
 * Scroll-scrubbed image sequence (ADR-35) — the technique used by the showcase templates (Halden,
 * Meridian, Aurelune): a short film is exported to frames (scripts/video-to-frames.mjs →
 * public/media/seq/<name>/frame_0001.webp + manifest.json) and drawn on a canvas as `progress` goes 0→1.
 * Until the frames exist (or with reduced motion) the `poster` image is shown instead, so a section can
 * ship now and upgrade the moment the client's video arrives.
 */

export interface SequenceManifest {
  count: number;
  ext: string;
  width: number;
  height: number;
  pad: number;
  prefix: string;
}

export function ScrollSequence({
  name,
  progress,
  poster,
  className,
  fit = 'cover',
}: {
  /** Folder under /media/seq. */
  name: string;
  /** 0 → 1, usually from useScroll on a pinned section. */
  progress: MotionValue<number>;
  /** Shown until frames load, or always under reduced motion. */
  poster: { src: string; alt: string };
  className?: string;
  fit?: 'cover' | 'contain';
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const frames = useRef<HTMLImageElement[]>([]);
  const [manifest, setManifest] = useState<SequenceManifest | null>(null);
  const [ready, setReady] = useState(false);
  const last = useRef(-1);

  // Download frames only when the section is within ~1.5 screens (keeps first load light).
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e?.isIntersecting) { setNear(true); io.disconnect(); } }, { rootMargin: '150% 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!near) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let cancelled = false;
    fetch(`/media/seq/${name}/manifest.json`)
      .then((r) => (r.ok ? (r.json() as Promise<SequenceManifest>) : null))
      .then((m) => {
        if (!m || cancelled) return;
        setManifest(m);
        const list: HTMLImageElement[] = [];
        let loaded = 0;
        for (let i = 1; i <= m.count; i++) {
          const img = new window.Image();
          img.decoding = 'async';
          img.src = `/media/seq/${name}/${m.prefix}${String(i).padStart(m.pad, '0')}.${m.ext}`;
          img.onload = () => {
            loaded++;
            if (i === 1 || loaded > m.count * 0.25) setReady(true);
          };
          list.push(img);
        }
        frames.current = list;
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [name, near]);

  const draw = (p: number) => {
    const canvas = canvasRef.current;
    const m = manifest;
    if (!canvas || !m) return;
    const idx = Math.min(m.count - 1, Math.max(0, Math.round(p * (m.count - 1))));
    // nearest loaded frame at or before idx
    let i = idx;
    while (i > 0 && !frames.current[i]?.complete) i--;
    const img = frames.current[i];
    if (!img?.complete || i === last.current) return;
    last.current = i;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { width: cw, height: ch } = canvas;
    const scale = fit === 'cover' ? Math.max(cw / m.width, ch / m.height) : Math.min(cw / m.width, ch / m.height);
    const w = m.width * scale;
    const h = m.height * scale;
    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !ready) return;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      last.current = -1;
      draw(progress.get());
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- draw reads refs; re-run only when ready
  }, [ready]);

  useMotionValueEvent(progress, 'change', (p) => {
    if (ready) draw(p);
  });

  return (
    <div ref={rootRef} className={cn('relative overflow-hidden', className)}>
      <Image
        src={poster.src}
        alt={poster.alt}
        fill
        sizes="100vw"
        priority
        className={cn('object-cover transition-opacity duration-700', ready && 'opacity-0')}
      />
      <canvas ref={canvasRef} aria-hidden className={cn('absolute inset-0 size-full', !ready && 'invisible')} />
    </div>
  );
}
