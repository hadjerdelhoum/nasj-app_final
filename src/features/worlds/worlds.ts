import type { ActivitySummary } from "../../app/types";

/** Visual identity of each universe, taken from the reference board (colours, banner, artwork, patch). */
export interface WorldMeta {
  id: string;
  accent: string;
  accentDark: string;
  banner: [string, string];
  tint: [string, string];
  art: string;
  /** CSS object-position so the main island stays centred when the art is cropped. */
  artPos: string;
  patch: string;
  hero?: string; // wide version of the landscape for the universe page header
  artRatio?: number; // width/height of the landscape, so panels show the whole composition
  guide: "nasj" | "papa" | "maman" | "sister" | "brother";
}

export const WORLDS: WorldMeta[] = [
  { id: "letters", accent: "#E8607A", accentDark: "#B93E58", banner: ["#F78FA3", "#E4607C"], tint: ["#FFE6EB", "#FFF4E8"],
    art: "/img/worlds/letters.webp", artPos: "62% 55%", patch: "/img/rewards/patch-letters.svg", guide: "maman" },
  { id: "numbers", accent: "#F0983A", accentDark: "#C26F14", banner: ["#F9BC57", "#EE9234"], tint: ["#FFEDCF", "#FFF8E9"],
    art: "/img/worlds/numbers.webp", artPos: "50% 50%", artRatio: 1060 / 555, hero: "/img/worlds/numbers-wide.webp", patch: "/img/rewards/patch-numbers.svg", guide: "papa" },
  { id: "forest", accent: "#4F9D5D", accentDark: "#357A44", banner: ["#80C47B", "#47985A"], tint: ["#E2F1D8", "#F5F9E9"],
    art: "/img/worlds/forest.webp", artPos: "70% 50%", patch: "/img/rewards/patch-forest.svg", guide: "brother" },
  { id: "stories", accent: "#8E6BC1", accentDark: "#6A4A9C", banner: ["#B39BDE", "#7F5DBA"], tint: ["#EEE3F8", "#FBF1F5"],
    art: "/img/worlds/stories.webp", artPos: "50% 50%", artRatio: 980 / 460, hero: "/img/worlds/stories-wide.webp", patch: "/img/rewards/patch-stories.svg", guide: "nasj" },
  { id: "inventors", accent: "#4A8FD6", accentDark: "#2F6CAB", banner: ["#7AB8EE", "#4082CC"], tint: ["#DDEBFA", "#F2F7FC"],
    art: "/img/worlds/inventors.webp", artPos: "50% 50%", patch: "/img/rewards/patch-inventors.svg", guide: "sister" },
];

export const worldMeta = (id: string): WorldMeta => WORLDS.find((w) => w.id === id) ?? WORLDS[0];

/** Colours of the six weft threads of a universe's woven bridge (one per activity). */
export const THREAD_COLORS = ["#F6B93B", "#17908A", "#F26B6B", "#A57BD0", "#F29B3E", "#7FD0C5"];
/** Matching yarn-ball artwork from the style guide. */
export const THREAD_YARN = ["yarn-1", "yarn-2", "yarn-4", "yarn-6", "yarn-3", "yarn-5"].map((n) => `/img/ui/${n}.png`);

export function activityIcon(a: Pick<ActivitySummary, "id">): { src: string } {
  return { src: `/img/icons2/${a.id}.svg` };
}
