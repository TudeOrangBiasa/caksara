// Vendored dari apps/web/src/features/quiz/quiz-pick.ts — JANGAN EDIT MANUAL, jalankan bun vendor-bank.ts
// Impor lintas batas Deno/Vite ditolak bundler Edge; sumber tunggal tetap quiz-pick.ts FE.
import type { Question } from "./question.ts";

export const SESSION_COUNT = 8;
export const MIN_TYPES = 2;

export function hasVariety(questions: readonly Question[], minTypes = MIN_TYPES): boolean {
  return new Set(questions.map((q) => q.type)).size >= minTypes;
}

export interface PickOptions {
  level?: number;
  count?: number;
  seed?: number;
  /** Batas tipe berbeda per sesi (default 5 dari 5 agar 8 soal bervariasi). */
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
 * Satu-satunya seam pemilihan Sesi Kuis: bank + level + seed → 8 soal.
 * Dipakai FE (buildSessionQuiz) dan Edge (pickFallback) dari sumber yang
 * sama via vendor-bank.ts — himpunan offline dan online identik.
 * Selalu sertakan dengar_pilih bila bank punya, jaga 3-5 tipe berbeda,
 * utamakan level target (±1), lalu putar urutan per seed agar pengulangan
 * tidak monoton. Deterministik — aman untuk resume.
 */
export function pickSessionQuestions(bank: readonly Question[], opts?: PickOptions): Question[] {
  const level = Math.min(3, Math.max(1, Math.round(opts?.level ?? 1)));
  const count = SESSION_COUNT;
  const seed = Math.max(0, Math.round(opts?.seed ?? 0));
  const maxTypes = Math.min(5, Math.max(MIN_TYPES, Math.round(opts?.maxTypes ?? 5)));
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
