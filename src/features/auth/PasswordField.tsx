import { useId, useState } from "react";
import { useI18n } from "../../i18n";

/** Password input with a visible label, an optional hint/error under it and a show/hide toggle (large enough to tap). */
export function PasswordField({ label, value, onChange, autoComplete, hint, error }: {
  label: string; value: string; onChange: (v: string) => void; autoComplete: string; hint?: string; error?: string | null;
}) {
  const { t } = useI18n();
  const [show, setShow] = useState(false);
  const id = useId();
  return (
    <div className={`field${error ? " field--bad" : ""}`}>
      <label htmlFor={id}>{label}</label>
      <div className="pw">
        <input id={id} type={show ? "text" : "password"} autoComplete={autoComplete} dir="ltr" required minLength={8}
          value={value} onChange={(e) => onChange(e.target.value)} aria-invalid={!!error} aria-describedby={`${id}-m`} />
        <button type="button" className="pw__btn" onClick={() => setShow((s) => !s)} aria-pressed={show}>{show ? t("hidePw") : t("showPw")}</button>
      </div>
      <small id={`${id}-m`} className={error ? "field__error" : ""} role={error ? "alert" : undefined}>{error ?? hint}</small>
    </div>
  );
}
