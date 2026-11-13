import { useChildren, useProgress } from "../../app/state";
import { Ribbon, Spinner } from "../../components/ui";
import { useI18n } from "../../i18n";
import { audio } from "../audio/audioService";
import { MascotBody } from "../mascot/Mascot";
import { VARIANTS, useVariant } from "../mascot/variants";
import { WORLDS, worldMeta } from "../worlds/worlds";
import { WovenBridge } from "./WovenBridge";
import { earnedRows } from "./weave";

/** "Ma collection": the woven bridges, patches, badges and the unlockable outfits. */
export function CollectionPage() {
  const { t, lang } = useI18n();
  const { child } = useChildren();
  const { universes, earned, threads } = useProgress();
  const [variant, choose] = useVariant(child?.id, threads);
  if (!universes) return <Spinner label={t("loading")} />;

  return (
    <div className="collection">
      <h1 className="page-title">{t("myCollection")}</h1>
      <p className="muted center">{t("threadsTotal", { n: threads })}</p>

      <section aria-labelledby="h-bridges">
        <h2 id="h-bridges" className="section-title">{t("woven")}</h2>
        <div className="bridges">
          {WORLDS.map((w) => {
            const u = universes.find((x) => x.id === w.id);
            if (!u) return null;
            const rows = earnedRows(u.id, earned);
            const n = rows.filter(Boolean).length;
            const hasPatch = earned.has(`patch-${u.id}`);
            return (
              <article key={u.id} className="card bridge-card" style={{ ["--t1" as string]: w.tint[0], ["--t2" as string]: w.tint[1] }}>
                <Ribbon world={u.id} fr={u.name_fr} ar={u.name_ar} small />
                <WovenBridge rows={rows} complete={n === rows.length} label={t("threadsWoven", { n, total: rows.length })} />
                <div className="bridge-card__foot">
                  <span>{t("threadsWoven", { n, total: rows.length })}</span>
                  <img src={worldMeta(u.id).patch} alt="" className={`patch ${hasPatch ? "on" : ""}`} width={64} height={64} title={hasPatch ? t("newPatch") : t("patches")} />
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="h-badges">
        <h2 id="h-badges" className="section-title">{t("badges")}</h2>
        <div className="badge-row">
          <figure className={`gift ${earned.has("badge-first-steps") ? "on" : "off"}`}>
            <img src="/img/rewards/medal.svg" alt="" />
            <figcaption>{t("firstSteps")}<small className="gift__cond">{earned.has("badge-first-steps") ? t("selected") : t("badgeCond1")}</small></figcaption>
          </figure>
          <figure className={`gift ${threads >= 6 ? "on" : "off"}`}>
            <img src="/img/rewards/star.svg" alt="" />
            <figcaption>6 ✦<small className="gift__cond">{threads >= 6 ? t("selected") : t("badgeCondN", { n: 6 })}</small></figcaption>
          </figure>
          <figure className={`gift ${threads >= 18 ? "on" : "off"}`}>
            <img src="/img/rewards/crown.svg" alt="" />
            <figcaption>18 ✦<small className="gift__cond">{threads >= 18 ? t("selected") : t("badgeCondN", { n: 18 })}</small></figcaption>
          </figure>
        </div>
      </section>

      <section aria-labelledby="h-wardrobe">
        <h2 id="h-wardrobe" className="section-title">{t("wardrobe")}</h2>
        <ul className="wardrobe">
          {VARIANTS.map((v) => {
            const open = threads >= v.unlockAt;
            return (
              <li key={v.id}>
                <button type="button" className={`outfit ${variant === v.id ? "is-on" : ""}`} disabled={!open} aria-pressed={variant === v.id}
                  onClick={() => { void audio.effect("click"); choose(v.id); }}>
                  <MascotBody outfitArt variant={v.id} height={120} className={open ? "" : "locked-img"} />
                  <strong>{lang === "ar" ? v.ar : v.fr}</strong>
                  <small>{open ? (variant === v.id ? t("selected") : t("choose")) : t("unlockAt", { n: v.unlockAt })}</small>
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
