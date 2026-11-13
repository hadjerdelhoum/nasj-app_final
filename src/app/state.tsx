import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api, tokenStore } from "./api";
import type { Child, Reward, Universe } from "./types";
import { useI18n } from "../i18n";

/* ------------------------------------------------------------------ auth */

interface AuthState {
  token: string | null;
  assistantEnabled: boolean;
  signIn: (token: string) => void;
  signOut: () => void;
}
const AuthCtx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => tokenStore.get());
  const [assistantEnabled, setAssistant] = useState(false);

  const signOut = useCallback(() => {
    tokenStore.set(null);
    setToken(null);
  }, []);
  const signIn = useCallback((t: string) => {
    tokenStore.set(t);
    setToken(t);
  }, []);

  useEffect(() => {
    const onUnauthorized = () => signOut();
    window.addEventListener("nasj:unauthorized", onUnauthorized);
    return () => window.removeEventListener("nasj:unauthorized", onUnauthorized);
  }, [signOut]);

  useEffect(() => {
    api.health().then((h) => setAssistant(Boolean(h.assistant))).catch(() => setAssistant(false));
  }, []);

  const value = useMemo(() => ({ token, assistantEnabled, signIn, signOut }), [token, assistantEnabled, signIn, signOut]);
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}
export function useAuth() {
  const v = useContext(AuthCtx);
  if (!v) throw new Error("useAuth outside provider");
  return v;
}

/* -------------------------------------------------------------- children */

const ACTIVE_KEY = "nasj.child";
export type Avatar = "nasj" | "papa" | "maman" | "sister" | "brother";
const avatarKey = (id: string) => `nasj.avatar.${id}`;

interface ChildState {
  children: Child[];
  loaded: boolean;
  child: Child | null;
  select: (id: string | null) => void;
  add: (c: { name: string; age: number; language: "fr" | "ar" }, avatar: Avatar) => Promise<Child>;
  avatarOf: (id: string) => Avatar;
}
const ChildCtx = createContext<ChildState | null>(null);

export function ChildProvider({ children: kids }: { children: ReactNode }) {
  const { token } = useAuth();
  const { setLang } = useI18n();
  const [children, setChildren] = useState<Child[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(() => {
    try {
      return localStorage.getItem(ACTIVE_KEY);
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (!token) {
      setChildren([]);
      setLoaded(false);
      return;
    }
    let live = true;
    api
      .children()
      .then((c) => live && setChildren(c))
      .catch(() => undefined)
      .finally(() => live && setLoaded(true));
    return () => {
      live = false;
    };
  }, [token]);

  const child = useMemo(() => children.find((c) => c.id === activeId) ?? null, [children, activeId]);

  const select = useCallback(
    (id: string | null) => {
      setActiveId(id);
      try {
        if (id) localStorage.setItem(ACTIVE_KEY, id);
        else localStorage.removeItem(ACTIVE_KEY);
      } catch {
        /* ignore */
      }
      const c = children.find((x) => x.id === id);
      if (c) setLang(c.language);
    },
    [children, setLang]
  );

  const avatarOf = useCallback((id: string): Avatar => {
    try {
      const a = localStorage.getItem(avatarKey(id)) as Avatar | null;
      if (a) return a;
    } catch {
      /* ignore */
    }
    return "nasj";
  }, []);

  const add = useCallback(
    async (c: { name: string; age: number; language: "fr" | "ar" }, avatar: Avatar) => {
      const created = await api.createChild(c);
      try {
        localStorage.setItem(avatarKey(created.id), avatar);
      } catch {
        /* ignore */
      }
      setChildren((prev) => [...prev, created]);
      return created;
    },
    []
  );

  const value = useMemo(() => ({ children, loaded, child, select, add, avatarOf }), [children, loaded, child, select, add, avatarOf]);
  return <ChildCtx.Provider value={value}>{kids}</ChildCtx.Provider>;
}
export function useChildren() {
  const v = useContext(ChildCtx);
  if (!v) throw new Error("useChildren outside provider");
  return v;
}

/* -------------------------------------------------------------- progress */

interface ProgressState {
  universes: Universe[] | null;
  rewards: Reward[];
  earned: Set<string>;
  threads: number;
  error: boolean;
  refresh: () => Promise<void>;
}
const ProgressCtx = createContext<ProgressState | null>(null);

export function ProgressProvider({ children: kids }: { children: ReactNode }) {
  const { child } = useChildren();
  const [universes, setUniverses] = useState<Universe[] | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [error, setError] = useState(false);

  const refresh = useCallback(async () => {
    if (!child) return;
    try {
      const [u, r] = await Promise.all([api.universes(child.id), api.collection(child.id)]);
      setUniverses(u);
      setRewards(r);
      setError(false);
    } catch {
      setError(true);
    }
  }, [child]);

  useEffect(() => {
    setUniverses(null);
    setRewards([]);
    void refresh();
  }, [refresh]);

  const earned = useMemo(() => new Set(rewards.map((r) => r.id)), [rewards]);
  const threads = useMemo(() => rewards.filter((r) => r.kind === "thread").length, [rewards]);
  const value = useMemo(() => ({ universes, rewards, earned, threads, error, refresh }), [universes, rewards, earned, threads, error, refresh]);
  return <ProgressCtx.Provider value={value}>{kids}</ProgressCtx.Provider>;
}
export function useProgress() {
  const v = useContext(ProgressCtx);
  if (!v) throw new Error("useProgress outside provider");
  return v;
}
