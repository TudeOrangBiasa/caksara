import { quizSchema } from "../../lib/zod/question";
import type { Question, Quiz } from "../../lib/zod/question";

export const QUIZ_BANK: Record<string, Question[]> = {
  mod_01: [
    {
      type: "dengar_pilih",
      prompt: "Dengarkan, lalu pilih sapaan yang benar.",
      latinText: "Om Swastiastu",
      audioType: "latin",
      choices: [
        { text: "Om Swastiastu", isCorrect: true },
        { text: "Matur suksma", isCorrect: false },
        { text: "Sampun", isCorrect: false },
        { text: "Ngiring", isCorrect: false },
      ],
      explanation: "Om Swastiastu adalah salam pembuka yang bermakna doa keselamatan.",
      sourceRef: "kb_sapaan · Basis Pengetahuan",
      level: 1,
    },
    {
      type: "kenali_visual",
      prompt: "Apa arti sapaan 'Om Swastiastu'?",
      choices: [
        { text: "Selamat pagi", isCorrect: false },
        { text: "Semoga selamat atas karunia Hyang Widhi", isCorrect: true },
        { text: "Terima kasih", isCorrect: false },
        { text: "Sampai jumpa", isCorrect: false },
      ],
      explanation:
        "Om Swastiastu bermakna 'semoga dalam keadaan selamat atas karunia Hyang Widhi'.",
      sourceRef: "kb_sapaan · Basis Pengetahuan",
      level: 1,
    },
    {
      type: "checkpoint_budaya",
      prompt: "Kapan 'Om Swastiastu' biasanya diucapkan?",
      choices: [
        { text: "Saat berpisah", isCorrect: false },
        { text: "Saat bertemu atau memulai percakapan", isCorrect: true },
        { text: "Saat makan", isCorrect: false },
        { text: "Saat tidur", isCorrect: false },
      ],
      explanation: "Om Swastiastu diucapkan saat bertemu atau memulai percakapan.",
      sourceRef: "kb_sapaan · Basis Pengetahuan",
      level: 1,
    },
    {
      type: "susun_aksara",
      prompt: "Susun suku kata menjadi sapaan 'swastiastu'.",
      tiles: ["swa", "ti", "as", "tu"],
      explanation: "Urutan yang benar: swa - ti - as - tu.",
      sourceRef: "kb_sapaan · Basis Pengetahuan",
      level: 1,
    },
    {
      type: "cocokkan",
      prompt: "Pasangkan sapaan dengan artinya.",
      pairs: [
        { left: "Om Swastiastu", right: "Salam sejahtera" },
        { left: "Matur suksma", right: "Terima kasih" },
        { left: "Ampura", right: "Mohon maaf" },
      ],
      explanation: "Salam sejahtera, terima kasih, dan mohon maaf adalah makna yang tepat.",
      sourceRef: "kb_sapaan · Basis Pengetahuan",
      level: 1,
    },
    {
      type: "kenali_visual",
      prompt: "ᬫᬢᬸᬃᬲᬸᬓ᭄ᬲ᭄ᬫ",
      choices: [
        { text: "Mohon maaf", isCorrect: false },
        { text: "Selamat tinggal", isCorrect: false },
        { text: "Terima kasih", isCorrect: true },
        { text: "Permisi lewat", isCorrect: false },
      ],
      explanation: "Matur suksma berarti terima kasih, bentuk halus dari suksma.",
      sourceRef: "kb_matur_suksma · Basis Pengetahuan",
      level: 1,
    },
  ],
  mod_02: [
    {
      type: "dengar_pilih",
      prompt: "Dengarkan bunyi aksara ini, lalu pilih huruf Latin yang tepat.",
      latinText: "ha",
      audioType: "latin",
      choices: [
        { text: "ha", isCorrect: true },
        { text: "na", isCorrect: false },
        { text: "ca", isCorrect: false },
        { text: "ka", isCorrect: false },
      ],
      explanation: "Bunyinya 'ha', aksara pembuka urutan Ha Na Ca Ra Ka.",
      sourceRef: "kb_wre_01 · Basis Pengetahuan",
      aksaraId: "wre_01",
      level: 1,
    },
    {
      type: "kenali_visual",
      prompt: "Lima aksara dasar pertama dalam urutan yang benar adalah...",
      choices: [
        { text: "Ha, Na, Ca, Ra, Ka", isCorrect: true },
        { text: "Ka, Na, Ca, Ra, Ha", isCorrect: false },
        { text: "Ha, Ma, Ga, Ba, Nga", isCorrect: false },
        { text: "Da, Ta, Sa, Wa, La", isCorrect: false },
      ],
      explanation: "Aksara dasar dimulai dari Ha, Na, Ca, Ra, Ka.",
      sourceRef: "kb_wre_01 · Basis Pengetahuan",
      aksaraId: "wre_01",
      level: 1,
    },
    {
      type: "checkpoint_budaya",
      prompt: "Apa yang melatarbelakangi urutan aksara dasar Bali?",
      choices: [
        { text: "Urutan abjad biasa", isCorrect: false },
        { text: "Kisah Aji Saka yang penuh filosofi", isCorrect: true },
        { text: "Urutan tanggal lahir", isCorrect: false },
        { text: "Hanya kebetulan", isCorrect: false },
      ],
      explanation: "Urutannya dibawa Aji Saka dan sarat makna filosofis.",
      sourceRef: "kb_wre_01 · Basis Pengetahuan",
      level: 1,
    },
    {
      type: "susun_aksara",
      prompt: "Susun tiga aksara pertama yang benar (Latin).",
      tiles: ["Ha", "Na", "Ca"],
      explanation: "Urutan yang benar: Ha - Na - Ca.",
      sourceRef: "kb_wre_01 · Basis Pengetahuan",
      level: 1,
    },
    {
      type: "cocokkan",
      prompt: "Pasangkan aksara dengan bunyinya.",
      pairs: [
        { left: "ᬳ", right: "ha" },
        { left: "ᬦ", right: "na" },
        { left: "ᬘ", right: "ca" },
      ],
      explanation: "Ha, na, ca adalah tiga aksara pembuka wresastra.",
      sourceRef: "kb_wre_01 · Basis Pengetahuan",
      level: 1,
    },
    {
      type: "kenali_visual",
      prompt: "Aksara 'ka' ditulis seperti apa?",
      choices: [
        { text: "ᬓ", isCorrect: true },
        { text: "ᬫ", isCorrect: false },
        { text: "ᬩ", isCorrect: false },
        { text: "ᬕ", isCorrect: false },
      ],
      explanation: "Bentuk 'ka' adalah ᬓ.",
      sourceRef: "kb_wre_05 · Basis Pengetahuan",
      aksaraId: "wre_05",
      level: 1,
    },
  ],
  mod_03: [
    {
      type: "dengar_pilih",
      prompt: "Dengarkan kata ini, lalu pilih arti yang tepat.",
      latinText: "Ngajeng",
      audioType: "latin",
      choices: [
        { text: "Makan — bentuk halus", isCorrect: true },
        { text: "Tidur — bentuk halus", isCorrect: false },
        { text: "Saya — bentuk halus", isCorrect: false },
        { text: "Maaf — bentuk halus", isCorrect: false },
      ],
      explanation: "Ngajeng adalah bentuk Alus dari 'makan'.",
      sourceRef: "kb_madaar_ngajeng · Basis Pengetahuan",
      level: 2,
    },
    {
      type: "checkpoint_budaya",
      prompt: "Basa Alus digunakan saat berbicara dengan...",
      choices: [
        { text: "Teman akrab", isCorrect: false },
        { text: "Orang tua, guru, atau pemuka agama", isCorrect: true },
        { text: "Adik kandung", isCorrect: false },
        { text: "Teman sebaya", isCorrect: false },
      ],
      explanation: "Basa Alus dipakai untuk orang yang dihormati.",
      sourceRef: "kb_madaar_ngajeng · Basis Pengetahuan",
      level: 2,
    },
    {
      type: "kenali_visual",
      prompt: "Kata 'makan' dalam Basa Alus adalah...",
      choices: [
        { text: "Madaar", isCorrect: false },
        { text: "Ngajeng", isCorrect: true },
        { text: "Pules", isCorrect: false },
        { text: "Sirep", isCorrect: false },
      ],
      explanation: "Ngajeng adalah bentuk Alus dari 'makan', sedangkan madaar adalah Andap.",
      sourceRef: "kb_madaar_ngajeng · Basis Pengetahuan",
      level: 2,
    },
    {
      type: "cocokkan",
      prompt: "Pasangkan kata Andap dengan padanan Alus-nya.",
      pairs: [
        { left: "Madaar", right: "Ngajeng" },
        { left: "Pules", right: "Sirep" },
        { left: "Tiang", right: "Titiang" },
      ],
      explanation: "Masing-masing adalah pasangan Andap dan Alus.",
      sourceRef: "kb_madaar_ngajeng · Basis Pengetahuan",
      level: 2,
    },
    {
      type: "checkpoint_budaya",
      prompt: "Kata ganti 'aku' yang paling halus adalah...",
      choices: [
        { text: "Icang", isCorrect: false },
        { text: "Tiang", isCorrect: false },
        { text: "Titiang", isCorrect: true },
        { text: "Cai", isCorrect: false },
      ],
      explanation: "Titiang adalah bentuk kata ganti orang yang paling halus.",
      sourceRef: "kb_titiang · Basis Pengetahuan",
      level: 3,
    },
    {
      type: "susun_aksara",
      prompt: "Susun kalimat Basa Alus 'saya mau makan'.",
      tiles: ["Titiang", "jagi", "ngajeng"],
      explanation: "Urutan yang benar: Titiang - jagi - ngajeng.",
      sourceRef: "kb_titiang · Basis Pengetahuan",
      level: 3,
    },
  ],
  mod_04: [
    {
      type: "dengar_pilih",
      prompt: "Dengarkan nama hari raya ini, lalu pilih yang benar.",
      latinText: "Galungan",
      audioType: "latin",
      choices: [
        { text: "Galungan", isCorrect: true },
        { text: "Kuningan", isCorrect: false },
        { text: "Nyepi", isCorrect: false },
        { text: "Canang Sari", isCorrect: false },
      ],
      explanation: "Terdengar 'Galungan', hari kemenangan dharma atas adharma.",
      sourceRef: "kb_galungan · Basis Pengetahuan",
      level: 2,
    },
    {
      type: "checkpoint_budaya",
      prompt: "Hari kemenangan dharma (kebaikan) atas adharma disebut...",
      choices: [
        { text: "Nyepi", isCorrect: false },
        { text: "Galungan", isCorrect: true },
        { text: "Kuningan", isCorrect: false },
        { text: "Kajeng Kliwon", isCorrect: false },
      ],
      explanation: "Galungan adalah hari kemenangan kebaikan atas keburukan.",
      sourceRef: "kb_galungan · Basis Pengetahuan",
      level: 2,
    },
    {
      type: "kenali_visual",
      prompt: "Kuningan dirayakan berapa hari setelah Galungan?",
      choices: [
        { text: "5 hari", isCorrect: false },
        { text: "10 hari", isCorrect: true },
        { text: "15 hari", isCorrect: false },
        { text: "Sekaligus bersamaan", isCorrect: false },
      ],
      explanation: "Kuningan datang 10 hari setelah Galungan menandai akhir rangkaian.",
      sourceRef: "kb_galungan · Basis Pengetahuan",
      level: 2,
    },
    {
      type: "checkpoint_budaya",
      prompt: "Saat Nyepi, umat diminta untuk...",
      choices: [
        { text: "Bekerja sepanjang hari", isCorrect: false },
        { text: "Hening tanpa api, kerja, berpergian, atau hiburan", isCorrect: true },
        { text: "Berpesta di jalan", isCorrect: false },
        { text: "Menyalakan api unggun", isCorrect: false },
      ],
      explanation: "Nyepi adalah hari hening penuh refleksi diri.",
      sourceRef: "kb_nyepi · Basis Pengetahuan",
      level: 2,
    },
    {
      type: "susun_aksara",
      prompt: "Susun kata 'galungan' dengan benar.",
      tiles: ["ga", "lu", "ngan"],
      explanation: "Urutan yang benar: ga - lu - ngan.",
      sourceRef: "kb_galungan · Basis Pengetahuan",
      level: 2,
    },
    {
      type: "cocokkan",
      prompt: "Pasangkan tradisi dengan cirinya.",
      pairs: [
        { left: "Galungan", right: "Penjor & sembahyang" },
        { left: "Nyepi", right: "Hari hening" },
        { left: "Canang Sari", right: "Sesaji harian" },
      ],
      explanation: "Setiap tradisi punya ciri khasnya masing-masing.",
      sourceRef: "kb_nyepi · Basis Pengetahuan",
      level: 2,
    },
  ],
};

