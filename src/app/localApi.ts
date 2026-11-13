/**
 * Offline mode: the same API surface as the server, but everything lives on the device (localStorage).
 * Used automatically by the Android app when it was built without an API address (VITE_API_URL).
 * The rules mirror backend/src/routes/*: first answer wins, grading at completion, rewards decided here only once,
 * adaptive mastery, one thread per activity, a patch per universe, a starter badge.
 */
import { trAr } from "./arMap";
import { aiReady, askGemini } from "./aiClient";
import { ApiError } from "./errors";
import { activities, buildQuestions, stories, universes, type QuestionSeed } from "./localContent";
import type { AnswerResult, Child, CompleteResult, Dashboard, Lang, Question, Reward, Session, Story, Universe } from "./types";

const KEY = "nasj.local.v1";
const SESSION_SIZE = 5;
const PASS_RATIO = 0.6;

const AR_RE = /[\u0600-\u06FF]/;
const LAT_RE = /[A-Za-zÀ-ÿ]/;
type Pool = { options: string[]; correct: string | number; payload?: { visual?: string; fallback?: string; trace?: string } };

/** Arabic child: French answer texts are shown in Arabic (same meaning, same correct answer). */
function localize<T extends Pool>(q: T, lang: "fr" | "ar"): T {
  if (lang !== "ar") return q;
  const options = q.options.map(trAr);
  const correct = typeof q.correct === "string" ? trAr(q.correct) : q.correct;
  const payload = q.payload ? { ...q.payload, ...(q.payload.visual ? { visual: trAr(q.payload.visual) } : {}), ...(q.payload.fallback ? { fallback: trAr(q.payload.fallback) } : {}) } : q.payload;
  return { ...q, options, correct, payload };
}
/** True when nothing the child reads or picks is in the other language (emoji and digits are neutral). */
function singleLanguage(q: Pool, lang: "fr" | "ar"): boolean {
  const texts = [...q.options, q.payload?.visual ?? "", q.payload?.fallback ?? "", q.payload?.trace ?? ""];
  return !texts.some((s) => (lang === "fr" ? AR_RE.test(s) : LAT_RE.test(s)));
}
/** One session never mixes languages: texts are localized, and items whose content is the other language's script are left out. */
export function pickPool<T extends Pool>(bank: T[], lang: "fr" | "ar", size: number): T[] {
  const pool = bank.map((q) => localize(q, lang)).filter((q) => singleLanguage(q, lang));
  return pool.length >= size ? pool : bank.map((q) => localize(q, lang));
}

interface Parent { id: string; email: string; salt: string; hash: string; firstName?: string; lastName?: string }
interface ChildRow extends Child { parentId: string }
interface Progress { best_ratio: number; attempts: number; completed: boolean; mastery: number }
interface StoredQuestion { id: string; payload: Question["payload"]; options: string[]; correct: number }
interface SessionRow {
  id: string; childId: string; activityId: string; mastery: number; questions: StoredQuestion[];
  answers: Record<string, { choice: number; correct: boolean }>; result?: CompleteResult;
}
interface Db {
  parents: Parent[]; children: ChildRow[];
  progress: Record<string, Progress>; rewards: Record<string, { id: string; earned_at: string }[]>;
  sessions: Record<string, SessionRow>;
}

let memory: Db | null = null; // used if storage is unavailable
function load(): Db {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as Db;
  } catch { /* fall through to a fresh database */ }
  return memory ?? { parents: [], children: [], progress: {}, rewards: {}, sessions: {} };
}
function save(db: Db) {
  memory = db;
  try { localStorage.setItem(KEY, JSON.stringify(db)); } catch { /* keep in memory only */ }
}

const uid = () =>
  (globalThis.crypto && "randomUUID" in globalThis.crypto)
    ? globalThis.crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

async function sha(text: string): Promise<string> {
  try {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
  } catch {
    let h = 5381;
    for (let i = 0; i < text.length; i++) h = ((h << 5) + h + text.charCodeAt(i)) | 0;
    return String(h);
  }
}

