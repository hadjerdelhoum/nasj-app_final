import { useNavigate } from "react-router-dom";
import { useAuth } from "../../app/state";
import { Btn } from "../../components/ui";
import { Icon } from "../../components/Icon";
import { useI18n } from "../../i18n";
import { audio } from "../audio/audioService";
import { useAudio } from "../audio/useAudio";
import { LangSwitch } from "./LangSwitch";

function Toggle({ label, on, onChange }: { label: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="toggle">
      <span>{label}</span>
      <input type="checkbox" role="switch" checked={on} onChange={(e) => { onChange(e.target.checked); void audio.effect("click"); }} />
      <i aria-hidden="true" />
    </label>
  );
}

export function SettingsPage() {
  const { t, lang } = useI18n();
  const { settings } = useAudio();
  const { signOut } = useAuth();
  const nav = useNavigate();
  const arabicVoiceMissing = lang === "ar" && !audio.voiceAvailable("ar");

  return (
    <div className="settings">
      <h1 className="page-title">{t("settings")}</h1>
      <section className="card">
        <h2 className="section-title">{t("appLanguage")}</h2>
        <LangSwitch />
      </section>

      <section className="card">
        <Toggle label={t("audioOn")} on={!settings.muted} onChange={(v) => { audio.update({ muted: !v }); if (v) audio.unlock(); }} />
        <Toggle label={t("soundEffects")} on={settings.sfx} onChange={(v) => audio.update({ sfx: v })} />
        <Toggle label={t("narration")} on={settings.narration} onChange={(v) => audio.update({ narration: v })} />
        <Toggle label={t("music")} on={settings.music} onChange={(v) => { audio.update({ music: v }); if (v) audio.unlock(); }} />
        <label className="slider">
          <span>{t("volume")}</span>
          <input type="range" min={0} max={1} step={0.05} value={settings.volume} onChange={(e) => audio.update({ volume: Number(e.target.value) })} />
        </label>
        <label className="slider">
          <span>{t("voiceSpeed")}</span>
          <input type="range" min={0.6} max={1.1} step={0.05} value={settings.speed} onChange={(e) => audio.update({ speed: Number(e.target.value) })} />
        </label>
        <div className="row">
          <Btn variant="secondary" size="sm" onClick={() => void audio.speak(undefined, lang === "ar" ? "مرحباً! أنا نسج" : "Bonjour ! Je suis NASJ", lang, { manual: true })}>
            <Icon name="speaker" size={18} /> {t("listen")}
          </Btn>
          <Btn variant="ghost" size="sm" onClick={() => audio.replay()}>
            <Icon name="refresh" size={18} /> {t("replay")}
          </Btn>
        </div>
        <p className="muted small">{t("voiceNote")}</p>
        {arabicVoiceMissing && <p className="form-error">{t("voiceMissing")}</p>}
      </section>

      <section className="card">
        <Btn variant="secondary" onClick={() => nav("/children")}>{t("switchChild")}</Btn>
        <Btn variant="ghost" onClick={() => { signOut(); nav("/welcome"); }}>
          <Icon name="logout" size={18} /> {t("logout")}
        </Btn>
      </section>
    </div>
  );
}
