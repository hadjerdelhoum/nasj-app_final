import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../app/state";
import { Icon } from "../../components/Icon";
import { useI18n } from "../../i18n";
import { audio } from "../audio/audioService";
import { LangSwitch } from "../settings/LangSwitch";

const COLORS = ["#E0556B", "#0f8488", "#C98512", "#7b55c4", "#2f7fc0"];
const FR = ["A", "B", "C", "a", "b", "é"];
const AR = ["أ", "ب", "ت", "ث", "ج", "د"];
const NEUTRAL = ["1", "2", "3", "4", "5", "+", "=", "★", "●", "▲", "■", "♥"];

/** Soft, drifting learning symbols (letters of the chosen language, numbers, shapes). Decorative only. */
function LearningBackdrop({ lang }: { lang: "fr" | "ar" }) {
  // fixed slots around the edges, so symbols never sit behind the logo or the sentence
  const SLOTS: [number, number][] = [[6, 14], [76, 12], [52, 4], [4, 34], [84, 36], [5, 48], [88, 50], [5, 84], [72, 86], [36, 90], [20, 20], [62, 22], [20, 76], [88, 78], [50, 95], [90, 10]];
  const items = useMemo(() => {
    const glyphs = [...(lang === "fr" ? FR : AR), ...NEUTRAL];
    return glyphs.slice(0, SLOTS.length).map((g, i) => ({
      g, left: SLOTS[i][0], top: SLOTS[i][1],
      size: 44 + ((i * 11) % 4) * 6,
      delay: (i % 6) * -1.3, dur: 7 + (i % 5), color: COLORS[i % COLORS.length],
    }));
  }, [lang]);
  return (
    <div className="backdrop" aria-hidden="true">
      {items.map((it, i) => (
        <span key={i} className="backdrop__g" style={{ left: `${it.left}%`, top: `${it.top}%`, width: it.size, height: it.size, fontSize: it.size * 0.55, color: it.color, animationDelay: `${it.delay}s`, animationDuration: `${it.dur}s` }}>{it.g}</span>
      ))}
    </div>
  );
}

/** Welcome: logo, the sentence, one button. Learning symbols float softly behind. */
export function WelcomePage() {
  const { t, lang } = useI18n();
  const { token } = useAuth();
  const nav = useNavigate();

  const begin = () => {
    audio.unlock();
    void audio.effect("welcome");
    void audio.speak("welcome", t("hello"), lang);
    window.setTimeout(() => nav(token ? "/children" : "/login"), 900);
  };

  return (
    <div className="welcome">
      <LearningBackdrop lang={lang} />
      <header className="welcome__top"><LangSwitch /></header>
      <section className="welcome__stage">
        <img className="welcome__logo" src="/img/logo/nasj-logo.png" alt="NASJ نسج" />
        <p className="welcome__title">{t("welcomeTitle")}</p>
        <button type="button" className="welcome__go" onClick={begin}>
          <span className="welcome__go-ball" aria-hidden="true"><Icon name="play" size={30} /></span>
          <span>{t("start")}</span>
        </button>
      </section>
    </div>
  );
}
