import { z } from "zod";

const storedAnswerSchema = z.object({
  selectedIndex: z.number().int().optional(),
  ordered: z.array(z.string()).optional(),
  match: z.object({ left: z.string(), right: z.string() }).optional(),
});

const resumeSchema = z.object({
  moduleId: z.string().min(1),
  currentIndex: z.number().int().nonnegative(),
  answers: z.array(z.tuple([z.number().int(), storedAnswerSchema])),
  hearts: z.number().int().min(0).max(5),
  updatedAt: z.number().int(),
});

export type QuizResume = z.infer<typeof resumeSchema>;

const KEY = "caksara.quiz-resume.v1";
/** Tawaran lanjut hanya 7 hari sejak terakhir main. */
const MAX_AGE_MS = 7 * 24 * 3600 * 1000;

function readAll(): Record<string, QuizResume> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = z.record(z.string(), resumeSchema).safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : {};
  } catch {
    return {};
  }
}

function writeAll(all: Record<string, QuizResume>): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    // Storage penuh/diblokir: sesi lanjut tidak tersimpan, kuis tetap jalan.
  }
}

/** Ambil simpanan kuis modul bila masih segar dan sudah mulai (soal > 1). */
export function loadResume(moduleId: string): QuizResume | null {
  const found = readAll()[moduleId];
  if (!found) return null;
  if (found.currentIndex <= 0) return null;
  if (Date.now() - found.updatedAt > MAX_AGE_MS) {
    clearResume(moduleId);
    return null;
  }
  return found;
}

export function saveResume(resume: QuizResume): void {
  const all = readAll();
  all[resume.moduleId] = resume;
  writeAll(all);
}

export function clearResume(moduleId: string): void {
  const all = readAll();
  if (!(moduleId in all)) return;
  delete all[moduleId];
  writeAll(all);
}
/** Hapus seluruh tawaran lanjut kuis (dipakai reset progres total #27). */
export function clearAllQuizResumes(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // Storage diblokir: tidak ada yang perlu dihapus.
  }
}
