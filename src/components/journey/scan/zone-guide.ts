import type { CaptureZone } from '@/lib/journey/types';

/** Per-zone capture guidance for the scan step screen and the camera. */

export const ZONE_TIP: Record<CaptureZone, string> = {
  forehead_left:
    'Push your hair back and hold the phone 10–15 cm from your left temple, camera facing the hairline.',
  forehead_centre: 'Push your hair off your forehead and centre the middle of your hairline in the frame.',
  forehead_right:
    'Push your hair back and hold the phone 10–15 cm from your right temple, camera facing the hairline.',
  top: 'Part the hair on top of your head and hold the phone straight above the mid-scalp.',
  crown: 'Hold the phone above the top-back of your head and centre the swirl — a helper makes it easier.',
  parting: 'Part your hair along your usual line and point the camera straight down at it.',
  back: 'Lift the hair at the back and hold the phone 10–15 cm away. A mirror or a helper helps here.',
};

export interface DiagramPoint {
  x: number;
  y: number;
}

/**
 * Where the zone sits on the three line-art heads (viewBox 0 0 100 110). `side` uses the
 * left-profile coordinates; the right profile is the same drawing mirrored.
 */
export const ZONE_POINT: Record<
  CaptureZone,
  { side: DiagramPoint | null; sides: 'left' | 'right' | 'both' | 'none'; top: DiagramPoint }
> = {
  forehead_left: { side: { x: 24, y: 32 }, sides: 'left', top: { x: 35, y: 38 } },
  forehead_centre: { side: { x: 20, y: 36 }, sides: 'both', top: { x: 50, y: 32 } },
  forehead_right: { side: { x: 24, y: 32 }, sides: 'right', top: { x: 65, y: 38 } },
  top: { side: { x: 44, y: 18 }, sides: 'both', top: { x: 50, y: 54 } },
  crown: { side: { x: 68, y: 27 }, sides: 'both', top: { x: 52, y: 76 } },
  parting: { side: null, sides: 'none', top: { x: 50, y: 46 } },
  back: { side: { x: 78, y: 57 }, sides: 'both', top: { x: 50, y: 93 } },
};

/** Crop of the macro reference photo per zone, so each step feels distinct. */
export const ZONE_REFERENCE_POSITION: Record<CaptureZone, string> = {
  forehead_left: '20% 40%',
  forehead_centre: '50% 30%',
  forehead_right: '80% 40%',
  top: '50% 50%',
  crown: '60% 70%',
  parting: '45% 50%',
  back: '30% 80%',
};
