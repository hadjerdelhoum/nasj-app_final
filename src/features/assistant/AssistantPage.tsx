import { useEffect, useRef, useState, type FormEvent } from "react";
import { api, ApiError } from "../../app/api";
import { Btn } from "../../components/ui";
import { Icon } from "../../components/Icon";
import { textDir, useI18n } from "../../i18n";
import { audio } from "../audio/audioService";
import { MascotFace, type Mood } from "../mascot/Mascot";

interface Msg {
  from: "child" | "nasj";
  text: string;
}

/** Optional AI helper. The server owns the key and the child-safety system prompt; the app only shows it if enabled. */
export default function AssistantPage() {
  const { t, lang } = useI18n();
  const [msgs, setMsgs] = useState<Msg[]>([{ from: "nasj", text: t("assistantHello") }]);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [mood, setMood] = useState<Mood>("happy");
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => end.current?.scrollIntoView({ behavior: "smooth", block: "end" }), [msgs, busy]);

  async function ask(text: string) {
    const question = text.trim();
    if (!question || busy) return;
    setMsgs((m) => [...m, { from: "child", text: question }]);
    setQ("");
    setBusy(true);
    setMood("thinking");
    try {
      const r = await api.ask(question);
      setMsgs((m) => [...m, { from: "nasj", text: r.answer }]);
      setMood("happy");
      void audio.speak(undefined, r.answer, textDir(r.answer) === "rtl" ? "ar" : "fr");
    } catch (e) {
      setMsgs((m) => [...m, { from: "nasj", text: e instanceof ApiError && e.status === 503 ? t("assistantOff") : t("assistantError") }]);
      setMood("oops");
    } finally {
      setBusy(false);
    }
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void ask(q);
  };

  return (
    <div className="assistant">
      <h1 className="page-title"><MascotFace mood={mood} size={56} /> {t("assistantTitle")}</h1>
      <div className="chat" aria-live="polite">
        {msgs.map((m, i) => (
          <div key={i} className={`msg msg--${m.from}`} dir={textDir(m.text)}>
            <p>{m.text}</p>
            {m.from === "nasj" && (
              <button type="button" className="link-btn" onClick={() => void audio.speak(undefined, m.text, textDir(m.text) === "rtl" ? "ar" : "fr", { manual: true })} aria-label={t("listen")}>
                <Icon name="speaker" size={18} />
              </button>
            )}
          </div>
        ))}
        {busy && <div className="msg msg--nasj"><p>{t("thinking")}</p></div>}
        <div ref={end} />
      </div>

      {msgs.length === 1 && (
        <div className="chips">
          {(["suggest1", "suggest2", "suggest3"] as const).map((k) => (
            <button key={k} type="button" className="chip-btn chip-btn--wide" onClick={() => void ask(t(k))}>{t(k)}</button>
          ))}
        </div>
      )}

      <form className="chat__form" onSubmit={onSubmit}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("askPlaceholder")} maxLength={300} dir="auto" lang={lang} aria-label={t("askPlaceholder")} />
        <Btn type="submit" disabled={busy || !q.trim()} aria-label={t("send")}><Icon name="send" className="flip-rtl" /></Btn>
      </form>
    </div>
  );
}
