import { quizSchema } from "../../lib/zod/question";
import type { Question, Quiz } from "../../lib/zod/question";

export const QUIZ_BANK: Record<string, Question[]> = {
  mod_01: [
    {
      type: "dengar_pilih",
      prompt: "Dengar, lalu pilih sapaan yang benar.",
      choices: [
        { text: "Om Swastiastu", isCorrect: true },
        { text: "Matur suksma", isCorrect: false },
        { text: "Sampun", isCorrect: false },
        { text: "Ngiring", isCorrect: false },
      ],
      explanation: "Om Swastiastu adalah salam pembuka yang bermakna doa keselamatan.",
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
    },
    {
      type: "susun_aksara",
      prompt: "Susun suku kata menjadi sapaan 'swastiastu'.",
      tiles: ["swa", "ti", "as", "tu"],
      explanation: "Urutan yang benar: swa - ti - as - tu.",
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
    },
  ],
  mod_02: [
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
    },
    {
      type: "susun_aksara",
      prompt: "Susun tiga aksara pertama yang benar (Latin).",
      tiles: ["Ha", "Na", "Ca"],
      explanation: "Urutan yang benar: Ha - Na - Ca.",
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
    },
  ],
  mod_03: [
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
    },
    {
      type: "susun_aksara",
      prompt: "Susun kalimat Basa Alus 'saya mau makan'.",
      tiles: ["Titiang", "jagi", "ngajeng"],
      explanation: "Urutan yang benar: Titiang - jagi - ngajeng.",
    },
  ],
  mod_04: [
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
    },
    {
      type: "susun_aksara",
      prompt: "Susun kata 'galungan' dengan benar.",
      tiles: ["ga", "lu", "ngan"],
      explanation: "Urutan yang benar: ga - lu - ngan.",
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
    },
  ],
};
/**
 * V3 tracer (#22): 3 soal kenali_visual mock dari KB (belum Gemini).
 * Tiap soal membawa explanation + sourceRef KB agar panel feedback bisa
 * menampilkan penjelasan berikon + teks sumber. Zod parse di batas.
 */
const TRACER_QUESTIONS: Question[] = [
  {
    type: "kenali_visual",
    prompt: "ᬒᬁᬲ᭄ᬯᬲ᭄ᬢᬶᬬᬲ᭄ᬢᬸ",
    choices: [
      { text: "Selamat pagi", isCorrect: false },
      { text: "Semoga selamat atas karunia Hyang Widhi", isCorrect: true },
      { text: "Terima kasih", isCorrect: false },
      { text: "Sampai jumpa", isCorrect: false },
    ],
    explanation: "Om Swastiastu berarti semoga dalam keadaan selamat atas karunia-Nya (kb_sapaan).",
    sourceRef: "kb_sapaan · Basis Pengetahuan",
    level: 1,
  },
  {
    type: "kenali_visual",
    prompt: "ᬳ",
    choices: [
      { text: "ha", isCorrect: true },
      { text: "na", isCorrect: false },
      { text: "ca", isCorrect: false },
      { text: "ka", isCorrect: false },
    ],
    explanation: "Bentuknya adalah aksara wresastra ha, pembuka urutan Ha Na Ca Ra Ka.",
    sourceRef: "kb_wre_01 · Basis Pengetahuan",
    aksaraId: "wre_01",
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
];

export function buildTracerQuiz(moduleId: string): Quiz {
  return quizSchema.parse({ moduleId, questions: TRACER_QUESTIONS });
}

export function buildQuiz(moduleId: string): Quiz {
  const questions = QUIZ_BANK[moduleId] ?? QUIZ_BANK.mod_01;
  return { moduleId, questions };
}

export function buildMixedQuiz(moduleIds: string[]): Quiz {
  const questions = moduleIds.flatMap((id) => QUIZ_BANK[id] ?? []);
  const shuffled = questions
    .map((q) => ({ q, r: Math.random() }))
    .sort((a, b) => a.r - b.r)
    .map((x) => x.q)
    .slice(0, 8);
  return { moduleId: "latihan", questions: shuffled };
}
