import { describe, expect, it } from "vitest";
import { strayInk, traceCoverage } from "./coverage";

function buf(w: number, h: number, fill: (x: number, y: number) => boolean) {
  const a = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (fill(x, y)) a[(y * w + x) * 4 + 3] = 255;
  return a;
}

describe("trace coverage", () => {
  const W = 60, H = 60;
  const guide = buf(W, H, (x) => x >= 25 && x < 35); // a vertical bar, like the letter alif
  it("is 0 with no strokes and 1 when the bar is fully inked", () => {
    expect(traceCoverage(guide, buf(W, H, () => false), W, H, 1)).toBe(0);
    expect(traceCoverage(guide, buf(W, H, (x) => x >= 20 && x < 40), W, H, 1)).toBe(1);
  });
  it("counts partial tracing proportionally", () => {
    const half = buf(W, H, (x, y) => x >= 20 && x < 40 && y < 30);
    expect(traceCoverage(guide, half, W, H, 1)).toBeCloseTo(0.5, 1);
  });
  it("measures ink outside the letter", () => {
    const scribble = buf(W, H, () => true);
    expect(strayInk(guide, scribble, W, H, 1)).toBeGreaterThan(0.8);
    expect(strayInk(guide, buf(W, H, (x) => x >= 26 && x < 34), W, H, 1)).toBe(0);
  });
});
