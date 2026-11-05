import { describe, expect, it } from 'vitest';
import { analysePixels } from './analyse';

const W = 64;
const H = 64;
type Rgb = [number, number, number];

/** Build an image from a per-pixel colour function. */
function image(fn: (x: number, y: number) => Rgb) {
  const data = new Uint8ClampedArray(W * H * 4);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const [r, g, b] = fn(x, y);
      const i = (y * W + x) * 4;
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
      data[i + 3] = 255;
    }
  return { data, width: W, height: H };
}

const SKIN: Rgb = [196, 140, 110]; // medium skin tone (in the YCrCb range)
const SHINY_SKIN: Rgb = [250, 215, 195]; // bright highlight on skin
const HAIR: Rgb = [28, 24, 22]; // dark hair

describe('analysePixels', () => {
  it('flags a flat, featureless photo as blurry', () => {
    const r = analysePixels(image(() => SKIN));
    expect(r.ok).toBe(false);
    expect(r.issue).toBe('blurry');
  });

  it('flags a very dark photo', () => {
    const r = analysePixels(image(() => [10, 10, 10]));
    expect(r.issue).toBe('too_dark');
  });

  it('dense hair: high cover', () => {
    // fine strands of hair with a little scalp showing every 6th column
    const r = analysePixels(image((x) => (x % 6 === 0 ? SKIN : HAIR)));
    expect(r.ok).toBe(true);
    expect(r.cover).toBeGreaterThan(0.75);
  });

  it('bare shiny scalp: no cover, high shine', () => {
    // skin with bright highlight stripes (texture keeps it sharp)
    const r = analysePixels(image((x, y) => ((x + y) % 4 === 0 ? SHINY_SKIN : SKIN)));
    expect(r.ok).toBe(true);
    expect(r.cover).toBeLessThan(0.05);
    expect(r.shine).toBeGreaterThan(0.18);
  });

  it('thinning: hair and scalp in between', () => {
    const r = analysePixels(image((x) => (x % 2 === 0 ? SKIN : HAIR)));
    expect(r.ok).toBe(true);
    expect(r.cover).toBeGreaterThan(0.3);
    expect(r.cover).toBeLessThan(0.7);
  });

  it('a photo of something else (a blue wall with texture) is not scalp', () => {
    const r = analysePixels(image((x, y) => ((x + y) % 3 === 0 ? [90, 130, 210] : [70, 110, 190])));
    expect(r.ok).toBe(false);
    expect(r.issue).toBe('not_scalp');
  });
});
