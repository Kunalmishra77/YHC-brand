'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
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

/**
 * Muted, looping, decorative b-roll that fills its (relative) parent. The poster image always renders
 * underneath, so reduced-motion visitors, slow networks and no-JS all get a still frame instead.
 */
export function BackgroundVideo({
  video,
  priority = false,
  className,
  objectPosition = 'center',
}: {
  video: SiteVideo;
  priority?: boolean;
  className?: string;
  objectPosition?: string;
}) {
  const reduced = usePrefersReducedMotion();
  return (
    <div className={cn('absolute inset-0 overflow-hidden', className)} aria-hidden>
      <Image
        src={video.poster}
        alt=""
        fill
        priority={priority}
        sizes="100vw"
        className="object-cover"
        style={{ objectPosition }}
      />
      {reduced ? null : (
        <video
          className="absolute inset-0 size-full object-cover"
          style={{ objectPosition }}
          src={video.src}
          poster={video.poster}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          disablePictureInPicture
          tabIndex={-1}
        />
      )}
    </div>
  );
}
