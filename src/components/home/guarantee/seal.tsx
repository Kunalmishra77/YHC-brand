import { cn } from '@/lib/utils';

/**
 * Decorative engraved seal: a slowly turning ring of text around a fixed centre mark. CSS-only rotation,
 * removed under prefers-reduced-motion. Hidden from assistive tech (the band says it all in text).
 */
export function GuaranteeSeal({ className }: { className?: string }) {
  return (
    <div className={cn('relative aspect-square', className)} aria-hidden>
      <svg
        viewBox="0 0 120 120"
        className="absolute inset-0 size-full text-platinum motion-safe:animate-[spin_48s_linear_infinite]"
        focusable="false"
      >
        <defs>
          <path id="yhc-seal-ring" d="M60 60 m-46 0 a46 46 0 1 1 92 0 a46 46 0 1 1 -92 0" />
        </defs>
        <circle
          cx="60"
          cy="60"
          r="57"
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.35"
          strokeWidth="0.75"
        />
        <circle
          cx="60"
          cy="60"
          r="37"
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.35"
          strokeWidth="0.75"
        />
        <text
          fill="currentColor"
          fontSize="8.4"
          letterSpacing="2.6"
          style={{ fontFamily: 'var(--yhc-font-sans)', fontWeight: 600 }}
        >
          <textPath href="#yhc-seal-ring">MONEY-BACK GUARANTEE · DOCTOR-REVIEWED · </textPath>
        </text>
      </svg>
      <svg viewBox="0 0 120 120" className="absolute inset-0 size-full" focusable="false">
        <defs>
          <linearGradient id="yhc-seal-silver" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#edeef0" />
            <stop offset="0.55" stopColor="#c9ccd1" />
            <stop offset="1" stopColor="#aeb2b8" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r="30" fill="url(#yhc-seal-silver)" />
        <path
          d="M47 61 l9 9 l17 -19"
          fill="none"
          stroke="#121315"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
