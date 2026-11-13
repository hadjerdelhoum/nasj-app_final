import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, OFFLINE } from "../../app/api";
import { useAuth } from "../../app/state";
import { Btn } from "../../components/ui";
import { useI18n } from "../../i18n";
import type { Key } from "../../i18n/dictionary";
import { LangSwitch } from "../settings/LangSwitch";
import { authErrorKey } from "./LoginPage";
import { PasswordField } from "./PasswordField";

type Errors = Partial<Record<"lastName" | "firstName" | "email" | "password" | "confirm", Key>>;

/** Create the parent account: name, first name, e-mail, password (twice). Separate from the sign-in page. */
export function SignUpPage() {
  const { t } = useI18n();
  const { signIn } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ lastName: "", firstName: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const [serverError, setServerError] = useState<Key | null>(null);
  const set = (k: keyof typeof f) => (v: string) => { setF((x) => ({ ...x, [k]: v })); setErrors((e) => ({ ...e, [k]: undefined })); };

  function validate(): Errors {
    const e: Errors = {};
    if (!f.lastName.trim()) e.lastName = "fieldRequired";
    if (!f.firstName.trim()) e.firstName = "fieldRequired";
    if (!f.email.trim()) e.email = "fieldRequired";
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email.trim())) e.email = "invalidEmail";
    if (f.password.length < 8) e.password = "passwordHint";
    if (f.confirm !== f.password) e.confirm = "passwordsDiffer";
    return e;
  }

  async function submit(ev: FormEvent) {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    setBusy(true);
    setServerError(null);
    try {
      const r = await api.register(f.email.trim(), f.password, { firstName: f.firstName, lastName: f.lastName });
      signIn(r.token);
      nav("/children", { replace: true });
    } catch (err) {
      setServerError(authErrorKey(err));
    } finally {
      setBusy(false);
    }
  }

  const text = (k: "lastName" | "firstName", label: Key, auto: string) => (
    <label className={`field${errors[k] ? " field--bad" : ""}`}>
      <span>{t(label)}</span>
      <input autoComplete={auto} value={f[k]} onChange={(e) => set(k)(e.target.value)} aria-invalid={!!errors[k]} />
      <small className="field__error" role={errors[k] ? "alert" : undefined}>{errors[k] ? t(errors[k]!) : ""}</small>
    </label>
  );

  return (
    <div className="auth">
      <div className="auth__top"><LangSwitch /></div>
      <form className="card auth__card auth__card--wide" onSubmit={submit} noValidate>
        <img className="auth__logo auth__logo--sm" src="/img/logo/nasj-logo.png" alt="NASJ نسج" />
        <h1>{t("registerTitle")}</h1>
        <p className="auth__sub">{t("signupSub")}</p>

        <fieldset className="auth__group">
          <legend>{t("parentInfo")}</legend>
          <div className="auth__row">
            {text("lastName", "lastName", "family-name")}
            {text("firstName", "firstName", "given-name")}
          </div>
        </fieldset>

        <fieldset className="auth__group">
          <legend>{t("loginInfo")}</legend>
          <label className={`field${errors.email ? " field--bad" : ""}`}>
            <span>{t("email")}</span>
            <input type="email" inputMode="email" autoComplete="email" dir="ltr" value={f.email} onChange={(e) => set("email")(e.target.value)} aria-invalid={!!errors.email} />
            <small className="field__error" role={errors.email ? "alert" : undefined}>{errors.email ? t(errors.email) : ""}</small>
          </label>
          <div className="auth__row">
            <PasswordField label={t("password")} value={f.password} onChange={set("password")} autoComplete="new-password" hint={t("passwordHint")} error={errors.password ? t(errors.password) : null} />
            <PasswordField label={t("confirmPassword")} value={f.confirm} onChange={set("confirm")} autoComplete="new-password" error={errors.confirm ? t(errors.confirm) : null} />
          </div>
        </fieldset>

        {serverError && <p className="form-error" role="alert">{t(serverError)}</p>}
        <Btn type="submit" size="lg" disabled={busy}>{t("createAccount")}</Btn>
        <Link to="/login" className="link-btn">{t("haveAccount")}</Link>
        <p className="muted small">{OFFLINE ? t("offlineMode") : t("serverMode")}</p>
      </form>
    </div>
  );
}
