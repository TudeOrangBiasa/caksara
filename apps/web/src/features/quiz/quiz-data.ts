import { questionSchema, quizSchema } from "../../lib/zod/question";
import type { Question, Quiz } from "../../lib/zod/question";
import type { CourseModule } from "../module/module-data";
import { pickSessionQuestions } from "./quiz-pick";

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
      type: "checkpoint_budaya",
      prompt: "Apa fungsi gestur Anjali Mudra saat menyapa?",
      choices: [
        { text: "Sekadar formalitas", isCorrect: false },
        { text: "Tanda hormat dan ikhlas", isCorrect: true },
        { text: "Tanda perpisahan", isCorrect: false },
        { text: "Tanda meminta makan", isCorrect: false },
      ],
      explanation:
        "Tangan dicakupkan di depan dada lalu sedikit menunduk: tanda hormat dan ikhlas.",
      sourceRef: "kb_sapaan · Basis Pengetahuan",
      level: 1,
    },
    {
      type: "kenali_visual",
      prompt: "Sapaan yang tepat untuk meminta maaf adalah...",
      choices: [
        { text: "Matur suksma", isCorrect: false },
        { text: "Om Swastiastu", isCorrect: false },
        { text: "Ampura", isCorrect: true },
        { text: "Rahajeng", isCorrect: false },
      ],
      explanation: "'Ampura' berarti mohon maaf; yang lebih dalam 'Nunas sinampura'.",
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
    {
      type: "kenali_visual",
      prompt: "Aksara 'na' ditulis seperti apa?",
      choices: [
        { text: "ᬦ", isCorrect: true },
        { text: "ᬳ", isCorrect: false },
        { text: "ᬘ", isCorrect: false },
        { text: "ᬭ", isCorrect: false },
      ],
      explanation: "Bentuk 'na' adalah ᬦ, aksara kedua urutan wresastra.",
      sourceRef: "kb_wre_01 · Basis Pengetahuan",
      level: 1,
    },
    {
      type: "checkpoint_budaya",
      prompt: "Bunyi dasar tiap aksara wresastra berakhiran...",
      choices: [
        { text: "'i'", isCorrect: false },
        { text: "'a'", isCorrect: true },
        { text: "'u'", isCorrect: false },
        { text: "'o'", isCorrect: false },
      ],
      explanation: "Tiap aksara berbunyi dasar ber-akhiran 'a': Ha, Na, Ca, Ra, Ka.",
      sourceRef: "kb_wre_01 · Basis Pengetahuan",
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
    {
      type: "kenali_visual",
      prompt: "Kata 'tidur' dalam Basa Alus adalah...",
      choices: [
        { text: "Madaar", isCorrect: false },
        { text: "Pules", isCorrect: false },
        { text: "Ngajeng", isCorrect: false },
        { text: "Sirep", isCorrect: true },
      ],
      explanation: "Sirep adalah bentuk Alus dari 'tidur', sedangkan pules adalah Andap.",
      sourceRef: "kb_madaar_ngajeng · Basis Pengetahuan",
      level: 2,
    },
    {
      type: "checkpoint_budaya",
      prompt: "Salah pilih tingkat bahasa bisa terdengar...",
      choices: [
        { text: "Kasar", isCorrect: true },
        { text: "Merdu", isCorrect: false },
        { text: "Lucu", isCorrect: false },
        { text: "Biasa saja", isCorrect: false },
      ],
      explanation: "Salah pilih Andap/Alus bisa terdengar kasar bagi lawan bicara.",
      sourceRef: "kb_madaar_ngajeng · Basis Pengetahuan",
      level: 2,
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
    {
      type: "kenali_visual",
      prompt: "Canang Sari adalah...",
      choices: [
        { text: "Sesaji harian umat Bali", isCorrect: true },
        { text: "Alat musik gamelan", isCorrect: false },
        { text: "Pakaian adat", isCorrect: false },
        { text: "Tarian sakral", isCorrect: false },
      ],
      explanation: "Canang Sari adalah sesaji harian sebagai tanda syukur.",
      sourceRef: "kb_nyepi · Basis Pengetahuan",
      level: 2,
    },
    {
      type: "checkpoint_budaya",
      prompt: "Penjor dipasang saat...",
      choices: [
        { text: "Nyepi", isCorrect: false },
        { text: "Galungan", isCorrect: true },
        { text: "Hari biasa", isCorrect: false },
        { text: "Malam hari raya saja", isCorrect: false },
      ],
      explanation: "Penjor dipasang saat Galungan sebagai tanda syukur atas kesejahteraan.",
      sourceRef: "kb_galungan · Basis Pengetahuan",
      level: 2,
    },
  ],
};

/** Batas Zod bank (#42): tiap modul diparse sekali saat dimuat; gagal cepat bila invalid. */
export function validateQuizBank(moduleId: string, bank: readonly Question[]): Question[] {
  const result = questionSchema.array().min(1).safeParse(bank);
  if (!result.success) {
    throw new Error(`[quiz-data] QUIZ_BANK.${moduleId} invalid: ${result.error.message}`);
  }
  return result.data;
}

for (const [moduleId, bank] of Object.entries(QUIZ_BANK)) {
  QUIZ_BANK[moduleId] = validateQuizBank(moduleId, bank);
}

export { hasVariety, MIN_TYPES, pickSessionQuestions, SESSION_COUNT } from "./quiz-pick";
export type { PickOptions } from "./quiz-pick";

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

export function recordSessionLevel(
  moduleId: string,
  correct: number,
  total: number,
  wrongTopics: readonly string[] = [],
): void {
  if (total <= 0) return;
  const rate = correct / total;
  const prev = getAdaptiveLevel(moduleId);
  // #33 V11a: salah terus menahan laju naik. Skor anjlok (<0.4) selalu
  // turun; di bawah lancar, topik salah memperlebar zona turun; skor
  // lancar (≥0.8) hanya naik bila bersih — ada topik salah berarti pola
  // salah berulang di materi itu, jadi tahan walau skor sesi tinggi.
  // Skor 5/5 murni tak punya topik salah (bukan temuan).
  const hasWrong = wrongTopics.length > 0;
  const next = hasWrong
    ? rate >= 0.8
      ? prev
      : Math.max(1, prev - 1)
    : rate < 0.4
      ? Math.max(1, prev - 1)
      : rate >= 0.8
        ? Math.min(3, prev + 1)
        : prev;
  writeNum(LEVEL_KEY, moduleId, next);
}

/** Hitung percobaan agar pengulangan sesi memutar urutan soal (deterministik per seed). */
export function nextAttemptSeed(moduleId: string): number {
  const prev = readNum(ATTEMPT_KEY, moduleId) ?? 0;
  writeNum(ATTEMPT_KEY, moduleId, prev + 1);
  return prev;
}

/** FNV-1a 32-bit: seed default campuran modul (#43). */
function hashModuleIds(moduleIds: readonly string[]): number {
  let h = 2166136261;
  const sep = "|".codePointAt(0) ?? 124;
  for (const id of moduleIds) {
    for (const ch of id) {
      h ^= ch.codePointAt(0) ?? 0;
      h = Math.imul(h, 16777619);
    }
    // Pemisah antar id agar ["ab", "c"] dan ["a", "bc"] tak bertabrakan.
    h ^= sep;
  }
  return h >>> 0;
}

/** PRNG deterministik (mulberry32): seed sama → urutan sama (#43). */
function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 2 ** 32;
  };
}

