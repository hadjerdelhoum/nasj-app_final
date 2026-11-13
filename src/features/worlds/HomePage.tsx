import { Link } from "react-router-dom";
import { useChildren, useProgress } from "../../app/state";
import type { Universe } from "../../app/types";
import { Icon } from "../../components/Icon";
import { ErrorNote, Spinner } from "../../components/ui";
import { useI18n } from "../../i18n";
import { audio } from "../audio/audioService";
import { MascotBody, TalkingMascot } from "../mascot/Mascot";
import { useVariant } from "../mascot/variants";
import { WORLDS, worldMeta } from "./worlds";

/** Stitched progress ring: dashed track = the threads still to weave, solid arc = threads already woven. */
function WorldRing({ done, total, size = 60 }: { done: number; total: number; size?: number }) {
  const r = (size - 10) / 2;
  const c = 2 * Math.PI * r;
  const v = total ? done / total : 0;
  return (
    <span className="wring" style={{ width: size, height: size }} aria-hidden="true">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeOpacity=".28" strokeWidth="5" strokeDasharray="3 6" strokeLinecap="round" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round"
          strokeDasharray={`${c * v} ${c}`} transform={`rotate(-90 ${size / 2} ${size / 2})`} style={{ transition: "stroke-dasharray var(--dur-slow) var(--ease-out)" }} />
      </svg>
      <b>{done}<small>/{total}</small></b>
    </span>
  );
}

/** One universe: a distinct silhouette + island medallion (see .wcard--* in screens.css), real progress and a clear action. */
function WorldCard({ u, index }: { u: Universe; index: number }) {
  const { t, pick } = useI18n();
  const w = worldMeta(u.id);
  const done = u.activities.filter((a) => a.completed).length;
  const total = u.activities.length;
  const complete = total > 0 && done === total;
  const name = pick({ fr: u.name_fr, ar: u.name_ar });
  return (
    <li className={`wcard wcard--${u.id}`} style={{ ["--t1" as string]: w.tint[0], ["--t2" as string]: w.tint[1], ["--i" as string]: index }}>
      <Link to={`/world/${u.id}`} className="wcard__link" onClick={() => void audio.effect("click")}
        aria-label={`${name}. ${t("threadsWoven", { n: done, total })}${complete ? ". " + t("worldDone") : ""}`}>
        <span className="wcard__island" aria-hidden="true">
          <img src={w.art} alt="" style={{ objectPosition: w.artPos }} loading={index < 2 ? "eager" : "lazy"} />
        </span>
        {complete && <span className="wcard__seal"><Icon name="check" size={16} /> {t("worldDone")}</span>}
        <span className="wcard__text">
          <span className="wcard__name">{name}</span>
          <span className="wcard__desc">{pick({ fr: u.description_fr, ar: u.description_ar })}</span>
        </span>
        <span className="wcard__foot">
          <WorldRing done={done} total={total} />
          <span className="wcard__go">{t("exploreWorld")} <Icon name="back" size={18} className="flip-rtl-rev" /></span>
        </span>
      </Link>
    </li>
  );
}

/** The activity to suggest first: the most advanced unfinished universe, else the first one. */
function nextActivity(universes: Universe[]) {
  const open = universes
    .map((u) => ({ u, done: u.activities.filter((a) => a.completed).length }))
    .filter(({ u, done }) => done < u.activities.length)
    .sort((a, b) => b.done - a.done);
  for (const { u, done } of open) {
    const a = u.activities.find((x) => !x.completed && x.status !== "locked");
    if (a) return { u, a, started: done > 0 };
  }
  return null;
}

export function HomePage() {
  const { t, lang, pick } = useI18n();
  const { child } = useChildren();
  const { universes, error, refresh, threads } = useProgress();
  const [variant] = useVariant(child?.id, threads);

  if (error && !universes) return <ErrorNote onRetry={refresh} retryLabel={t("retry")}>{t("errNetwork")}</ErrorNote>;
  if (!universes) return <Spinner label={t("loading")} />;

  const ordered = WORLDS.map((w) => universes.find((u) => u.id === w.id)).filter(Boolean) as Universe[];
  const next = nextActivity(ordered);
  const greeting = t("homeGreeting", { name: child?.name ?? "" });
  const say = () => { audio.unlock(); void audio.speak(undefined, `${greeting} ${t("continueTitle")}`, lang, { manual: true }); };

  return (
    <div className="home">
      <section className="dash" aria-labelledby="dash-title">
        <div className="dash__mascot">
          {variant === "classic"
            ? <TalkingMascot height={170} poses={["/img/mascot/expr-happy.webp", "/img/mascot/expr-celebrating.webp"]} onTap={say} />
            : <MascotBody variant={variant} height={170} />}
        </div>
        <div className="dash__text">
          <h1 id="dash-title">{greeting}</h1>
          {next ? (
            <>
              <p className="dash__lead">{next.started ? t("continueTitle") : t("nextUp")}</p>
              <Link to={`/play/${next.a.id}`} className="dash__next" onClick={() => void audio.effect("click")}
                style={{ ["--c" as string]: `var(--u-${next.u.id})` }}>
                <span className="dash__next-title">{pick({ fr: next.a.title_fr, ar: next.a.title_ar })}</span>
                <span className="dash__next-world">{pick({ fr: next.u.name_fr, ar: next.u.name_ar })}</span>
                <span className="btn btn--primary btn--sm" aria-hidden="true">{next.started ? t("continueCta") : t("startCta")}</span>
              </Link>
            </>
          ) : (
            <p className="dash__lead">{t("everyWorld")}</p>
          )}
        </div>
      </section>

      <section aria-labelledby="worlds-title" className="worlds">
        <h2 id="worlds-title" className="section-title">{t("worldsTitle")}</h2>
        <ul className="worlds__grid">
          {ordered.map((u, i) => <WorldCard key={u.id} u={u} index={i} />)}
        </ul>
      </section>
    </div>
  );
}
