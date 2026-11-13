import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { useSpeaking } from "../audio/useAudio";

/** Expressions cut from the official mascot sheet. happy = hello wave, focused = reading, proud = hugging the star. */
export type Mood = "happy" | "curious" | "thinking" | "encouraging" | "celebrating" | "focused" | "oops" | "surprised" | "sleepy" | "proud" | "running" | "love";
export type MascotVariant = "classic" | "adventure" | "explorer" | "creative" | "sporty" | "winter";
export type FamilyMember = "nasj" | "papa" | "maman" | "sister" | "brother";

/** Head-and-shoulders expression of the NASJ mascot (artwork from the style guide). */
export function MascotFace({ mood = "happy", size = 96, className = "" }: { mood?: Mood; size?: number; className?: string }) {
  return (
    <img
      className={`mascot-face ${className}`}
      src={`/img/mascot/expr-${mood}.webp`}
      alt=""
      width={size}
      height={size}
      style={{ width: size, height: "auto" }}
      draggable={false}
    />
  );
}

/** Full-body mascot in the currently selected outfit. */
export function MascotBody({ variant = "classic", mood = "happy", height = 220, className = "", outfitArt = false }: { variant?: MascotVariant; mood?: Mood; height?: number; className?: string; outfitArt?: boolean }) {
  // Default look = the expression-sheet mascot (pose follows `mood`); an unlocked outfit replaces it with that outfit's artwork. `outfitArt` forces the standing outfit-sheet art (welcome screen, outfit gallery).
  const src = variant === "classic" && !outfitArt ? `/img/mascot/expr-${mood}.webp` : `/img/mascot/variant-${variant}.webp`;
  return <img className={`mascot-body ${className}`} src={src} alt="" style={{ height }} draggable={false} />;
}

/**
 * Mascot that "talks": while a voice line plays (see audioService) it alternates between two official poses and bobs.
 * Welcome screen = the two standing outfit-sheet poses (default); everywhere else = expression-sheet poses via `poses`. Only official artwork is used: nothing is redrawn.
 * With reduced motion it stays on the neutral pose.
 */
export function TalkingMascot({ height = 280, className = "", onTap, poses = ["/img/mascot/classic.webp", "/img/mascot/wave.webp"] }: { height?: number; className?: string; onTap?: () => void; poses?: [string, string] }) {
  const speaking = useSpeaking();
  const still = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const talk = speaking && !still;
  const [alt, setAlt] = useState(false);
  useEffect(() => {
    if (!talk) { setAlt(false); return; }
    const id = window.setInterval(() => setAlt((a) => !a), 380);
    return () => window.clearInterval(id);
  }, [talk]);
  const Tag = onTap ? "button" : "span";
  return (
    <Tag {...(onTap ? { type: "button" as const, onClick: onTap } : {})} className={`talking-mascot ${talk ? "is-talking" : ""} ${onTap ? "talking-mascot--tap" : ""} ${className}`} style={{ height }}>
      <img src={poses[0]} alt="" draggable={false} style={{ height }} className={alt ? "is-hidden" : ""} />
      <img src={poses[1]} alt="" draggable={false} style={{ height }} className={`talking-mascot__alt ${alt ? "" : "is-hidden"}`} />
    </Tag>
  );
}

export function FamilyPortrait({ who, size = 72, className = "" }: { who: FamilyMember; size?: number; className?: string }) {
  const style: CSSProperties = { width: size, height: size };
  return (
    <span className={`portrait ${className}`} style={style}>
      <img src={`/img/family/${who}.png`} alt="" draggable={false} />
    </span>
  );
}

/** A mascot expression with a speech bubble, used for hints, encouragement and introductions. */
export function MascotBubble({ mood = "happy", children, size = 84, side = "start" }: { mood?: Mood; children: ReactNode; size?: number; side?: "start" | "end" }) {
  const speaking = useSpeaking();
  return (
    <div className={`bubble-row bubble-row--${side}`}>
      <MascotFace mood={mood} size={size} className={speaking ? "is-talking" : ""} />
      <div className="bubble" role="status">
        {children}
      </div>
    </div>
  );
}

export const FAMILY: FamilyMember[] = ["nasj", "papa", "maman", "sister", "brother"];
