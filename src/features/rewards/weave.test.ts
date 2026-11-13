import { describe, expect, it } from "vitest";
import { COLS, earnedRows, overCrossings, warpOnTop } from "./weave";

describe("weave geometry", () => {
  it("alternates over/under both along a row and down a column (plain weave)", () => {
    for (let r = 0; r < 6; r++) for (let c = 0; c < COLS - 1; c++) expect(warpOnTop(r, c)).not.toBe(warpOnTop(r, c + 1));
    for (let c = 0; c < COLS; c++) for (let r = 0; r < 5; r++) expect(warpOnTop(r, c)).not.toBe(warpOnTop(r + 1, c));
  });

  it("only produces crossings for earned rows", () => {
    const rows = [true, false, true, false, false, false];
    const cs = overCrossings(rows);
    expect(cs.every((c) => rows[c.row])).toBe(true);
    expect(cs.length).toBe(2 * (COLS / 2));
  });

  it("maps earned thread rewards to rows by activity position", () => {
    const rows = earnedRows("forest", new Set(["thread-forest-1", "thread-forest-3", "thread-letters-2", "badge-first-steps"]));
    expect(rows).toEqual([true, false, true, false, false, false]);
  });
});
