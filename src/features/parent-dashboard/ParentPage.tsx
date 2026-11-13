import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { api, OFFLINE } from "../../app/api";
import { aiReady, saveAi, verifyAndSave } from "../../app/aiClient";
import { useChildren, useProgress } from "../../app/state";
import type { Dashboard } from "../../app/types";
import { Btn, ChildAvatar, ErrorNote, ProgressRing, Spinner } from "../../components/ui";
import { useI18n } from "../../i18n";
import { MascotFace } from "../mascot/Mascot";
import { WovenBridge } from "../rewards/WovenBridge";
import { earnedRows } from "../rewards/weave";
import { worldMeta } from "../worlds/worlds";

const GATE_KEY = "nasj.parentGate";

/** A tiny sum keeps small children out of the parent area (this is a gate, not security: the API is token-protected). */
function Gate({ onPass }: { onPass: () => void }) {
  const { t } = useI18n();
  const [a, b] = useMemo(() => [4 + Math.floor(Math.random() * 6), 3 + Math.floor(Math.random() * 6)], []);
  const [val, setVal] = useState("");
  const [bad, setBad] = useState(false);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (Number(val) === a + b) {
      try {
        sessionStorage.setItem(GATE_KEY, String(Date.now()));
      } catch {
        /* ignore */
      }
      onPass();
    } else {
      setBad(true);
      setVal("");
    }
  };
  return (
    <form className="card gate" onSubmit={submit}>
      <MascotFace mood="curious" size={80} />
      <h1>{t("gateTitle")}</h1>
      <label className="field">
        <span dir="ltr">{t("gateAsk", { a, b })}</span>
        <input inputMode="numeric" pattern="[0-9]*" value={val} onChange={(e) => { setVal(e.target.value); setBad(false); }} dir="ltr" autoFocus />
      </label>
      {bad && <p className="form-error" role="alert">{t("gateWrong")}</p>}
      <Btn type="submit" disabled={!val}>{t("enter")}</Btn>
    </form>
  );
}

/** Optional: paste a free Gemini key so the assistant can answer any question. Stays on this device. */
function AiSetup() {
  const { t } = useI18n();
  const [key, setKey] = useState("");
  const [active, setActive] = useState(aiReady());
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const save = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const r = await verifyAndSave(key);
    setBusy(false);
    if (r === "ok") {
      setActive(true);
      setKey("");
      setMsg({ ok: true, text: t("aiOk") });
    } else {
      setActive(aiReady());
      setMsg({ ok: false, text: t(r === "key" ? "aiBadKey" : r === "limit" ? "aiLimit" : r === "network" ? "aiNoNet" : "aiOther") });
    }
  };
  return (
    <section className="card ai-setup">
      <h2>{t("aiTitle")}</h2>
      <p className="muted">{t("aiHelp")}</p>
      <p className="ai-setup__warn">{t("aiPrivacy")}</p>
      <p><strong>{active ? t("aiActive") : t("aiOff")}</strong></p>
      <form onSubmit={save} className="ai-setup__form">
        <label className="field">
          <span>{t("aiKeyLabel")}</span>
          <input type="password" dir="ltr" autoComplete="off" autoCapitalize="off" spellCheck={false} placeholder="AIza…" value={key} onChange={(e) => setKey(e.target.value)} />
        </label>
        <div className="row">
          <Btn type="submit" size="sm" disabled={busy || key.trim().length < 10}>{busy ? t("loading") : t("aiSave")}</Btn>
          {active && <Btn type="button" variant="ghost" size="sm" onClick={() => { saveAi({ key: "", model: "" }); setActive(false); setMsg(null); }}>{t("aiRemove")}</Btn>}
        </div>
      </form>
      {msg && <p className={msg.ok ? "ai-setup__ok" : "form-error"} role="status">{msg.text}</p>}
    </section>
  );
}

function recentlyPassed() {
  try {
    const at = Number(sessionStorage.getItem(GATE_KEY));
    return at > 0 && Date.now() - at < 10 * 60_000;
  } catch {
    return false;
  }
}

