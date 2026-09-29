import { KB_ENTRIES } from "../kb/kb-data";
import type { KbEntry, KbSource } from "../kb/kb-data";

export interface TeacherReply {
  answer: string;
  sources: KbSource[];
  title?: string;
  glyph?: string;
  /** ID entri KB asal jawaban — tautan balik kecil ke KbDetail (bila ada). */
  entryId?: string;
  outside: boolean;
  suggestions?: string[];
}

export interface QuickReply {
  label: string;
  text: string;
}

const SUGGESTIONS = [
  "Apa arti Galungan?",
  "Jelaskan Nyepi",
  "Apa itu Om Swastiastu?",
  "Cerita tentang canang sari",
  "Apa itu wresastra?",
  "Kapan Nyepi dirayakan?",
];

export const QUICK_REPLIES: QuickReply[] = [
  { label: "Om Swastiastu", text: "Apa arti Om Swastiastu?" },
  { label: "Matur suksma", text: "Apa itu matur suksma?" },
  { label: "Ampura", text: "Apa arti ampura?" },
  { label: "Galungan", text: "Apa itu Galungan?" },
  { label: "Nyepi", text: "Jelaskan hari raya Nyepi" },
  { label: "Canang sari", text: "Apa itu canang sari?" },
  { label: "Wresastra", text: "Apa itu wresastra?" },
  { label: "Madaar / Ngajeng", text: "Bedanya madaar sama ngajeng?" },
  { label: "Pules / Sirep", text: "Apa itu pules dan sirep?" },
  { label: "Titiang", text: "Apa arti kata titiang?" },
  { label: "Kapan Galungan", text: "Kapan Galungan dirayakan?" },
  { label: "Sejarah urutan aksara", text: "Kenapa aksara Bali urutannya ha na ca ra ka?" },
  { label: "Bedanya Andap & Alus", text: "Apa beda bahasa andap dan alus?" },
  { label: "Cara belajar aksara", text: "Gimana cara cepat belajar aksara Bali?" },
  { label: "Makna canang", text: "Jelaskan makna canang sari" },
  { label: "Cara pakai kalimat halus", text: "Kapan saya pakai bahasa halus?" },
  { label: "Filosofi aksara", text: "Apa filosofi di balik aksara Bali?" },
  { label: "Kapan Nyepi", text: "Kapan Nyepi dirayakan?" },
];

const SEMANTIC_HINTS: {
  tokens: string[];
  text: string;
  category: "kosakata" | "budaya" | "wresastra";
  exact?: string;
}[] = [
  {
    tokens: ["galungan", "kuningan", "nyepi", "hari raya", "tradisi", "penjor", "canang"],
    text: "hari raya atau tradisi Bali",
    category: "budaya",
  },
  {
    tokens: [
      "sapaan",
      "terima kasih",
      "maaf",
      "suksma",
      "ampura",
      "swastiastu",
      "makan",
      "tidur",
      "titiang",
      "pules",
      "sirep",
      "madaar",
      "ngajeng",
      "kosakata",
      "kata",
      "arti",
    ],
    text: "kosakata atau sapaan sehari-hari",
    category: "kosakata",
  },
  {
    tokens: [
      "aksara",
      "wresastra",
      "huruf",
      "bentuk",
      "latin",
      "ha",
      "na",
      "ca",
      "ra",
      "ka",
      "nyanya",
      "filosofi aksara",
    ],
    text: "aksara wresastra dasar",
    category: "wresastra",
  },
];

const STOPWORDS = new Set([
  "apa",
  "apakah",
  "itu",
  "ini",
  "yang",
  "untuk",
  "tolong",
  "jelaskan",
  "jelasin",
  "coba",
  "gimana",
  "bagaimana",
  "bisa",
  "arti",
  "tentang",
  "sih",
  "ya",
  "nih",
  "dong",
  "kah",
  "dari",
  "ke",
  "di",
  "dan",
  "atau",
  "serta",
  "sama",
  "dengan",
  "kenapa",
  "mengapa",
  "siapa",
  "kapan",
  "mana",
  "kata",
  "kapan",
  "ado",
  "nggak",
  "gak",
  "orang",
  "hari",
  "saat",
]);

function clean(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w && !STOPWORDS.has(w))
    .join(" ");
}

function tokenize(q: string): string[] {
  return clean(q).split(" ").filter(Boolean);
}

function scoreEntry(entry: KbEntry, tokens: string[]): number {
  if (tokens.length === 0) return 0;
  const title = entry.title.toLowerCase();
  const latin = (entry.latin ?? "").toLowerCase();
  const body = entry.body.toLowerCase();
  let score = 0;

  const query = tokens.join(" ");
  if (title.includes(query) || latin.includes(query)) score += 5;
  if (body.includes(query)) score += 3;

  const matched = new Set<string>();
  for (const t of tokens) {
    if (title.includes(t)) {
      score += 3;
      matched.add(t);
    }
    if (latin.includes(t)) {
      score += 1;
      matched.add(t);
    }
    if (body.includes(t)) {
      score += 1;
      matched.add(t);
    }
  }

  if (entry.category === "wresastra" && tokens.some((t) => t === "aksara" || t === "huruf")) {
    score += 1;
  }

  const coverage = matched.size / tokens.length;
  if (coverage >= 0.5) score += 2;
  return score;
}

export function getTeacherReply(input: string): TeacherReply {
  const tokens = tokenize(input);
  if (tokens.length === 0) {
    return {
      answer:
        "Tanya apa aja seputar aksara, bahasa, atau budaya Bali ya. Kalau di luar itu, aku belum bisa jawab.",
      sources: [],
      outside: true,
      suggestions: SUGGESTIONS,
    };
  }

  let best: KbEntry | null = null;
  let bestScore = 0;
  for (const entry of KB_ENTRIES) {
    const s = scoreEntry(entry, tokens);
    if (s > bestScore) {
      bestScore = s;
      best = entry;
    }
  }

  if (best && bestScore >= 4) {
    return {
      answer: best.body,
      title: best.title,
      glyph: best.glyph,
      sources: best.sources,
      entryId: best.id,
      outside: false,
    };
  }

  const q = clean(input);
  const hint = SEMANTIC_HINTS.find((h) => h.tokens.some((t) => q.includes(t)));
  const fallback = hint
    ? `Maaf, itu masih di luar materi yang aku pelajari. Coba tanya lebih spesifik seputar ${hint.text} ya, atau seputar aksara, bahasa, dan budaya Bali lainnya.`
    : "Maaf, itu masih di luar materi yang aku pelajari. Coba tanya seputar aksara, bahasa, atau budaya Bali ya, atau pilih pertanyaan cepat di bawah.";

  return {
    answer: fallback,
    sources: [],
    outside: true,
    suggestions: SUGGESTIONS,
  };
}
