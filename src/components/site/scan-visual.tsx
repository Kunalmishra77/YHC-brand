import Image from 'next/image';
import { CLINICAL } from '@/lib/images';
import { cn } from '@/lib/utils';

/**
 * Decorative "3D scan" illustration: a macro hair photograph with a scanning overlay. It illustrates the
 * idea of looking at roots first — it is not a real scan output and is labelled as an illustration.
 */
export function ScanVisual({ className }: { className?: string }) {
  const img = CLINICAL.scalpPartingPortrait;
  return (
    <figure
      className={cn(
        'relative aspect-[4/5] overflow-hidden rounded-3xl bg-ink-2 ring-1 ring-line-dark',
        className,
      )}
    >
      <Image
        src={img.src}
        alt={img.alt}
        fill
        sizes="(min-width: 768px) 45vw, 100vw"
        className="object-cover opacity-80"
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/30 to-obsidian/40"
        aria-hidden
      />

      {/* Measurement grid + rings */}
      <svg
        viewBox="0 0 400 500"
        className="absolute inset-0 size-full"
        aria-hidden
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <pattern id="scan-grid" width="25" height="25" patternUnits="userSpaceOnUse">
            <path d="M25 0 L0 0 0 25" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="400" height="500" fill="url(#scan-grid)" />
        <circle cx="200" cy="230" r="118" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1" />
        <circle
          cx="200"
          cy="230"
          r="78"
          fill="none"
          stroke="rgba(255,255,255,0.2)"
          strokeDasharray="4 6"
          strokeWidth="1"
        />
        <path
          d="M200 92 L200 112 M200 348 L200 368 M62 230 L82 230 M318 230 L338 230"
          stroke="rgba(255,255,255,0.6)"
          strokeWidth="1.5"
        />
        {[
          [168, 196],
          [236, 214],
          [204, 262],
          [150, 254],
          [252, 168],
        ].map(([x, y]) => (
          <g key={`${x}-${y}`}>
            <circle cx={x} cy={y} r="9" fill="none" stroke="rgba(160,190,220,0.9)" strokeWidth="1.25" />
            <circle cx={x} cy={y} r="2.5" fill="rgba(200,220,240,1)" />
          </g>
        ))}
      </svg>

      {/* Scanning line */}
      <div
        className="absolute inset-x-6 top-[18%] h-px animate-[yhc-scan_4.5s_ease-in-out_infinite_alternate] bg-gradient-to-r from-transparent via-platinum to-transparent shadow-[0_0_18px_2px_rgba(201,204,209,0.45)] motion-reduce:animate-none"
        aria-hidden
      />
      <style>{`@keyframes yhc-scan { from { top: 18%; } to { top: 70%; } }`}</style>

      <div className="absolute top-4 left-4 rounded-full bg-black/45 px-3 py-1 text-[11px] font-medium text-on-dark backdrop-blur">
        Illustration · not a scan result
      </div>
      <figcaption className="absolute inset-x-4 bottom-4 grid grid-cols-2 gap-2 text-[12px] text-on-dark sm:inset-x-6 sm:bottom-6">
        {[
          ['Roots', 'located'],
          ['Density', 'mapped by zone'],
          ['Follicles', 'checked for activity'],
          ['Next', 'doctor review'],
        ].map(([k, v]) => (
          <span key={k} className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 backdrop-blur-md">
            <span className="block text-on-dark-muted">{k}</span>
            {v}
          </span>
        ))}
      </figcaption>
    </figure>
  );
}