function shuffle<T>(a: T[]): T[] {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

// Question bank, built once per launch (sessions keep their own snapshot).
let bank: (StoredQuestion & { activity: string; difficulty: number })[] | null = null;
function getBank() {
  if (!bank) {
    bank = buildQuestions().map((q: QuestionSeed, i) => {
      const options = shuffle([...new Set(q.options)]);
      return { id: `${q.activity}#${i}`, activity: q.activity, difficulty: q.difficulty, payload: q.payload, options, correct: options.indexOf(q.correct) };
    }).filter((q) => q.correct >= 0);
  }
  return bank;
}

const rewardCatalogue = (): Reward[] => [
  ...activities.map((a) => ({ id: `thread-${a.id}`, kind: "thread" as const, name_fr: `Fil : ${a.fr}`, name_ar: `خيط: ${a.ar}`, universe_id: a.universe })),
  ...universes.map((u) => ({ id: `patch-${u.id}`, kind: "patch" as const, name_fr: `Patch : ${u.name_fr}`, name_ar: `رقعة: ${u.name_ar}`, universe_id: u.id })),
  { id: "badge-first-steps", kind: "badge" as const, name_fr: "Premiers pas", name_ar: "الخطوات الأولى", universe_id: null },
];

function nextMastery(current: number, ratio: number): number {
  if (ratio >= 0.85) return Math.min(3, current + 1);
  if (ratio < 0.4) return Math.max(1, current - 1);
  return current;
}

/** A small on-device helper (no server, no key): friendly answers about the things the app teaches. */
const TOPICS: { k: string[]; fr: string; ar: string }[] = [
  { k: ["ciel bleu", "pourquoi le ciel", "السماء زرقاء", "لماذا السماء"], fr: "Le ciel paraît bleu parce que l'air renvoie la lumière bleue du soleil dans toutes les directions.", ar: "تبدو السماء زرقاء لأن الهواء ينشر الضوء الأزرق القادم من الشمس في كل الاتجاهات." },
  { k: ["arc-en-ciel", "arc en ciel", "قوس قزح"], fr: "Un arc-en-ciel apparaît quand le soleil brille à travers les gouttes de pluie : il a 7 couleurs !", ar: "يظهر قوس قزح عندما تشرق الشمس عبر قطرات المطر، وله 7 ألوان!" },
  { k: ["lettre", "alphabet", "حرف", "حروف", "ابجد"], fr: "Les lettres sont comme des briques : avec elles on fabrique des mots ! Essaie le Jardin des lettres.", ar: "الحروف مثل قطع البناء: بها نصنع الكلمات! جرّب حديقة الحروف." },
  { k: ["nombre", "chiffre", "compter", "عدد", "رقم", "ارقام", "أرقام", "عد"], fr: "Pour compter, on touche chaque objet une seule fois et on dit le nombre à voix haute. Montagne des nombres t'attend !", ar: "لنعدّ نلمس كل شيء مرة واحدة ونقول الرقم بصوت عالٍ. جبل الأرقام ينتظرك!" },
  { k: ["addition", "plus", "ajouter", "جمع", "اجمع"], fr: "Additionner, c'est mettre ensemble : 2 pommes et 3 pommes font 5 pommes !", ar: "الجمع يعني أن نضع الأشياء معًا: تفاحتان وثلاث تفاحات تساوي خمس تفاحات!" },
  { k: ["soustraction", "moins", "enlever", "طرح"], fr: "Soustraire, c'est enlever : si tu as 5 bonbons et que tu en manges 2, il en reste 3.", ar: "الطرح يعني أن نأخذ شيئًا: عندك 5 حلوى وأكلت 2، يبقى 3." },
  { k: ["forme", "triangle", "carre", "carré", "cercle", "rond", "شكل", "اشكال", "أشكال", "مثلث", "مربع", "دائرة"], fr: "Le triangle a 3 côtés, le carré en a 4 égaux, et le cercle est tout rond, sans coins !", ar: "المثلث له 3 أضلاع، والمربع له 4 أضلاع متساوية، والدائرة مستديرة بلا زوايا!" },
  { k: ["couleur", "rouge", "bleu", "jaune", "vert", "لون", "الوان", "ألوان"], fr: "Rouge + jaune = orange ! Bleu + jaune = vert ! Les couleurs adorent se mélanger.", ar: "أحمر + أصفر = برتقالي! أزرق + أصفر = أخضر! الألوان تحب أن تمتزج." },
  { k: ["animal", "animaux", "chat", "chien", "oiseau", "poisson", "حيوان", "حيوانات", "قطة", "كلب", "طائر", "سمكة"], fr: "Les animaux ont chacun leur maison : l'oiseau dans un nid, le poisson dans l'eau. Visite la Forêt des merveilles !", ar: "لكل حيوان بيته: الطائر في عشه والسمكة في الماء. زُر غابة العجائب!" },
  { k: ["plante", "arbre", "fleur", "graine", "نبات", "شجرة", "زهرة", "بذرة"], fr: "Une graine a besoin d'eau, de lumière et de patience pour devenir une plante.", ar: "البذرة تحتاج إلى ماء وضوء وصبر لتصبح نبتة." },
  { k: ["soleil", "lune", "etoile", "étoile", "ciel", "شمس", "قمر", "نجمة", "نجوم", "سماء"], fr: "Le soleil nous donne la lumière le jour, et la lune brille la nuit avec les étoiles.", ar: "الشمس تعطينا الضوء في النهار، والقمر يلمع في الليل مع النجوم." },
  { k: ["meteo", "météo", "pluie", "nuage", "vent", "طقس", "مطر", "غيمة", "سحابة", "ريح"], fr: "La pluie tombe des nuages. Après la pluie, si le soleil revient, on peut voir un arc-en-ciel !", ar: "المطر ينزل من الغيوم. وبعد المطر إذا عادت الشمس نرى قوس قزح!" },
  { k: ["histoire", "conte", "lire", "قصة", "حكاية", "اقرأ", "قراءة"], fr: "Une histoire a un début, un milieu et une fin. Va au Village des histoires et lis-en une !", ar: "للقصة بداية ووسط ونهاية. اذهب إلى قرية القصص واقرأ قصة!" },
  { k: ["fil", "tisser", "tissage", "خيط", "نسج"], fr: "Chaque activité réussie ajoute un fil à ton pont tissé. Quand le pont est fini, tu gagnes une récompense !", ar: "كل نشاط تنجح فيه يضيف خيطًا إلى جسرك المنسوج. وعند اكتمال الجسر تربح مكافأة!" },
  { k: ["planete", "planète", "terre", "espace", "fusee", "fusée", "كوكب", "الارض", "الأرض", "فضاء", "صاروخ"], fr: "La Terre est une planète qui tourne autour du soleil. Il y a 8 planètes dans notre système solaire !", ar: "الأرض كوكب يدور حول الشمس. في نظامنا الشمسي 8 كواكب!" },
  { k: ["mer", "ocean", "océan", "eau", "baleine", "بحر", "محيط", "ماء", "حوت"], fr: "La mer est pleine d'eau salée, et des poissons, des tortues et des baleines y vivent.", ar: "البحر مليء بالماء المالح، وتعيش فيه الأسماك والسلاحف والحيتان." },
  { k: ["dormir", "sommeil", "nuit", "نوم", "انام", "أنام", "ليل"], fr: "Dormir aide ton corps à grandir et ton cerveau à retenir ce que tu as appris. Bonne nuit !", ar: "النوم يساعد جسمك على النمو ودماغك على تذكّر ما تعلّمته. تصبح على خير!" },
  { k: ["manger", "fruit", "legume", "légume", "pomme", "banane", "اكل", "أكل", "فاكهة", "خضار", "تفاح", "موز"], fr: "Les fruits et les légumes donnent de l'énergie et des vitamines. Mange-en un peu chaque jour !", ar: "الفواكه والخضروات تعطي الطاقة والفيتامينات. تناول منها كل يوم!" },
  { k: ["main", "lavage", "propre", "dent", "يد", "اغسل", "أغسل", "اسنان", "أسنان"], fr: "On se lave les mains avec du savon et on se brosse les dents matin et soir pour rester en bonne santé.", ar: "نغسل أيدينا بالصابون ونفرّش أسناننا صباحًا ومساءً لنبقى بصحة جيدة." },
  { k: ["famille", "maman", "papa", "frere", "frère", "soeur", "sœur", "عائلة", "امي", "أمي", "ابي", "أبي", "اخ", "أخ", "اخت", "أخت"], fr: "Une famille, c'est des personnes qui s'aiment et s'entraident : papa, maman, frères et sœurs.", ar: "العائلة أشخاص يحبون بعضهم ويساعدون بعضهم: أب وأم وإخوة وأخوات." },
  { k: ["jour", "semaine", "lundi", "mois", "saison", "يوم", "اسبوع", "أسبوع", "شهر", "فصل"], fr: "Une semaine a 7 jours et une année a 4 saisons : le printemps, l'été, l'automne et l'hiver.", ar: "الأسبوع 7 أيام والسنة فيها 4 فصول: الربيع والصيف والخريف والشتاء." },
  { k: ["merci", "svp", "s'il te plait", "poli", "شكرا", "شكرًا", "من فضلك"], fr: "Dire « s'il te plaît » et « merci » rend tout le monde heureux. Bravo !", ar: "قول «من فضلك» و«شكرًا» يُسعد الجميع. أحسنت!" },
  { k: ["dinosaure", "ديناصور", "ديناصورات"], fr: "Les dinosaures vivaient il y a très, très longtemps. Certains étaient géants, d'autres petits comme une poule !", ar: "عاشت الديناصورات منذ زمن بعيد جدًا. بعضها عملاق وبعضها صغير كالدجاجة!" },
  { k: ["aide", "comment jouer", "que faire", "مساعدة", "كيف العب", "كيف ألعب"], fr: "Choisis un monde, ouvre une activité, réponds aux questions, et chaque réussite ajoute un fil à ton pont !", ar: "اختر عالمًا وافتح نشاطًا وأجب عن الأسئلة، وكل نجاح يضيف خيطًا إلى جسرك!" },
  { k: ["bonjour", "salut", "coucou", "مرحبا", "اهلا", "أهلا", "سلام"], fr: "Bonjour ! Je suis Nasj. Pose-moi une question sur les lettres, les nombres, les animaux ou les histoires.", ar: "مرحبًا! أنا نسج. اسألني عن الحروف أو الأرقام أو الحيوانات أو القصص." },
];
function offlineAnswer(q: string): string {
  const arabic = /[\u0600-\u06FF]/.test(q);
  // Tiny calculator for questions like "2+3", "7 - 4", "3 x 2" (digits only, small numbers).
  const calc = q.replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632)).match(/(\d{1,3})\s*(\+|-|−|x|×|\*|plus|moins|fois)\s*(\d{1,3})/i);
  if (calc) {
    const a = Number(calc[1]), b = Number(calc[3]), op = calc[2].toLowerCase();
    const r = op === "+" || op === "plus" ? a + b : op === "-" || op === "−" || op === "moins" ? a - b : a * b;
    return arabic ? `الجواب هو ${r}. أحسنت لأنك تحب الحساب!` : `${a} ${op === "+" || op === "plus" ? "+" : op === "x" || op === "×" || op === "*" || op === "fois" ? "×" : "−"} ${b} = ${r}. Bravo, tu aimes les maths !`;
  }
  const strip = (x: string) => x.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const text = strip(q);
  const has = (w: string) => {
    const x = strip(w);
    return /[a-z]/.test(x) ? new RegExp("(^|[^a-z])" + x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).test(text) : text.includes(x);
  };
  const hit = TOPICS.find((t) => t.k.some(has));
  if (hit) return arabic ? hit.ar : hit.fr;
  return arabic
    ? "سؤال جميل! لا أعرف الجواب الآن، اسأل أمك أو أباك، أو جرّب نشاطًا جديدًا في أحد العوالم."
    : "Belle question ! Je ne connais pas encore la réponse. Demande à un parent, ou essaie une nouvelle activité dans un des mondes.";
}

