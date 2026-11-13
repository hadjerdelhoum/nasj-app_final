import type { Lang } from "../../app/types";

/**
 * Maps the audio keys used in the learning content (e.g. "ar/words/qamar") to the text that the
 * device voice should say while no recorded file exists for that key in /audio/manifest.json.
 * Keep in sync with backend/src/seeds/content.ts.
 */
const FR_WORDS: Record<string, string> = {
  pomme: "pomme", lune: "lune", chat: "chat", poisson: "poisson", maison: "maison",
  arbre: "arbre", soleil: "soleil", livre: "livre", banane: "banane", voiture: "voiture",
};
const AR_WORDS: Record<string, string> = {
  tuffaha: "تفاحة", qamar: "قمر", qitta: "قطة", samaka: "سمكة", bayt: "بيت",
  shajara: "شجرة", shams: "شمس", kitab: "كتاب", mawza: "موزة", sayyara: "سيارة",
};
// Same order as arLetters in the seed file.
const AR_LETTER_NAMES = ["ألف", "باء", "تاء", "ثاء", "جيم", "حاء", "دال", "راء", "سين", "شين", "قاف", "كاف", "ميم", "نون"];
const FR_LETTER_NAMES: Record<string, string> = {
  a: "a", b: "bé", c: "cé", d: "dé", e: "e", f: "effe", l: "elle", m: "emme", p: "pé", s: "esse", v: "vé",
};

export function lexiconText(key: string | undefined): { text: string; lang: Lang } | null {
  if (!key) return null;
  const [lang, kind, slug] = key.split("/");
  if (lang === "fr" && kind === "words" && FR_WORDS[slug]) return { text: FR_WORDS[slug], lang: "fr" };
  if (lang === "ar" && kind === "words" && AR_WORDS[slug]) return { text: AR_WORDS[slug], lang: "ar" };
  if (lang === "ar" && kind === "letters" && AR_LETTER_NAMES[Number(slug)]) return { text: AR_LETTER_NAMES[Number(slug)], lang: "ar" };
  if (lang === "fr" && kind === "letters" && FR_LETTER_NAMES[slug]) return { text: FR_LETTER_NAMES[slug], lang: "fr" };
  return null;
}