const SESSION_COUNT = 5;
const MIN_TYPES = 2;

const MODULE_BASE_LEVEL: Record<string, number> = {
  mod_01: 1,
  mod_02: 1,
  mod_03: 2,
  mod_04: 2,
};

const LEVEL_KEY = "caksara.quiz-level.v1";
const ATTEMPT_KEY = "caksara.quiz-attempt.v1";

function memStore(): Map<string, string> {
  const g = globalThis as { caksaraQuizMem?: Map<string, Map<string, string>> };
  g.caksaraQuizMem ??= new Map();
  const ns = "quiz-data";
  if (!g.caksaraQuizMem.has(ns)) g.caksaraQuizMem.set(ns, new Map());
  return g.caksaraQuizMem.get(ns) as Map<string, string>;
}

function readNum(key: string, field: string): number | null {
  try {
    const raw =
      typeof window !== "undefined" ? window.localStorage.getItem(key) : memStore().get(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const v = parsed[field];
    return typeof v === "number" ? v : null;
  } catch {
    return null;
  }
}

function writeNum(key: string, field: string, value: number): void {
  try {
    const raw =
      typeof window !== "undefined" ? window.localStorage.getItem(key) : memStore().get(key);
    const parsed = (raw ? JSON.parse(raw) : {}) as Record<string, unknown>;
    parsed[field] = value;
    const str = JSON.stringify(parsed);
    if (typeof window !== "undefined") window.localStorage.setItem(key, str);
    else memStore().set(key, str);
  } catch {
    // Storage diblokir: level adaptif kembali ke level dasar modul.
  }
}
/** Hapus level adaptif + hitung percobaan sesi (dipakai reset progres total #27). */
export function clearQuizProgress(): void {
  try {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(LEVEL_KEY);
      window.localStorage.removeItem(ATTEMPT_KEY);
      return;
    }
    memStore().delete(LEVEL_KEY);
    memStore().delete(ATTEMPT_KEY);
  } catch {
    // Storage diblokir: tidak ada yang perlu dihapus.
  }
}

