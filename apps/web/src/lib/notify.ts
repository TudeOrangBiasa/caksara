import { toast } from "sonner";

/**
 * Toast sistem untuk kondisi backend (429, Gemini down, kembali online).
 * Sonner bawaan: slide-in + swipe-to-dismiss + fade-out via duration.
 * Retry diserahkan ke pemanggil: pemicu 429/Gemini berasal dari Edge (#29 V8c).
 */
export function notifyRateLimited(onRetry?: () => void) {
  toast.warning("Terlalu banyak permintaan (429)", {
    description: "Tunggu sebentar lalu coba lagi.",
    action: onRetry ? { label: "Coba lagi", onClick: onRetry } : undefined,
    duration: 3000,
  });
}

export function notifyGeminiDown(onRetry?: () => void) {
  toast.error("Guru Virtual sedang gangguan", {
    description: "Jawaban dari sumber KB tetap bisa dibaca manual.",
    action: onRetry ? { label: "Coba lagi", onClick: onRetry } : undefined,
    duration: 5000,
  });
}

export function notifyBackOnline() {
  toast.success("Kembali online", {
    description: "Koneksi pulih, silakan lanjutkan.",
    duration: 3000,
  });
}

/** V9: hati diisi penuh 5 saat refresh melewati 00:00 WITA. */
export function notifyHeartsRefilled() {
  toast.success("Hati penuh lagi", {
    description: "5 dari 5 siap dipakai belajar hari ini.",
    duration: 3500,
  });
}

/** V9: streak dinolkan karena terlewat sehari penuh atau lebih. */
export function notifyStreakReset() {
  toast.warning("Streak terputus", {
    description: "Mulai lagi hari ini untuk streak baru.",
    duration: 4000,
  });
}

/** #21: modul terkunci diklik → peringatan + ajakan bereskan modul sebelumnya. */
export function notifyModuleLocked() {
  toast.warning("Beresin modul sebelumnya dulu ya", {
    description: "Modul ini kebuka setelah modul sebelumnya selesai.",
    duration: 3500,
  });
}
/** #27: reset progres total → konfirmasi singkat, ajak mulai lagi. */
export function notifyProgressReset() {
  toast.success("Progres direset", {
    description: "Mulai lagi dari Modul 1, pelan-pelan ya.",
    duration: 3500,
  });
}
/** #23: Edge/Gemini gagal → sesi jalan dari bank statis lokal + cache. */
export function notifyQuizFallback() {
  toast.info("Mode offline kuis", {
    description: "Soal dari bank lokal + cache. Coba lagi nanti untuk soal Gemini baru.",
    duration: 4000,
  });
}

/** V10: hasil kuis gagal terkirim → antre di perangkat, sync saat online. */
export function notifyQueuedOffline() {
  toast.info("Tersimpan di perangkat", {
    description: "Hasil akan dikirim otomatis saat kembali online.",
    duration: 4000,
  });
}

/** V10: antrean buffer terkirim setelah koneksi pulih. */
export function notifyPendingSynced(sent: number) {
  toast.success("Hasil terkirim", {
    description: sent === 1 ? "1 sesi tertunda sudah masuk." : `${sent} sesi tertunda sudah masuk.`,
    duration: 3500,
  });
}
