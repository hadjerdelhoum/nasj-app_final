/**
 * Optional real AI assistant using Google's Gemini API (free tier, no credit card).
 * The parent pastes their own key in the Parents area; it is stored only on this device.
 * Nothing about the child (name, age, progress) is ever sent: only the question text.
 */
const STORE = "nasj.ai";
const ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";
// Free-tier model ids published by Google (Oct 2026). They are tried in order; the one that works is remembered.
export const GEMINI_MODELS = ["gemini-3.8-flash", "gemini-3.5-flash-lite", "gemini-3.1-flash-lite", "gemini-2.5-flash"];

export interface AiConfig { key: string; model: string }
export type AiErrorKind = "key" | "limit" | "network" | "blocked" | "other";
export class AiError extends Error {
  constructor(public kind: AiErrorKind, message: string = kind) {
    super(message);
  }
}

export function loadAi(): AiConfig {
  try {
    const raw = localStorage.getItem(STORE);
    if (raw) {
      const c = JSON.parse(raw) as Partial<AiConfig>;
      return { key: String(c.key ?? ""), model: String(c.model ?? "") };
    }
  } catch { /* none saved */ }
  return { key: "", model: "" };
}
export function saveAi(c: AiConfig) {
  try {
    if (c.key) localStorage.setItem(STORE, JSON.stringify(c));
    else localStorage.removeItem(STORE);
  } catch { /* storage unavailable */ }
}
export const aiReady = () => loadAi().key.length > 10;

const SYSTEM =
  "You are NASJ, a gentle, encouraging learning companion for children aged 3 to 10. " +
  "Answer in the same language as the question (French or Arabic) in at most three very short, simple sentences, with words a young child knows. " +
  "Stay on educational, child-appropriate topics (letters, numbers, shapes, nature, animals, stories, science for kids). " +
  "Never ask for or repeat personal information (name, address, school, phone). " +
  "If asked about anything unsafe, scary, violent, adult or medical, kindly say you cannot help with that and suggest asking a parent or a teacher. " +
  "Do not use markdown, lists or emojis.";

const SAFETY = ["HARM_CATEGORY_HARASSMENT", "HARM_CATEGORY_HATE_SPEECH", "HARM_CATEGORY_SEXUALLY_EXPLICIT", "HARM_CATEGORY_DANGEROUS_CONTENT"].map((category) => ({
  category,
  threshold: "BLOCK_LOW_AND_ABOVE",
}));

async function callModel(model: string, key: string, question: string): Promise<string> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 15000);
  let res: Response;
  try {
    res = await fetch(`${ENDPOINT}/${encodeURIComponent(model)}:generateContent`, {
      method: "POST",
      signal: ctrl.signal,
      headers: { "content-type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM }] },
        contents: [{ role: "user", parts: [{ text: question }] }],
        generationConfig: { maxOutputTokens: 800, temperature: 0.5 },
        safetySettings: SAFETY,
      }),
    });
  } catch {
    throw new AiError("network");
  } finally {
    clearTimeout(timer);
  }
  if (res.status === 401 || res.status === 403) throw new AiError("key");
  if (res.status === 429) throw new AiError("limit");
  if (res.status === 400 || res.status === 404) throw new AiError("other", "model"); // unknown model id or key rejected: try the next one
  if (!res.ok) throw new AiError("other", String(res.status));
  const data = (await res.json().catch(() => null)) as {
    candidates?: { content?: { parts?: { text?: string }[] }; finishReason?: string }[];
    promptFeedback?: { blockReason?: string };
  } | null;
  if (data?.promptFeedback?.blockReason) throw new AiError("blocked");
  const text = (data?.candidates?.[0]?.content?.parts ?? []).map((p) => p.text ?? "").join("").trim();
  if (!text) throw new AiError("blocked");
  return text.replace(/[*_#`]/g, "").slice(0, 600);
}

/** Asks Gemini. Throws AiError; the caller falls back to the built-in helper. */
export async function askGemini(question: string): Promise<string> {
  const cfg = loadAi();
  if (cfg.key.length <= 10) throw new AiError("key");
  const q = question.trim().slice(0, 300);
  const order = [cfg.model, ...GEMINI_MODELS].filter((m, i, a) => m && a.indexOf(m) === i);
  let last: AiError = new AiError("other");
  for (const model of order) {
    try {
      const text = await callModel(model, cfg.key, q);
      if (model !== cfg.model) saveAi({ key: cfg.key, model });
      return text;
    } catch (e) {
      last = e instanceof AiError ? e : new AiError("other");
      if (!(last.kind === "other" && last.message === "model")) throw last; // only an unknown model id moves to the next one
    }
  }
  throw last.message === "model" ? new AiError("key") : last;
}

/** Saves a key only if it works: returns the error kind otherwise. */
export async function verifyAndSave(key: string): Promise<AiErrorKind | "ok"> {
  const k = key.trim();
  saveAi({ key: k, model: "" });
  try {
    await askGemini("Dis bonjour en un mot.");
    return "ok";
  } catch (e) {
    const kind = e instanceof AiError ? e.kind : "other";
    if (kind === "key" || kind === "other") saveAi({ key: "", model: "" });
    return kind;
  }
}
