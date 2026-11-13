import type { Lang } from "../../app/types";
import { lexiconText } from "./lexicon";

export interface AudioSettings {
  sfx: boolean;
  narration: boolean;
  music: boolean;
  volume: number; // 0..1
  speed: number; // voice speed 0.6..1.1 (device voice)
  muted: boolean; // master switch: silences effects, voices (even the "listen" buttons) and music
}
export type Effect = "click" | "correct" | "try-again" | "reward" | "weave" | "welcome";

interface Manifest {
  effects: Record<string, string>;
  music: Record<string, string>;
  speech: Record<string, string>;
}

const STORE = "nasj.audio";
const isNative = () =>
  typeof window !== "undefined" && Boolean((window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.());
const DEFAULTS: AudioSettings = { sfx: true, narration: true, music: false, volume: 0.8, speed: 0.85, muted: false };
const BASE = `${import.meta.env.BASE_URL}audio/`;

function load(): AudioSettings {
  try {
    const raw = localStorage.getItem(STORE);
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    /* ignore */
  }
  return { ...DEFAULTS };
}

/**
 * Reusable audio service. Three independent channels so nothing overlaps unexpectedly:
 *  - effects   (one clip at a time)
 *  - narration (one voice at a time; a new line replaces the previous one)
 *  - music     (a quiet loop)
 * Audio is never required to finish an activity: every failure path is silent and the UI always
 * shows the text/visual alternative.
 */
class AudioService {
  private settings: AudioSettings = load();
  private listeners = new Set<() => void>();
  private manifest: Manifest = { effects: {}, music: {}, speech: {} };
  private manifestReady: Promise<void>;
  private effectEls = new Map<string, HTMLAudioElement>();
  private currentEffect: HTMLAudioElement | null = null;
  private narrationEl: HTMLAudioElement | null = null;
  private musicEl: HTMLAudioElement | null = null;
  private unlocked = false;
  private last: { key?: string; text: string; lang: Lang } | null = null;
  private speaking = false;
  private speechId = 0;
  private speakListeners = new Set<() => void>();

  constructor() {
    this.manifestReady = fetch(`${BASE}manifest.json`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((m: Manifest) => {
        this.manifest = { effects: m.effects ?? {}, music: m.music ?? {}, speech: m.speech ?? {} };
      })
      .catch(() => undefined); // no manifest => silent effects + device voice only
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
          this.musicEl?.pause();
          this.stopSpeech();
        } else this.startMusic();
      });
    }
  }

  // ---- "is a voice playing right now?" (lets the mascot move its mouth) ----
  isSpeaking = () => this.speaking;
  subscribeSpeaking = (fn: () => void) => {
    this.speakListeners.add(fn);
    return () => this.speakListeners.delete(fn);
  };
  private setSpeaking(v: boolean, id = this.speechId) {
    if (id !== this.speechId || this.speaking === v) return; // ignore events from a line that was replaced
    this.speaking = v;
    this.speakListeners.forEach((l) => l());
  }

  // ---- settings (observable) ----
  getSettings = () => this.settings;
  subscribe = (fn: () => void) => {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  };
  update(patch: Partial<AudioSettings>) {
    this.settings = { ...this.settings, ...patch };
    try {
      localStorage.setItem(STORE, JSON.stringify(this.settings));
    } catch {
      /* ignore */
    }
    if (this.musicEl) this.musicEl.volume = this.settings.volume * 0.35;
    if (this.settings.muted || !this.settings.music) this.musicEl?.pause();
    else this.startMusic();
    if (this.settings.muted || !this.settings.narration) this.stopSpeech();
    if (this.settings.muted) {
      this.currentEffect?.pause();
    }
    this.listeners.forEach((l) => l());
  }

  /** Browsers only allow sound after a user gesture; call from the first tap. */
  unlock() {
    if (this.unlocked) return;
    this.unlocked = true;
    this.startMusic();
  }

  // ---- effects ----
  async effect(name: Effect) {
    if (!this.settings.sfx || this.settings.muted) return;
    await this.manifestReady;
    const file = this.manifest.effects[name];
    if (!file) return;
    let el = this.effectEls.get(name);
    if (!el) {
      el = new Audio(BASE + file);
      el.preload = "auto";
      this.effectEls.set(name, el);
    }
    if (this.currentEffect && this.currentEffect !== el) this.currentEffect.pause();
    this.currentEffect = el;
    el.volume = this.settings.volume;
    el.currentTime = 0;
    el.play().catch(() => undefined);
  }

  // ---- narration / pronunciation ----
  /**
   * Speaks a line. `key` identifies a recorded file in the manifest (e.g. "ar/words/qamar");
   * when none exists, the device's speech synthesis says `text` instead.
   * `manual: true` is used by an explicit "listen" button and ignores the auto-narration toggle.
   */
  async speak(key: string | undefined, text: string, lang: Lang, opts: { manual?: boolean } = {}) {
    if (this.settings.muted || (!opts.manual && !this.settings.narration)) return;
    this.stopSpeech();
    const id = this.speechId;
    const lex = lexiconText(key);
    const line = { key, text: lex?.text ?? text, lang: lex?.lang ?? lang };
    this.last = line;
    await this.manifestReady;
    const file = key ? this.manifest.speech[key] : undefined;
    if (file) {
      const el = new Audio(BASE + file);
      el.volume = this.settings.volume;
      this.narrationEl = el;
      el.addEventListener("playing", () => this.setSpeaking(true, id));
      el.addEventListener("ended", () => this.setSpeaking(false, id));
      el.addEventListener("pause", () => this.setSpeaking(false, id));
      el.addEventListener("error", () => this.tts(line.text, line.lang, id), { once: true });
      el.play().catch(() => this.tts(line.text, line.lang, id));
      return;
    }
    this.tts(line.text, line.lang, id);
  }
  replay() {
    if (this.last) void this.speak(this.last.key, this.last.text, this.last.lang, { manual: true });
  }
  stopSpeech() {
    this.narrationEl?.pause();
    this.narrationEl = null;
    this.speechId++;
    this.setSpeaking(false);
    try {
      if (typeof speechSynthesis !== "undefined") speechSynthesis.cancel();
    } catch {
      /* some Android web views expose a broken speechSynthesis: never let sound crash the app */
    }
    if (isNative()) void import("@capacitor-community/text-to-speech").then((m) => m.TextToSpeech.stop()).catch(() => undefined);
  }

  /** True when the device can say text in this language (Arabic voices are often missing on desktops). */
  voiceAvailable(lang: Lang): boolean {
    if (isNative()) return true; // the phone's engine decides; we cannot know synchronously
    try {
      if (typeof speechSynthesis === "undefined") return false;
      return speechSynthesis.getVoices().some((v) => v.lang.toLowerCase().startsWith(lang));
    } catch {
      return false;
    }
  }

  private tts(text: string, lang: Lang, id = this.speechId) {
    if (this.settings.muted) return;
    if (isNative()) {
      // Android's web view has no speechSynthesis: use the phone's own text-to-speech engine instead.
      void import("@capacitor-community/text-to-speech")
        .then(async ({ TextToSpeech }) => {
          await TextToSpeech.stop().catch(() => undefined);
          this.setSpeaking(true, id);
          await TextToSpeech.speak({ text, lang: lang === "ar" ? "ar-SA" : "fr-FR", rate: Math.min(1.1, this.settings.speed + 0.05), pitch: 1.1, volume: this.settings.volume, category: "ambient" });
          this.setSpeaking(false, id); // resolves when the phone has finished speaking
        })
        .catch(() => this.setSpeaking(false, id)); // no voice installed: the text stays on screen
      return;
    }
    try {
      if (typeof speechSynthesis === "undefined" || typeof SpeechSynthesisUtterance === "undefined" || !text.trim()) return;
      const voice = pickVoice(lang);
      // Long lines are cut into sentences: engines stop reading after ~15 s and read short chunks more naturally.
      const chunks = text.match(/[^.!?؟…\n]+[.!?؟…]*/g)?.map((c) => c.trim()).filter(Boolean) ?? [text];
      speechSynthesis.cancel();
      chunks.forEach((c, k) => {
        const u = new SpeechSynthesisUtterance(c);
        u.lang = voice?.lang ?? (lang === "ar" ? "ar-SA" : "fr-FR");
        u.rate = this.settings.speed;
        u.pitch = 1.1;
        u.volume = this.settings.volume;
        if (voice) u.voice = voice;
        if (k === 0) u.onstart = () => this.setSpeaking(true, id);
        if (k === chunks.length - 1) u.onend = () => this.setSpeaking(false, id);
        u.onerror = () => this.setSpeaking(false, id);
        speechSynthesis.speak(u);
      });
    } catch {
      /* no usable voice on this device: the text stays on screen */
    }
  }

  // ---- background music ----
  async startMusic() {
    if (!this.unlocked || this.settings.muted || !this.settings.music || (typeof document !== "undefined" && document.hidden)) return;
    await this.manifestReady;
    const file = this.manifest.music.ambient;
    if (!file) return;
    if (!this.musicEl) {
      this.musicEl = new Audio(BASE + file);
      this.musicEl.loop = true;
    }
    this.musicEl.volume = this.settings.volume * 0.35;
    this.musicEl.play().catch(() => undefined);
  }
}

/** Best available device voice: exact language first, then natural / neural / network voices. */
function pickVoice(lang: Lang): SpeechSynthesisVoice | undefined {
  try {
    const vs = speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().replace("_", "-").startsWith(lang));
    const score = (v: SpeechSynthesisVoice) =>
      (/natural|neural|online|premium|enhanced|google/i.test(v.name) ? 4 : 0) +
      (lang === "fr" && /^fr-fr/i.test(v.lang) ? 2 : 0) +
      (lang === "ar" && /^ar-(sa|eg|ae)/i.test(v.lang) ? 1 : 0) +
      (v.localService ? 0 : 1);
    return vs.sort((a, b) => score(b) - score(a))[0];
  } catch {
    return undefined;
  }
}

export const audio = new AudioService();