/**
 * Level adaptif berbasis data (#23): mulai dari level dasar modul, lalu
 * geser mengikuti hasil sesi terakhir. Bukan instruksi "bikin gampang" ke Gemini.
 */
export function getAdaptiveLevel(moduleId: string): number {
  const base = MODULE_BASE_LEVEL[moduleId] ?? 1;
  const stored = readNum(LEVEL_KEY, moduleId);
  if (stored === null) return base;
  return Math.min(3, Math.max(1, Math.round(stored)));
}

export function recordSessionLevel(moduleId: string, correct: number, total: number): void {
  if (total <= 0) return;
  const rate = correct / total;
  const prev = getAdaptiveLevel(moduleId);
  const next = rate < 0.4 ? Math.max(1, prev - 1) : rate >= 0.8 ? Math.min(3, prev + 1) : prev;
  writeNum(LEVEL_KEY, moduleId, next);
}

/** Hitung percobaan agar pengulangan sesi memutar urutan soal (deterministik per seed). */
export function nextAttemptSeed(moduleId: string): number {
  const prev = readNum(ATTEMPT_KEY, moduleId) ?? 0;
  writeNum(ATTEMPT_KEY, moduleId, prev + 1);
  return prev;
}

export function hasVariety(questions: readonly Question[], minTypes = MIN_TYPES): boolean {
  return new Set(questions.map((q) => q.type)).size >= minTypes;
}

