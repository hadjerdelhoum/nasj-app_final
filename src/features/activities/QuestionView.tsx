import { useEffect, useMemo, useRef, useState } from "react";
import type { AnswerResult, Question } from "../../app/types";
import { Btn } from "../../components/ui";
import { Icon } from "../../components/Icon";
import { textDir, useI18n } from "../../i18n";
import { audio } from "../audio/audioService";
import { MascotBubble, type Mood } from "../mascot/Mascot";
import { TracePad } from "./TracePad";

interface Props {
  question: Question;
  index: number;
  total: number;
  isLast: boolean;
  /** Sends the child's first choice to the server and resolves with the server's verdict. */
  onAnswer: (questionId: string, choice: number) => Promise<AnswerResult>;
  onNext: () => void;
}

const MEMORY_SECONDS = 4;

/** Short options (letters, numbers, emoji) are big tiles; long sentences are full-width buttons. */
function optionSize(o: string): "tile" | "mid" | "wide" {
  const n = [...o].length;
  if (n <= 3) return "tile";
  if (n <= 12) return "mid";
  return "wide";
}

export function QuestionView({ question, index, total, isLast, onAnswer, onNext }: Props) {
  const { t, lang } = useI18n();
  const p = question.payload;
  const prompt = p[lang] ?? p.fr ?? "";
  const needsTrace = Boolean(p.trace);
  const isMemory = Boolean(p.hide);

  const [traced, setTraced] = useState(!needsTrace);
  const [memoryLeft, setMemoryLeft] = useState(isMemory ? MEMORY_SECONDS : 0);
  const [showFallback, setShowFallback] = useState(false);
  const [res, setRes] = useState<AnswerResult | null>(null);
  const [picked, setPicked] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(false);
  const feedbackIdx = useRef(Math.floor(Math.random() * 3) + 1);

  // Narrate on arrival: the item itself when there is one (a letter, a word), else the instruction.
  useEffect(() => {
    void audio.speak(p.audio, prompt, lang);
    return () => audio.stopSpeech();
  }, [question.id, p.audio, prompt, lang]);

  // Memory game: the sequence is visible for a few seconds, then hidden.
  useEffect(() => {
    if (!isMemory || memoryLeft <= 0) return;
    const id = window.setTimeout(() => setMemoryLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(id);
  }, [isMemory, memoryLeft]);

  const optionsReady = traced && (!isMemory || memoryLeft <= 0);
  const mood: Mood = res ? (res.correct ? "celebrating" : "oops") : needsTrace || isMemory ? "focused" : "curious";

  const choose = async (i: number) => {
    if (res || busy) return;
    setBusy(true);
    setErr(false);
    setPicked(i);
    try {
      const r = await onAnswer(question.id, i);
      setRes(r);
      void audio.effect(r.correct ? "correct" : "try-again");
    } catch {
      setErr(true);
      setPicked(null);
    } finally {
      setBusy(false);
    }
  };

  const feedback = useMemo(() => {
    if (!res) return "";
    const k = feedbackIdx.current;
    return res.correct ? t(`cheer${k}` as "cheer1") : t(`retry${k}` as "retry1");
  }, [res, t]);

  // The mascot says the encouragement out loud (respects narration / mute settings).
  useEffect(() => {
    if (feedback) void audio.speak(undefined, feedback, lang);
  }, [feedback, lang]);

  const visual = p.visual ?? "";
  const kind = needsTrace ? "trace" : isMemory ? "memory" : "choice";
  const hideVisual = isMemory && memoryLeft <= 0;
  const bigVisual = [...visual].length <= 4;

  return (
    <section className={`quiz quiz--${kind}`} aria-live="polite">
      <p className="quiz__count">
        <span className="kind-chip">{t(`kind_${kind}` as "kind_choice")}</span>
        {t("questionOf", { n: index + 1, total })}
      </p>

      <MascotBubble mood={mood}>
        <p className="quiz__prompt" lang={lang}>{res ? feedback : isMemory && memoryLeft > 0 ? t("rememberThis") : isMemory ? t("remembered") : prompt}</p>
        <div className="quiz__tools">
          <button type="button" className="link-btn" onClick={() => void audio.speak(p.audio, prompt, lang, { manual: true })}>
            <Icon name="speaker" size={18} /> {t("listen")}
          </button>
          {p.fallback && (
            <button type="button" className="link-btn" onClick={() => setShowFallback((v) => !v)} aria-pressed={showFallback}>
              Aa
            </button>
          )}
        </div>
        {showFallback && p.fallback && <p className="quiz__fallback" dir={textDir(p.fallback)}>{p.fallback}</p>}
      </MascotBubble>

      {needsTrace && !traced && p.trace && <TracePad glyph={p.trace} onDone={() => setTraced(true)} />}

      {visual && hideVisual && traced && <div className="quiz__hidden" aria-hidden="true"><span>?</span></div>}

      {visual && !hideVisual && traced && (
        <div className={`quiz__visual ${bigVisual ? "quiz__visual--big" : ""}`} dir={textDir(visual)} lang={textDir(visual) === "rtl" ? "ar" : undefined} aria-label={visual}>
          {visual}
          {isMemory && (
            <div className="memory">
              <div className="memory__bar" aria-hidden="true"><i style={{ animationDuration: `${MEMORY_SECONDS}s` }} /></div>
              <Btn size="sm" variant="secondary" onClick={() => setMemoryLeft(0)}>{t("ready")}</Btn>
            </div>
          )}
        </div>
      )}
      {p.trace && traced && <div className="quiz__traced" dir={textDir(p.trace)} aria-hidden="true">{p.trace}</div>}

      {optionsReady && (
        <ul className="options" role="list">
          {question.options.map((o, i) => {
            const state = !res ? (picked === i ? "pending" : "") : i === res.correctIndex ? "right" : i === res.choice ? "wrong" : "dim";
            return (
              <li key={i}>
                <button type="button" className={`option option--${optionSize(o)} opt--${i % 4} ${state ? `is-${state}` : ""}`} disabled={Boolean(res) || busy}
                  dir="auto" lang={textDir(o) === "rtl" ? "ar" : undefined} onClick={() => void choose(i)}>
                  <span>{o}</span>
                  {state === "right" && <Icon name="check" className="option__mark" />}
                  {state === "wrong" && <Icon name="close" className="option__mark option__mark--wrong" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {err && <p className="form-error" role="alert">{t("answerError")}</p>}

      {res && (
        <div className={`quiz__footer ${res.correct ? "is-right" : "is-wrong"}`}>
          <Btn size="lg" onClick={onNext}>
            {isLast ? t("finish") : t("next")} <Icon name="back" className="flip-fwd" />
          </Btn>
        </div>
      )}
    </section>
  );
}
