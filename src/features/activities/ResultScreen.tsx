import { useEffect } from "react";
import type { CompleteResult, Universe } from "../../app/types";
import { Btn, Confetti, LinkBtn } from "../../components/ui";
import { useI18n } from "../../i18n";
import { audio } from "../audio/audioService";
import { MascotBody } from "../mascot/Mascot";
import type { MascotVariant } from "../mascot/Mascot";
import { WovenBridge } from "../rewards/WovenBridge";
import { earnedRows } from "../rewards/weave";
import { THREAD_YARN, worldMeta } from "../worlds/worlds";

interface Props {
  result: CompleteResult;
  universe: Universe | undefined;
  earned: Set<string>;
  variant: MascotVariant;
  onRetry: () => void;
}

const stars = (c: number, t: number) => (t === 0 ? 0 : c / t >= 0.8 ? 3 : c / t >= 0.6 ? 2 : 1);

/** The weaving moment: score, the new thread sliding into the bridge, and any patch / badge earned. */
export function ResultScreen({ result, universe, earned, variant, onRetry }: Props) {
  const { t, pick } = useI18n();
  const threadReward = result.newRewards.find((r) => r.kind === "thread");
  const pos = universe ? universe.activities.findIndex((a) => a.id === result.activityId) : -1;
  const rows = universe ? earnedRows(universe.id, earned) : [];
  const complete = rows.length > 0 && rows.every(Boolean);
  const patch = result.newRewards.find((r) => r.kind === "patch");
  const badge = result.newRewards.find((r) => r.kind === "badge");
  const nextActivity = universe && pos >= 0 ? universe.activities[pos + 1] : undefined;
  const n = stars(result.correct, result.total);

  useEffect(() => {
    if (threadReward) {
      void audio.effect("weave");
      const id = window.setTimeout(() => void audio.effect("reward"), 900);
      return () => window.clearTimeout(id);
    }
    void audio.effect(result.passed ? "correct" : "try-again");
  }, [threadReward, result.passed]);

  return (
    <section className="result">
      {result.passed && <Confetti />}
      <MascotBody variant={result.passed ? variant : "classic"} mood={result.passed ? "celebrating" : "encouraging"} height={170} className="result__mascot" />
      <h1>{result.passed ? t("resultPass") : t("resultTry")}</h1>
      <div className="result__stars" role="img" aria-label={`${n}/3`}>
        {[1, 2, 3].map((k) => (
          <img key={k} src="/img/rewards/star.svg" alt="" className={k <= n ? "on" : ""} style={{ animationDelay: `${0.25 * k}s` }} />
        ))}
      </div>
      <p className="muted">{t("scoreLine", { c: result.correct, t: result.total })}</p>

      {universe && threadReward && (
        <div className="result__weave card">
          <h2>{t("newThread")}</h2>
          <WovenBridge rows={rows} fresh={pos} complete={complete} label={t("newThread")} />
          <div className="result__gift">
            <img src={THREAD_YARN[Math.max(0, pos)]} alt="" width={48} height={48} />
            <span>{pick({ fr: threadReward.name_fr, ar: threadReward.name_ar })}</span>
          </div>
        </div>
      )}

      {(patch || badge) && (
        <div className="result__rewards">
          {patch && (
            <figure className="gift">
              <img src={worldMeta(patch.universe_id ?? "letters").patch} alt="" />
              <figcaption><b>{t("newPatch")}</b><br />{pick({ fr: patch.name_fr, ar: patch.name_ar })}</figcaption>
            </figure>
          )}
          {badge && (
            <figure className="gift">
              <img src="/img/rewards/medal.svg" alt="" />
              <figcaption><b>{t("newBadge")}</b><br />{pick({ fr: badge.name_fr, ar: badge.name_ar })}</figcaption>
            </figure>
          )}
        </div>
      )}

      <div className="result__actions">
        {result.passed && nextActivity && nextActivity.status !== "locked" && (
          <LinkBtn to={`/play/${nextActivity.id}`} size="lg" replace>{t("nextActivity")}</LinkBtn>
        )}
        {!result.passed && <Btn size="lg" onClick={onRetry}>{t("tryAgain")}</Btn>}
        <LinkBtn to={`/world/${result.universeId}`} variant={result.passed ? "secondary" : "ghost"}>{t("backToWorld")}</LinkBtn>
        {result.passed && <Btn variant="ghost" onClick={onRetry}>{t("replay")}</Btn>}
      </div>
    </section>
  );
}
