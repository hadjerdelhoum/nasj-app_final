// COPY of backend/src/seeds/content.ts used by the offline (on-device) mode. Keep both files in sync.
// Structured, editable learning content. Add activities/questions/stories here (or in the DB) without touching app logic.

export interface UniverseSeed {
  id: string; position: number; name_fr: string; name_ar: string;
  description_fr: string; description_ar: string; color: string;
}

export const universes: UniverseSeed[] = [
  { id: "letters", position: 1, name_fr: "Jardin des lettres", name_ar: "حديقة الحروف",
    description_fr: "Découvre les lettres, les sons et les premiers mots en arabe et en français.",
    description_ar: "اكتشف الحروف والأصوات والكلمات الأولى بالعربية والفرنسية.", color: "#E86A7A" },
  { id: "numbers", position: 2, name_fr: "Montagne des nombres", name_ar: "جبل الأرقام",
    description_fr: "Compte, calcule et découvre les formes et les motifs.",
    description_ar: "عدّ، احسب واكتشف الأشكال والأنماط.", color: "#F2A03D" },
  { id: "forest", position: 3, name_fr: "Forêt des merveilles", name_ar: "غابة العجائب",
    description_fr: "Explore la nature, les animaux et découvre le monde qui t'entoure.",
    description_ar: "استكشف الطبيعة والحيوانات واكتشف العالم من حولك.", color: "#4F9D5D" },
  { id: "stories", position: 4, name_fr: "Village des histoires", name_ar: "قرية القصص",
    description_fr: "Lis, écoute et vis des histoires pleines d'aventures.",
    description_ar: "اقرأ، استمع وعش قصصًا مليئة بالمغامرات.", color: "#8E6BC1" },
  { id: "inventors", position: 5, name_fr: "Atelier des inventeurs", name_ar: "ورشة المخترعين",
    description_fr: "Résous des énigmes, joue et développe ta logique et ta créativité.",
    description_ar: "حل الألغاز، العب وطوّر منطقك وإبداعك.", color: "#4A8FD6" },
];

export interface ActivitySeed {
  id: string; universe: string; position: number; kind: "choice" | "trace" | "memory" | "story";
  fr: string; ar: string; config?: Record<string, unknown>;
}

export const activities: ActivitySeed[] = [
  { id: "letters-1", universe: "letters", position: 1, kind: "choice", fr: "Reconnaissance des lettres", ar: "التعرف على الحروف" },
  { id: "letters-2", universe: "letters", position: 2, kind: "choice", fr: "Vocabulaire", ar: "المفردات" },
  { id: "letters-3", universe: "letters", position: 3, kind: "trace", fr: "Tracer les lettres", ar: "تتبع الحروف" },
  { id: "letters-4", universe: "letters", position: 4, kind: "choice", fr: "Associer un mot à une image", ar: "ربط الكلمة بالصورة" },
  { id: "letters-5", universe: "letters", position: 5, kind: "choice", fr: "Écouter et choisir", ar: "استمع واختر" },
  { id: "letters-6", universe: "letters", position: 6, kind: "choice", fr: "Trouver la première lettre", ar: "جد الحرف الأول" },

  { id: "numbers-1", universe: "numbers", position: 1, kind: "choice", fr: "Compter les objets", ar: "عدّ الأشياء" },
  { id: "numbers-2", universe: "numbers", position: 2, kind: "choice", fr: "Addition et soustraction", ar: "الجمع والطرح" },
  { id: "numbers-3", universe: "numbers", position: 3, kind: "choice", fr: "Reconnaître les formes", ar: "التعرف على الأشكال" },
  { id: "numbers-4", universe: "numbers", position: 4, kind: "choice", fr: "Compléter un motif", ar: "أكمل النمط" },
  { id: "numbers-5", universe: "numbers", position: 5, kind: "choice", fr: "Comparer les quantités", ar: "قارن الكميات" },
  { id: "numbers-6", universe: "numbers", position: 6, kind: "choice", fr: "Trouver le nombre manquant", ar: "جد الرقم الناقص" },

  { id: "forest-1", universe: "forest", position: 1, kind: "choice", fr: "Découvrir les animaux", ar: "اكتشف الحيوانات" },
  { id: "forest-2", universe: "forest", position: 2, kind: "choice", fr: "Reconnaître les plantes", ar: "تعرّف على النباتات" },
  { id: "forest-3", universe: "forest", position: 3, kind: "choice", fr: "La météo", ar: "الطقس" },
  { id: "forest-4", universe: "forest", position: 4, kind: "choice", fr: "Observer et classer", ar: "لاحظ وصنّف" },
  { id: "forest-5", universe: "forest", position: 5, kind: "choice", fr: "Où vit cet animal ?", ar: "أين يعيش هذا الحيوان؟" },
  { id: "forest-6", universe: "forest", position: 6, kind: "choice", fr: "À quoi ça sert ?", ar: "لماذا نستعمله؟" },

  { id: "stories-1", universe: "stories", position: 1, kind: "story", fr: "Lire une histoire", ar: "اقرأ قصة", config: { storyId: "little-star" } },
  { id: "stories-2", universe: "stories", position: 2, kind: "story", fr: "Écouter la narration", ar: "استمع إلى السرد", config: { storyId: "little-star", narrate: true } },
  { id: "stories-3", universe: "stories", position: 3, kind: "choice", fr: "Ordonner les images", ar: "رتّب الصور" },
  { id: "stories-4", universe: "stories", position: 4, kind: "story", fr: "Comprendre une histoire", ar: "افهم القصة", config: { storyId: "red-kite" } },
  { id: "stories-5", universe: "stories", position: 5, kind: "choice", fr: "Choisir la suite", ar: "اختر التكملة" },
  { id: "stories-6", universe: "stories", position: 6, kind: "choice", fr: "Découvrir un nouveau mot", ar: "اكتشف كلمة جديدة" },

  { id: "inventors-1", universe: "inventors", position: 1, kind: "choice", fr: "Puzzles", ar: "الأحاجي" },
  { id: "inventors-2", universe: "inventors", position: 2, kind: "memory", fr: "Jeu de mémoire", ar: "لعبة الذاكرة" },
  { id: "inventors-3", universe: "inventors", position: 3, kind: "choice", fr: "Logique", ar: "المنطق" },
  { id: "inventors-4", universe: "inventors", position: 4, kind: "choice", fr: "Compléter une construction", ar: "أكمل البناء" },
  { id: "inventors-5", universe: "inventors", position: 5, kind: "choice", fr: "Trouver l'intrus", ar: "جد المختلف" },
  { id: "inventors-6", universe: "inventors", position: 6, kind: "choice", fr: "Créer des motifs", ar: "ابتكر الأنماط" },
];

