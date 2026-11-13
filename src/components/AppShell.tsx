import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth, useChildren, useProgress } from "../app/state";
import { useI18n } from "../i18n";
import { audio } from "../features/audio/audioService";
import { useAudio } from "../features/audio/useAudio";
import { Icon, type IconName } from "./Icon";
import { ChildAvatar } from "./ui";

/** Frame for all child-facing screens: slim top bar + floating bottom dock. */
export function AppShell() {
  const { t } = useI18n();
  const { assistantEnabled } = useAuth();
  const { child, avatarOf } = useChildren();
  const { threads } = useProgress();
  const { settings } = useAudio();
  const nav = useNavigate();

  const tabs: { to: string; icon: IconName; label: string }[] = [
    { to: "/home", icon: "worlds", label: t("navWorlds") },
    { to: "/collection", icon: "yarn", label: t("navCollection") },
    ...(assistantEnabled ? [{ to: "/assistant", icon: "chat" as IconName, label: t("navAssistant") }] : []),
    { to: "/parent", icon: "shield", label: t("navParents") },
  ];

  return (
    <div className="shell" data-age={child && child.age <= 5 ? "small" : "big"}>
      <header className="topbar">
        <button type="button" className="topbar__child" onClick={() => nav("/children")} aria-label={t("switchChild")}>
          {child && <ChildAvatar who={avatarOf(child.id)} size={42} />}
          <span>{child?.name}</span>
        </button>
        <div className="topbar__right">
          <span className="chip" title={t("threadsTotal", { n: threads })}>
            <img src="/img/ui/yarn-1.png" alt="" width={22} height={22} />
            <b>{threads}</b>
          </span>
          <button
            type="button"
            className="icon-btn"
            aria-label={settings.muted ? t("audioOff") : t("audioOn")}
            aria-pressed={!settings.muted}
            onClick={() => {
              audio.update({ muted: !settings.muted });
              if (!settings.muted) audio.stopSpeech();
            }}
          >
            <Icon name={settings.muted ? "speakerOff" : "speaker"} />
          </button>
          <NavLink to="/settings" className="icon-btn" aria-label={t("settings")}>
            <Icon name="gear" />
          </NavLink>
        </div>
      </header>

      <main className="shell__main">
        <Outlet />
      </main>

      <nav className="dock" aria-label="Navigation">
        {tabs.map((tab) => (
          <NavLink key={tab.to} to={tab.to} className={({ isActive }) => `dock__item ${isActive ? "is-active" : ""}`} onClick={() => void audio.effect("click")}>
            <Icon name={tab.icon} />
            <span>{tab.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
