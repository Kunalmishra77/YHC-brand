import { ANGLE_LABEL } from '@/lib/journey/labels';
import type { CaptureZone } from '@/lib/journey/types';
import { cn } from '@/lib/utils';
import styles from '../journey.module.css';
import { type DiagramPoint, ZONE_POINT } from './zone-guide';

/*
 * Three small line-art heads (left side, top, right side) with a highlighted dot on the zone to scan.
 * Left profile faces left (the patient's left side); the top view has the face at the top.
 */

const PROFILE =
  'M60 106 L58 90 C70 86 80 74 80 56 C80 32 64 14 44 14 C27 14 17 27 17 42 C17 46 16 49 14 53 L10 60 C9 62 10 63 12 63 L15 63 L15 69 C15 71 16 72 17 72 L16 75 C16 77 18 78 19 78 C18 81 19 84 23 84 L30 84 L32 90 L30 106';
const PROFILE_EAR = 'M50 52 C55 50 58 54 57 59 C56 64 52 65 50 63';
const PROFILE_HAIRLINE = 'M19 36 C24 28 32 26 38 30 C42 34 44 44 46 52';

function Dot({ point }: { point: DiagramPoint }) {
  return (
    <g>
      <circle cx={point.x} cy={point.y} r="9" className={cn('fill-obsidian/15', styles.pulse)} />
      <circle cx={point.x} cy={point.y} r="4.5" className="fill-obsidian stroke-pearl" strokeWidth="1.5" />
    </g>
  );
}

function Profile({ point, mirrored }: { point: DiagramPoint | null; mirrored?: boolean }) {
  return (
    <g transform={mirrored ? 'translate(100 0) scale(-1 1)' : undefined}>
      <path d={PROFILE} className="fill-mist stroke-steel" strokeWidth="1.6" />
      <path d={PROFILE_HAIRLINE} className="stroke-steel" strokeWidth="1.4" strokeDasharray="3 3" />
      <path d={PROFILE_EAR} className="stroke-steel" strokeWidth="1.4" />
      {point ? <Dot point={point} /> : null}
    </g>
  );
}

function TopView({ point, parting }: { point: DiagramPoint; parting: boolean }) {
  return (
    <g>
      <path d="M46 22 L50 14 L54 22" className="fill-mist stroke-steel" strokeWidth="1.4" />
      <ellipse cx="20" cy="60" rx="3.5" ry="8" className="fill-mist stroke-steel" strokeWidth="1.4" />
      <ellipse cx="80" cy="60" rx="3.5" ry="8" className="fill-mist stroke-steel" strokeWidth="1.4" />
      <ellipse cx="50" cy="58" rx="30" ry="38" className="fill-mist stroke-steel" strokeWidth="1.6" />
      <path d="M30 40 C38 30 62 30 70 40" className="stroke-steel" strokeWidth="1.4" strokeDasharray="3 3" />
      <path
        d="M50 34 L50 70"
        className={parting ? 'stroke-obsidian' : 'stroke-steel'}
        strokeWidth={parting ? 2.4 : 1.2}
        strokeDasharray={parting ? undefined : '2 3'}
      />
      <path d="M52 76 c3 -1 4 -4 1 -6 s-7 0 -7 4 3 7 7 7" className="stroke-steel" strokeWidth="1.3" />
      <Dot point={point} />
    </g>
  );
}

export function HeadDiagrams({ zone, className }: { zone: CaptureZone; className?: string }) {
  const p = ZONE_POINT[zone];
  const showLeft = p.sides === 'left' || p.sides === 'both';
  const showRight = p.sides === 'right' || p.sides === 'both';
  const views = [
    {
      key: 'left',
      label: 'Left side',
      node: <Profile point={showLeft ? p.side : null} />,
    },
    { key: 'top', label: 'Top', node: <TopView point={p.top} parting={zone === 'parting'} /> },
    {
      key: 'right',
      label: 'Right side',
      node: <Profile point={showRight ? p.side : null} mirrored />,
    },
  ];
  return (
    <figure
      role="img"
      aria-label={`Where to scan: ${ANGLE_LABEL[zone]}, marked on drawings of the left side, top and right side of the head`}
      className={cn('grid grid-cols-3 gap-2', className)}
    >
      {views.map((v) => (
        <div key={v.key} className="flex flex-col items-center">
          <svg
            viewBox="0 0 100 110"
            className="h-auto w-full max-w-[104px]"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            {v.node}
          </svg>
          <span
            className="mt-1 text-[11px] font-medium tracking-wide text-muted-foreground uppercase"
            aria-hidden
          >
            {v.label}
          </span>
        </div>
      ))}
    </figure>
  );
}
