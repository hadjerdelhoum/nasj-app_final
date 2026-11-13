/**
 * How much of a letter's shape has the child's finger passed over?
 * Both inputs are RGBA pixel buffers of the same size: `guide` (the glyph filled) and `strokes` (the child's drawing).
 * Returns 0..1: covered guide pixels / guide pixels. Sampled on a grid for speed.
 */
export function traceCoverage(guide: Uint8ClampedArray, strokes: Uint8ClampedArray, width: number, height: number, step = 3): number {
  let total = 0;
  let hit = 0;
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const i = (y * width + x) * 4 + 3;
      if (guide[i] > 120) {
        total++;
        if (strokes[i] > 20) hit++;
      }
    }
  }
  return total === 0 ? 0 : hit / total;
}

/** Share of the child's ink that is OUTSIDE the letter (used to avoid rewarding scribbling over everything). */
export function strayInk(guide: Uint8ClampedArray, strokes: Uint8ClampedArray, width: number, height: number, step = 3): number {
  let ink = 0;
  let stray = 0;
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const i = (y * width + x) * 4 + 3;
      if (strokes[i] > 20) {
        ink++;
        if (guide[i] <= 120) stray++;
      }
    }
  }
  return ink === 0 ? 0 : stray / ink;
}
