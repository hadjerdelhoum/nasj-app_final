/** Pure geometry for the woven bridge, kept separate so it can be unit-tested. */

export const ROWS = 6;
export const COLS = 12;
export const DECK = { x0: 34, x1: 326, y0: 40, rowH: 18, rowGap: 5 };
export const COL_X0 = 44;
export const COL_STEP = 24.5;
export const WARP_W = 9;

export const rowY = (r: number) => DECK.y0 + r * (DECK.rowH + DECK.rowGap);
export const colX = (c: number) => COL_X0 + c * COL_STEP;

/** Plain weave: at every crossing either the warp (vertical) or the weft (horizontal) is on top, alternating. */
export const warpOnTop = (row: number, col: number) => (row + col) % 2 === 0;

export interface Crossing {
  row: number;
  col: number;
}

/** Crossings where the warp thread must be redrawn over the weft of an earned row. */
export function overCrossings(earnedRows: boolean[]): Crossing[] {
  const out: Crossing[] = [];
  for (let r = 0; r < earnedRows.length; r++) {
    if (!earnedRows[r]) continue;
    for (let c = 0; c < COLS; c++) if (warpOnTop(r, c)) out.push({ row: r, col: c });
  }
  return out;
}

/** Maps a universe's activities (by position 1..6) + the set of earned thread reward ids to filled rows. */
export function earnedRows(universeId: string, earned: Set<string>): boolean[] {
  return Array.from({ length: ROWS }, (_, i) => earned.has(`thread-${universeId}-${i + 1}`));
}
