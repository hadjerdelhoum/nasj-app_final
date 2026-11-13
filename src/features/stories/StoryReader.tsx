import { THREAD_COLORS } from "../worlds/worlds";
import { useEffect, useRef, useState } from "react";
import type { Story } from "../../app/types";
import { Btn } from "../../components/ui";
import { Icon } from "../../components/Icon";
import { useI18n } from "../../i18n";
import { audio } from "../audio/audioService";
import { MascotFace, TalkingMascot } from "../mascot/Mascot";
import { useSpeaking } from "../audio/useAudio";

/** Structured scenes (art + bilingual text + narration key) read like a picture book. Content comes from the database. */
export function StoryReader({ story, narrate, onFinish }: { story: Story; narrate?: boolean; onFinish: () => void }) {
  const { t, lang } = useI18n();
  const [i, setI] = useState(0);
  const [auto, setAuto] = useState(false); // "read the whole story to me": reads each page, then turns it
  const speaking = useSpeaking();
  const started = useRef(false);
  const scene = story.scenes[i];
  const last = i === story.scenes.length - 1;
  const main = scene[lang];

  // Narrate each page: a recorded file when one is registered for scene.audio, else the device voice.
  useEffect(() => {
    started.current = false;
    void audio.speak(scene.audio, main, lang, { manual: narrate || auto });
    return () => audio.stopSpeech();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i, scene.audio, main, lang, narrate]);

  // Auto reading: when the voice finishes the page, wait a beat and turn it (stop on the last page).
  useEffect(() => {
    if (speaking) started.current = true;
    if (!auto || speaking || !started.current) return;
    const id = window.setTimeout(() => (last ? setAuto(false) : setI((x) => x + 1)), 1100);
    return () => window.clearTimeout(id);
  }, [speaking, auto, last]);
  // No voice on this device (never started)? Turn the page after a reading-time estimate instead.
  useEffect(() => {
    if (!auto) return;
    const id = window.setTimeout(() => { if (!started.current) (last ? setAuto(false) : setI((x) => x + 1)); }, Math.max(4500, main.length * 80));
    return () => window.clearTimeout(id);
  }, [auto, i, last, main.length]);

  const toggleAuto = () => {
    if (auto) { setAuto(false); audio.stopSpeech(); return; }
    audio.unlock();
    setAuto(true);
    started.current = false;
    void audio.speak(scene.audio, main, lang, { manual: true });
  };

  return (
    <section className="story">
      <h1 className="story__title" lang={lang}>{lang === "fr" ? story.title_fr : story.title_ar}</h1>
      <div className="story__teller">
        <TalkingMascot height={170} poses={["/img/mascot/expr-focused.webp", "/img/mascot/expr-happy.webp"]} />
        <Btn onClick={toggleAuto} aria-pressed={auto}>
          <Icon name={auto ? "refresh" : "speaker"} /> {auto ? t("pauseReading") : t("readStory")}
        </Btn>
      </div>
      <div className="story__book">
        <div className="story__art" aria-hidden="true">{scene.art}</div>
        <p className="story__text" lang={lang} dir={lang === "ar" ? "rtl" : "ltr"}>{main}</p>
      </div>
      <div className="thread thread--story" aria-hidden="true">
        {story.scenes.map((_, k) => <i key={k} className={k === i ? "now" : k < i ? "done" : ""} style={{ ["--k" as string]: THREAD_COLORS[k % THREAD_COLORS.length] }} />)}
      </div>
      <div className="story__nav">
        <Btn variant="secondary" disabled={i === 0} onClick={() => setI(i - 1)} aria-label={t("prevPage")}>
          <Icon name="back" className="flip-rtl" />
        </Btn>
        <Btn variant="ghost" onClick={() => void audio.speak(scene.audio, main, lang, { manual: true })} aria-label={t("listen")}>
          <Icon name="speaker" /> {t("listen")}
        </Btn>
        {last ? (
          <Btn onClick={onFinish}><MascotFace mood="celebrating" size={30} /> {t("endStory")}</Btn>
        ) : (
          <Btn onClick={() => setI(i + 1)} aria-label={t("nextPage")}>
            <Icon name="back" className="flip-fwd" />
          </Btn>
        )}
      </div>
    </section>
  );
}
