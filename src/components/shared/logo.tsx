import Image from 'next/image';
import Link from 'next/link';
import { BRAND_LOGO } from '@/lib/brand-media';
import { cn } from '@/lib/utils';

/**
 * The YHC logo (client artwork, 2026-10-18). `tone` picks the version for the surface: `dark` ink on
 * light backgrounds, `light` pearl on dark ones. `adaptive` renders both and lets the site header swap
 * them while it sits over the dark hero (`group/hdr` with `data-dark=true`).
 */
export function Logo({
  tone = 'dark',
  adaptive = false,
  className,
  priority = false,
}: {
  tone?: 'dark' | 'light';
  adaptive?: boolean;
  className?: string;
  priority?: boolean;
}) {
  const img = (variant: 'dark' | 'light', extra?: string) => (
    <Image
      src={BRAND_LOGO[variant].src}
      width={BRAND_LOGO[variant].width}
      height={BRAND_LOGO[variant].height}
      alt=""
      priority={priority}
      sizes="120px"
      className={cn('h-full w-auto', extra)}
    />
  );
  return (
    <Link
      href="/"
      className={cn('inline-flex h-10 shrink-0 items-center rounded-sm md:h-11', className)}
      aria-label="Your Hair Company — home"
    >
      {adaptive ? (
        <>
          {img('dark', 'group-data-[dark=true]/hdr:hidden')}
          {img('light', 'hidden group-data-[dark=true]/hdr:block')}
        </>
      ) : (
        img(tone)
      )}
    </Link>
  );
}