export interface PickOptions {
  level?: number;
  count?: number;
  seed?: number;
  /** Batas tipe berbeda per sesi (default 3 dari 5 agar sesi fokus). */
  maxTypes?: number;
}

const TYPE_ORDER: Question["type"][] = [
  "dengar_pilih",
  "kenali_visual",
  "checkpoint_budaya",
  "susun_aksara",
  "cocokkan",
];

/**
 * Pilih soal sesi: selalu sertakan dengar_pilih bila bank punya, jaga
 * 2+ tipe berbeda (batas atas default 3 dari 5 agar sesi fokus),
 * utamakan level target (±1), lalu putar urutan per seed agar
 * pengulangan tidak monoton. Deterministik — aman untuk resume.
 */
export function pickSessionQuestions(bank: readonly Question[], opts?: PickOptions): Question[] {
  const level = Math.min(3, Math.max(1, Math.round(opts?.level ?? 1)));
  const count = Math.min(8, Math.max(3, Math.round(opts?.count ?? SESSION_COUNT)));
  const seed = Math.max(0, Math.round(opts?.seed ?? 0));
  const maxTypes = Math.min(5, Math.max(MIN_TYPES, Math.round(opts?.maxTypes ?? 3)));
  if (bank.length === 0) return [];

  const byLevel = [...bank]
    .map((q, i) => ({ q, i }))
    .toSorted((a, b) => {
      const da = Math.abs((a.q.level ?? level) - level);
      const db = Math.abs((b.q.level ?? level) - level);
      return da - db || a.i - b.i;
    })
    .map((x) => x.q);

  // Pilih maxTypes dari 5 tipe via shuffle seed-tetap per level (selalu
  // sertakan dengar_pilih bila ada). Seed sesi hanya memutar urutan, bukan
  // mengganti himpunan soal — pengulangan tetap sehimpunan (aman resume).
  const bankTypes = new Set(byLevel.map((q) => q.type));
  const shuffledTypes = [...TYPE_ORDER];
  let s = (0x9e3779b9 ^ Math.imul(level, 0x9e3779b1)) >>> 0;
  const rand = (): number => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
  for (let i = shuffledTypes.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const tmp = shuffledTypes[i] as Question["type"];
    shuffledTypes[i] = shuffledTypes[j] as Question["type"];
    shuffledTypes[j] = tmp;
  }
  let allowed: Question["type"][] = shuffledTypes.slice(
    0,
    Math.min(maxTypes, shuffledTypes.length),
  );
  if (bankTypes.has("dengar_pilih") && !allowed.includes("dengar_pilih")) {
    allowed[allowed.length - 1] = "dengar_pilih";
  }
  const filtered = allowed.filter((t) => bankTypes.has(t));
  allowed = (
    filtered.length > 0 ? filtered : [...bankTypes].slice(0, maxTypes)
  ) as Question["type"][];

  const picked: Question[] = [];
  const used = new Set<Question>();
  const takeOfType = (type: Question["type"]): boolean => {
    const found = byLevel.find((q) => q.type === type && !used.has(q));
    if (!found) return false;
    picked.push(found);
    used.add(found);
    return true;
  };

  const order: Question["type"][] = [
    ...(allowed.includes("dengar_pilih") ? (["dengar_pilih"] as const) : []),
    ...allowed.filter((t) => t !== "dengar_pilih"),
  ];
  for (const t of order) {
    if (picked.length >= count) break;
    takeOfType(t);
  }
  for (const t of order) {
    if (picked.length >= count) break;
    while (picked.length < count && takeOfType(t)) {
      // Lanjut sampai tipe ini habis atau kuota penuh.
    }
  }
  if (picked.length === 0) return byLevel.slice(0, Math.min(count, byLevel.length));

  const rot = seed % picked.length;
  return picked.slice(rot).concat(picked.slice(0, rot));
}

export function buildMixedQuiz(moduleIds: string[]): Quiz {
  const questions = moduleIds.flatMap((id) => QUIZ_BANK[id] ?? []);
  const shuffled = questions
    .map((q) => ({ q, r: Math.random() }))
    .toSorted((a, b) => a.r - b.r)
    .map((x) => x.q)
    .slice(0, 8);
  // Debt #43: Math.random tanpa seed — rotasi acak tiap render; stabilkan
  // dengan PRNG seed sesi bila blok ini disentuh lagi.
  return quizSchema.parse({ moduleId: "latihan", questions: shuffled });
}

/** Sesi kuis modul: 3-8 soal bervariasi, tervalidasi Zod di batas. */
export function buildSessionQuiz(moduleId: string, opts?: PickOptions): Quiz {
  const bank = QUIZ_BANK[moduleId] ?? QUIZ_BANK.mod_01;
  const level = opts?.level ?? getAdaptiveLevel(moduleId);
  return quizSchema.parse({
    moduleId,
    questions: pickSessionQuestions(bank, { ...opts, level }),
  });
}
