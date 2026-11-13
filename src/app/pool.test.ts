import { describe, expect, it } from "vitest";
import { buildQuestions as getBank } from "./localContent";
import { pickPool } from "./localApi";

describe("sessions never mix languages", () => {
  for (const lang of ["fr", "ar"] as const) {
    it(`letters-1 pool for ${lang}`, () => {
      const bank = getBank().filter((q) => q.activity === "letters-1");
      const pool = pickPool(bank, lang, 5);
      const bad = pool.filter((q) => (lang === "fr" ? /[؀-ۿ]/ : /[A-Za-z]/).test(String(q.correct)));
      expect(bad).toHaveLength(0);
      expect(pool.length).toBeGreaterThanOrEqual(5);
    });
  }
});

describe("every activity is single-language in both languages", () => {
  const all = getBank();
  const acts = [...new Set(all.map((q) => q.activity))];
  for (const lang of ["fr", "ar"] as const) for (const a of acts) {
    it(`${a} in ${lang}`, () => {
      const pool = pickPool(all.filter((q) => q.activity === a), lang, 5);
      expect(pool.length).toBeGreaterThanOrEqual(5);
      const other = lang === "fr" ? /[؀-ۿ]/ : /[A-Za-zÀ-ÿ]/;
      for (const q of pool as any[]) {
        const texts = [...q.options, q.payload.visual ?? "", q.payload.fallback ?? "", q.payload.trace ?? ""];
        expect(texts.filter((s) => other.test(s))).toEqual([]);
      }
    });
  }
});
