import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../app/api";
import { useChildren, useProgress } from "../../app/state";
import type { CompleteResult, Session, Story } from "../../app/types";
import { ErrorNote, Spinner } from "../../components/ui";
import { Icon } from "../../components/Icon";
import { useI18n } from "../../i18n";
import { audio } from "../audio/audioService";
import { useAudio } from "../audio/useAudio";
import { useVariant } from "../mascot/variants";
import { StoryReader } from "../stories/StoryReader";
import { THREAD_COLORS, worldMeta } from "../worlds/worlds";
import { QuestionView } from "./QuestionView";
import { ResultScreen } from "./ResultScreen";

type Phase = "loading" | "error" | "story" | "quiz" | "saving" | "result";

/** Runs one activity: server session -> (story) -> questions with instant server verdicts -> server-graded result. */
export function ActivityPage() {
  const { activityId = "" } = useParams();
  const { t, pick } = useI18n();
  const nav = useNavigate();
  const { child } = useChildren();
  const { universes, earned, threads, refresh } = useProgress();
  const { settings } = useAudio();
  const [variant] = useVariant(child?.id, threads);

  const [phase, setPhase] = useState<Phase>("loading");
  const [session, setSession] = useState<Session | null>(null);
  const [story, setStory] = useState<Story | null>(null);
  const [idx, setIdx] = useState(0);
  const [result, setResult] = useState<CompleteResult | null>(null);
  const [attempt, setAttempt] = useState(0);
  const started = useRef<string>("");

  const start = useCallback(async () => {
    if (!child) return;
    setPhase("loading");
    setIdx(0);
    setResult(null);
    setStory(null);
    try {
      const s = await api.startSession(activityId, child.id);
      setSession(s);
      if (s.activity.kind === "story" && s.activity.config.storyId) {
        setStory(await api.story(s.activity.config.storyId));
        setPhase("story");
      } else setPhase("quiz");
    } catch {
      setPhase("error");
    }
  }, [activityId, child]);

  useEffect(() => {
    // StrictMode runs effects twice in dev; one server session per visit is enough.
    const key = `${activityId}:${child?.id}:${attempt}`;
    if (started.current === key) return;
    started.current = key;
    void start();
    return () => audio.stopSpeech();
  }, [activityId, child?.id, attempt, start]);

  const finish = async () => {
    if (!session || !child) return;
    setPhase("saving");
    try {
      const r = await api.complete(session.sessionId, child.id);
      await refresh(); // pull the new threads/patches before drawing the bridge
      setResult(r);
      setPhase("result");
    } catch {
      setPhase("error");
    }
  };

  const universe = universes?.find((u) => u.id === session?.activity.universe_id);
  const w = worldMeta(session?.activity.universe_id ?? "letters");
  const total = session?.questions.length ?? 0;
  const title = session ? pick({ fr: session.activity.title_fr, ar: session.activity.title_ar }) : "";

  return (
    <div className={`play play--${session?.activity.kind ?? "choice"}`} style={{ ["--t1" as string]: w.tint[0], ["--t2" as string]: w.tint[1], ["--accent" as string]: w.accent }}>
      <header className="play__bar">
        <button type="button" className="icon-btn" aria-label={t("quit")} onClick={() => nav(session ? `/world/${session.activity.universe_id}` : "/home")}>
          <Icon name="close" />
        </button>
        <div className="play__title">
          <strong>{title}</strong>
          {phase === "quiz" && total > 0 && (
            <div className="thread" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={idx} aria-label={t("questionOf", { n: idx + 1, total })}>
              {Array.from({ length: total }, (_, i) => <i key={i} className={i < idx ? "done" : i === idx ? "now" : ""} style={{ ["--k" as string]: THREAD_COLORS[i % THREAD_COLORS.length] }} />)}
            </div>
          )}
        </div>
        <button type="button" className="icon-btn" aria-label={settings.muted ? t("audioOff") : t("audioOn")} aria-pressed={!settings.muted}
          onClick={() => { audio.update({ muted: !settings.muted }); if (!settings.muted) audio.stopSpeech(); }}>
          <Icon name={settings.muted ? "speakerOff" : "speaker"} />
        </button>
      </header>

      <main className="play__main">
        {(phase === "loading" || phase === "saving") && <Spinner label={t("loading")} />}
        {phase === "error" && (
          <ErrorNote onRetry={() => (session && idx >= total && total > 0 ? void finish() : setAttempt((a) => a + 1))} retryLabel={t("retry")}>
            {t("sessionError")}
          </ErrorNote>
        )}
        {phase === "story" && story && session && (
          <StoryReader story={story} narrate={session.activity.config.narrate} onFinish={() => setPhase("quiz")} />
        )}
        {phase === "quiz" && session && session.questions[idx] && child && (
          <QuestionView
            key={session.questions[idx].id}
            question={session.questions[idx]}
            index={idx}
            total={total}
            isLast={idx === total - 1}
            onAnswer={(qid, choice) => api.answer(session.sessionId, child.id, qid, choice)}
            onNext={() => (idx === total - 1 ? void finish() : setIdx(idx + 1))}
          />
        )}
        {phase === "quiz" && session && total === 0 && <ErrorNote>{t("sessionError")}</ErrorNote>}
        {phase === "result" && result && (
          <ResultScreen result={result} universe={universe} earned={earned} variant={variant} onRetry={() => setAttempt((a) => a + 1)} />
        )}
      </main>
    </div>
  );
}
