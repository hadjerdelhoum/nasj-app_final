import { useCallback, useEffect, useState } from "react";
import type { MascotVariant } from "./Mascot";

/** Cosmetic outfits unlocked by weaving threads. Purely decorative: no learning content is ever gated by them. */
export const VARIANTS: { id: MascotVariant; unlockAt: number; fr: string; ar: string }[] = [
  { id: "classic", unlockAt: 0, fr: "Classique", ar: "كلاسيكي" },
  { id: "adventure", unlockAt: 3, fr: "Aventure", ar: "مغامرة" },
  { id: "explorer", unlockAt: 6, fr: "Explorateur", ar: "مستكشف" },
  { id: "creative", unlockAt: 10, fr: "Créatif", ar: "مبدع" },
  { id: "sporty", unlockAt: 15, fr: "Sportif", ar: "رياضي" },
  { id: "winter", unlockAt: 20, fr: "Hiver", ar: "شتاء" },
];

const key = (childId: string) => `nasj.variant.${childId}`;

export function useVariant(childId: string | undefined, threads: number): [MascotVariant, (v: MascotVariant) => void] {
  const [variant, setVariant] = useState<MascotVariant>("classic");
  useEffect(() => {
    if (!childId) return;
    try {
      const v = localStorage.getItem(key(childId)) as MascotVariant | null;
      const def = VARIANTS.find((x) => x.id === v);
      setVariant(def && threads >= def.unlockAt ? def.id : "classic");
    } catch {
      setVariant("classic");
    }
  }, [childId, threads]);
  const choose = useCallback(
    (v: MascotVariant) => {
      setVariant(v);
      try {
        if (childId) localStorage.setItem(key(childId), v);
      } catch {
        /* ignore */
      }
    },
    [childId]
  );
  return [variant, choose];
}
