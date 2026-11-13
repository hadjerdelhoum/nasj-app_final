import type {
  AnswerResult,
  Child,
  CompleteResult,
  Dashboard,
  Lang,
  Reward,
  Session,
  Story,
  Universe,
} from "./types";

// Browser: same-origin ("/api", proxied in dev). Capacitor/native: set VITE_API_URL.
const BASE = `${(import.meta.env.VITE_API_URL as string | undefined) ?? ""}/api`;
const TOKEN_KEY = "nasj.token";

export { ApiError } from "./errors";
import { ApiError } from "./errors";
import { makeLocalApi } from "./localApi";

export const tokenStore = {
  get: () => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set: (t: string | null) => {
    try {
      if (t) localStorage.setItem(TOKEN_KEY, t);
      else localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* storage unavailable (private mode): session simply won't persist */
    }
  },
};

async function request<T>(path: string, opts: { method?: string; body?: unknown } = {}): Promise<T> {
  const token = tokenStore.get();
  let res: Response;
  try {
    res = await fetch(BASE + path, {
      method: opts.method ?? (opts.body !== undefined ? "POST" : "GET"),
      headers: {
        ...(opts.body !== undefined ? { "content-type": "application/json" } : {}),
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    });
  } catch {
    throw new ApiError(0, "network");
  }
  const raw = await res.text();
  let data: unknown = {};
  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {
    // Not JSON (for example the app's own HTML page because no API address was configured at build time).
    if (res.ok) throw new ApiError(0, "network");
  }
  if (res.ok && (typeof data !== "object" || data === null)) throw new ApiError(0, "network");
  if (!res.ok) {
    // A static host answers 404/405 to API calls: that is "no server here", not a real API error.
    if (res.status === 404 || res.status === 405) throw new ApiError(0, "network");
    if (res.status === 401 && token) window.dispatchEvent(new Event("nasj:unauthorized"));
    throw new ApiError(res.status, (data as { error?: string }).error ?? "error");
  }
  return data as T;
}

// A sign-in answer without a token means we did not really reach the NASJ API.
async function tokenOnly(p: Promise<{ token: string }>) {
  const r = await p;
  if (!r || typeof r.token !== "string") throw new ApiError(0, "network");
  return r;
}

/**
 * Offline mode: the Android app built without VITE_API_URL keeps everything on the device.
 * Set VITE_LOCAL=1 to force it in a browser, VITE_LOCAL=0 to force the server.
 */
const forced = import.meta.env.VITE_LOCAL as string | undefined;
// Any published build (APK or website) without an API address keeps everything on the device.
// Only `vite dev` (which proxies to the local backend) or a build with VITE_API_URL talks to a server.
export const OFFLINE = forced === "1" || (forced !== "0" && !import.meta.env.DEV && !import.meta.env.VITE_API_URL);

export interface ParentProfile { firstName: string; lastName: string }

const remoteApi = {
  health: () => request<{ ok: boolean; assistant: boolean }>("/health"),
  register: (email: string, password: string, _profile?: ParentProfile) => tokenOnly(request<{ token: string }>("/auth/register", { body: { email, password } })),
  login: (email: string, password: string) => tokenOnly(request<{ token: string }>("/auth/login", { body: { email, password } })),

  children: () => request<Child[]>("/children"),
  createChild: (c: { name: string; age: number; language: Lang }) => request<Child>("/children", { body: c }),
  collection: (childId: string) => request<Reward[]>(`/children/${childId}/collection`),
  dashboard: (childId: string) => request<Dashboard>(`/children/${childId}/dashboard`),

  universes: (childId: string) => request<Universe[]>(`/universes?childId=${childId}`),
  startSession: (activityId: string, childId: string) => request<Session>(`/activities/${activityId}/session?childId=${childId}`),
  answer: (sessionId: string, childId: string, questionId: string, choice: number) =>
    request<AnswerResult>(`/sessions/${sessionId}/answer`, { body: { childId, questionId, choice } }),
  complete: (sessionId: string, childId: string) => request<CompleteResult>(`/sessions/${sessionId}/complete`, { body: { childId } }),
  story: (id: string) => request<Story>(`/stories/${id}`),

  ask: (question: string) => request<{ answer: string }>("/assistant", { body: { question } }),
};

export const api: typeof remoteApi = OFFLINE ? makeLocalApi(() => tokenStore.get()) : remoteApi;