export interface QuestionSeed {
  activity: string; difficulty: 1 | 2 | 3;
  payload: { fr?: string; ar?: string; visual?: string; audio?: string; fallback?: string; trace?: string; hide?: boolean };
  options: string[]; correct: string;
}

const Q = (activity: string, difficulty: 1 | 2 | 3, payload: QuestionSeed["payload"], options: string[], correct: string): QuestionSeed =>
  ({ activity, difficulty, payload, options, correct });

// ---- Letters / vocabulary data ----
const arLetters = ["أ", "ب", "ت", "ث", "ج", "ح", "د", "ر", "س", "ش", "ق", "ك", "م", "ن"];
const frLetters = ["A", "B", "C", "D", "E", "F", "L", "M", "P", "S", "V"];
// emoji, fr, ar, first fr letter, first ar letter, audio slugs
const vocab = [
  ["🍎", "pomme", "تفاحة", "P", "ت", "pomme", "tuffaha"],
  ["🌙", "lune", "قمر", "L", "ق", "lune", "qamar"],
  ["🐱", "chat", "قطة", "C", "ق", "chat", "qitta"],
  ["🐟", "poisson", "سمكة", "P", "س", "poisson", "samaka"],
  ["🏠", "maison", "بيت", "M", "ب", "maison", "bayt"],
  ["🌳", "arbre", "شجرة", "A", "ش", "arbre", "shajara"],
  ["☀️", "soleil", "شمس", "S", "ش", "soleil", "shams"],
  ["📖", "livre", "كتاب", "L", "ك", "livre", "kitab"],
  ["🍌", "banane", "موزة", "B", "م", "banane", "mawza"],
  ["🚗", "voiture", "سيارة", "V", "س", "voiture", "sayyara"],
] as const;

function pick<T>(arr: readonly T[], n: number, not: T[] = []): T[] {
  return arr.filter((x) => !not.includes(x)).sort(() => Math.random() - 0.5).slice(0, n);
}
function withDistractors(correct: string, pool: readonly string[], n = 2): string[] {
  return [correct, ...pick(pool, n, [correct])];
}

