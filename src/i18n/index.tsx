import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Lang } from "../app/types";
import { ar, fr, type Key } from "./dictionary";

const STORE = "nasj.lang";
const tables: Record<Lang, Record<Key, string>> = { fr, ar };

interface I18n {
  lang: Lang;
  dir: "ltr" | "rtl";
  setLang: (l: Lang) => void;
  t: (key: Key, vars?: Record<string, string | number>) => string;
  /** Picks the French or Arabic variant of a bilingual database field for the current language. */
  pick: (o: { fr?: string; ar?: string } | undefined) => string;
}

const Ctx = createContext<I18n | null>(null);

function initialLang(): Lang {
  try {
    const s = localStorage.getItem(STORE);
    if (s === "fr" || s === "ar") return s;
  } catch {
    /* ignore */
  }
  return "fr";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang);
  const dir = lang === "ar" ? "rtl" : "ltr";

  // Arabic shaping + right-to-left layout: set on <html> so every logical CSS property flips.
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(STORE, l);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo<I18n>(
    () => ({
      lang,
      dir,
      setLang,
      t: (key, vars) => {
        let s = tables[lang][key] ?? fr[key];
        if (vars) for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, String(v));
        return s;
      },
      pick: (o) => (o ? (o[lang] ?? o.fr ?? o.ar ?? "") : ""),
    }),
    [lang, dir, setLang]
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n(): I18n {
  const v = useContext(Ctx);
  if (!v) throw new Error("useI18n outside provider");
  return v;
}

/** Text direction for a free string (so Arabic words render RTL even inside an LTR page and vice versa). */
export function textDir(s: string): "rtl" | "ltr" {
  return /[؀-ۿ]/.test(s) ? "rtl" : "ltr";
}
