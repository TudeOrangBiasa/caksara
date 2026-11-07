// Sinkronkan FALLBACK_BANK Edge dari QUIZ_BANK FE (#57). Jalankan lokal via
// bun; tanpa network, tanpa mengubah FE (sumber tunggal tetap QUIZ_BANK).
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..", "..", "..");
const FE_REL = "apps/web/src/features/quiz/quiz-data.ts";
const EDGE_REL = "supabase/functions/generate-quiz/index.ts";
const FE_MARKER = "export const QUIZ_BANK";
const EDGE_MARKER = "const FALLBACK_BANK";

/** Baris pertama tiap blok vendored (pola question.ts). */
export const VENDOR_HEADER = `// Vendored dari ${FE_REL} — JANGAN EDIT MANUAL, jalankan bun vendor-bank.ts`;
const VENDOR_WHY =
  "// Impor lintas batas Deno/Vite ditolak bundler Edge; sumber tunggal tetap QUIZ_BANK FE.";

interface BankBlock {
  start: number;
  end: number;
  lines: string[];
}

/** Ambil blok literal dari baris `marker … {` sampai penutup `};` kolom-0. */
export function extractBlock(source: string, marker: string, label: string): BankBlock {
  const lines = source.split("\n");
  const starts: number[] = [];
  lines.forEach((line, i) => {
    if (line.startsWith(marker) && line.endsWith("{")) starts.push(i);
  });
  if (starts.length !== 1) {
    throw new Error(`[vendor-bank] ${label}: ${starts.length} blok ${marker} (harus 1)`);
  }
  const start = starts[0] as number;
  const end = lines.findIndex((line, i) => i > start && line === "};");
  if (end === -1) throw new Error(`[vendor-bank] ${label}: penutup }; kolom-0 tak ketemu`);
  return { start, end, lines: lines.slice(start, end + 1) };
}

/** Splice blok vendored ke sumber Edge; lebar header lama dilewati bila ada. */
export function spliceVendoredBlock(edgeSource: string, block: string): string {
  const lines = edgeSource.split("\n");
  const declIdx = lines.findIndex((line) => line.startsWith(EDGE_MARKER) && line.endsWith("{"));
  if (declIdx === -1) throw new Error("[vendor-bank] Edge: deklarasi FALLBACK_BANK tak ketemu");
  let start = declIdx;
  if (lines[declIdx - 2] === VENDOR_HEADER) start = declIdx - 2;
  const end = lines.findIndex((line, i) => i > declIdx && line === "};");
  if (end === -1) throw new Error("[vendor-bank] Edge: penutup }; kolom-0 tak ketemu");
  return [...lines.slice(0, start), ...block.split("\n"), ...lines.slice(end + 1)].join("\n");
}

/** Bangun blok vendored: header + literal FE dengan identifier diganti. */
export function buildVendoredBlock(feSource: string): string {
  const { lines, start } = extractBlock(feSource, FE_MARKER, "FE");
  const decl = lines[0] as string;
  if (!decl.startsWith("export const QUIZ_BANK")) {
    throw new Error(`[vendor-bank] FE:${start + 1} bukan deklarasi QUIZ_BANK`);
  }
  const renamed = decl.replace("export const QUIZ_BANK", "const FALLBACK_BANK");
  return [VENDOR_HEADER, VENDOR_WHY, renamed, ...lines.slice(1)].join("\n");
}

const FE_PICK_REL = "apps/web/src/features/quiz/quiz-pick.ts";
const EDGE_PICK_REL = "supabase/functions/generate-quiz/pick-shared.ts";
const PICK_HEADER = `// Vendored dari ${FE_PICK_REL} — JANGAN EDIT MANUAL, jalankan bun vendor-bank.ts`;
const PICK_WHY =
  "// Impor lintas batas Deno/Vite ditolak bundler Edge; sumber tunggal tetap quiz-pick.ts FE.";
const FE_PICK_IMPORT = 'import type { Question } from "../../lib/zod/question";';
const EDGE_PICK_IMPORT = 'import type { Question } from "./question.ts";';

/** Salin modul picker FE ke Edge dengan import type di-rewrite ke question.ts lokal. */
export function buildVendoredPicker(feSource: string): string {
  if (!feSource.includes(FE_PICK_IMPORT)) {
    throw new Error("[vendor-bank] picker FE: import Question tak ketemu");
  }
  const body = feSource.replace(FE_PICK_IMPORT, EDGE_PICK_IMPORT);
  return [PICK_HEADER, PICK_WHY, body].join("\n");
}

export function syncPickerFile(feSource: string, edgeSource: string | null): string | null {
  const next = buildVendoredPicker(feSource);
  if (edgeSource === next) return null;
  return next;
}

function main(): void {
  const fe = readFileSync(join(ROOT, FE_REL), "utf8");
  const edgePath = join(ROOT, EDGE_REL);
  const edge = readFileSync(edgePath, "utf8");
  const next = spliceVendoredBlock(edge, buildVendoredBlock(fe));
  if (next === edge) {
    console.log(`[vendor-bank] sinkron: ${EDGE_REL} = ${FE_REL} (no-op)`);
  } else {
    writeFileSync(edgePath, next);
    console.log(`[vendor-bank] tulis: ${EDGE_REL} ← ${FE_REL}`);
  }
  const fePick = readFileSync(join(ROOT, FE_PICK_REL), "utf8");
  const edgePickPath = join(ROOT, EDGE_PICK_REL);
  let edgePick: string | null = null;
  try {
    edgePick = readFileSync(edgePickPath, "utf8");
  } catch {
    edgePick = null;
  }
  const pickNext = syncPickerFile(fePick, edgePick);
  if (pickNext === null) {
    console.log(`[vendor-bank] sinkron: ${EDGE_PICK_REL} = ${FE_PICK_REL} (no-op)`);
    return;
  }
  writeFileSync(edgePickPath, pickNext);
  console.log(`[vendor-bank] tulis: ${EDGE_PICK_REL} ← ${FE_PICK_REL}`);
}

if (import.meta.main) main();