export function buildQuestions(): QuestionSeed[] {
  const out: QuestionSeed[] = [];
  const allEmoji = vocab.map((v) => v[0]);
  const allFr = vocab.map((v) => v[1]);
  const allAr = vocab.map((v) => v[2]);

  // letters-1: letter recognition (FR and AR)
  arLetters.forEach((l, i) => out.push(Q("letters-1", (i < 5 ? 1 : i < 10 ? 2 : 3) as 1 | 2 | 3,
    { fr: "Trouve la lettre", ar: "جد الحرف", visual: l, audio: `ar/letters/${i}` }, withDistractors(l, arLetters, i < 5 ? 2 : 3), l)));
  frLetters.forEach((l, i) => out.push(Q("letters-1", (i < 4 ? 1 : i < 8 ? 2 : 3) as 1 | 2 | 3,
    { fr: "Trouve la lettre", ar: "جد الحرف", visual: l, audio: `fr/letters/${l.toLowerCase()}` }, withDistractors(l, frLetters, 2), l)));

  // letters-2: vocabulary — emoji → word (FR and AR)
  vocab.forEach((v, i) => {
    const d = (i < 4 ? 1 : i < 7 ? 2 : 3) as 1 | 2 | 3;
    out.push(Q("letters-2", d, { fr: "Quel est ce mot ?", ar: "ما هذه الكلمة؟", visual: v[0], audio: `fr/words/${v[5]}` }, withDistractors(v[1], allFr), v[1]));
    out.push(Q("letters-2", d, { fr: "Quel est ce mot ?", ar: "ما هذه الكلمة؟", visual: v[0], audio: `ar/words/${v[6]}` }, withDistractors(v[2], allAr), v[2]));
  });

  // letters-3: trace a letter, then identify what you traced
  arLetters.slice(0, 8).forEach((l, i) => out.push(Q("letters-3", (i < 3 ? 1 : i < 6 ? 2 : 3) as 1 | 2 | 3,
    { fr: "Quelle lettre as-tu tracée ?", ar: "أي حرف رسمت؟", trace: l, audio: `ar/letters/${i}` }, withDistractors(l, arLetters, 2), l)));
  frLetters.slice(0, 6).forEach((l, i) => out.push(Q("letters-3", (i < 2 ? 1 : i < 4 ? 2 : 3) as 1 | 2 | 3,
    { fr: "Quelle lettre as-tu tracée ?", ar: "أي حرف رسمت؟", trace: l }, withDistractors(l, frLetters, 2), l)));

  // letters-4: word → picture
  vocab.forEach((v, i) => out.push(Q("letters-4", (i < 4 ? 1 : i < 7 ? 2 : 3) as 1 | 2 | 3,
    { fr: "Quelle image va avec ce mot ?", ar: "أي صورة تناسب هذه الكلمة؟", visual: i % 2 ? v[2] : v[1] }, withDistractors(v[0], allEmoji), v[0])));

  // letters-5: listen and choose (visual fallback shows the word)
  vocab.forEach((v, i) => {
    out.push(Q("letters-5", (i < 5 ? 1 : 2) as 1 | 2 | 3,
      { fr: "Écoute et choisis", ar: "استمع واختر", audio: `fr/words/${v[5]}`, fallback: v[1] }, withDistractors(v[0], allEmoji), v[0]));
    out.push(Q("letters-5", (i < 5 ? 2 : 3) as 1 | 2 | 3,
      { fr: "Écoute et choisis", ar: "استمع واختر", audio: `ar/words/${v[6]}`, fallback: v[2] }, withDistractors(v[0], allEmoji), v[0]));
  });

  // letters-6: first letter
  vocab.forEach((v, i) => {
    const d = (i < 4 ? 1 : i < 7 ? 2 : 3) as 1 | 2 | 3;
    out.push(Q("letters-6", d, { fr: `Par quelle lettre commence « ${v[1]} » ?`, ar: `بأي حرف تبدأ كلمة «${v[2]}»؟`, visual: v[0] }, withDistractors(v[3], frLetters), v[3]));
    out.push(Q("letters-6", d, { fr: `Par quelle lettre commence « ${v[2]} » ?`, ar: `بأي حرف تبدأ كلمة «${v[2]}»؟`, visual: v[0] }, withDistractors(v[4], arLetters), v[4]));
  });

  // ---- Numbers ----
  const fruit = ["🍎", "🍐", "⭐", "🐝", "🍓"];
  for (let n = 1; n <= 10; n++) {
    const d = (n <= 4 ? 1 : n <= 7 ? 2 : 3) as 1 | 2 | 3;
    const e = fruit[n % fruit.length];
    const opts = [n, ...pick([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 3, [n])].map(String);
    out.push(Q("numbers-1", d, { fr: "Combien y en a-t-il ?", ar: "كم عددها؟", visual: e.repeat(n) }, opts, String(n)));
  }
  const sums: [number, number, "+" | "-"][] = [[1, 1, "+"], [2, 1, "+"], [2, 2, "+"], [3, 2, "+"], [5, 1, "-"], [4, 2, "-"], [6, 3, "+"], [7, 4, "+"], [9, 5, "-"], [8, 3, "-"], [6, 7, "+"], [12, 5, "-"]];
  sums.forEach(([a, b, op], i) => {
    const r = op === "+" ? a + b : a - b;
    const opts = [r, r + 1, Math.max(0, r - 1), r + 2].map(String);
    out.push(Q("numbers-2", (i < 4 ? 1 : i < 8 ? 2 : 3) as 1 | 2 | 3,
      { fr: "Calcule", ar: "احسب", visual: `${a} ${op === "+" ? "+" : "−"} ${b} = ?` }, [...new Set(opts)], String(r)));
  });
  const shapes: [string, string, string][] = [["🔴", "cercle", "دائرة"], ["🟦", "carré", "مربع"], ["🔺", "triangle", "مثلث"], ["⭐", "étoile", "نجمة"], ["⬛", "carré", "مربع"], ["🟢", "cercle", "دائرة"]];
  const shapeFr = ["cercle", "carré", "triangle", "étoile"];
  const shapeAr = ["دائرة", "مربع", "مثلث", "نجمة"];
  shapes.forEach((s, i) => {
    out.push(Q("numbers-3", (i < 3 ? 1 : 2) as 1 | 2 | 3, { fr: "Quelle est cette forme ?", ar: "ما هذا الشكل؟", visual: s[0] }, withDistractors(s[1], shapeFr, 2), s[1]));
    out.push(Q("numbers-3", (i < 3 ? 2 : 3) as 1 | 2 | 3, { fr: "Quelle est cette forme ?", ar: "ما هذا الشكل؟", visual: s[0] }, withDistractors(s[2], shapeAr, 2), s[2]));
  });
  const patterns: [string, string, number, string[]][] = [
    ["🔴🔵🔴🔵🔴", "🔵", 1, ["🔴", "🟢"]], ["🟡🟡🔴🟡🟡", "🔴", 1, ["🟡", "🔵"]],
    ["🔺🔵🔺🔵🔺", "🔵", 1, ["🔺", "🟢"]], ["🍎🍎🍌🍎🍎🍌🍎🍎", "🍌", 2, ["🍎", "🍐"]],
    ["⭐🌙☀️⭐🌙", "☀️", 2, ["⭐", "🌙"]], ["🔴🔴🔵🔵🔴🔴🔵", "🔵", 3, ["🔴", "🟢"]],
  ];
  patterns.forEach(([seq, ans, d, wrong]) =>
    out.push(Q("numbers-4", d as 1 | 2 | 3, { fr: "Quelle est la suite ?", ar: "ما التالي؟", visual: `${seq}❓` }, [ans, ...wrong], ans)));
  const cmp: [number, number][] = [[2, 4], [5, 3], [3, 6], [7, 4], [8, 5], [9, 6], [4, 9], [10, 7]];
  cmp.forEach(([a, b], i) => {
    const A = "🍎".repeat(a), B = "🍎".repeat(b);
    out.push(Q("numbers-5", (i < 3 ? 1 : i < 6 ? 2 : 3) as 1 | 2 | 3,
      { fr: "Quel groupe en a le plus ?", ar: "أي مجموعة أكثر؟" }, [A, B], a > b ? A : B));
  });
  const seqs: [number[], number][] = [[[1, 2, 3, 4], 3], [[2, 4, 6, 8], 4], [[1, 2, 3, 4, 5], 4], [[5, 6, 7, 8], 7], [[2, 4, 6, 8, 10], 6], [[10, 20, 30, 40], 30], [[3, 6, 9, 12], 9], [[5, 10, 15, 20], 15]];
  seqs.forEach(([s, miss], i) => {
    const shown = s.map((x) => (x === miss ? "❓" : String(x))).join(", ");
    const opts = [...new Set([miss, miss + 1, Math.max(0, miss - 1), miss + 2])].map(String);
    out.push(Q("numbers-6", (i < 3 ? 1 : i < 6 ? 2 : 3) as 1 | 2 | 3, { fr: "Quel nombre manque ?", ar: "ما الرقم الناقص؟", visual: shown }, opts, String(miss)));
  });

  // ---- Forest ----
  const animals: [string, string, string][] = [["🐻", "ours", "دب"], ["🦊", "renard", "ثعلب"], ["🐰", "lapin", "أرنب"], ["🦌", "cerf", "غزال"], ["🦉", "hibou", "بومة"], ["🐸", "grenouille", "ضفدع"], ["🐿️", "écureuil", "سنجاب"], ["🐝", "abeille", "نحلة"]];
  const aFr = animals.map((a) => a[1]);
  animals.forEach((a, i) => out.push(Q("forest-1", (i < 3 ? 1 : i < 6 ? 2 : 3) as 1 | 2 | 3,
    { fr: "Quel est cet animal ?", ar: "ما هذا الحيوان؟", visual: a[0] }, withDistractors(a[1], aFr), a[1])));
  const plants: [string, string][] = [["🌻", "tournesol"], ["🌹", "rose"], ["🌵", "cactus"], ["🍄", "champignon"], ["🌲", "sapin"], ["🍀", "trèfle"]];
  const pNames = plants.map((p) => p[1]);
  plants.forEach((p, i) => out.push(Q("forest-2", (i < 2 ? 1 : i < 4 ? 2 : 3) as 1 | 2 | 3,
    { fr: "Quelle est cette plante ?", ar: "ما هذا النبات؟", visual: p[0] }, withDistractors(p[1], pNames), p[1])));
  const weather: [string, string][] = [["☀️", "ensoleillé"], ["🌧️", "pluvieux"], ["☁️", "nuageux"], ["❄️", "neigeux"], ["💨", "venteux"], ["⛈️", "orageux"]];
  const wNames = weather.map((w) => w[1]);
  weather.forEach((w, i) => out.push(Q("forest-3", (i < 3 ? 1 : 2) as 1 | 2 | 3,
    { fr: "Quel temps fait-il ?", ar: "كيف الطقس؟", visual: w[0] }, withDistractors(w[1], wNames), w[1])));
  out.push(
    Q("forest-3", 2, { fr: "Que prends-tu quand il pleut ?", ar: "ماذا تأخذ عندما تمطر؟", visual: "🌧️" }, ["☂️", "🕶️", "🧤"], "☂️"),
    Q("forest-3", 2, { fr: "Que mets-tu quand il neige ?", ar: "ماذا تلبس عندما تثلج؟", visual: "❄️" }, ["🧣", "🩳", "👙"], "🧣"),
    Q("forest-3", 3, { fr: "Quand le soleil brille fort, que mets-tu ?", ar: "عندما تشتد الشمس، ماذا تضع؟", visual: "☀️" }, ["🕶️", "🧤", "🥾"], "🕶️"),
  );
  const classify: [string, string, string[], string, number][] = [
    ["Qui peut voler ?", "من يستطيع الطيران؟", ["🦉", "🐻", "🐸"], "🦉", 1], ["Qui vit dans l'eau ?", "من يعيش في الماء؟", ["🐟", "🐿️", "🦌"], "🐟", 1],
    ["Qui est une plante ?", "ما هو النبات؟", ["🌻", "🐰", "🦊"], "🌻", 1], ["Qui est un fruit ?", "ما هي الفاكهة؟", ["🍎", "🥕", "🥔"], "🍎", 2],
    ["Qui est un légume ?", "ما هو الخضار؟", ["🥕", "🍓", "🍌"], "🥕", 2], ["Qui a des plumes ?", "من له ريش؟", ["🦉", "🐰", "🐟"], "🦉", 2],
  ];
  classify.forEach(([fr, ar, o, c, d]) => out.push(Q("forest-4", d as 1 | 2 | 3, { fr, ar }, o, c)));
  const homes: [string, string, string[], string][] = [
    ["🐟", "dans l'eau", ["dans l'eau", "dans un arbre", "sous terre"], "dans l'eau"], ["🐦", "dans un nid", ["dans un nid", "dans l'eau", "dans le sable"], "dans un nid"],
    ["🐻", "dans la forêt", ["dans la forêt", "dans la mer", "dans le désert"], "dans la forêt"], ["🐧", "sur la glace", ["sur la glace", "dans le désert", "dans un arbre"], "sur la glace"],
    ["🐪", "dans le désert", ["dans le désert", "sur la glace", "dans l'eau"], "dans le désert"], ["🐝", "dans une ruche", ["dans une ruche", "dans l'eau", "sous terre"], "dans une ruche"],
  ];
  homes.forEach(([e, , o, c], i) => out.push(Q("forest-5", (i < 2 ? 1 : i < 4 ? 2 : 3) as 1 | 2 | 3,
    { fr: "Où vit cet animal ?", ar: "أين يعيش هذا الحيوان؟", visual: e }, o, c)));
  const uses: [string, string, string[], string][] = [
    ["🥄", "Pour manger", ["Pour manger", "Pour écrire", "Pour dormir"], "Pour manger"], ["✏️", "Pour écrire", ["Pour écrire", "Pour manger", "Pour courir"], "Pour écrire"],
    ["☂️", "Pour se protéger de la pluie", ["Pour se protéger de la pluie", "Pour couper du pain", "Pour jouer au ballon"], "Pour se protéger de la pluie"],
    ["🪥", "Pour se brosser les dents", ["Pour se brosser les dents", "Pour planter des fleurs", "Pour écrire"], "Pour se brosser les dents"],
    ["🔑", "Pour ouvrir une porte", ["Pour ouvrir une porte", "Pour manger", "Pour dessiner"], "Pour ouvrir une porte"],
    ["⚽", "Pour jouer", ["Pour jouer", "Pour manger", "Pour dormir"], "Pour jouer"],
  ];
  uses.forEach(([e, , o, c], i) => out.push(Q("forest-6", (i < 2 ? 1 : i < 4 ? 2 : 3) as 1 | 2 | 3,
    { fr: "À quoi ça sert ?", ar: "لماذا نستعمله؟", visual: e }, o, c)));

  // ---- Stories (comprehension after reading) ----
  const star: [string, string, string[], string, number][] = [
    ["Que voulait découvrir la petite étoile ?", "ماذا أرادت النجمة الصغيرة أن تكتشف؟", ["Le monde", "Un gâteau", "Une voiture"], "Le monde", 1],
    ["Qui a aidé la petite étoile ?", "من ساعد النجمة الصغيرة؟", ["La lune", "Le chat", "Le vent froid"], "La lune", 1],
    ["Où est descendue la petite étoile ?", "إلى أين نزلت النجمة الصغيرة؟", ["Dans un jardin", "Dans la mer", "Dans le désert"], "Dans un jardin", 2],
    ["Que ressent la petite étoile à la fin ?", "بماذا شعرت النجمة في النهاية؟", ["De la joie", "De la peur", "De la colère"], "De la joie", 2],
    ["Que veut dire « découvrir » ?", "ماذا تعني كلمة «اكتشف»؟", ["Trouver quelque chose de nouveau", "Dormir", "Courir très vite"], "Trouver quelque chose de nouveau", 3],
  ];
  star.forEach(([fr, ar, o, c, d]) => {
    out.push(Q("stories-1", d as 1 | 2 | 3, { fr, ar }, o, c));
    out.push(Q("stories-2", d as 1 | 2 | 3, { fr, ar }, o, c));
  });
  const kite: [string, string, string[], string, number][] = [
    ["De quelle couleur est le cerf-volant ?", "ما لون الطائرة الورقية؟", ["Rouge", "Vert", "Noir"], "Rouge", 1],
    ["Qui joue avec le cerf-volant ?", "من يلعب بالطائرة الورقية؟", ["Lina", "Le loup", "Le roi"], "Lina", 1],
    ["Pourquoi le cerf-volant s'envole-t-il ?", "لماذا تطير الطائرة الورقية؟", ["Il y a du vent", "Il pleut", "Il neige"], "Il y a du vent", 2],
    ["Où le cerf-volant se pose-t-il ?", "أين تحط الطائرة الورقية؟", ["Dans un arbre", "Dans l'eau", "Sur le toit d'une voiture"], "Dans un arbre", 2],
    ["Qui aide Lina à le récupérer ?", "من يساعد لينا في استعادتها؟", ["Son frère", "Un dragon", "Un robot"], "Son frère", 3],
  ];
  kite.forEach(([fr, ar, o, c, d]) => out.push(Q("stories-4", d as 1 | 2 | 3, { fr, ar }, o, c)));
  const order: [string, string, string[], string, number][] = [
    ["Que fait-on en premier ?", "ماذا نفعل أولاً؟", ["🌱 On plante une graine", "🌸 La fleur pousse", "🌻 On cueille la fleur"], "🌱 On plante une graine", 1],
    ["Que se passe-t-il après la pluie ?", "ماذا يحدث بعد المطر؟", ["🌈 L'arc-en-ciel apparaît", "❄️ La neige tombe", "🌙 La lune disparaît"], "🌈 L'arc-en-ciel apparaît", 1],
    ["Que fait-on le matin ?", "ماذا نفعل في الصباح؟", ["🪥 On se réveille", "🌙 On dort", "🌟 On regarde les étoiles"], "🪥 On se réveille", 1],
    ["Quelle image vient en dernier ?", "أي صورة تأتي أخيرًا؟", ["🐣 Le poussin sort", "🥚 L'œuf", "🐔 La poule pond"], "🐣 Le poussin sort", 2],
    ["Qu'est-ce qui vient avant le gâteau cuit ?", "ما الذي يأتي قبل الكعكة المطبوخة؟", ["🥣 On mélange", "🍰 On mange", "🎂 On décore"], "🥣 On mélange", 2],
    ["Dans quel ordre se couche-t-on ?", "كيف نستعد للنوم؟", ["🛁 Bain, 📖 histoire, 😴 dodo", "😴 Dodo, 🛁 bain, 📖 histoire", "📖 Histoire, 😴 dodo, 🛁 bain"], "🛁 Bain, 📖 histoire, 😴 dodo", 3],
  ];
  order.forEach(([fr, ar, o, c, d]) => out.push(Q("stories-3", d as 1 | 2 | 3, { fr, ar }, o, c)));
  const next: [string, string, string[], string, number][] = [
    ["Lina trouve un chaton perdu. Que fait-elle ?", "وجدت لينا قطًا صغيرًا ضائعًا. ماذا تفعل؟", ["Elle l'aide à retrouver sa maman", "Elle s'enfuit", "Elle l'ignore"], "Elle l'aide à retrouver sa maman", 1],
    ["Il pleut. Le petit lapin a froid. Que fait-il ?", "تمطر. الأرنب الصغير يشعر بالبرد. ماذا يفعل؟", ["Il se met à l'abri", "Il nage dans la rivière", "Il sort sans manteau"], "Il se met à l'abri", 1],
    ["Un ami est triste. Que peux-tu faire ?", "صديقك حزين. ماذا يمكنك أن تفعل؟", ["Lui offrir un sourire", "Te moquer", "Partir"], "Lui offrir un sourire", 2],
    ["Le pont est cassé. Comment traverser ?", "الجسر مكسور. كيف نعبر؟", ["Chercher un autre chemin avec un adulte", "Sauter dans l'eau", "Courir très vite"], "Chercher un autre chemin avec un adulte", 2],
    ["Tu as fini ton jouet. Que dis-tu à ton ami ?", "انتهيت من لعبتك. ماذا تقول لصديقك؟", ["Veux-tu jouer avec moi ?", "Va-t'en !", "Rien du tout"], "Veux-tu jouer avec moi ?", 3],
  ];
  next.forEach(([fr, ar, o, c, d]) => out.push(Q("stories-5", d as 1 | 2 | 3, { fr, ar }, o, c)));
  const words: [string, string, string[], string, number][] = [
    ["« Immense » veut dire…", "«ضخم» تعني…", ["Très grand", "Très petit", "Très froid"], "Très grand", 1],
    ["« Minuscule » veut dire…", "«صغير جدًا» تعني…", ["Très petit", "Très grand", "Très rapide"], "Très petit", 1],
    ["« Voyager » veut dire…", "«سافر» تعني…", ["Aller loin de chez soi", "Dormir", "Manger"], "Aller loin de chez soi", 2],
    ["« Lumineux » veut dire…", "«مضيء» تعني…", ["Qui brille", "Qui est sale", "Qui est lourd"], "Qui brille", 2],
    ["« Courageux » veut dire…", "«شجاع» تعني…", ["Qui n'a pas peur d'essayer", "Qui dort tout le temps", "Qui crie"], "Qui n'a pas peur d'essayer", 3],
    ["« Curieux » veut dire…", "«فضولي» تعني…", ["Qui aime apprendre", "Qui est fatigué", "Qui a faim"], "Qui aime apprendre", 3],
  ];
  words.forEach(([fr, ar, o, c, d]) => out.push(Q("stories-6", d as 1 | 2 | 3, { fr, ar }, o, c)));

  // ---- Inventors ----
  const puzzles: [string, string[], string, number][] = [
    ["🧩 Quelle pièce complète le cercle ?  ◐ + ?", ["◑", "■", "▲"], "◑", 1], ["🧩 Quelle pièce complète le carré ?  ⬓ + ?", ["⬒", "●", "▲"], "⬒", 2],
    ["🚀 Pour décoller, une fusée a besoin de…", ["Carburant", "Feuilles", "Neige"], "Carburant", 1], ["⚙️ Que fait un engrenage ?", ["Il tourne et transmet le mouvement", "Il chante", "Il dort"], "Il tourne et transmet le mouvement", 2],
    ["🔧 Quel outil sert à visser ?", ["Tournevis", "Cuillère", "Peigne"], "Tournevis", 1], ["🧱 Avec 4 briques de 2, combien de trous au total ?", ["8", "6", "4"], "8", 3],
  ];
  puzzles.forEach(([fr, o, c, d]) => out.push(Q("inventors-1", d as 1 | 2 | 3, { fr, ar: "حل اللغز" }, o, c)));
  const mem: [string, number, string[], string, number][] = [
    ["🐱🐶🐰", 1, ["🐶", "🐱", "🐰"], "🐱", 1], ["🍎🍌🍇", 2, ["🍌", "🍎", "🍇"], "🍌", 1], ["🔴🟢🔵", 3, ["🔴", "🟢", "🔵"], "🔵", 1],
    ["⭐🌙☀️🌈", 2, ["🌙", "☀️", "🌈", "⭐"], "🌙", 2], ["🚗🚲🚀✈️", 4, ["🚗", "✈️", "🚲", "🚀"], "✈️", 2],
    ["🐘🦒🦁🐯🐵", 3, ["🦁", "🦒", "🐯", "🐵"], "🦁", 3], ["🍓🍒🍑🍍🥝", 5, ["🥝", "🍑", "🍍", "🍒"], "🥝", 3],
  ];
  mem.forEach(([seq, idx, o, c, d]) => out.push(Q("inventors-2", d as 1 | 2 | 3,
    { fr: `Retiens bien ! Quel était le n°${idx} ?`, ar: `تذكّر جيدًا! ما هو رقم ${idx}؟`, visual: seq, hide: true }, o, c)));
  const logic: [string, string[], string, number][] = [
    ["Si 🔴 = 1 et 🔵 = 2, combien font 🔴🔵 ?", ["3", "2", "12"], "3", 1], ["Tous les oiseaux ont des plumes. Un 🐦 a-t-il des plumes ?", ["Oui", "Non", "On ne sait pas"], "Oui", 1],
    ["Le chat est plus grand que la souris. Qui est le plus petit ?", ["La souris", "Le chat", "Les deux"], "La souris", 2], ["Quel nombre est entre 4 et 6 ?", ["5", "7", "3"], "5", 2],
    ["Lina est devant Sami. Sami est devant Omar. Qui est le dernier ?", ["Omar", "Lina", "Sami"], "Omar", 3], ["Si hier était lundi, quel jour est-on ?", ["Mardi", "Dimanche", "Jeudi"], "Mardi", 3],
  ];
  logic.forEach(([fr, o, c, d]) => out.push(Q("inventors-3", d as 1 | 2 | 3, { fr, ar: "فكّر جيدًا" }, o, c)));
  const build: [string, string[], string, number][] = [
    ["🧱🧱🧱 ... Il manque une brique pour faire 4 : combien ?", ["1", "2", "3"], "1", 1], ["🏠 Que manque-t-il à la maison ?  🧱🧱 ❓ 🚪", ["Un toit 🔺", "Une voiture 🚗", "Un nuage ☁️"], "Un toit 🔺", 1],
    ["🌉 Pour faire un pont, on relie…", ["Deux rives", "Deux nuages", "Deux étoiles"], "Deux rives", 2], ["🚀 Fusée : ⬜ corps, 🔺 pointe, et…", ["Des ailes", "Des roues de vélo", "Une cuillère"], "Des ailes", 2],
    ["🧱 Avec 3 briques en bas et 2 au-dessus, combien en tout ?", ["5", "4", "6"], "5", 3], ["🧱 Une tour de 2 étages de 3 briques : combien ?", ["6", "5", "9"], "6", 3],
  ];
  build.forEach(([fr, o, c, d]) => out.push(Q("inventors-4", d as 1 | 2 | 3, { fr, ar: "أكمل البناء" }, o, c)));
  const odd: [string[], string, number][] = [
    [["🍎", "🍌", "🚗"], "🚗", 1], [["🐱", "🐶", "🌳"], "🌳", 1], [["🔴", "🔴", "🔵"], "🔵", 1],
    [["🦉", "🕊️", "🐟"], "🐟", 2], [["☀️", "🌙", "🍕"], "🍕", 2], [["🔺", "🔺", "🔺", "🟦"], "🟦", 3], [["2", "4", "7", "8"], "7", 3],
  ];
  odd.forEach(([o, c, d]) => out.push(Q("inventors-5", d as 1 | 2 | 3, { fr: "Trouve l'intrus", ar: "جد المختلف" }, o, c)));
  const motif: [string, string[], string, number][] = [
    ["🔴🔵🔴🔵 ❓", ["🔴", "🔵", "🟢"], "🔴", 1], ["🟢🟢🟡 🟢🟢 ❓", ["🟡", "🟢", "🔴"], "🟡", 1],
    ["🔺🟦🔺🟦 ❓", ["🔺", "🟦", "⭐"], "🔺", 2], ["⭐⭐🌙 ⭐⭐🌙 ⭐ ❓", ["⭐", "🌙", "☀️"], "⭐", 2],
    ["1 2 1 2 1 ❓", ["2", "1", "3"], "2", 2], ["🔴🔵🟢 🔴🔵 ❓", ["🟢", "🔴", "🔵"], "🟢", 3],
  ];
  motif.forEach(([fr, o, c, d]) => out.push(Q("inventors-6", d as 1 | 2 | 3, { fr: `Continue le motif : ${fr}`, ar: "أكمل النمط" }, o, c)));

  return out;
}

export const stories = [
  {
    id: "little-star", title_fr: "La petite étoile", title_ar: "النجمة الصغيرة",
    scenes: [
      { art: "🌟🌙", fr: "La petite étoile voulait découvrir le monde…", ar: "كانت النجمة الصغيرة تريد اكتشاف العالم…", audio: "fr/story/star-1" },
      { art: "🌙🤝🌟", fr: "La lune lui dit : « Je t'aiderai à descendre doucement. »", ar: "قالت لها القمر: «سأساعدك على النزول بلطف».", audio: "fr/story/star-2" },
      { art: "🌷🏡🌳", fr: "Elle est arrivée dans un jardin plein de fleurs et de maisons.", ar: "وصلت إلى حديقة مليئة بالزهور والبيوت.", audio: "fr/story/star-3" },
      { art: "😊✨", fr: "Elle a découvert tant de merveilles ! La petite étoile était pleine de joie.", ar: "اكتشفت الكثير من العجائب! وامتلأت النجمة الصغيرة فرحًا.", audio: "fr/story/star-4" },
    ],
  },
  {
    id: "red-kite", title_fr: "Le cerf-volant rouge", title_ar: "الطائرة الورقية الحمراء",
    scenes: [
      { art: "🪁👧", fr: "Lina joue avec son cerf-volant rouge.", ar: "تلعب لينا بطائرتها الورقية الحمراء.", audio: "fr/story/kite-1" },
      { art: "💨🪁", fr: "Il y a beaucoup de vent. Le cerf-volant s'envole très haut !", ar: "الريح قوية. الطائرة الورقية تطير عاليًا!", audio: "fr/story/kite-2" },
      { art: "🌳🪁", fr: "Oh non ! Il se pose tout en haut d'un arbre.", ar: "يا إلهي! حطت فوق شجرة عالية.", audio: "fr/story/kite-3" },
      { art: "👦🤝👧", fr: "Son frère l'aide à le récupérer. Ils sont très contents.", ar: "يساعدها أخوها على استعادتها. كانا سعيدين جدًا.", audio: "fr/story/kite-4" },
    ],
  },
];
