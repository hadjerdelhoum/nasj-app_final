import { useId, useMemo } from "react";
import { worldMeta } from "./worlds";

/** Scalloped "flower" outline used for the round universe badges on the board. */
function flowerPath(cx: number, cy: number, r: number, amp: number, lobes: number) {
  const pts: string[] = [];
  for (let i = 0; i <= 160; i++) {
    const a = (i / 160) * Math.PI * 2;
    const rr = r + amp * Math.cos(lobes * a);
    pts.push(`${(cx + rr * Math.cos(a)).toFixed(2)},${(cy + rr * Math.sin(a)).toFixed(2)}`);
  }
  return `M${pts.join("L")}Z`;
}

function gearPath(cx: number, cy: number, teeth: number, outer: number, inner: number) {
  const pts: string[] = [];
  const step = (Math.PI * 2) / teeth;
  for (let i = 0; i < teeth; i++) {
    const a = i * step;
    for (const [da, r] of [[-0.22, inner], [-0.12, outer], [0.12, outer], [0.22, inner]] as const) {
      pts.push(`${(cx + r * Math.cos(a + da * step * 2)).toFixed(2)},${(cy + r * Math.sin(a + da * step * 2)).toFixed(2)}`);
    }
  }
  return `M${pts.join("L")}Z`;
}

const LEAF = "M0 -17C-13 -13 -18 -2 -14 10C-9 17 1 17 8 12C16 5 18 -8 14 -16C8 -18 4 -18 0 -17ZM-8 12C-3 3 3 -4 9 -10";
const BOOK = "M-18 -10C-11 -14 -5 -13 0 -9C5 -13 11 -14 18 -10V12C11 8 5 9 0 13C-5 9 -11 8 -18 12ZM0 -9V13";

export function WorldBadge({ id, size = 56 }: { id: string; size?: number }) {
  const w = worldMeta(id);
  const uid = useId().replace(/:/g, "");
  const flower = useMemo(() => flowerPath(50, 50, 41, 3.4, 10), []);
  const gear = useMemo(() => gearPath(0, 0, 8, 19, 14.5), []);
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-hidden="true" className="world-badge">
      <defs>
        <linearGradient id={`g${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={w.banner[0]} />
          <stop offset="1" stopColor={w.banner[1]} />
        </linearGradient>
      </defs>
      <path d={flower} fill={`url(#g${uid})`} stroke="#fff" strokeWidth="2.5" />
      <circle cx="50" cy="50" r="31" fill="none" stroke="#fff" strokeOpacity=".75" strokeWidth="1.6" strokeDasharray="3.5 3" />
      <g fill="#fff" transform="translate(50 50)">
        {id === "letters" && (
          <text y="15" textAnchor="middle" fontSize="42" fontWeight="700" fontFamily="'Noto Sans Arabic', sans-serif">أ</text>
        )}
        {id === "numbers" && (
          <text y="9" textAnchor="middle" fontSize="27" fontWeight="800" fontFamily="Nunito, sans-serif">123</text>
        )}
        {id === "forest" && <path d={LEAF} transform="scale(1.35)" stroke="#fff" strokeOpacity=".0" />}
        {id === "stories" && <path d={BOOK} transform="scale(1.25)" fillOpacity=".95" stroke={w.banner[1]} strokeWidth="1.4" />}
        {id === "inventors" && (
          <>
            <path d={gear} />
            <circle r="7" fill={w.banner[1]} />
          </>
        )}
      </g>
    </svg>
  );
}