/**
 * Kuis latihan lintas modul: kocok deterministik dari hash daftar modul
 * bila seed tak diisi, lalu putar urutan per seed (semantik seed sama
 * seperti pickSessionQuestions: himpunan tetap, urutan berputar).
 */
export function buildMixedQuiz(moduleIds: string[] = Object.keys(QUIZ_BANK), seed?: number): Quiz {
  const questions = moduleIds.flatMap((id) => QUIZ_BANK[id] ?? []);
  const baseSeed = hashModuleIds(moduleIds);
  const rand = mulberry32(baseSeed);
  const shuffled = [...questions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const tmp = shuffled[i] as Question;
    shuffled[i] = shuffled[j] as Question;
    shuffled[j] = tmp;
  }
  const picked = shuffled.slice(0, 8);
  const rotSeed = Math.max(0, Math.round(seed ?? baseSeed));
  const rot = picked.length === 0 ? 0 : rotSeed % picked.length;
  const rotated = picked.slice(rot).concat(picked.slice(0, rot));
  return quizSchema.parse({ moduleId: "latihan", questions: rotated });
}

/** Sesi kuis modul: 8 soal bervariasi, tervalidasi Zod di batas. */
export function buildSessionQuiz(moduleId: string, opts?: PickOptions): Quiz {
  const bank = QUIZ_BANK[moduleId] ?? QUIZ_BANK.mod_01;
  const level = opts?.level ?? getAdaptiveLevel(moduleId);
  return quizSchema.parse({
    moduleId,
    questions: pickSessionQuestions(bank, { ...opts, level }),
  });
}

/** Modul sintetis Latihan Campuran (sesi lintas modul yang sudah selesai). */
export const MOD_LATIHAN: CourseModule = {
  id: "latihan",
  order: 1,
  title: "Latihan Campuran",
  theme: "Ulas ulang semua materi yang sudah dipelajari",
  description: "Latihan campuran dari semua modul yang sudah kamu selesaikan.",
  poinBelajar: ["Pengulangan"],
  jumlahSoal: 8,
  estimasiMenit: 3,
  materi: [
    {
      id: "lat_01",
      judul: "Latihan Campuran",
      isi: "Ulas ulang semua materi dari modul yang sudah kamu selesaikan.",
    },
  ],
};

/**
 * Satu-satunya seam perakitan Sesi Kuis: modul latihan → campuran,
 * modul biasa → sesi 8 soal. Router hanya memilih tab/view.
 */
export function quizForModule(mod: CourseModule, selesai: readonly string[] = []): Quiz {
  if (mod.id === MOD_LATIHAN.id) return buildMixedQuiz([...selesai]);
  return buildSessionQuiz(mod.id, { seed: nextAttemptSeed(mod.id) });
}
