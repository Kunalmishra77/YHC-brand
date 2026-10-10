import { cn } from '@/lib/utils';

export type GuideVariant = 'front' | 'crown' | 'parting' | 'closeup';

/**
 * Decorative line drawings for the scan intro and analysis screens (platinum strokes on the dark
 * stage). The per-zone capture guidance lives in ./scan/head-diagrams.tsx.
 */
export function AngleGuide({ angle, className }: { angle: GuideVariant; className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={cn('pointer-events-none', className)}
      aria-hidden
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* framing corners */}
      <g stroke="rgba(230,232,236,0.55)" strokeWidth="2">
        <path d="M18 42V18h24M182 42V18h-24M18 158v24h24M182 158v24h-24" />
      </g>
      {angle === 'front' ? (
        <g stroke="rgba(230,232,236,0.9)" strokeWidth="1.6">
          {/* face oval + hairline band */}
          <ellipse cx="100" cy="112" rx="46" ry="60" strokeDasharray="5 5" />
          <path d="M58 92c8-34 76-38 84 0" />
          <path d="M66 80c-5 9-7 16-7 24M134 80c5 9 7 16 7 24" opacity="0.7" />
          <path d="M72 70c18-10 38-10 56 0" strokeDasharray="2 4" opacity="0.8" />
          <text x="100" y="40" fill="rgba(230,232,236,0.75)" fontSize="9" textAnchor="middle" stroke="none">
            Hairline inside the band
          </text>
        </g>
      ) : null}
      {angle === 'crown' ? (
        <g stroke="rgba(230,232,236,0.9)" strokeWidth="1.6">
          {/* top-down head + crown whorl */}
          <ellipse cx="100" cy="104" rx="58" ry="68" strokeDasharray="5 5" />
          <path d="M100 104c7-2 9-9 4-14s-16-3-18 6 5 20 16 20 23-9 23-23-12-27-29-27" />
          <circle cx="100" cy="104" r="3" fill="rgba(230,232,236,0.9)" stroke="none" />
          <text x="100" y="196" fill="rgba(230,232,236,0.75)" fontSize="9" textAnchor="middle" stroke="none">
            Crown centred, from above
          </text>
        </g>
      ) : null}
      {angle === 'parting' ? (
        <g stroke="rgba(230,232,236,0.9)" strokeWidth="1.6">
          <ellipse cx="100" cy="100" rx="52" ry="70" strokeDasharray="5 5" />
          <path d="M100 32v136" />
          <path
            d="M100 52l-14 6M100 74l-16 6M100 96l-16 6M100 118l-14 6M100 52l14 6M100 74l16 6M100 96l16 6M100 118l14 6"
            opacity="0.7"
          />
          <text x="100" y="194" fill="rgba(230,232,236,0.75)" fontSize="9" textAnchor="middle" stroke="none">
            Parting line straight down the middle
          </text>
        </g>
      ) : null}
      {angle === 'closeup' ? (
        <g stroke="rgba(230,232,236,0.9)" strokeWidth="1.6">
          <circle cx="100" cy="100" r="62" strokeDasharray="5 5" />
          <circle cx="100" cy="100" r="34" opacity="0.6" />
          {/* follicle dots */}
          {[
            [86, 88],
            [100, 82],
            [114, 90],
            [92, 104],
            [108, 106],
            [98, 118],
            [118, 116],
            [80, 112],
          ].map(([x, y]) => (
            <g key={`${x}-${y}`}>
              <circle cx={x} cy={y} r="1.8" fill="rgba(230,232,236,0.9)" stroke="none" />
              <path d={`M${x} ${y}l4 -9`} opacity="0.75" />
            </g>
          ))}
          <text x="100" y="186" fill="rgba(230,232,236,0.75)" fontSize="9" textAnchor="middle" stroke="none">
            Hold 10 cm from the thinnest area
          </text>
        </g>
      ) : null}
    </svg>
  );
}
