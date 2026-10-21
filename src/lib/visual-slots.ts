import { GENERATED_IMAGES } from '@/lib/generated-images';
import type { SiteImage } from '@/lib/images';

/*
 * Image slots (YHC_IMAGE_PROMPTS.md). Every visual on the site that waits for a client-generated
 * image is a slot with an ID (H01, P02, C03 …). Until the image exists in public/media/gen, the slot
 * shows its temporary fallback; `scripts/add-generated-images.mjs` switches it on automatically.
 * `illustrative` slots show people or doctor scenes and must carry an "Illustrative image" chip.
 */

export interface VisualSlot extends SiteImage {
  id: string;
  /** True once the generated image is on the site. */
  ready: boolean;
  /** People / doctor scenes: show an "Illustrative image" chip where the image is shown large. */
  illustrative: boolean;
}

export function slot(
  id: string,
  alt: string,
  fallback: SiteImage,
  opts: { illustrative?: boolean } = {},
): VisualSlot {
  const gen = GENERATED_IMAGES[id];
  return gen
    ? { id, src: `/media/gen/${id}.webp`, width: gen.width, height: gen.height, alt, ready: true, illustrative: Boolean(opts.illustrative) }
    : { ...fallback, id, alt: fallback.alt, ready: false, illustrative: false };
}
