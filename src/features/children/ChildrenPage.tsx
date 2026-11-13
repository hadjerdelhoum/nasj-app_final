import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, useChildren, type Avatar } from "../../app/state";
import type { Lang } from "../../app/types";
import { Btn, ChildAvatar, Spinner } from "../../components/ui";
import { Icon } from "../../components/Icon";
import { useI18n } from "../../i18n";
import type { Key } from "../../i18n/dictionary";
import { authErrorKey } from "../auth/LoginPage";
import { FAMILY, MascotFace } from "../mascot/Mascot";
import { LangSwitch } from "../settings/LangSwitch";

/** "Who is playing today?" Each child has their own progress, language and companion. */
export function ChildrenPage() {
  const { t, setLang } = useI18n();
  const { signOut } = useAuth();
  const { children, loaded, select, add, avatarOf } = useChildren();
  const nav = useNavigate();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [age, setAge] = useState(5);
  const [language, setLanguage] = useState<Lang>("fr");
  const [avatar, setAvatar] = useState<Avatar>("nasj");
  const [error, setError] = useState<Key | null>(null);
  const [busy, setBusy] = useState(false);

  if (!loaded) return <Spinner label={t("loading")} />;
  const showForm = adding || children.length === 0;

  const play = (id: string, lang: Lang) => {
    select(id);
    setLang(lang);
    nav("/home");
  };

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const c = await add({ name: name.trim(), age, language }, avatar);
      play(c.id, c.language);
    } catch (err) {
      setError(authErrorKey(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth">
      <LangSwitch className="welcome__lang" />
      <div className="card auth__card auth__card--wide">
        <img className="auth__logo" src="/img/logo/nasj-logo.png" alt="NASJ نسج" />
        <h1>{t("whoPlays")}</h1>

        {children.length > 0 && (
          <ul className="profiles">
            {children.map((c) => (
              <li key={c.id}>
                <button type="button" className="profile" onClick={() => play(c.id, c.language)}>
                  <ChildAvatar who={avatarOf(c.id)} size={84} />
                  <strong>{c.name}</strong>
                  <small>{c.age} {t("years")}</small>
                </button>
              </li>
            ))}
            {!showForm && (
              <li>
                <button type="button" className="profile profile--add" onClick={() => setAdding(true)}>
                  <span className="profile__plus"><Icon name="plus" size={34} /></span>
                  <strong>{t("addChild")}</strong>
                </button>
              </li>
            )}
          </ul>
        )}

        {showForm && (
          <form className="child-form" onSubmit={submit}>
            {children.length === 0 && (
              <p className="muted">
                <MascotFace mood="curious" size={64} /> {t("noChildYet")}
              </p>
            )}
            <label className="field">
              <span>{t("childName")}</span>
              <input value={name} onChange={(e) => setName(e.target.value)} maxLength={40} required autoComplete="off" />
            </label>

            <fieldset className="field">
              <legend>{t("childAge")}</legend>
              <div className="chips">
                {[3, 4, 5, 6, 7, 8, 9, 10].map((a) => (
                  <button key={a} type="button" className={`chip-btn ${age === a ? "is-on" : ""}`} aria-pressed={age === a} onClick={() => setAge(a)}>
                    {a}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="field">
              <legend>{t("language")}</legend>
              <div className="chips">
                {(["fr", "ar"] as const).map((l) => (
                  <button key={l} type="button" lang={l} className={`chip-btn chip-btn--wide ${language === l ? "is-on" : ""}`} aria-pressed={language === l}
                    onClick={() => { setLanguage(l); setLang(l); }}>
                    {l === "fr" ? t("french") : t("arabic")}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="field">
              <legend>{t("chooseCompanion")}</legend>
              <div className="chips chips--avatars">
                {FAMILY.map((f) => (
                  <button key={f} type="button" className={`avatar-pick ${avatar === f ? "is-on" : ""}`} aria-pressed={avatar === f} aria-label={f} onClick={() => setAvatar(f)}>
                    <ChildAvatar who={f} size={64} />
                  </button>
                ))}
              </div>
            </fieldset>

            {error && <p className="form-error" role="alert">{t(error)}</p>}
            <div className="row">
              <Btn type="submit" size="lg" disabled={busy || !name.trim()}>{t("save")}</Btn>
              {children.length > 0 && <Btn variant="ghost" onClick={() => setAdding(false)}>{t("cancel")}</Btn>}
            </div>
          </form>
        )}

        <button type="button" className="link-btn" onClick={() => { signOut(); nav("/welcome"); }}>
          <Icon name="logout" size={18} /> {t("logout")}
        </button>
      </div>
    </div>
  );
}
