import { useEffect, useMemo, useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Link, type LinkProps } from "react-router-dom";
import { audio } from "../features/audio/audioService";
import { FamilyPortrait, type FamilyMember } from "../features/mascot/Mascot";
import { WorldBadge } from "../features/worlds/WorldBadge";
import { worldMeta } from "../features/worlds/worlds";
import { useI18n } from "../i18n";

type Variant = "primary" | "secondary" | "coral" | "ghost";

/** Game-style pill button that plays the soft tap sound. */
export function Btn({ variant = "primary", size = "md", className = "", onClick, children, ...rest }:
  { variant?: Variant; size?: "sm" | "md" | "lg" } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...rest}
      className={`btn btn--${variant} btn--${size} ${className}`}
      onClick={(e) => {
        void audio.effect("click");
        onClick?.(e);
      }}
    >
      {children}
    </button>
  );
}

export function LinkBtn({ variant = "primary", size = "md", className = "", children, ...rest }:
  { variant?: Variant; size?: "sm" | "md" | "lg" } & LinkProps) {
  return (
    <Link {...rest} className={`btn btn--${variant} btn--${size} ${className}`} onClick={() => void audio.effect("click")}>
      {children}
    </Link>
  );
}

/** Stitched title banner like the ones on the reference board: French on top, Arabic below. */
export function Ribbon({ world, fr, ar, small = false, badge = true }: { world: string; fr: string; ar: string; small?: boolean; badge?: boolean }) {
  const w = worldMeta(world);
  const { lang } = useI18n();
  return (
    <div className={`ribbon ${small ? "ribbon--small" : ""}`} style={{ ["--b1" as string]: w.banner[0], ["--b2" as string]: w.banner[1] }}>
      {badge && <WorldBadge id={world} size={small ? 44 : 64} />}
      <div className="ribbon__text">
        <strong lang={lang}>{lang === "fr" ? fr : ar}</strong>
      </div>
    </div>
  );
}

export function ProgressRing({ value, size = 56, color = "var(--teal)", label }: { value: number; size?: number; color?: string; label?: ReactNode }) {
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  return (
    <span className="ring" style={{ width: size, height: size }} role="img" aria-label={`${Math.round(value * 100)}%`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(18,72,90,.12)" strokeWidth="6" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="6" strokeLinecap="round"
          strokeDasharray={`${c * value} ${c}`} transform={`rotate(-90 ${size / 2} ${size / 2})`} style={{ transition: "stroke-dasharray .8s ease" }} />
      </svg>
      <span className="ring__label">{label ?? `${Math.round(value * 100)}%`}</span>
    </span>
  );
}

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="spinner" role="status" aria-live="polite">
      <img src="/img/logo/yarn-ball.png" alt="" width={64} height={60} />
      {label && <p>{label}</p>}
    </div>
  );
}

const CONFETTI = ["#F6B93B", "#17908A", "#F26B6B", "#A57BD0", "#F29B3E", "#7FD0C5"];
/** Yarn-coloured confetti burst (purely decorative; disabled by prefers-reduced-motion in CSS). */
export function Confetti({ count = 26 }: { count?: number }) {
  const bits = useMemo(
    () => Array.from({ length: count }, (_, i) => ({
      left: Math.round(Math.random() * 100), delay: Math.random() * 0.5, dur: 1.6 + Math.random() * 1.4,
      color: CONFETTI[i % CONFETTI.length], rot: Math.round(Math.random() * 360), w: 6 + Math.round(Math.random() * 8),
    })),
    [count]
  );
  return (
    <div className="confetti" aria-hidden="true">
      {bits.map((b, i) => (
        <i key={i} style={{ left: `${b.left}%`, background: b.color, width: b.w, animationDelay: `${b.delay}s`, animationDuration: `${b.dur}s`, transform: `rotate(${b.rot}deg)` }} />
      ))}
    </div>
  );
}

/** Rope-like connector between two stops on the journey map. */
export function ThreadPath({ flip = false }: { flip?: boolean }) {
  return (
    <svg className={`thread-path ${flip ? "thread-path--flip" : ""}`} viewBox="0 0 120 90" aria-hidden="true">
      <path d="M20 0C20 40 100 40 100 90" fill="none" stroke="#F6B93B" strokeWidth="7" strokeLinecap="round" strokeDasharray="14 10" />
      <path d="M20 0C20 40 100 40 100 90" fill="none" stroke="#17908A" strokeWidth="7" strokeLinecap="round" strokeDasharray="14 10" strokeDashoffset="8" />
      <path d="M20 0C20 40 100 40 100 90" fill="none" stroke="#F26B6B" strokeWidth="7" strokeLinecap="round" strokeDasharray="14 10" strokeDashoffset="16" />
    </svg>
  );
}

export function ChildAvatar({ who, size = 44 }: { who: FamilyMember; size?: number }) {
  return <FamilyPortrait who={who} size={size} className="avatar" />;
}

export function useMedia(query: string): boolean {
  const [match, setMatch] = useState(() => (typeof window !== "undefined" ? window.matchMedia(query).matches : false));
  useEffect(() => {
    const m = window.matchMedia(query);
    const on = () => setMatch(m.matches);
    on();
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, [query]);
  return match;
}

export function ErrorNote({ children, onRetry, retryLabel }: { children: ReactNode; onRetry?: () => void; retryLabel?: string }) {
  return (
    <div className="error-note" role="alert">
      <p>{children}</p>
      {onRetry && <Btn variant="secondary" size="sm" onClick={onRetry}>{retryLabel}</Btn>}
    </div>
  );
}
