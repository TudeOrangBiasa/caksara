/// <reference lib="deno.ns" />
// Edge Function: guru-rag (#94 ask, #95 explain).
// Kontrak: { mode:"ask", question } | { mode:"explain", prompt, userChoice,
// entryHint } → { answer, entryIds, outside, citations? } JSON ketat.
// Gemini gemini-3.1-flash-lite temp 0.3 dengan seluruh baris kb_entries
// (id+judul+isi ringkas) sebagai konteks terikat; entryIds asing dibuang
// server-side (filterValidIds); outside:true → FE render kalimat tolak #90.
// Tanpa key / Gemini gagal → 503 + body { offline:true } agar FE jatuh ke
// fallback lokal (getTeacherReply / explanation statis), tak pernah blank.
// GEMINI_API_KEY hanya hidup di Edge secrets (Tude set di dashboard).

import { authProfileId, fetchJsonWithAuth } from "./http-auth.ts";
import {
  buildAskPrompt,
  buildExplainPrompt,
  citationsFor,
  extractJson,
  filterValidIds,
  GURU_RAG_MAX_IDS,
  GURU_RAG_MODEL,
  GURU_RAG_TEMPERATURE,
  kbContextLines,
  type RagKbRow,
} from "./rag-context.ts";
import { ragResponseSchema } from "./rag-schema.ts";
import { secretFromJsonPlural } from "./secret-keys.ts";

const GEMINI_ENDPOINT = (model: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

const RATE_LIMIT_PER_MINUTE = 10;
const KB_CACHE_TTL_MS = 60_000;
const QUESTION_MAX = 500;
const KB_LIMIT = 40;

interface AskBody {
  mode?: "ask";
  question?: unknown;
}
interface ExplainBody {
  mode: "explain";
  prompt?: unknown;
  userChoice?: unknown;
  entryHint?: unknown;
}
type GuruRagBody = AskBody | ExplainBody;

const kbCache = new Map<string, { at: number; rows: RagKbRow[] }>();

function json(status: number, body: unknown, extra?: Record<string, string>): Response {
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (extra) {
    for (const [k, v] of Object.entries(extra)) headers[k] = v;
  }
  return new Response(JSON.stringify(body), { status, headers });
}

function text(v: unknown, max: number): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

function responseSchema(): Record<string, unknown> {
  return {
    type: "OBJECT",
    properties: {
      answer: { type: "STRING" },
      entryIds: { type: "ARRAY", maxItems: GURU_RAG_MAX_IDS, items: { type: "STRING" } },
      outside: { type: "BOOLEAN" },
    },
    required: ["answer", "entryIds", "outside"],
  };
}

async function queryAllKb(supabaseUrl: string, secretKey: string): Promise<RagKbRow[]> {
  const hit = kbCache.get("all");
  if (hit && Date.now() - hit.at < KB_CACHE_TTL_MS) return hit.rows;
  const params = new URLSearchParams({
    select: "id,category,title,body,source,level",
    order: "id.asc",
    limit: String(KB_LIMIT),
  });
  const res = await fetchJsonWithAuth<RagKbRow[]>(
    `${supabaseUrl}/rest/v1/kb_entries?${params}`,
    secretKey,
  );
  if (!res.ok) return [];
  kbCache.set("all", { at: Date.now(), rows: res.data });
  return res.data;
}

function rateLimited(calledAts: string[]): boolean {
  if (calledAts.length === 0) return false;
  const now = Date.now();
  const ts = calledAts.map((s) => Date.parse(s)).filter((n) => !Number.isNaN(n));
  return ts.filter((t) => now - t < 60_000).length >= RATE_LIMIT_PER_MINUTE;
}

async function checkRateLimit(
  supabaseUrl: string,
  secretKey: string,
  profileId: string,
): Promise<boolean> {
  const params = new URLSearchParams({
    select: "called_at",
    profile_id: `eq.${profileId}`,
    order: "called_at.desc",
    limit: String(RATE_LIMIT_PER_MINUTE + 5),
  });
  const res = await fetchJsonWithAuth<Array<{ called_at: string }>>(
    `${supabaseUrl}/rest/v1/quiz_calls?${params}`,
    secretKey,
  );
  if (!res.ok) return false;
  return rateLimited(res.data.map((r) => r.called_at));
}

async function recordCall(supabaseUrl: string, secretKey: string, profileId: string) {
  await fetch(`${supabaseUrl}/rest/v1/quiz_calls`, {
    method: "POST",
    headers: {
      apikey: secretKey,
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ profile_id: profileId }),
  }).catch(() => undefined);
}