export default function ParentPage() {
  const { t, pick } = useI18n();
  const { child, children, avatarOf, select } = useChildren();
  const { universes, earned, threads } = useProgress();
  const [open, setOpen] = useState(recentlyPassed);
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!open || !child) return;
    setData(null);
    setError(false);
    api.dashboard(child.id).then(setData).catch(() => setError(true));
  }, [open, child]);

  if (!open) return <Gate onPass={() => setOpen(true)} />;
  if (!child) return null;

  const level = (u: Dashboard["universes"][number]) =>
    !u.attempts ? "levelNew" : u.avg_score >= 0.8 ? "levelGreat" : u.avg_score >= 0.5 ? "levelProgress" : "levelPractice";
  const done = data ? data.universes.reduce((s, u) => s + u.completed, 0) : 0;
  const attempts = data ? data.universes.reduce((s, u) => s + u.attempts, 0) : 0;
  const scored = data ? data.universes.filter((u) => u.attempts) : [];
  const avg = scored.length ? Math.round((scored.reduce((s, u) => s + u.avg_score, 0) / scored.length) * 100) : null;
  const patches = [...earned].filter((id) => id.startsWith("patch-")).length;
  const badges = [...earned].filter((id) => id.startsWith("badge-")).length;
  const weak = data ? [...scored].sort((x, y) => x.avg_score - y.avg_score)[0] : undefined;
  const fresh = data ? data.universes.find((u) => !u.attempts) : undefined;
  const advice = weak && weak.avg_score < 0.8
    ? t("adviceReview", { world: pick({ fr: weak.name_fr, ar: weak.name_ar }) })
    : fresh ? t("adviceStart", { world: pick({ fr: fresh.name_fr, ar: fresh.name_ar }) }) : t("adviceGreat");
  const stats: { k: string; v: string | number; c: string }[] = [
    { k: "statThreads", v: threads, c: "var(--yarn-1)" },
    { k: "statDone", v: done, c: "var(--yarn-2)" },
    { k: "statScore", v: avg === null ? "—" : `${avg}%`, c: "var(--yarn-0)" },
    { k: "statAttempts", v: attempts, c: "var(--yarn-3)" },
    { k: "statPatches", v: patches, c: "var(--yarn-4)" },
    { k: "statBadges", v: badges, c: "var(--yarn-1)" },
  ];

  return (
    <div className="parent">
      <h1 className="page-title">{t("parentSpace")}</h1>
      <p className="parent__intro">{t("parentIntro", { name: child.name })}</p>

      <section className="card parent__child">
        <ChildAvatar who={avatarOf(child.id)} size={72} />
        <div className="parent__who">
          <h2>{child.name}</h2>
          <p className="muted">{child.age} {t("years")}</p>
        </div>
        {children.length > 1 && (
          <select aria-label={t("switchChild")} value={child.id} onChange={(e) => select(e.target.value)}>
            {children.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        )}
        {data && <ProgressRing value={data.overall} size={84} label={`${Math.round(data.overall * 100)}%`} color="var(--teal-600)" />}
      </section>

      {error && <ErrorNote onRetry={() => setOpen(true)} retryLabel={t("retry")}>{t("errNetwork")}</ErrorNote>}
      {!data && !error && <Spinner label={t("loading")} />}

      {data && (
        <>
          <ul className="parent__stats">
            {stats.map((s) => (
              <li key={s.k} style={{ ["--c" as string]: s.c }}><b>{s.v}</b><span>{t(s.k as "statThreads")}</span></li>
            ))}
          </ul>

          <section className="card parent__advice">
            <MascotFace mood="happy" size={64} />
            <div><h2>{t("adviceTitle")}</h2><p>{advice}</p></div>
          </section>

          <h2 className="section-title">{t("worldsProgress")}</h2>
          <ul className="parent__grid">
            {data.universes.map((u) => {
              const w = worldMeta(u.universe_id);
              const uni = universes?.find((x) => x.id === u.universe_id);
              const lv = level(u);
              return (
                <li key={u.universe_id} className={`card parent__world parent__world--${lv}`} style={{ ["--accent" as string]: w.accent }}>
                  <header>
                    <img src={w.patch} alt="" width={44} height={44} />
                    <div>
                      <strong style={{ color: w.accentDark }}>{pick({ fr: u.name_fr, ar: u.name_ar })}</strong>
                      <span>{t("activitiesDone", { c: u.completed, t: u.total })}</span>
                    </div>
                    <em className={`level level--${lv}`}>{t(lv as "levelNew")}</em>
                  </header>
                  <div className="bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round((u.completed / u.total) * 100)}>
                    <i style={{ width: `${(u.completed / u.total) * 100}%`, background: w.accent }} />
                  </div>
                  <dl>
                    <div><dt>{t("avgScore")}</dt><dd>{u.attempts ? `${Math.round(u.avg_score * 100)}%` : "—"}</dd></div>
                    <div><dt>{t("attempts")}</dt><dd>{u.attempts}</dd></div>
                  </dl>
                  {uni && <WovenBridge rows={earnedRows(u.universe_id, earned)} className="bridge--mini" />}
                </li>
              );
            })}
          </ul>

          {OFFLINE && <AiSetup />}

          <section className="card parent__tools">
            <h2>{t("parentTools")}</h2>
            <div className="row">
              <Link to="/settings" className="btn btn--secondary btn--sm">{t("openSettings")}</Link>
              <Link to="/children" className="btn btn--secondary btn--sm">{t("manageProfiles")}</Link>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
