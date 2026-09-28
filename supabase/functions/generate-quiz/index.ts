/// <reference lib="deno.ns" />
// Edge Function: generate-quiz (#23 V4).
// Kontrak: terima { moduleId, level, count, wrongTopics }, kembalikan
// { moduleId, questions[3..8], cached } dengan 2+ tipe soal termasuk
// dengar_pilih (audio asli bila ada, badge Latin bila belum terkurasi).
// Ketahanan: rate-limit 429 sebelum panggil Gemini, retry 2x lalu fallback
// bank statis QUIZ_BANK + header `x-quiz-source: gemini|fallback`, tidak
// pernah macet, API key tidak pernah bocor ke klien.

import { quizSchema } from "../../../apps/web/src/lib/zod/question.ts";
import type { Question } from "../../../apps/web/src/lib/zod/question.ts";

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
  ],
};

const GENERATE_MODEL = "gemini-3.1-flash-lite";
const GEMINI_ENDPOINT = (model: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

const RATE_LIMIT_PER_MINUTE = 10;
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

function clampLevel(v: unknown): number {
  const n = typeof v === "number" ? Math.round(v) : 1;
  return Math.min(3, Math.max(1, n));
}

function clampCount(v: unknown): number {
  const n = typeof v === "number" ? Math.round(v) : 5;
  return Math.min(8, Math.max(3, n));
}

function pickFallback(moduleId: string, count: number): Question[] {
  const bank = FALLBACK_BANK[moduleId] ?? FALLBACK_BANK.mod_01 ?? [];
  return bank.slice(0, Math.min(count, Math.max(3, bank.length)));
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
        maxItems: 8,
        items: {
          anyOf: [
            {
              type: "OBJECT",
              properties: {
                ...base,
                type: { type: "STRING", enum: ["dengar_pilih"] },
                choices: { type: "ARRAY", minItems: 2, items: choice },
              },
              required: ["type", "prompt", "choices"],
            },
            {
              type: "OBJECT",
              properties: {
                ...base,
                type: { type: "STRING", enum: ["kenali_visual"] },
                choices: { type: "ARRAY", minItems: 2, items: choice },
              },
              required: ["type", "prompt", "choices"],
            },
            {
              type: "OBJECT",
              properties: {
                ...base,
                type: { type: "STRING", enum: ["checkpoint_budaya"] },
                choices: { type: "ARRAY", minItems: 2, items: choice },
              },
              required: ["type", "prompt", "choices"],
            },
            {
              type: "OBJECT",
              properties: {
                ...base,
                type: { type: "STRING", enum: ["susun_aksara"] },
                tiles: { type: "ARRAY", minItems: 2, items: { type: "STRING" } },
              },
              required: ["type", "prompt", "tiles"],
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
              required: ["type", "prompt", "pairs"],
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
    (r) => `- [${r.category}/L${r.level}] ${r.title}: ${r.body} (sumber: ${r.source})`,
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
    "setiap soal memakai tepat satu KB Entry di atas (cantumkan sourceRef 'id · Basis Pengetahuan' dan level KB),",
    "choices tepat 4 dengan satu isCorrect true bila tipe pilihan.",
    context,
    "Balas hanya JSON sesuai responseSchema: { moduleId, questions }.",
  ].join("\n");
}

async function queryKb(
  supabaseUrl: string,
  serviceKey: string,
  moduleId: string,
  level: number,
): Promise<KbRow[]> {
  const hit = cache.get(moduleId);
  if (hit && Date.now() - hit.at < KB_CACHE_TTL_MS) return hit.rows;
  const params = new URLSearchParams({
    select: "id,category,title,body,source,level",
    level: `eq.${level}`,
    order: "id.asc",
    limit: "12",
  });
  const res = await fetch(`${supabaseUrl}/rest/v1/kb_entries?${params}`, {
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
  });
  if (!res.ok) return [];
  const rows = (await res.json()) as KbRow[];
  cache.set(moduleId, { at: Date.now(), rows });
  return rows;
}

function rateLimited(calledAts: string[]): boolean {
  const cutoff = Date.now() - 60_000;
  return calledAts.filter((iso) => Date.parse(iso) >= cutoff).length >= RATE_LIMIT_PER_MINUTE;
}

async function checkRateLimit(
  supabaseUrl: string,
  serviceKey: string,
  profileId: string,
): Promise<boolean> {
  const params = new URLSearchParams({
    select: "called_at",
    profile_id: `eq.${profileId}`,
    order: "called_at.desc",
    limit: String(RATE_LIMIT_PER_MINUTE),
  });
  const res = await fetch(`${supabaseUrl}/rest/v1/quiz_calls?${params}`, {
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
  });
  if (!res.ok) return false;
  const rows = (await res.json()) as Array<{ called_at: string }>;
  return rateLimited(rows.map((r) => r.called_at));
}

async function recordCall(supabaseUrl: string, serviceKey: string, profileId: string) {
  await fetch(`${supabaseUrl}/rest/v1/quiz_calls`, {
    method: "POST",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ profile_id: profileId }),
  });
}

function extractJson(raw: string): unknown {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("respons Gemini bukan JSON");
  return JSON.parse(raw.slice(start, end + 1));
}

async function callGemini(apiKey: string, req: GenerateQuizRequest, context: string) {
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
      if (parsed.success && parsed.data.questions.length >= 3) {
        return { quiz: parsed.data, rateLimited: false as const };
      }
      lastError = "validasi Zod gagal";
    } catch (e) {
      lastError = e instanceof Error ? e.message : "fetch gagal";
    }
  }
  return { quiz: null as null, rateLimited: false as const, error: lastError };
}

async function authProfileId(supabaseUrl: string, anonKey: string, req: Request): Promise<string> {
  const auth = req.headers.get("authorization") ?? "";
  const res = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { apikey: anonKey, Authorization: auth },
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
  const count = clampCount(body.count);
  const wrongTopics = Array.isArray(body.wrongTopics)
    ? body.wrongTopics.filter((t): t is string => typeof t === "string").slice(0, 8)
    : [];

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!supabaseUrl || !serviceKey || !anonKey) {
    return json(500, { error: "konfigurasi server belum lengkap" });
  }

  let profileId: string;
  try {
    profileId = await authProfileId(supabaseUrl, anonKey, req);
  } catch {
    return json(401, { error: "butuh sesi anon" });
  }

  if (await checkRateLimit(supabaseUrl, serviceKey, profileId)) {
    return json(429, { error: "terlalu banyak permintaan, coba lagi sebentar" });
  }
  await recordCall(supabaseUrl, serviceKey, profileId);

  const kb = await queryKb(supabaseUrl, serviceKey, moduleId, level);
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

  const result = await callGemini(apiKey, { moduleId, level, count, wrongTopics }, context);
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

// Supabase Edge runtime: layani request masuk.
Deno.serve(handler);
