'use client';

import { Pause, Play } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { t } from '@/i18n/en';
import type { SiteVideo } from '@/lib/images';
import { cn } from '@/lib/utils';

/** True when the visitor asked the OS for less motion (re-evaluated if they change it). */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return reduced;
}

/** Distance outside the viewport at which a below-the-fold video starts loading. */
const NEAR_MARGIN = '200px';

/**
 * Muted, looping, decorative b-roll that fills its (relative) parent. The poster image always renders
 * underneath, so reduced-motion visitors, slow networks and no-JS all get a still frame instead.
 *
 * - WCAG 2.2.2: a visible Pause/Play button (44×44) sits in a corner of the video area. It is rendered
 *   outside the decorative layer, in the parent's stacking context, so it stays above the overlays.
 * - Reduced motion: never autoplays — the poster shows and the button offers Play.
 * - Loading: the <video> (and so its `src`) only exists once the area is within 200 px of the viewport —
 *   immediately after hydration for above-the-fold heroes (`eager` then preloads the whole file).
 *   Playback pauses whenever the area scrolls out of view and resumes when it returns (unless the
 *   visitor paused). WebM (VP9) is offered first, H.264 MP4 as the fallback.
 */
export function BackgroundVideo({
  video,
  priority = false,
  eager = priority,
  className,
  objectPosition = 'center',
  controlsPosition = 'bottom-right',
}: {
  video: SiteVideo;
  /** Preload the poster image (above-the-fold). Also makes the video eager unless `eager` is set. */
  priority?: boolean;
  /** Above-the-fold: preload the whole file once mounted (it mounts on first paint, being in view). */
  eager?: boolean;
  className?: string;
  objectPosition?: string;
  /** Corner for the Pause/Play button — pick the one that doesn't collide with overlaid content. */
  controlsPosition?: 'bottom-right' | 'top-right';
}) {
  const reduced = usePrefersReducedMotion();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [near, setNear] = useState(false);
  const [inView, setInView] = useState(false);
  /** The visitor's explicit choice; `null` follows the default (play unless reduced motion). */
  const [userPaused, setUserPaused] = useState<boolean | null>(null);
  const paused = userPaused ?? reduced;
  /** Once the video has been mounted it stays mounted (no re-download after pausing). */
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    // Above-the-fold (eager) areas intersect on the observer's first callback, straight after hydration.
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        setInView(entry.isIntersecting);
        if (entry.isIntersecting) setNear(true);
      },
      { rootMargin: NEAR_MARGIN },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  if (near && !paused && !mounted) setMounted(true);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (inView && !paused) {
      v.play().catch(() => {
        /* autoplay refused (e.g. data saver) — the poster stays visible */
      });
    } else {
      v.pause();
    }
  }, [mounted, inView, paused]);

  return (
    <>
      <div ref={wrapperRef} className={cn('absolute inset-0 overflow-hidden', className)} aria-hidden>
        <Image
          src={video.poster}
          alt=""
          fill
          priority={priority}
          sizes="100vw"
          className="object-cover"
          style={{ objectPosition }}
        />
        {mounted ? (
          <video
            ref={videoRef}
            className="absolute inset-0 size-full object-cover"
            style={{ objectPosition }}
            poster={video.poster}
            muted
            loop
            playsInline
            preload={eager ? 'auto' : 'metadata'}
            disablePictureInPicture
            tabIndex={-1}
          >
            {video.webm ? <source src={video.webm} type="video/webm" /> : null}
            <source src={video.src} type="video/mp4" />
          </video>
        ) : null}
      </div>
      <button
        type="button"
        onClick={() => setUserPaused(!paused)}
        aria-label={paused ? t('common.playVideo') : t('common.pauseVideo')}
        className={cn(
          'absolute right-3 z-10 inline-flex size-11 items-center justify-center rounded-full border border-white/25 bg-obsidian/60 text-on-dark backdrop-blur-sm transition-colors hover:bg-obsidian/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:right-5',
          controlsPosition === 'top-right' ? 'top-3 sm:top-5' : 'bottom-3 sm:bottom-5',
        )}
      >
        {paused ? (
          <Play className="size-4 translate-x-px" aria-hidden />
        ) : (
          <Pause className="size-4" aria-hidden />
        )}
      </button>
    </>
  );
}
