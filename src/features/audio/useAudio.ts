import { useEffect, useSyncExternalStore } from "react";
import { audio, type AudioSettings } from "./audioService";

/** React binding for the audio service. */
export function useAudio() {
  const settings: AudioSettings = useSyncExternalStore(audio.subscribe, audio.getSettings);
  return { settings, audio };
}

/** Unlocks audio on the first tap anywhere (browser autoplay policy) and warms the voice list. */
export function useAudioUnlock() {
  useEffect(() => {
    const unlock = () => audio.unlock();
    window.addEventListener("pointerdown", unlock, { once: true });
    try {
      if (typeof speechSynthesis !== "undefined") speechSynthesis.getVoices();
    } catch {
      /* broken speech engine on this device: ignore */
    }
    return () => window.removeEventListener("pointerdown", unlock);
  }, []);
}

/** True while a voice line is playing (recorded file or device voice). */
export function useSpeaking(): boolean {
  return useSyncExternalStore(audio.subscribeSpeaking, audio.isSpeaking);
}
