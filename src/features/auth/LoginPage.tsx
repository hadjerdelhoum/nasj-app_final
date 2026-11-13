import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, ApiError, OFFLINE } from "../../app/api";
import { useAuth } from "../../app/state";
import { Btn } from "../../components/ui";
import { useI18n } from "../../i18n";
import type { Key } from "../../i18n/dictionary";
import { LangSwitch } from "../settings/LangSwitch";
import { PasswordField } from "./PasswordField";

export function authErrorKey(e: unknown): Key {
  if (e instanceof ApiError) {
    if (e.status === 0) return "errNetwork";
    if (e.status === 401) return "errBadLogin";
    if (e.status === 409) return "errEmailTaken";
    if (e.status === 400) return "errValidation";
    if (e.status === 429) return "errTooMany";
  }
  return "errGeneric";
}

/** Sign in: e-mail + password only. Creating an account is a separate page (/signup). */
export function LoginPage() {
  const { t } = useI18n();
  const { signIn } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<Key | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const r = await api.login(email.trim(), password);
      signIn(r.token);
      nav("/children", { replace: true });
    } catch (err) {
      setError(authErrorKey(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth">
      <div className="auth__top"><LangSwitch /></div>
      <form className="card auth__card" onSubmit={submit} noValidate>
        <img className="auth__logo" src="/img/logo/nasj-logo.png" alt="NASJ نسج" />
        <h1>{t("loginTitle")}</h1>
        <p className="auth__sub">{t("loginSub")}</p>

        <label className="field">
          <span>{t("email")}</span>
          <input type="email" inputMode="email" autoComplete="email" dir="ltr" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <PasswordField label={t("password")} value={password} onChange={setPassword} autoComplete="current-password" />

        {error && <p className="form-error" role="alert">{t(error)}</p>}

        <Btn type="submit" size="lg" disabled={busy || !email || password.length < 8}>{t("login")}</Btn>
        <Link to="/signup" className="link-btn">{t("noAccount")}</Link>
        <p className="muted small">{OFFLINE ? t("offlineMode") : t("serverMode")}</p>
      </form>
    </div>
  );
}
