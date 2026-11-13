import { useMemo, type SVGProps } from "react";

export type IconName =
  | "worlds" | "yarn" | "chat" | "shield" | "gear" | "speaker" | "speakerOff" | "back" | "check" | "lock"
  | "play" | "star" | "music" | "close" | "refresh" | "send" | "logout" | "plus";

function gear(cx: number, cy: number, teeth: number, outer: number, inner: number) {
  const pts: string[] = [];
  const step = (Math.PI * 2) / teeth;
  for (let i = 0; i < teeth; i++) {
    for (const [da, r] of [[-0.42, inner], [-0.2, outer], [0.2, outer], [0.42, inner]] as const) {
      const a = i * step + da * step;
      pts.push(`${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`);
    }
  }
  return `M${pts.join("L")}Z`;
}

const PATHS: Record<Exclude<IconName, "gear" | "star" | "play">, string> = {
  worlds: "M12 3a9 9 0 100 18 9 9 0 000-18zM15.8 8.2l-2.1 5.5-5.5 2.1 2.1-5.5z",
  yarn: "M12 3a9 9 0 100 18 9 9 0 000-18zM4.6 8.6c5 2.2 10 2 14.8-.4M3.4 13.2c5.4 2.4 11.4 2.2 17.2-.4M8.4 4.4c-1.4 6.2-.4 11.4 3.2 16.4",
  chat: "M4 5.5h16v11H9.5L5 20.5v-4H4z",
  shield: "M12 3l8 3v6c0 4.8-3.4 7.9-8 9-4.6-1.1-8-4.2-8-9V6zM9.2 12.2l2 2 3.8-4",
  speaker: "M4 9.5v5h3.8L13 19V5L7.8 9.5zM16.2 9a4.2 4.2 0 010 6M18.6 6.4a8 8 0 010 11.2",
  speakerOff: "M4 9.5v5h3.8L13 19V5L7.8 9.5zM16.5 9.5l5 5M21.5 9.5l-5 5",
  back: "M15 5l-7 7 7 7",
  check: "M5 12.5l4.5 4.5L19 7.5",
  lock: "M6 11h12v9H6zM8.5 11V8a3.5 3.5 0 017 0v3",
  music: "M9 18V6l10-2v12M9 18a3 3 0 11-6 0 3 3 0 016 0zM19 16a3 3 0 11-6 0 3 3 0 016 0z",
  close: "M6 6l12 12M18 6L6 18",
  refresh: "M20 11a8 8 0 10-2.3 5.7M20 4v7h-7",
  send: "M4 12l16-8-6 16-2.5-6.5z",
  logout: "M10 4H5v16h5M14 8l5 4-5 4M19 12H9",
  plus: "M12 5v14M5 12h14",
};

export function Icon({ name, size = 24, ...rest }: { name: IconName; size?: number } & SVGProps<SVGSVGElement>) {
  const g = useMemo(() => gear(12, 12, 8, 9.5, 7), []);
  const common = { width: size, height: size, viewBox: "0 0 24 24", "aria-hidden": true, focusable: false } as const;
  if (name === "play") return <svg {...common} {...rest}><path d="M8 5l11 7-11 7z" fill="currentColor" /></svg>;
  if (name === "star")
    return <svg {...common} {...rest}><path d="M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.5 6.6 19.5l1.2-6L3.3 9.3l6.1-.7z" fill="currentColor" /></svg>;
  if (name === "gear")
    return (
      <svg {...common} {...rest} fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
        <path d={g} />
        <circle cx="12" cy="12" r="2.8" />
      </svg>
    );
  return (
    <svg {...common} {...rest} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={PATHS[name]} />
    </svg>
  );
}
