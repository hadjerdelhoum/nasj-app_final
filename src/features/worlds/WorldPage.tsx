import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { useProgress } from "../../app/state";
import { ErrorNote, ProgressRing, Ribbon, Spinner } from "../../components/ui";
import { Icon } from "../../components/Icon";
import { useI18n } from "../../i18n";
import { audio } from "../audio/audioService";
import { useEffect } from "react";
import { useSpeaking } from "../audio/useAudio";
import { MascotBody } from "../mascot/Mascot";
import { WovenBridge } from "../rewards/WovenBridge";
import { earnedRows } from "../rewards/weave";
import { activityIcon, worldMeta } from "./worlds";

/** The guide greets the child when a universe opens (respects the narration / mute settings). */
function GuideVoice({ line, lang }: { line: string; lang: "fr" | "ar" }) {
  useEffect(() => {
    const id = window.setTimeout(() => void audio.speak(undefined, line, lang), 600);
    return () => { window.clearTimeout(id); audio.stopSpeech(); };
  }, [line, lang]);
  return null;
}
function GuidePortrait({ complete }: { complete: boolean }) {
  const talking = useSpeaking();
  return <MascotBody mood={complete ? "celebrating" : talking ? "happy" : "focused"} height={96} className={talking ? "is-talking" : ""} />;
}

/** One universe: the illustrated landscape, its guide, its bridge of six threads and its activities. */
export function WorldPage() {
  const { worldId = "" } = useParams();
  const { t, lang, pick } = useI18n();
  const nav = useNavigate();
  const { universes, earned, error, refresh } = useProgress();

  if (error && !universes) return <ErrorNote onRetry={refresh} retryLabel={t("retry")}>{t("errNetwork")}</ErrorNote>;
  if (!universes) return <Spinner label={t("loading")} />;
  const u = universes.find((x) => x.id === worldId);
  if (!u) return <Navigate to="/home" replace />;

  const w = worldMeta(u.id);
  const rows = earnedRows(u.id, earned);
  const done = rows.filter(Boolean).length;
  const complete = done === u.activities.length;
  const worldName = pick({ fr: u.name_fr, ar: u.name_ar });
  const guideLine = complete ? t("guideDone") : `${t("guideHello", { world: worldName })} ${t("guideAction")}`;

  return (
    <div className="world" style={{ ["--t1" as string]: w.tint[0], ["--t2" as string]: w.tint[1], ["--accent" as string]: w.accent, ["--accent-d" as string]: w.accentDark }}>
      <section className="world__hero">
        <img src={w.hero ?? w.art} alt="" style={{ objectPosition: w.hero ? "50% 35%" : w.artPos }} />
        <Link to="/home" className="world__back icon-btn" aria-label={t("back")} onClick={() => void audio.effect("click")}>
          <Icon name="back" className="flip-rtl" />
        </Link>
        <div className="world__ribbon">
          <Ribbon world={u.id} fr={u.name_fr} ar={u.name_ar} />
        </div>
      </section>

      <section className="world__intro card">
        <div className="world__guide">
          <GuideVoice line={guideLine} lang={lang} />
          <GuidePortrait complete={complete} />
          <div className="bubble">
            <p>{guideLine}</p>
            <button type="button" className="link-btn" onClick={() => void audio.speak(undefined, guideLine, lang, { manual: true })}>
              <Icon name="speaker" size={18} /> {t("listen")}
            </button>
          </div>
        </div>
        <p className="world__desc" lang={lang}>{pick({ fr: u.description_fr, ar: u.description_ar })}</p>
        <div className="world__progress">
          <ProgressRing value={u.progress} color={w.accent} size={64} label={`${done}/${u.activities.length}`} />
          <WovenBridge rows={rows} complete={complete} label={t("threadsWoven", { n: done, total: u.activities.length })} />
        </div>
        <p className="muted center">{t("threadsWoven", { n: done, total: u.activities.length })}</p>
      </section>

      <ol className="path">
        {u.activities.map((a, i) => {
          const ic = activityIcon(a);
          const locked = a.status === "locked";
          const label = pick({ fr: a.title_fr, ar: a.title_ar });
          return (
            <li key={a.id} className={`stone stone--${a.status} ${i % 2 ? "stone--odd" : ""}`}>
              <button
                type="button"
                className="stone__btn"
                disabled={locked}
                aria-label={`${label} — ${locked ? t("locked") : a.completed ? t("completed") : t("available")}`}
                onClick={() => nav(`/play/${a.id}`)}
              >
                <span className="stone__icon">
                  <img src={ic.src} alt="" />
                  {a.completed && <span className="stone__tick"><Icon name="check" size={16} /></span>}
                  {locked && <span className="stone__lock"><Icon name="lock" size={18} /></span>}
                </span>
                <span className="stone__text">
                  <strong>{label}</strong>
                  <em>{locked ? t("lockedHint") : a.completed ? t("completed") : t("available")}</em>
                </span>
                {!locked && <span className={`stone__go btn btn--${a.completed ? "secondary" : "primary"} btn--sm`} aria-hidden="true">{a.completed ? t("replay") : t("play")}</span>}
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
