/// <reference lib="deno.ns" />
// Edge Function: generate-quiz (#23 V4).
// Kontrak: terima { moduleId, level, count, wrongTopics }, kembalikan
// { moduleId, questions[tepat 3, #85], cached } dengan 2+ tipe soal
// termasuk dengar_pilih (audio asli bila ada, badge Latin bila belum terkurasi).
// Ketahanan: rate-limit 429 sebelum panggil Gemini, retry 2x lalu fallback
// bank statis QUIZ_BANK + header `x-quiz-source: gemini|fallback`, tidak
// pernah macet, API key tidak pernah bocor ke klien.

import { allQuestionsGrounded } from "./quiz-grounding.ts";
import { quizSchema } from "./question.ts";
import type { Question } from "./question.ts";
import { secretFromJsonPlural } from "./secret-keys.ts";
import { canUseFastPath, rateLimited, windowHourStart } from "./rate-window.ts";
import type { QuizCallRow } from "./rate-window.ts";

// Vendored dari apps/web/src/features/quiz/quiz-data.ts — JANGAN EDIT MANUAL, jalankan bun vendor-bank.ts
// Impor lintas batas Deno/Vite ditolak bundler Edge; sumber tunggal tetap QUIZ_BANK FE.
const FALLBACK_BANK: Record<string, Question[]> = {
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

const GENERATE_MODEL = "gemini-3.1-flash-lite";
const GEMINI_ENDPOINT = (model: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

const KB_CACHE_TTL_MS = 60_000;

interface KbRow {
  id: number;
  category: string;
  title: string;
  body: string;
  source: string;
  level: number;
}

interface GenerateQuizRequest {
  moduleId: string;
  level?: number;
  count?: number;
  wrongTopics?: string[];
}

const cache = new Map<string, { at: number; rows: KbRow[] }>();

function json(status: number, body: unknown, extra?: Record<string, string>): Response {
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (extra) {
    for (const [k, v] of Object.entries(extra)) headers[k] = v;
  }
  return new Response(JSON.stringify(body), { status, headers });
}
/**
 * Kunci server baru Supabase berbentuk PLURAL JSON dict, mis.
 * SUPABASE_PUBLISHABLE_KEYS = {"default": "sb_publishable_..."}.
 * Deno.env.get singular return null — parse ["default"] dengan try/catch
 * (lihat secret-keys.ts, diuji outcome via bun tanpa Deno).
 * Tanpa fallback legacy: string kosong berarti konfigurasi belum lengkap
 * (handler balas 500 yang jelas, bukan 500 misterius).
 * Tak pernah log nilai kunci — hanya label bila JSON rusak.
 */

function clampLevel(v: unknown): number {
  const n = typeof v === "number" ? Math.round(v) : 1;
  return Math.min(3, Math.max(1, n));
}
function pickFallback(moduleId: string, count: number): Question[] {
  const bank = FALLBACK_BANK[moduleId] ?? FALLBACK_BANK.mod_01 ?? [];
  const sliced = bank.slice(0, Math.min(count, Math.max(3, bank.length)));
  const parsed = quizSchema.safeParse({ moduleId, questions: sliced });
  if (parsed.success) return parsed.data.questions;
  const first = quizSchema.safeParse({ moduleId, questions: FALLBACK_BANK.mod_01 ?? [] });
  if (first.success) {
    return first.data.questions.slice(0, Math.min(count, first.data.questions.length));
  }
  return [];
}

function responseSchema(): Record<string, unknown> {
  const choice = {
    type: "OBJECT",
    properties: { text: { type: "STRING" }, isCorrect: { type: "BOOLEAN" } },
    required: ["text", "isCorrect"],
  };
  const base = {
    prompt: { type: "STRING" },
    audioUrl: { type: "STRING" },
    audioType: { type: "STRING", enum: ["original", "latin"] },
    latinText: { type: "STRING" },
    explanation: { type: "STRING" },
    sourceRef: { type: "STRING" },
    aksaraId: { type: "STRING" },
    level: { type: "INTEGER" },
  };
  return {
    type: "OBJECT",
    properties: {
      moduleId: { type: "STRING" },
      questions: {
        type: "ARRAY",
        minItems: 3,
        maxItems: 3,
        items: {
          anyOf: [
            {
              type: "OBJECT",
              properties: {
                ...base,
                type: { type: "STRING", enum: ["dengar_pilih"] },
                choices: { type: "ARRAY", minItems: 2, items: choice },
              },
              required: ["type", "prompt", "choices", "sourceRef"],
            },
            {
              type: "OBJECT",
              properties: {
                ...base,
                type: { type: "STRING", enum: ["kenali_visual"] },
                choices: { type: "ARRAY", minItems: 2, items: choice },
              },
              required: ["type", "prompt", "choices", "sourceRef"],
            },
            {
              type: "OBJECT",
              properties: {
                ...base,
                type: { type: "STRING", enum: ["checkpoint_budaya"] },
                choices: { type: "ARRAY", minItems: 2, items: choice },
              },
              required: ["type", "prompt", "choices", "sourceRef"],
            },
            {
              type: "OBJECT",
              properties: {
                ...base,
                type: { type: "STRING", enum: ["susun_aksara"] },
                tiles: { type: "ARRAY", minItems: 2, items: { type: "STRING" } },
              },
              required: ["type", "prompt", "tiles", "sourceRef"],
            },
            {
              type: "OBJECT",
              properties: {
                ...base,
                type: { type: "STRING", enum: ["cocokkan"] },
                pairs: {
                  type: "ARRAY",
                  minItems: 1,
                  items: {
                    type: "OBJECT",
                    properties: { left: { type: "STRING" }, right: { type: "STRING" } },
                    required: ["left", "right"],
                  },
                },
              },
              required: ["type", "prompt", "pairs", "sourceRef"],
            },
          ],
        },
      },
    },
    required: ["moduleId", "questions"],
  };
}

function kbContext(rows: KbRow[], wrongTopics: string[]): string {
  const lines = rows.map(
    (r) => `- KB#${r.id} [${r.category}/L${r.level}] ${r.title}: ${r.body} (sumber: ${r.source})`,
  );
  const wrong =
    wrongTopics.length > 0 ? `\nTopik yang sering salah: ${wrongTopics.join(", ")}.` : "";
  return `Basis Pengetahuan (satu-satunya sumber soal):\n${lines.join("\n")}${wrong}`;
}

function buildPrompt(req: GenerateQuizRequest, context: string): string {
  return [
    "Kamu pembuat soal CAKSARA (aksara & budaya Bali).",
    `Buat ${req.count} soal untuk modul ${req.moduleId} pada level ${req.level}.`,
    "Syarat: tepat 2-3 tipe berbeda dari [dengar_pilih, susun_aksara, kenali_visual, checkpoint_budaya, cocokkan],",
    "wajib ada 1 soal dengar_pilih (audioUrl boleh kosong; isi latinText bila audio belum ada — jangan pura-pura TTS aksara),",
    "setiap soal memakai tepat satu KB Entry di atas dan WAJIB cantumkan sourceRef persis 'KB#<id> · Basis Pengetahuan' dengan <id> salah satu id di atas (soal tanpa kutipan valid DITOLAK — jangan tulis id lain),",
    "cantumkan level KB tiap soal; choices tepat 4 dengan satu isCorrect true bila tipe pilihan.",
    context,
    "Balas hanya JSON sesuai responseSchema: { moduleId, questions }.",
  ].join("\n");
}

async function queryKb(
  supabaseUrl: string,
  secretKey: string,
  moduleId: string,
  level: number,
): Promise<KbRow[]> {
  const hit = cache.get(moduleId);
  if (hit && Date.now() - hit.at < KB_CACHE_TTL_MS) return hit.rows;
  // Debt: kb_entries tak punya kolom module_id — filter kategori di memori.
  // Tambah kolom module_id + filter server bila KB diskalakan.
  const categoryByModule: Record<string, string> = {
    mod_01: "kosakata",
    mod_02: "wresastra",
    mod_03: "kosakata",
    mod_04: "budaya",
  };
  const params = new URLSearchParams({
    select: "id,category,title,body,source,level",
    level: `eq.${level}`,
    order: "id.asc",
    limit: "24",
  });
  const res = await fetch(`${supabaseUrl}/rest/v1/kb_entries?${params}`, {
    headers: { apikey: secretKey, Authorization: `Bearer ${secretKey}` },
  });
  if (!res.ok) return [];
  const rows = (await res.json()) as KbRow[];
  const want = categoryByModule[moduleId];
  const filtered = want ? rows.filter((r) => r.category === want) : rows;
  const out = (filtered.length > 0 ? filtered : rows).slice(0, 12);
  cache.set(moduleId, { at: Date.now(), rows: out });
  return out;
}

// #60: bucket jam UTC (kolom window_hour + index) untuk counter 50/jam —
// nullable agar baris pra-migrasi (null) tetap valid dan jatuh ke hitung
// in-memory 60-menit. Batas 10/menit + 50/jam tak berubah.
const RATE_LIMIT_PER_HOUR = 50;

async function checkRateLimit(
  supabaseUrl: string,
  secretKey: string,
  profileId: string,
): Promise<boolean> {
  // Jalur cepat #60: satu query atas index (profile_id, window_hour).
  try {
    const hourStart = windowHourStart();
    const fast = new URLSearchParams({
      select: "called_at",
      profile_id: `eq.${profileId}`,
      window_hour: `gte.${hourStart}`,
      order: "called_at.desc",
      limit: String(RATE_LIMIT_PER_HOUR + 1),
    });
    const fastRes = await fetch(`${supabaseUrl}/rest/v1/quiz_calls?${fast}`, {
      headers: { apikey: secretKey, Authorization: `Bearer ${secretKey}` },
    });
    if (fastRes.ok) {
      const fastRows = (await fastRes.json()) as QuizCallRow[];
      if (canUseFastPath(fastRows)) {
        return (
          fastRows.length > RATE_LIMIT_PER_HOUR || rateLimited(fastRows.map((r) => r.called_at))
        );
      }
    }
  } catch {
    // Jaringan/parse gagal → fallback di bawah.
  }
  const params = new URLSearchParams({
    select: "called_at,window_hour",
    profile_id: `eq.${profileId}`,
    order: "called_at.desc",
    limit: String(RATE_LIMIT_PER_HOUR),
  });
  const res = await fetch(`${supabaseUrl}/rest/v1/quiz_calls?${params}`, {
    headers: { apikey: secretKey, Authorization: `Bearer ${secretKey}` },
  });
  if (!res.ok) return false;
  const rows = (await res.json()) as QuizCallRow[];
  return rateLimited(rows.map((r) => r.called_at));
}

async function recordCall(supabaseUrl: string, secretKey: string, profileId: string) {
  await fetch(`${supabaseUrl}/rest/v1/quiz_calls`, {
    method: "POST",
    headers: {
      apikey: secretKey,
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ profile_id: profileId, window_hour: windowHourStart() }),
  });
}

function extractJson(raw: string): unknown {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("respons Gemini bukan JSON");
  return JSON.parse(raw.slice(start, end + 1));
}

async function callGemini(
  apiKey: string,
  req: GenerateQuizRequest,
  context: string,
  kbIds: ReadonlySet<string>,
) {
  let lastError = "unknown";
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(`${GEMINI_ENDPOINT(GENERATE_MODEL)}?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 4096,
            responseMimeType: "application/json",
            responseSchema: responseSchema(),
          },
          contents: [{ parts: [{ text: buildPrompt(req, context) }] }],
        }),
        signal: AbortSignal.timeout(30_000),
      });
      if (res.status === 429) return { rateLimited: true as const };
      if (!res.ok) {
        lastError = `gemini ${res.status}`;
        continue;
      }
      const data = (await res.json()) as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      };
      const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
      const parsed = quizSchema.safeParse(extractJson(text));
      if (
        parsed.success &&
        parsed.data.questions.length >= 3 &&
        allQuestionsGrounded(parsed.data.questions, kbIds)
      ) {
        return { quiz: parsed.data, rateLimited: false as const };
      }
      lastError = parsed.success
        ? "soal tanpa sourceRef KB valid (grounding #97)"
        : "validasi Zod gagal";
    } catch (e) {
      lastError = e instanceof Error ? e.message : "fetch gagal";
    }
  }
  return { quiz: null as null, rateLimited: false as const, error: lastError };
}

async function authProfileId(
  supabaseUrl: string,
  publishableKey: string,
  req: Request,
): Promise<string> {
  const auth = req.headers.get("authorization") ?? "";
  const res = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { apikey: publishableKey, Authorization: auth },
  });
  if (!res.ok) throw new Error("unauthorized");
  const user = (await res.json()) as { id?: string };
  if (!user.id) throw new Error("unauthorized");
  return user.id;
}

export async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") return json(405, { error: "method harus POST" });
  let body: GenerateQuizRequest;
  try {
    body = (await req.json()) as GenerateQuizRequest;
  } catch {
    return json(400, { error: "body harus JSON" });
  }
  const moduleId = typeof body.moduleId === "string" ? body.moduleId.trim() : "";
  if (!moduleId) return json(400, { error: "moduleId wajib" });
  const level = clampLevel(body.level);
  const count = 3; // #85: sesi selalu tepat 3 soal, abaikan count klien.
  const wrongTopics = Array.isArray(body.wrongTopics)
    ? body.wrongTopics.filter((t): t is string => typeof t === "string").slice(0, 8)
    : [];

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  // Runtime baru menginjeksi dict PLURAL JSON, bukan string singular:
  // SUPABASE_PUBLISHABLE_KEYS / SUPABASE_SECRET_KEYS = {"default": "sb_..."}.
  // Kunci singular lama sudah tidak ada — jangan baca singular di sini.
  const publishableKey = secretFromJsonPlural(
    Deno.env.get("SUPABASE_PUBLISHABLE_KEYS"),
    "SUPABASE_PUBLISHABLE_KEYS",
  );
  const secretKey = secretFromJsonPlural(
    Deno.env.get("SUPABASE_SECRET_KEYS"),
    "SUPABASE_SECRET_KEYS",
  );
  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!supabaseUrl || !secretKey || !publishableKey) {
    return json(500, {
      error:
        'konfigurasi server belum lengkap (SUPABASE_URL / SUPABASE_PUBLISHABLE_KEYS["default"] / SUPABASE_SECRET_KEYS["default"])',
    });
  }

  let profileId: string;
  try {
    profileId = await authProfileId(supabaseUrl, publishableKey, req);
  } catch {
    return json(401, { error: "butuh sesi anon" });
  }

  if (await checkRateLimit(supabaseUrl, secretKey, profileId)) {
    return json(429, { error: "terlalu banyak permintaan, coba lagi sebentar" });
  }
  await recordCall(supabaseUrl, secretKey, profileId);

  const kb = await queryKb(supabaseUrl, secretKey, moduleId, level);
  const context =
    kb.length > 0
      ? kbContext(kb, wrongTopics)
      : "KB kosong untuk level ini — pakai pengetahuan aksara Bali umum yang aman.";

  if (!apiKey) {
    return json(
      200,
      { moduleId, questions: pickFallback(moduleId, count), cached: false, offline: true },
      { "x-quiz-source": "fallback" },
    );
  }

  const kbIds = new Set(kb.map((r) => String(r.id)));
  const result = await callGemini(apiKey, { moduleId, level, count, wrongTopics }, context, kbIds);
  if ("rateLimited" in result && result.rateLimited) {
    return json(429, { error: "terlalu banyak permintaan, coba lagi sebentar" });
  }
  if ("quiz" in result && result.quiz) {
    return json(
      200,
      { moduleId: result.quiz.moduleId, questions: result.quiz.questions, cached: false },
      { "x-quiz-source": "gemini" },
    );
  }
  return json(
    200,
    { moduleId, questions: pickFallback(moduleId, count), cached: false, offline: true },
    { "x-quiz-source": "fallback" },
  );
}

// Supabase Edge runtime: layani request masuk. Guard import.meta.main agar
// impor handler (mis. deno eval/test outcome 500) tak ikut menyalakan server.
if (import.meta.main) Deno.serve(handler);