export function makeLocalApi(getToken: () => string | null) {
  const parentId = (): string => {
    const t = getToken();
    const id = t?.startsWith("local:") ? t.slice(6) : null;
    if (!id || !load().parents.some((p) => p.id === id)) throw new ApiError(401, "Unauthorized");
    return id;
  };
  const ownChild = (db: Db, childId: string): ChildRow => {
    const c = db.children.find((x) => x.id === childId && x.parentId === parentId());
    if (!c) throw new ApiError(404, "Child not found");
    return c;
  };
  const credentials = (email: string, password: string) => {
    const e = String(email).trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e) || password.length < 8) throw new ApiError(400, "Invalid input");
    return e;
  };
  const prog = (db: Db, childId: string, activityId: string): Progress | undefined => db.progress[`${childId}|${activityId}`];

  return {
    health: async () => ({ ok: true, assistant: true }),

    register: async (email: string, password: string, profile?: { firstName: string; lastName: string }) => {
      const e = credentials(email, password);
      const db = load();
      if (db.parents.some((p) => p.email === e)) throw new ApiError(409, "Email already registered");
      const salt = uid();
      const p: Parent = { id: uid(), email: e, salt, hash: await sha(salt + password), firstName: profile?.firstName.trim(), lastName: profile?.lastName.trim() };
      db.parents.push(p);
      save(db);
      return { token: `local:${p.id}` };
    },
    login: async (email: string, password: string) => {
      const e = String(email).trim().toLowerCase();
      const p = load().parents.find((x) => x.email === e);
      if (!p || p.hash !== (await sha(p.salt + password))) throw new ApiError(401, "Invalid email or password");
      return { token: `local:${p.id}` };
    },

    children: async (): Promise<Child[]> => {
      const pid = parentId();
      return load().children.filter((c) => c.parentId === pid).map(({ id, name, age, language }) => ({ id, name, age, language }));
    },
    createChild: async (c: { name: string; age: number; language: Lang }): Promise<Child> => {
      const pid = parentId();
      const name = String(c.name ?? "").trim();
      if (!name || name.length > 40 || !Number.isInteger(c.age) || c.age < 3 || c.age > 10) throw new ApiError(400, "Invalid input");
      const db = load();
      const row: ChildRow = { id: uid(), parentId: pid, name, age: c.age, language: c.language === "ar" ? "ar" : "fr" };
      db.children.push(row);
      save(db);
      return { id: row.id, name: row.name, age: row.age, language: row.language };
    },
    collection: async (childId: string): Promise<Reward[]> => {
      const db = load();
      ownChild(db, childId);
      const cat = rewardCatalogue();
      return (db.rewards[childId] ?? []).flatMap((r) => {
        const def = cat.find((x) => x.id === r.id);
        return def ? [{ ...def, earned_at: r.earned_at }] : [];
      });
    },
    dashboard: async (childId: string): Promise<Dashboard> => {
      const db = load();
      ownChild(db, childId);
      const rows = [...universes].sort((a, b) => a.position - b.position).map((u) => {
        const acts = activities.filter((a) => a.universe === u.id);
        const ps = acts.map((a) => prog(db, childId, a.id)).filter((p): p is Progress => !!p);
        const tried = ps.filter((p) => p.attempts > 0);
        return {
          universe_id: u.id, name_fr: u.name_fr, name_ar: u.name_ar, total: acts.length,
          completed: ps.filter((p) => p.completed).length,
          avg_score: tried.length ? tried.reduce((s, p) => s + p.best_ratio, 0) / tried.length : 0,
          attempts: ps.reduce((s, p) => s + p.attempts, 0),
        };
      });
      const total = rows.reduce((s, x) => s + x.total, 0);
      const done = rows.reduce((s, x) => s + x.completed, 0);
      return { overall: total ? done / total : 0, universes: rows };
    },

    universes: async (childId: string): Promise<Universe[]> => {
      const db = load();
      ownChild(db, childId);
      return [...universes].sort((a, b) => a.position - b.position).map((u) => {
        let prevDone = true;
        const acts = activities.filter((a) => a.universe === u.id).sort((a, b) => a.position - b.position).map((a) => {
          const p = prog(db, childId, a.id);
          const completed = p?.completed ?? false;
          const status = completed ? "completed" as const : prevDone ? "available" as const : "locked" as const;
          prevDone = completed;
          return { id: a.id, universe_id: a.universe, position: a.position, kind: a.kind, title_fr: a.fr, title_ar: a.ar, completed, best_ratio: p?.best_ratio ?? 0, status };
        });
        const done = acts.filter((a) => a.completed).length;
        return { ...u, activities: acts, progress: acts.length ? done / acts.length : 0 };
      });
    },

    startSession: async (activityId: string, childId: string): Promise<Session> => {
      const db = load();
      ownChild(db, childId);
      const act = activities.find((a) => a.id === activityId);
      if (!act) throw new ApiError(404, "Activity not found");
      const mastery = prog(db, childId, activityId)?.mastery ?? 1;
      const kid = ownChild(db, childId);
      const childLang = kid.language;
      // ages 3–5: gentle ceiling; ages 6–10: start a bit harder
      const target = kid.age <= 5 ? Math.min(mastery, 1.5) : Math.max(mastery, 1.5);
      const picked = shuffle(pickPool(getBank().filter((q) => q.activity === activityId), childLang, SESSION_SIZE))
        .sort((a, b) => Math.abs(a.difficulty - target) - Math.abs(b.difficulty - target))
        .slice(0, SESSION_SIZE);
      const sid = uid();
      db.sessions[sid] = { id: sid, childId, activityId, mastery, answers: {}, questions: picked.map(({ id, payload, options, correct }) => ({ id, payload, options, correct })) };
      // keep storage small: forget old finished sessions
      const ids = Object.keys(db.sessions);
      if (ids.length > 60) for (const k of ids.slice(0, ids.length - 60)) delete db.sessions[k];
      save(db);
      return {
        sessionId: sid,
        activity: { id: act.id, universe_id: act.universe, kind: act.kind, title_fr: act.fr, title_ar: act.ar, config: (act.config ?? {}) as { storyId?: string; narrate?: boolean } },
        mastery,
        questions: picked.map(({ id, payload, options }) => ({ id, payload, options })),
      };
    },

    answer: async (sessionId: string, childId: string, questionId: string, choice: number): Promise<AnswerResult> => {
      const db = load();
      ownChild(db, childId);
      const s = db.sessions[sessionId];
      if (!s || s.childId !== childId) throw new ApiError(404, "Session not found");
      if (s.result) throw new ApiError(409, "Session already completed");
      const q = s.questions.find((x) => x.id === questionId);
      if (!q) throw new ApiError(400, "Question was not part of this session");
      if (!Number.isInteger(choice) || choice < 0 || choice >= q.options.length) throw new ApiError(400, "Invalid choice");
      if (!s.answers[questionId]) s.answers[questionId] = { choice, correct: choice === q.correct }; // first answer wins
      save(db);
      const a = s.answers[questionId];
      return { correct: a.correct, choice: a.choice, correctIndex: q.correct };
    },

    complete: async (sessionId: string, childId: string): Promise<CompleteResult> => {
      const db = load();
      ownChild(db, childId);
      const s = db.sessions[sessionId];
      if (!s || s.childId !== childId) throw new ApiError(404, "Session not found");
      if (s.result) return s.result; // idempotent
      const act = activities.find((a) => a.id === s.activityId)!;
      const total = s.questions.length;
      const perQuestion = s.questions.filter((q) => s.answers[q.id]).map((q) => ({ questionId: q.id, correct: s.answers[q.id].correct }));
      const correct = perQuestion.filter((p) => p.correct).length;
      const ratio = total === 0 ? 0 : correct / total;
      const passed = ratio >= PASS_RATIO;

      const key = `${childId}|${act.id}`;
      const prev = db.progress[key];
      const wasCompleted = prev?.completed ?? false;
      db.progress[key] = {
        best_ratio: Math.max(prev?.best_ratio ?? 0, ratio),
        attempts: (prev?.attempts ?? 0) + 1,
        completed: wasCompleted || passed,
        mastery: nextMastery(prev?.mastery ?? 1, ratio),
      };

      const newRewards: Reward[] = [];
      if (passed && !wasCompleted) {
        const candidates = [`thread-${act.id}`, "badge-first-steps"];
        const allDone = activities.filter((a) => a.universe === act.universe).every((a) => db.progress[`${childId}|${a.id}`]?.completed);
        if (allDone) candidates.push(`patch-${act.universe}`);
        const owned = (db.rewards[childId] ??= []);
        const cat = rewardCatalogue();
        for (const rid of candidates) {
          if (owned.some((r) => r.id === rid)) continue;
          const def = cat.find((x) => x.id === rid);
          if (!def) continue;
          owned.push({ id: rid, earned_at: new Date().toISOString() });
          newRewards.push(def);
        }
      }
      const result: CompleteResult = { correct, total, passed, activityId: act.id, universeId: act.universe, perQuestion, newRewards };
      s.result = result;
      save(db);
      return result;
    },

    story: async (id: string): Promise<Story> => {
      const s = stories.find((x) => x.id === id);
      if (!s) throw new ApiError(404, "Story not found");
      return s as Story;
    },

    ask: async (question: string): Promise<{ answer: string }> => {
      parentId();
      const q = String(question ?? "");
      if (aiReady()) {
        try {
          return { answer: await askGemini(q) };
        } catch {
          /* no network, limit reached, blocked: use the built-in helper */
        }
      }
      return { answer: offlineAnswer(q) };
    },
  };
}
