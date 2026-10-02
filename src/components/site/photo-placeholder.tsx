import { Camera } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Stand-in for real photography (docs/07 §8: no stock models).
 * TODO(client): doctor portraits and product photography — see docs/12 C / D-P2
 */
export function PhotoPlaceholder({
  caption,
  tone = 'dark',
  shape = 'portrait',
  className,
}: {
  caption: string;
  tone?: 'dark' | 'light';
  shape?: 'portrait' | 'product';
  className?: string;
}) {
  const dark = tone === 'dark';
  return (
    <figure
      role="img"
      aria-label={caption}
      className={cn(
        'relative isolate overflow-hidden rounded-xl',
        dark
          ? 'bg-[linear-gradient(160deg,#3a3d42_0%,#2a2d31_40%,#1c1e21)] ring-1 ring-line-dark'
          : 'bg-[linear-gradient(160deg,#fbfbfa_0%,#e6e7e9_45%,#c9ccd1)] ring-1 ring-line',
        className,
      )}
    >
      <div
        aria-hidden
        className={cn(
          'absolute inset-0 -z-10',
          dark
            ? 'bg-[radial-gradient(ellipse_at_70%_20%,rgba(201,204,209,0.22),transparent_60%)]'
            : 'bg-[radial-gradient(ellipse_at_70%_20%,rgba(255,255,255,0.9),transparent_60%)]',
        )}
      />
      {shape === 'portrait' ? (
        <svg
          aria-hidden
          viewBox="0 0 200 240"
          className={cn(
            'absolute inset-x-0 bottom-0 mx-auto h-[74%] w-auto',
            dark ? 'text-graphite' : 'text-platinum/70',
          )}
          fill="currentColor"
        >
          <circle cx="100" cy="82" r="44" />
          <path d="M14 240c6-58 42-92 86-92s80 34 86 92z" />
        </svg>
      ) : (
        <svg
          aria-hidden
          viewBox="0 0 120 200"
          className={cn(
            'absolute inset-x-0 top-1/2 mx-auto h-[58%] w-auto -translate-y-1/2',
            dark ? 'text-graphite' : 'text-platinum/80',
          )}
          fill="currentColor"
        >
          <rect x="46" y="4" width="28" height="26" rx="4" />
          <rect x="22" y="34" width="76" height="162" rx="18" />
        </svg>
      )}
      <figcaption
        className={cn(
          'absolute inset-x-3 bottom-3 flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[13px]',
          dark ? 'bg-obsidian/70 text-on-dark-muted' : 'bg-card/85 text-muted-foreground',
        )}
      >
        <Camera className="size-3.5 shrink-0" aria-hidden />
        {caption}
      </figcaption>
    </figure>
  );
}