interface GeminiVerdict {
  answer: string;
  entryIds: string[];
  outside: boolean;
}

async function callGemini(
  apiKey: string,
  prompt: string,
  kbIds: ReadonlySet<string>,
): Promise<GeminiVerdict | null> {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(`${GEMINI_ENDPOINT(GURU_RAG_MODEL)}?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          generationConfig: {
            temperature: GURU_RAG_TEMPERATURE,
            maxOutputTokens: 1024,
            responseMimeType: "application/json",
            responseSchema: responseSchema(),
          },
          contents: [{ parts: [{ text: prompt }] }],
        }),
        signal: AbortSignal.timeout(30_000),
      });
      if (res.status === 429) return null;
      if (!res.ok) continue;
      const data = (await res.json()) as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      };
      const raw = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
      const parsed = ragResponseSchema.safeParse(extractJson(raw));
      if (!parsed.success) continue;
      // outside:true → answer diabaikan FE; entryIds valid tetap dicantumkan
      // bila ada (tak dipakai FE untuk outside, tapi jujur di body).
      if (parsed.data.outside) {
        return {
          answer: "",
          entryIds: filterValidIds(parsed.data.entryIds, kbIds),
          outside: true,
        };
      }
      const valid = filterValidIds(parsed.data.entryIds, kbIds);
      if (parsed.data.answer.trim().length === 0 || valid.length === 0) continue;
      return { answer: parsed.data.answer.trim(), entryIds: valid, outside: false };
    } catch {
      // Timeout/jaringan: coba dua kali lagi, lalu 503 → fallback lokal FE.
    }
  }
  return null;
}

export async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") return json(405, { error: "method harus POST" });
  let body: GuruRagBody;
  try {
    body = (await req.json()) as GuruRagBody;
  } catch {
    return json(400, { error: "body harus JSON" });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
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

  const rows = await queryAllKb(supabaseUrl, secretKey);
  if (rows.length === 0) {
    return json(503, { error: "KB kosong", offline: true });
  }
  const { text: context, ids } = kbContextLines(rows);
  const kbIds = new Set(ids);

  const mode = (body as ExplainBody).mode === "explain" ? "explain" : "ask";
  let prompt: string;
  if (mode === "explain") {
    const b = body as ExplainBody;
    const q = text(b.prompt, QUESTION_MAX);
    if (!q) return json(400, { error: "prompt wajib" });
    prompt = buildExplainPrompt(
      { prompt: q, userChoice: text(b.userChoice, 300), entryHint: text(b.entryHint, 120) },
      context,
    );
  } else {
    const q = text((body as AskBody).question, QUESTION_MAX);
    if (!q) return json(400, { error: "question wajib" });
    prompt = buildAskPrompt(q, context);
  }

  if (!apiKey) {
    return json(503, { error: "AI belum dikonfigurasi", offline: true });
  }

  const verdict = await callGemini(apiKey, prompt, kbIds);
  if (!verdict) {
    return json(503, { error: "AI sedang gangguan", offline: true });
  }
  return json(
    200,
    {
      answer: verdict.answer,
      entryIds: verdict.entryIds,
      outside: verdict.outside,
      citations: citationsFor(verdict.entryIds, rows),
    },
    { "x-rag-source": "gemini" },
  );
}

if (import.meta.main) Deno.serve(handler);
