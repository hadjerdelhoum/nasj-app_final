import { useI18n } from "../../i18n";
import { audio } from "../audio/audioService";

/** FR | العربية toggle. Flipping it flips the whole layout to RTL. */
export function LangSwitch({ className = "" }: { className?: string }) {
  const { lang, setLang } = useI18n();
  return (
    <div className={`lang-switch ${className}`} role="group" aria-label="Langue / اللغة">
      {(["fr", "ar"] as const).map((l) => (
        <button
          key={l}
          type="button"
          lang={l}
          aria-pressed={lang === l}
          className={lang === l ? "is-on" : ""}
          onClick={() => {
            void audio.effect("click");
            setLang(l);
          }}
        >
          {l === "fr" ? "Français" : "العربية"}
        </button>
      ))}
    </div>
  );
}
