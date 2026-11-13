import { useId } from "react";
import { THREAD_COLORS } from "../worlds/worlds";
import { COLS, DECK, ROWS, WARP_W, colX, overCrossings, rowY } from "./weave";

interface Props {
  /** One entry per activity (6): is its thread woven yet? */
  rows: boolean[];
  /** Row index that was JUST earned: it weaves in with an animation. */
  fresh?: number;
  /** All six rows done: adds the golden finish. */
  complete?: boolean;
  label?: string;
  className?: string;
}

/**
 * The NASJ signature mechanic: each completed activity weaves one coloured thread into a bridge.
 * Plain SVG: vertical warp threads, coloured weft threads, and the warp redrawn over the weft at alternating crossings.
 */
export function WovenBridge({ rows, fresh, complete, label, className = "" }: Props) {
  const uid = useId().replace(/:/g, "");
  const warpTop = 28;
  const warpBottom = rowY(ROWS - 1) + DECK.rowH + 8;
  const over = overCrossings(rows);
  const deckW = DECK.x1 - DECK.x0;

  return (
    <svg viewBox="0 0 360 200" className={`bridge ${complete ? "bridge--complete" : ""} ${className}`} role="img" aria-label={label}>
      <defs>
        <pattern id={`tw${uid}`} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(38)">
          <rect width="1.7" height="6" fill="#fff" fillOpacity=".34" />
        </pattern>
        <linearGradient id={`rope${uid}`} x1="0" x2="1">
          <stop offset="0" stopColor="#F6B93B" />
          <stop offset=".33" stopColor="#F26B6B" />
          <stop offset=".66" stopColor="#17908A" />
          <stop offset="1" stopColor="#A57BD0" />
        </linearGradient>
      </defs>

      {/* posts */}
      {[6, 336].map((x) => (
        <g key={x}>
          <rect x={x} y="22" width="18" height="160" rx="9" fill="#C99C70" />
          <rect x={x + 3} y="26" width="4" height="150" rx="2" fill="#fff" fillOpacity=".25" />
          {[48, 88, 128].map((y) => (
            <ellipse key={y} cx={x + 9} cy={y} rx="11" ry="3.5" fill="none" stroke={`url(#rope${uid})`} strokeWidth="3" />
          ))}
        </g>
      ))}
      {/* hand-ropes */}
      <path d="M15 24 Q180 -6 345 24" fill="none" stroke={`url(#rope${uid})`} strokeWidth="4.5" strokeLinecap="round" strokeDasharray="9 3.5" />

      {/* warp threads (the loom frame) */}
      {Array.from({ length: COLS }, (_, c) => (
        <rect key={c} x={colX(c) - WARP_W / 2} y={warpTop} width={WARP_W} height={warpBottom - warpTop} rx={WARP_W / 2} fill="#D7ECE7" stroke="#A9D4CB" strokeWidth=".8" />
      ))}

      {/* weft threads */}
      {Array.from({ length: ROWS }, (_, r) => {
        const y = rowY(r);
        if (!rows[r]) {
          return (
            <rect key={r} x={DECK.x0} y={y} width={deckW} height={DECK.rowH} rx={DECK.rowH / 2} fill="none" stroke="#D8CBB3" strokeWidth="1.6" strokeDasharray="5 5" opacity=".9" />
          );
        }
        const isFresh = fresh === r;
        return (
          <g key={r} className={isFresh ? "weft weft--fresh" : "weft"}>
            <line x1={DECK.x0 + DECK.rowH / 2} x2={DECK.x1 - DECK.rowH / 2} y1={y + DECK.rowH / 2} y2={y + DECK.rowH / 2}
              stroke={THREAD_COLORS[r]} strokeWidth={DECK.rowH} strokeLinecap="round" pathLength={1} />
            <line x1={DECK.x0 + DECK.rowH / 2} x2={DECK.x1 - DECK.rowH / 2} y1={y + DECK.rowH / 2} y2={y + DECK.rowH / 2}
              stroke={`url(#tw${uid})`} strokeWidth={DECK.rowH} strokeLinecap="round" pathLength={1} />
          </g>
        );
      })}

      {/* warp over weft at alternating crossings => the woven look */}
      {over.map(({ row, col }) => (
        <rect key={`${row}-${col}`} x={colX(col) - WARP_W / 2} y={rowY(row) - 1.5} width={WARP_W} height={DECK.rowH + 3} rx={WARP_W / 2}
          fill="#E6F4F0" stroke="#A9D4CB" strokeWidth=".8" className={fresh === row ? "warp-over warp-over--late" : "warp-over"} />
      ))}

      {complete && <path d="M180 8l4 9 10 1-7.5 6.5 2.5 9.7L180 29l-9 5.2 2.5-9.7L166 18l10-1z" fill="#F6C244" stroke="#fff" strokeWidth="1.5" className="bridge__star" />}
      <title>{label}</title>
    </svg>
  );
}

/** Six little stitches: a compact progress display for a universe. */
export function StitchBar({ done, total = 6, className = "" }: { done: boolean[] | number; total?: number; className?: string }) {
  const n = Array.isArray(done) ? done.length : total;
  return (
    <span className={`stitches ${className}`} aria-hidden="true">
      {Array.from({ length: n }, (_, i) => {
        const on = Array.isArray(done) ? done[i] : i < done;
        return <i key={i} className={on ? "on" : ""} style={on ? { background: THREAD_COLORS[i % THREAD_COLORS.length] } : undefined} />;
      })}
    </span>
  );
}
